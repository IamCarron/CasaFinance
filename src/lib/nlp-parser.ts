import { BotParsedExpense, Category, UserSettings } from './types';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'cat-comida': [
    'mercadona', 'carrefour', 'lidl', 'dia', 'aldi', 'eroski', 'alcampo', 'super', 
    'supermercado', 'compra', 'fruta', 'fruteria', 'pan', 'panaderia', 'pescado', 
    'pescaderia', 'carne', 'carniceria', 'hipercor', 'groceries', 'comida', 'mercado',
    'supermarket', 'food', 'bakery', 'butcher', 'grocery', 'produce', 'tesco', 'sainsburys', 'costco'
  ],
  'cat-ocio': [
    'restaurante', 'cena', 'cenar', 'comida fuera', 'bar', 'cerveza', 'cervezas', 
    'tapas', 'copas', 'cafe', 'pizzas', 'pizza', 'burger', 'hamburguesa', 'mcdonalds', 
    'glovo', 'uber eats', 'just eat', 'cine', 'concierto', 'entradas', 'copa', 'salida', 'viaje', 'hotel',
    'restaurant', 'dinner', 'lunch', 'drinks', 'cocktails', 'pub', 'cinema', 'movie', 'concert', 'vacation', 'trip'
  ],
  'cat-transporte': [
    'gasolina', 'diesel', 'gasoil', 'repsol', 'cepsa', 'bp', 'galp', 'petroprix', 
    'parking', 'aparcamiento', 'peaje', 'metro', 'bus', 'autobus', 'tren', 'renfe', 
    'uber', 'cabify', 'taxi', 'itv', 'taller', 'mecanico', 'lavado coche',
    'gas', 'fuel', 'petrol', 'train', 'flight', 'garage', 'mechanic', 'car wash'
  ],
  'cat-suministros': [
    'luz', 'electricidad', 'iberdrola', 'endesa', 'naturgy', 'totalenergies', 'agua', 
    'canal de isabel', 'aqualia', 'gas', 'butano', 'calefaccion', 'basuras',
    'electricity', 'power', 'water', 'heating', 'utilities', 'bills', 'energy'
  ],
  'cat-internet': [
    'internet', 'fibra', 'wifi', 'digi', 'vodafone', 'movistar', 'orange', 'o2', 
    'pepephone', 'yoigo', 'lowi', 'simyo', 'telefono', 'movil',
    'fiber', 'broadband', 'phone', 'cellular', 'mobile'
  ],
  'cat-suscripciones': [
    'netflix', 'spotify', 'hbo', 'max', 'disney', 'amazon prime', 'prime video', 
    'youtube', 'apple music', 'icloud', 'dazn', 'filmin', 'chatgpt',
    'subscription', 'gym', 'audible', 'patreon'
  ],
  'cat-hogar': [
    'ikea', 'leroy', 'bricolaje', 'ferreteria', 'limpieza', 'detergente', 'zara home', 
    'muebles', 'decoracion', 'jardin', 'plantas', 'fontanero', 'cerrajero',
    'home', 'furniture', 'hardware', 'decor', 'cleaning', 'plants', 'plumber', 'locksmith'
  ],
  'cat-ahorro': ['ahorro', 'bote', 'fondo', 'hucha', 'inversion', 'savings', 'emergency fund', 'piggy bank', 'deposit'],
  'cat-vivienda': ['alquiler', 'hipoteca', 'comunidad', 'seguro hogar', 'ibi', 'rent', 'mortgage', 'hoa', 'home insurance', 'property tax'],
};

