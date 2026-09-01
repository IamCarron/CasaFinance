import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CasaFinance - Finanzas y Presupuesto de Pareja',
  description: 'Gestión inteligente de presupuesto del hogar, reparto proporcional a ingresos y gastos compartidos para parejas.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CasaFinance',
  },
  openGraph: {
    title: 'CasaFinance - Finanzas de Pareja',
    description: 'Gestor de finanzas compartidas y presupuesto proporcional para parejas. Privado, local-first y listo para Docker.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-[#fdfdfc] dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
