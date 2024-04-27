import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export type AppQueryClientProviderProps = {
  children: ReactNode;
};

export function AppQueryClientProvider({
  children,
}: AppQueryClientProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
