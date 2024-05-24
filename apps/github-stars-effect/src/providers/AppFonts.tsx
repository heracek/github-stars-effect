import { type ReactNode } from 'react';
import { useFonts } from 'expo-font';

export type AppFontsProps = {
  children: ReactNode;
};

export function AppFonts({ children }: AppFontsProps) {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  if (!loaded) {
    return null;
  }

  return children;
}
