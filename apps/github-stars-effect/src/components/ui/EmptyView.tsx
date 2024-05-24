import React from 'react';
import { Search } from '@tamagui/lucide-icons';
import { H2, Text, YStack } from 'tamagui';

export type EmptyViewProps = {
  title: string;
  subTitle?: string;
};

export function EmptyView({ title, subTitle }: EmptyViewProps) {
  return (
    <YStack
      flex={1}
      alignContent="center"
      justifyContent="center"
      paddingHorizontal="$6"
      paddingBottom="$12"
      gap="$4"
    >
      <Search size="$8" color="$color9" alignSelf="center" />

      <H2 textAlign="center" color="$color075">
        {title}
      </H2>

      {subTitle ? (
        <Text fontSize="$6" textAlign="center">
          {subTitle}
        </Text>
      ) : null}
    </YStack>
  );
}
