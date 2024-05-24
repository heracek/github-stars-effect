import React, { type ReactNode } from 'react';

import { AppFonts } from './AppFonts';
import { AppQueryClientProvider } from './AppQueryClientProvider';
import { AppTamaguiProvider } from './AppTamaguiProvider';

export type AllAppProviders = {
  children: ReactNode;
};

export function AllAppProviders({ children }: AllAppProviders) {
  return (
    <AppFonts>
      <AppTamaguiProvider>
        <AppQueryClientProvider>{children}</AppQueryClientProvider>
      </AppTamaguiProvider>
    </AppFonts>
  );
}
