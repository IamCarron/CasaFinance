export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, getCategories, getSettings } from '@/lib/db';

function isAuthorized(req: Request) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const botToken = process.env.BOT_API_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  if (expectedToken) {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const { searchParams } = new URL(req.url);
    const queryToken = searchParams.get('token');
    return token === expectedToken || queryToken === expectedToken;
  }

  if (isProd || botToken) {
    return false;
  }

  return true;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // optional filter: YYYY-MM

    const allExpenses = getExpenses(month || undefined);
    const categories = getCategories();
    const settings = getSettings();
    const p1Name = settings.partner1Name || 'Tú';
    const p2Name = settings.partner2Name || 'Pareja';

    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    // CSV Header with UTF-8 BOM so Excel opens with proper accents and currency symbols
    const headers = ['Fecha', 'Concepto', 'Importe', 'Moneda', 'Categoría', 'Pagado Por', 'Asignación', 'Reparto 50/50', 'Notas'];
    
    const rows = allExpenses.map((exp) => {
      const catName = catMap.get(exp.categoryId) || 'General';
      let payer = 'Cuenta Común';
      if (exp.paidBy === 'partner1') payer = p1Name;
      if (exp.paidBy === 'partner2') payer = p2Name;

      let split = 'Ambos';
      if (exp.splitBetween === 'partner1') split = `Solo ${p1Name}`;
      if (exp.splitBetween === 'partner2') split = `Solo ${p2Name}`;

      const is5050 = exp.splitModeOverride === 'equal' ? 'Sí' : 'No';

      const escapeCsv = (val: string | number) => {
        let str = String(val ?? '').replace(/"/g, '""');
        if (/^[=+\-@\t\r]/.test(str)) {
          str = `'${str}`;
        }
        return `"${str}"`;
      };

      return [
        escapeCsv(exp.date),
        escapeCsv(exp.title),
        exp.amount.toFixed(2).replace('.', ','), // European Excel format
        escapeCsv(settings.currencySymbol || '€'),
        escapeCsv(catName),
        escapeCsv(payer),
        escapeCsv(split),
        escapeCsv(is5050),
        escapeCsv(exp.notes || ''),
      ].join(';');
    });

    // UTF-8 BOM is \uFEFF
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

    const filename = month ? `casafinance-gastos-${month}.csv` : 'casafinance-todos-los-gastos.csv';

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
