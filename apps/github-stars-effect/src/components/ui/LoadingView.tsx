import React from 'react';
import { H2, Spinner, YStack } from 'tamagui';

export type LoadingViewProps = {
  title?: string;
};

export function LoadingView({ title = 'Loading...' }: LoadingViewProps) {
  return (
    <YStack
      flex={1}
      alignContent="center"
      justifyContent="center"
      paddingHorizontal="$6"
      paddingBottom="$12"
      gap="$6"
    >
      <Spinner size="large" alignSelf="center" />

      <H2 textAlign="center" color="$color05">
        {title}
      </H2>
    </YStack>
  );
}
