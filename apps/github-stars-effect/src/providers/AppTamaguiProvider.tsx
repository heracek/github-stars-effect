import React, { type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { TamaguiProvider } from 'tamagui';

import tamaguiConfig from '../../tamagui.config';

export type AppTamaguiProviderProps = {
  children: ReactNode;
};

export function AppTamaguiProvider({ children }: AppTamaguiProviderProps) {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme ?? 'dark'}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {children}
      </ThemeProvider>
    </TamaguiProvider>
  );
}