export function parseExpenseMessage(
  rawText: string,
  categories: Category[],
  settings: UserSettings,
  senderNameOrPhone?: string
): BotParsedExpense | null {
  let text = rawText.trim();
  if (!text) return null;

  // Optional prefixes: "/gasto", "!gasto", "+", "gasto:", "/expense", "!expense", "expense:"
  text = text.replace(/^(\/gasto|!gasto|\+|gasto:|\/expense|!expense|expense:)\s*/i, '').trim();

  // 1. Filter out common non-expense conversational phrases with numbers
  const isTimePattern = /\b(a las|son las|hacia las|at \d|around \d)\s+\d{1,2}(?::\d{2})?\b/i.test(text);
  const isClockFormat = /^\d{1,2}:\d{2}$/.test(text);
  const isUnitCounter = /\b\d+\s*(huevos|veces|minutos|min|horas|h|dias|días|meses|anos|años|personas|amigos|kilos|kg|litros|botellas|cajas|paquetes|eggs|times|minutes|hours|days|months|years|people|bottles|boxes)\b/i.test(text);
  const isPureChatGreeting = /^(hola|buenas|que tal|ok|vale|si|no|gracias|perfecto|voy|llego|adios|hello|hi|hey|thanks|sure|cool|bye)\b/i.test(text);

  if (isTimePattern || isClockFormat || isUnitCounter || isPureChatGreeting) {
    return null;
  }

  // 2. Extract Amount:
  // Must be either at start: "42.50 Mercadona" / "42,50€ Mercadona" / "50$ Groceries"
  // OR with explicit currency anywhere: "Mercadona 42.50€" / "Cena 60 euros" / "Gasolina 50$"
  let amount: number | null = null;
  let remainingText = text;

  const startAmountRegex = /^(\$|€|£)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|\$|£|eur|euros|usd|gbp)?\s+/i;
  const startMatch = text.match(startAmountRegex);

  if (startMatch) {
    amount = parseFloat(startMatch[2].replace(',', '.'));
    remainingText = text.slice(startMatch[0].length).trim();
  } else {
    const explicitCurrencyRegex = /(\d+(?:[.,]\d{1,2})?)\s*(?:€|\$|£|eur|euros|usd|gbp)\b/i;
    const currMatch = text.match(explicitCurrencyRegex);
    if (currMatch) {
      amount = parseFloat(currMatch[1].replace(',', '.'));
      remainingText = text.replace(currMatch[0], '').trim();
    }
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return null;
  }

  // 3. Check 50/50 Override: looks for "50/50", "50-50", "50 50", "a medias", "mitad", "fifty fifty", "half and half"
  let splitModeOverride: 'default' | 'equal' | null = null;
  const equalSplitRegex = /\b(50\/50|50-50|50 50|a medias|mitad|fifty fifty|half and half|split equal)\b/i;
  if (equalSplitRegex.test(remainingText)) {
    splitModeOverride = 'equal';
    remainingText = remainingText.replace(equalSplitRegex, '').trim();
  }

  // 4. Check Paid By (Payer):
  // Explicit Common Account keywords:
  let paidBy: 'common' | 'partner1' | 'partner2' = 'common';
  const p1Lower = (settings.partner1Name || 'tú').toLowerCase();
  const p2Lower = (settings.partner2Name || 'pareja').toLowerCase();

  const commonRegex = /\b(cuenta comun|cuenta común|tarjeta comun|tarjeta común|banco comun|banco común|comun|común|joint account|joint card|common card|common|joint)\b/i;
  const hasCommonWord = commonRegex.test(remainingText);
  if (hasCommonWord) {
    paidBy = 'common';
    remainingText = remainingText.replace(commonRegex, '').trim();
  }

  // Explicit Pocket Advance keywords:
  const pocketRegex = /\b(bolsillo|adelanto|adelantado|pague yo|pago yo|particular|advance|out of pocket|pocket|i paid|paid by me)\b/i;
  const hasPocketWord = pocketRegex.test(remainingText);
  if (hasPocketWord) {
    remainingText = remainingText.replace(pocketRegex, '').trim();
  }

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Check explicit partner name in text (e.g. "pagó Carlos", "paga Alex", "paid by Sam")
  const p1Regex = new RegExp(`\\b(pago|paga|pagó|paid by)?\\s*${escapeRegExp(p1Lower)}\\b`, 'i');
  const p2Regex = new RegExp(`\\b(pago|paga|pagó|paid by)?\\s*${escapeRegExp(p2Lower)}\\b`, 'i');

  if (p1Regex.test(remainingText) && !hasCommonWord) {
    paidBy = 'partner1';
    remainingText = remainingText.replace(p1Regex, '').trim();
  } else if (p2Regex.test(remainingText) && !hasCommonWord) {
    paidBy = 'partner2';
    remainingText = remainingText.replace(p2Regex, '').trim();
  } else if (hasPocketWord && !hasCommonWord) {
    // If pocket word detected, check if sender matches partner 1 or 2
    if (senderNameOrPhone) {
      const senderLower = senderNameOrPhone.toLowerCase();
      if (senderLower.includes(p1Lower)) {
        paidBy = 'partner1';
      } else if (senderLower.includes(p2Lower)) {
        paidBy = 'partner2';
      } else {
        paidBy = 'partner1';
      }
    } else {
      paidBy = 'partner1';
    }
  }

  // Clean up title
  let cleanTitle = remainingText
    .replace(/^[-–—:,/]+/, '')
    .replace(/[-–—:,/]+$/, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = 'Gasto General';
  }

  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  // 5. Intelligent Category Matching
  let matchedCategoryId = categories[0]?.id || 'cat-1';
  let foundCategory = false;
  const titleLower = cleanTitle.toLowerCase();

  for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (titleLower.includes(kw)) {
        const existing = categories.find(
          (c) => c.id === catKey || c.name.toLowerCase().includes(kw)
        );
        if (existing) {
          matchedCategoryId = existing.id;
          foundCategory = true;
          break;
        }
      }
    }
    if (foundCategory) break;
  }

  // If no keyword matched, search by category names directly
  if (!foundCategory) {
    for (const cat of categories) {
      if (titleLower.includes(cat.name.toLowerCase())) {
        matchedCategoryId = cat.id;
        foundCategory = true;
        break;
      }
    }
  }

  return {
    title: cleanTitle,
    amount,
    categoryId: matchedCategoryId,
    paidBy,
    splitBetween: 'both',
    splitModeOverride,
    confidence: foundCategory ? 0.95 : 0.75,
  };
}
