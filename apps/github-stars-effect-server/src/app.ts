import { Array, Effect, pipe } from 'effect';
import { Api, HttpError, Middlewares, RouterBuilder } from 'effect-http';
import * as S from '@effect/schema/Schema';

import { GetStarsResponseSchema } from '@ghs/github-stars-shared-schema';

import { GithubApiRepository } from './repository/githubApi/GithubApiRepository';
import { StarsDbRepository } from './repository/starsDb/StarsDbRepository';

const appError = (message: string) =>
  Effect.mapError((e: Error) =>
    HttpError.make(500, {
      message,
      details: `${e}`,
    }),
  );

export const publicApi = pipe(
  Api.make({ title: 'GitHub Stars Effect API' }),
  Api.addEndpoint(
    pipe(
      Api.get('getStars', '/stars'),
      Api.setRequestQuery(S.Struct({ q: S.String })),
      Api.setResponseBody(GetStarsResponseSchema),
    ),
  ),
  Api.addEndpoint(
    pipe(
      Api.post('refreshStars', '/refresh-stars'),
      Api.setResponseBody(S.String),
    ),
  ),
);

export const app = RouterBuilder.make(publicApi).pipe(
  RouterBuilder.handle('getStars', ({ query }) =>
    Effect.gen(function* () {
      const repository = yield* StarsDbRepository;
      const results = yield* repository.fullTextSearch(query.q);

      return {
        results,
        error: null,
      };
    }).pipe(
      Effect.withSpan('PublicApi.getStars'),
      appError('Could not get stars'),
    ),
  ),
  RouterBuilder.handle('refreshStars', () =>
    Effect.gen(function* () {
      const repository = yield* StarsDbRepository;
      const githubRepository = yield* GithubApiRepository;

      const STOP_ITERATING = -1;

      const fetchAndUpdateWorker = (initialPage: number) =>
        Effect.iterate(initialPage, {
          while: (page) => page !== STOP_ITERATING,
          body: (page) =>
            Effect.gen(function* () {
              const response = yield* githubRepository.getStarred({ page });

              yield* Effect.log(`page ${page} - length: ${response.length}`);

              if (response.length === 0) return STOP_ITERATING;

              yield* pipe(
                response,
                Array.map(({ starred_at, repo }) =>
                  repository.insertOrUpdateStarredRepo({
                    starred_at,
                    ...repo,
                  }),
                ),
                (effects) =>
                  Effect.all(effects, { batching: true, discard: true }),
              );

              return page + 1;
            }),
        });

      const worker = fetchAndUpdateWorker(0);

      yield* worker;

      return '✅ Ok';
    }).pipe(
      Effect.withSpan('refreshStars'),
      appError('Could not refresh stars'),
    ),
  ),
  RouterBuilder.build,
  Middlewares.cors({ allowedOrigins: ['*'] }),
  Middlewares.accessLog(),
  Middlewares.errorLog,
  Middlewares.endpointCallsMetric(),
);
