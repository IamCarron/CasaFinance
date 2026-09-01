import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getSettings, getCategories } from '@/lib/db';
import { parseReceiptWithLLM } from '@/lib/ocr-service';

const RECEIPTS_DIR = path.join(process.cwd(), 'data', 'receipts');
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, filename } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64 field' }, { status: 400 });
    }

    const settings = getSettings();
    const categories = getCategories();

    // 1. Save receipt image locally
    const ext = filename ? path.extname(filename) || '.jpg' : '.jpg';
    const savedName = `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const filePath = path.join(RECEIPTS_DIR, savedName);

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(filePath, buffer);

    const receiptUrl = `/api/receipts/${savedName}`;

    // 2. Extract OCR data with LLM
    try {
      const ocr = await parseReceiptWithLLM(imageBase64, settings);

      // 3. Match category by keyword
      let categoryId = categories[0]?.id || 'cat-comida';
      const kw = ocr.categoryKeyword.toLowerCase();
      const titleLower = ocr.title.toLowerCase();

      const matched = categories.find((c) => {
        const cName = c.name.toLowerCase();
        return (
          cName.includes(kw) ||
          (kw.includes('comida') && cName.includes('supermercado')) ||
          (kw.includes('supermercado') && cName.includes('alimentación')) ||
          (kw.includes('restaurante') && (cName.includes('ocio') || cName.includes('comida'))) ||
          (kw.includes('suministros') && cName.includes('luz')) ||
          (kw.includes('gasolina') && cName.includes('transporte')) ||
          (titleLower.includes('mercadona') && cName.includes('supermercado')) ||
          (titleLower.includes('carrefour') && cName.includes('supermercado')) ||
          (titleLower.includes('lidl') && cName.includes('supermercado')) ||
          (titleLower.includes('dia') && cName.includes('supermercado')) ||
          (titleLower.includes('repsol') && cName.includes('transporte')) ||
          (titleLower.includes('farmacia') && cName.includes('hogar'))
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
