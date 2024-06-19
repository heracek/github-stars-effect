import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { pipe } from 'effect/Function';
import * as O from 'effect/Option';
import * as S from '@effect/schema/Schema';
import { useHeaderHeight } from '@react-navigation/elements';
import { GitFork, Star } from '@tamagui/lucide-icons';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { Input, Label, Spinner, Text, View, XStack, YStack } from 'tamagui';

import { GetStarsResponse } from '@crfx/github-stars-shared-schema';

import { EmptyView } from '../ui/EmptyView';
import { ErrorView } from '../ui/ErrorView';
import { HighlightedText } from '../ui/HighlightedText';
import { LoadingView } from '../ui/LoadingView';
import { Tag } from '../ui/Tag';

const MINIMUM_LENGTH = 3;

async function fetchStars({
  queryKey,
  signal,
}: {
  queryKey: [string, string];
  signal: AbortSignal;
}) {
  const queryString = queryKey[1];

  const url = new URL('http://localhost:4000/stars');
  url.searchParams.set('q', queryString);

  const jsonResponse = await (await fetch(url, { signal })).json();

  return pipe(
    jsonResponse,
    S.decodeUnknownSync(GetStarsResponse),
  );
}

export function SearchStarsScreen() {
  const localSearchParams = useLocalSearchParams<{ q?: string }>();
  const searchString = localSearchParams.q ?? '';

  const isValidSearchStringLength = useMemo(() => {
    return searchString.trim().length >= MINIMUM_LENGTH;
  }, [searchString]);

  const searchQuery = useQuery({
    queryKey: ['search-stars', searchString],
    queryFn: fetchStars,
    enabled: isValidSearchStringLength,
  });

  const searchWords = useMemo(() => searchString.split(/\s+/), [searchString]);

  const height = useHeaderHeight();

  return (
    <>
      <Stack.Screen options={{ title: 'GitHub ✨🔭' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={height}
      >
        <FlatList
          data={searchQuery.data?.results ?? []}
          keyExtractor={(item) => `${item.id}`}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            searchQuery.error ? (
              <ErrorView
                message={searchQuery.error.message}
                onRefresh={() => searchQuery.refetch()}
              />
            ) : searchQuery.isFetching ? (
              <LoadingView />
            ) : (
              <EmptyView
                title="No results"
                subTitle={
                  !isValidSearchStringLength
                    ? `Search string is too short,\nminimum is ${MINIMUM_LENGTH} characters.`
                    : "We couldn't find any matching starred repositories."
                }
              />
            )
          }
          ListHeaderComponent={
            <YStack
              paddingHorizontal="$3"
              paddingBottom="$2"
              borderBottomWidth={StyleSheet.hairlineWidth}
              borderBottomColor="$color025"
            >
              <XStack>
                <Label
                  fontSize="$6"
                  fontWeight="800"
                  htmlFor="search-box"
                  flex={1}
                >
                  Search GitHub Stars:
                </Label>
                <Spinner
                  marginVertical="$3"
                  marginEnd="$1"
                  opacity={searchQuery.isFetching && searchQuery.data ? 1 : 0}
                />
              </XStack>
              <Input
                flex={1}
                id="search-box"
                value={searchString}
                onChangeText={(str) => router.setParams({ q: str })}
                size="$3"
                placeholder="Search for something..."
                borderRadius={1000}
                borderColor="$color9"
                outlineColor="$blue10"
                outlineWidth={2}
                focusStyle={{ borderColor: '$blue10' }}
                focusVisibleStyle={{ outlineColor: '$blue10' }}
                autoCapitalize="none"
                clearButtonMode="always"
              />
            </YStack>
          }
          ItemSeparatorComponent={
            Platform.OS !== 'android'
              ? () => (
                  <View
                    borderTopColor="$color025"
                    borderTopWidth={StyleSheet.hairlineWidth}
                  />
                )
              : null
          }
          renderItem={({ item: repo }) => (
            <YStack
              key={repo.id}
              paddingVertical="$3"
              paddingHorizontal="$3"
              gap="$2"
              backgroundColor="$background"
            >
              <View>
                <Link href={repo.html_url}>
                  <Text>
                    <HighlightedText
                      searchWords={searchWords}
                      textToHighlight={`${repo.owner.login}/${repo.name}`}
                      fontSize="$6"
                      color="$blue11"
                      fontWeight="800"
                    />
                  </Text>
                </Link>
              </View>

              {repo.description ? (
                <Text fontSize="$5" paddingVertical="$2">
                  <HighlightedText
                    searchWords={searchWords}
                    textToHighlight={repo.description}
                  />
                </Text>
              ) : null}

              {repo.topics.length ? (
                <XStack gap="$1.5" flexWrap="wrap">
                  {repo.topics.map((topic, index) => (
                    <Tag key={index} fontSize="$2" theme="green_alt1">
                      <HighlightedText
                        searchWords={searchWords}
                        textToHighlight={topic}
                      />
                    </Tag>
                  ))}
                </XStack>
              ) : null}

              <XStack
                width="$22"
                justifyContent="flex-start"
                alignItems="center"
                flexWrap="wrap"
                gap="$3"
              >
                {repo.language ? (
                  <View>
                    {/* <Tag theme="green_alt2" ellipse ellipsizeMode="tail"> */}
                    <HighlightedText
                      searchWords={searchWords}
                      textToHighlight={repo.language}
                      fontWeight="800"
                      fontSize="$2"
                      // textToHighlight={'react kldsjflksdjflksdjf '}
                    />
                    {/* </Tag> */}
                  </View>
                ) : null}

                <XStack alignItems="center" gap="$1">
                  <Star size="$1" scale={0.75} color="$color05" />
                  <Text fontSize="$2">123</Text>
                </XStack>

                <XStack alignItems="center" gap="$1">
                  <GitFork size="$1" scale={0.75} color="$color05" />
                  <Text fontSize="$2">123</Text>
                </XStack>

                <View flex={1} alignItems="flex-end">
                  <Text fontSize="$2">
                    Starred {formatDistanceToNow(repo.starred_at)} ago
                  </Text>
                </View>
              </XStack>
            </YStack>
          )}
        />
      </KeyboardAvoidingView>
    </>
  );
}
