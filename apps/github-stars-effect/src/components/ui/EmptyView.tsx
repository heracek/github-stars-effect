import React from 'react';
import { Search } from '@tamagui/lucide-icons';
import { H2, Text, View, YStack } from 'tamagui';

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
      gap="$4"
    >
      <Search size="$8" color="$color9" alignSelf="center" />

      <View>
        <H2 textAlign="center" color="$color075">
          {title}
        </H2>
      </View>

      {subTitle ? (
        <View>
          <Text fontSize="$6" textAlign="center">
            {subTitle}
          </Text>
        </View>
      ) : null}
    </YStack>
  );
}
