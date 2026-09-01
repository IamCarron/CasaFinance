'use client';

import React from 'react';
import { HouseholdProvider } from '@/context/HouseholdContext';
import AppShell from '@/components/AppShell';

export default function AjustesPage() {
  return (
    <HouseholdProvider initialTab="settings">
      <AppShell />
    </HouseholdProvider>
  );
}
