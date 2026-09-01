'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import {
  LayoutDashboard,
  Calculator,
  Receipt,
  Scale,
  Settings,
  Plus,
  HeartHandshake,
} from 'lucide-react';

interface NavbarProps {
  onOpenExpenseModal: () => void;
}

export default function Navbar({ onOpenExpenseModal }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Resumen', icon: LayoutDashboard },
    { href: '/gastos', label: 'Gastos', icon: Receipt },
    { href: '/presupuesto', label: 'Presupuesto', icon: Calculator },
    { href: '/liquidaciones', label: 'Balance', icon: Scale },
    { href: '/ajustes', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between py-3">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/70 dark:bg-zinc-900/70 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Add Expense Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Añadir Gasto</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-zinc-900 dark:text-white font-bold'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-zinc-900 dark:text-white' : ''}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
