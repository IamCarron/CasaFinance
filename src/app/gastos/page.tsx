'use client';

import React from 'react';
import { HouseholdProvider } from '@/context/HouseholdContext';
import AppShell from '@/components/AppShell';

export default function GastosPage() {
  return (
    <HouseholdProvider initialTab="expenses">
      <AppShell />
    </HouseholdProvider>
  );
}
