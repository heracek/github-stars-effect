import { Effect, pipe } from 'effect';
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform';

import { GetStarsResponseSchema } from '@ghs/github-stars-shared-schema';

export async function fetchStars({
  queryKey,
  signal,
}: {
  queryKey: [string, string];
  signal: AbortSignal;
}) {
  const queryString = queryKey[1];

  const fetchEffect = pipe(
    HttpClientRequest.get('http://localhost:4000/stars'),
    HttpClientRequest.setUrlParams({ q: `${queryString}` }),
    HttpClient.fetchOk,
    Effect.flatMap(HttpClientResponse.schemaBodyJson(GetStarsResponseSchema)),
    Effect.scoped,
  );

  return await Effect.runPromise(fetchEffect, { signal });
}
