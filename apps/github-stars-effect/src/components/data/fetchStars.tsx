import { pipe } from 'effect';
import * as S from '@effect/schema/Schema';

import { GetStarsResponseSchema } from '@ghs/github-stars-shared-schema';

export async function fetchStars({
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
  return pipe(jsonResponse, S.decodeUnknownSync(GetStarsResponseSchema));
}
