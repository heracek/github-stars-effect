import React from 'react';
import { AlertTriangle } from '@tamagui/lucide-icons';
import { Button, H2, Text, YStack } from 'tamagui';

export type ErrorViewProps = {
  message: string;
  onRefresh?: () => void;
};

export function ErrorView({ message, onRefresh }: ErrorViewProps) {
  return (
    <YStack
      flex={1}
      alignContent="center"
      justifyContent="center"
      paddingHorizontal="$6"
      paddingBottom="$12"
      gap="$4"
    >
      <AlertTriangle size="$8" color="$color9" alignSelf="center" />

      <H2 textAlign="center" color="$color075">
        Error fetching stars
      </H2>

      <Text fontSize="$6" textAlign="center" color="$color">
        {message}
      </Text>

      {onRefresh ? (
        <Button
          themeInverse
          size="$5"
          alignSelf="center"
          theme="blue_active"
          onPress={onRefresh}
          marginTop="$3"
        >
          Retry
        </Button>
      ) : null}
    </YStack>
  );
}
