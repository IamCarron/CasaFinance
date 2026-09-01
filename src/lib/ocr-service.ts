import { UserSettings } from './types';

export interface OCRResult {
  title: string;
  amount: number;
  date: string;
  categoryKeyword: string;
  notes: string;
  rawText?: string;
}

const OCR_PROMPT = `
Eres un asistente experto en analizar tickets de compra, facturas y recibos de gastos del hogar.
Analiza la imagen del ticket proporcionada y extrae con máxima precisión los siguientes datos en formato JSON estricto:

{
  "title": "Nombre del establecimiento o comercio (ej. Mercadona, Carrefour, Farmacia, Gasolinera, Iberdrola...)",
  "amount": 0.00 (Importe total final a pagar en formato numérico flotante),
  "date": "YYYY-MM-DD" (Fecha del ticket, si no se distingue o es hoy usa la fecha actual),
  "categoryKeyword": "comida | supermercado | suministros | luz | internet | ocio | restaurante | transporte | gasolina | farmacia | hogar | otros",
  "notes": "Breve resumen de los productos principales o número de ticket"
}

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON válido, sin texto adicional, sin bloques de markdown adicionales.
`;

/**
 * Parses receipt image using Ollama (local) or OpenAI-compatible vision API
 */
export async function parseReceiptWithLLM(
  base64Image: string,
  settings: UserSettings
): Promise<OCRResult> {
  const provider = settings.ocrProvider || 'ollama';
  const endpoint = settings.ocrEndpoint || 'http://localhost:11434/api/generate';
  const model = settings.ocrModel || 'llama3.2-vision';
  const apiKey = settings.ocrApiKey || '';

  // Clean base64 string
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  if (provider === 'openai' || (apiKey && endpoint.includes('api.openai.com'))) {
    // OpenAI Vision format
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: OCR_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Vision API Error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || '{}';
    return sanitizeOCRResponse(content);
  }

  // Default: Ollama Vision format
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: OCR_PROMPT,
        images: [cleanBase64],
        stream: false,
        format: 'json',
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama Error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return sanitizeOCRResponse(data.response);
  } catch (err: any) {
    console.error('Ollama vision failed, falling back to heuristic parsing:', err.message);
    throw new Error(`No se pudo conectar con el modelo local de visión (${endpoint}). Asegúrate de que Ollama está corriendo: ${err.message}`);
  }
}

function sanitizeOCRResponse(responseText: string): OCRResult {
  const today = new Date().toISOString().split('T')[0];
  try {
    const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      title: String(parsed.title || 'Compra / Ticket').trim(),
      amount: Math.abs(parseFloat(parsed.amount)) || 0,
      date: typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : today,
      categoryKeyword: String(parsed.categoryKeyword || '').toLowerCase(),
      notes: String(parsed.notes || '').trim(),
      rawText: responseText,
    };
  } catch {
    return {
      title: 'Ticket escaneado',
      amount: 0,
      date: today,
      categoryKeyword: 'comida',
      notes: 'No se pudo parsear el JSON de la respuesta del modelo.',
      rawText: responseText,
    };
  }
}
