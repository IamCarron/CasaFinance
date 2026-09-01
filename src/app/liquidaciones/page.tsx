'use client';

import React from 'react';
import { HouseholdProvider } from '@/context/HouseholdContext';
import AppShell from '@/components/AppShell';

export default function LiquidacionesPage() {
  return (
    <HouseholdProvider initialTab="balance">
      <AppShell />
    </HouseholdProvider>
  );
}
