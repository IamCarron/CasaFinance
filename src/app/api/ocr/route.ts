import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getSettings, getCategories } from '@/lib/db';
import { parseReceiptWithLLM } from '@/lib/ocr-service';

const RECEIPTS_DIR = path.join(process.cwd(), 'data', 'receipts');
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.heic', '.heif']);
const MAX_BASE64_LENGTH = 12 * 1024 * 1024; // 12MB base64 string
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB decoded binary

function isAuthorized(req: Request) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const botToken = process.env.BOT_API_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  if (expectedToken) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    return token === expectedToken;
  }

  if (isProd || botToken) {
    return false;
  }

  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, filename } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid imageBase64 field' }, { status: 400 });
    }

    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum image size is 10MB.' },
        { status: 413 }
      );
    }

    // Validate extension against whitelist
    const rawExt = filename ? path.extname(path.basename(filename)).toLowerCase() : '.jpg';
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Allowed extensions: jpg, jpeg, png, webp, pdf, heic' },
        { status: 400 }
      );
    }
    const ext = rawExt;

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '').trim();
    if (!cleanBase64) {
      return NextResponse.json({ error: 'Empty image data' }, { status: 400 });
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length === 0 || buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Invalid file content or file exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const settings = getSettings();
    const categories = getCategories();

    // 1. Save receipt image locally
    const savedName = `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const filePath = path.join(RECEIPTS_DIR, savedName);
    fs.writeFileSync(filePath, buffer);

    const receiptUrl = `/api/receipts/${savedName}`;

    // 2. Extract OCR data with LLM
    try {
      const ocr = await parseReceiptWithLLM(imageBase64, settings);

      // 3. Match category by keyword
      let categoryId = categories[0]?.id || '';
      const kw = ocr.categoryKeyword.toLowerCase();
      const titleLower = ocr.title.toLowerCase();

      const matched = categories.find((c) => {
        const cName = c.name.toLowerCase();
        return (
          cName.includes(kw) ||
          (kw.includes('comida') && (cName.includes('supermercado') || cName.includes('alimentac'))) ||
          (kw.includes('supermercado') && cName.includes('alimentac')) ||
          (kw.includes('restaurante') && (cName.includes('ocio') || cName.includes('restauran') || cName.includes('comida'))) ||
          (kw.includes('suministro') && (cName.includes('luz') || cName.includes('factura'))) ||
          (kw.includes('gasolina') && (cName.includes('transporte') || cName.includes('gasolina') || cName.includes('coche'))) ||
          (kw.includes('farmacia') && (cName.includes('salud') || cName.includes('farmacia') || cName.includes('care'))) ||
          (titleLower.includes('mercadona') && (cName.includes('supermercado') || cName.includes('alimentac'))) ||
          (titleLower.includes('carrefour') && (cName.includes('supermercado') || cName.includes('alimentac'))) ||
          (titleLower.includes('lidl') && (cName.includes('supermercado') || cName.includes('alimentac'))) ||
          (titleLower.includes('dia') && (cName.includes('supermercado') || cName.includes('alimentac'))) ||
          (titleLower.includes('repsol') && (cName.includes('transporte') || cName.includes('gasolina'))) ||
          (titleLower.includes('farmacia') && (cName.includes('salud') || cName.includes('farmacia')))
        );
      });

      if (matched) {
        categoryId = matched.id;
      }

      return NextResponse.json({
        success: true,
        receiptUrl,
        parsed: {
          title: ocr.title,
          amount: ocr.amount,
          date: ocr.date,
          categoryId,
          notes: ocr.notes,
        },
      });
    } catch (llmError: any) {
      // If LLM fails (e.g. Ollama not running), still return the uploaded receipt image with defaults
      return NextResponse.json({
        success: true,
        receiptUrl,
        warning: llmError.message,
        parsed: {
          title: 'Ticket adjunto',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          categoryId: categories[0]?.id || 'cat-comida',
          notes: 'Ticket subido (configura Ollama en Ajustes para lectura automática con IA).',
        },
      });
    }
  } catch (error: any) {
    console.error('OCR Route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
