import { Array, Effect, pipe, Redacted } from 'effect';
import { Api, HttpError, Middlewares, RouterBuilder } from 'effect-http';
import { HttpClient } from '@effect/platform';
import * as S from '@effect/schema/Schema';

import { GetStarsResponse } from '@crfx/github-stars-shared-schema';

import { AppConfig } from './layers/AppConfig';
import { GithubApiRepository } from './repository/GithubApiRepository';
import { StarsDbRepository } from './repository/starsDb/StarsDbRepository';
import { ResponseStar } from './schemas/ResponseStar';

const appError = (message: string) =>
  Effect.mapError((e: Error) =>
    HttpError.make(500, {
      message,
      details: e.message,
    }),
  );

export const noteApi = pipe(
  Api.make({ title: 'GitHub Stars Effect API' }),
  Api.addEndpoint(
    pipe(
      Api.get('getStars', '/stars'),
      Api.setRequestQuery(
        S.Struct({
          q: S.String,
        }),
      ),
      Api.setResponseBody(GetStarsResponse),
    ),
  ),
  Api.addEndpoint(
    pipe(
      Api.get('getTest', '/test'),
      Api.setResponseBody(
        S.Any,
        // ResponseStarred.pipe(
        //   S.annotations({
        //     description: 'ResponseStarred',
        //   }),
        // ),
      ),
      // Api.setResponseRepresentations([{ stringify: S.validate }]),
    ),
  ),
);

export const app = Effect.gen(function* () {
  return RouterBuilder.make(noteApi).pipe(
    RouterBuilder.handle('getStars', ({ query }) =>
      Effect.gen(function* () {
        const repository = yield* StarsDbRepository;
        const results = yield* repository.fullTextSearch(query.q);
        return {
          results,
          error: null,
        };
      }).pipe(Effect.withSpan('getStars'), appError('could not get stars')),
    ),
    RouterBuilder.handle('getTest', () =>
      Effect.gen(function* () {
        let page = 1;

        while (true) {
          const repository = yield* StarsDbRepository;
          const githubRepository = yield* GithubApiRepository;

          const response = yield* githubRepository.getStarred({ page });
          yield* Effect.log(`page ${page} - length: ${response.length}`);

          if (response.length === 0) break;

          yield* pipe(
            response,
            Array.map(({ starred_at, repo }) =>
              repository.insertOrUpdateStarredRepo({
                starred_at,
                ...repo,
              }),
            ),
            Effect.all,
            Effect.withRequestBatching(true),
            Effect.withSpan('StarsDbRepository-store-all-repos'),
          );

          page++;
        }

        return [`ok - last page: ${page}`];
      }).pipe(Effect.withSpan('getStars'), appError('could not get stars')),
    ),
    RouterBuilder.build,
    Middlewares.cors({ allowedOrigins: ['*'] }),
    Middlewares.errorLog,
  );
});
