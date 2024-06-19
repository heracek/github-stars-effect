import { Array, Config, Effect, pipe, Secret } from 'effect';
import { Api, HttpError, Middlewares, RouterBuilder } from 'effect-http';
import { HttpClient } from '@effect/platform';
import * as S from '@effect/schema/Schema';

import { GetStarsResponse } from '@crfx/github-stars-shared-schema';

import { makeStarsDbRepository } from './repository/starsDbRepository';
import { ResponseStar } from './schemas/ResponseStar';

const appError = (message: string) =>
  Effect.mapError((e: Error) =>
    HttpError.make(500, {
      message,
      details: e.message,
    }),
  );

const ResponseStarred = S.Array(ResponseStar);

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

const makeGithubRepository = () =>
  Effect.gen(function* makeGithubRepository() {
    const githubToken = yield* pipe(
      Config.secret('GITHUB_TOKEN'),
      Effect.orDie,
    );

    const getStarred = ({ page }: { page: number }) =>
      pipe(
        HttpClient.request.get('https://api.github.com/user/starred'),
        HttpClient.request.setHeaders({
          Accept: 'application/vnd.github.v3.star+json',
        }),
        HttpClient.request.bearerToken(Secret.value(githubToken)),
        HttpClient.request.setUrlParams({ per_page: '100', page: `${page}` }),
        HttpClient.client.fetchOk,
        Effect.andThen(HttpClient.response.schemaBodyJson(ResponseStarred)),
        Effect.orDie,
        Effect.scoped,
        Effect.withSpan('GithubRepository.getStarred', {
          attributes: { page },
        }),
      );

    return { getStarred };
  });

export const app = Effect.gen(function* () {
  const repository = yield* makeStarsDbRepository();
  const githubRepository = yield* makeGithubRepository();

  return RouterBuilder.make(noteApi).pipe(
    RouterBuilder.handle('getStars', ({ query }) =>
      Effect.gen(function* () {
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
