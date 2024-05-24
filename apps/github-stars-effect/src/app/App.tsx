import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppUi } from './AppUi';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <AppUi />
      </SafeAreaView>
    </QueryClientProvider>
  );
};
