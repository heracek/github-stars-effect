import { Array, Config, Effect, pipe, Secret } from 'effect';
import { Api, Middlewares, RouterBuilder, ServerError } from 'effect-http';
import { HttpClient } from '@effect/platform';
import * as S from '@effect/schema/Schema';

import { makeStarsDbRepository } from './repository/starsDbRepository';
import { ResponseStar } from './schemas/ResponseStar';

const appError = (message: string) =>
  Effect.mapError((e: Error) =>
    ServerError.makeJson(500, {
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
      //Api.setResponseBody(ResponseStarred)
      Api.setResponseBody(S.Any),
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
  const repository = yield* makeStarsDbRepository();

  return RouterBuilder.make(noteApi).pipe(
    RouterBuilder.handle('getStars', ({ query }) =>
      Effect.gen(function* () {
        const star = yield* repository.fullTextSearch(query.q);
        // const star = yield* repository.FunctionList(undefined);
        return [star];
      }).pipe(Effect.withSpan('getStars'), appError('could not get stars')),
    ),
    RouterBuilder.handle('getTest', () =>
      Effect.gen(function* () {
        const githubToken = yield* pipe(
          Config.secret('GITHUB_TOKEN'),
          Effect.orDie,
        );

        const response = yield* pipe(
          HttpClient.request.get('https://api.github.com/user/starred'),
          HttpClient.request.setHeaders({
            Accept: 'application/vnd.github.v3.star+json',
          }),
          HttpClient.request.bearerToken(Secret.value(githubToken)),
          HttpClient.client.fetchOk,
          // Effect.andThen(HttpClient.response.schemaBodyJson(S.Any)),
          Effect.andThen(HttpClient.response.schemaBodyJson(ResponseStarred)),
          Effect.orDie,
          Effect.scoped,
        );

        yield* pipe(
          response,
          Array.map(({ starredAt, repo }) =>
            repository.insertOrUpdateStarredRepo({
              starred_at: starredAt,
              ...repo,
            }),
          ),
          Effect.all,
        );

        return response;
      }).pipe(Effect.withSpan('getStars'), appError('could not get stars')),
    ),
    RouterBuilder.build,
    Middlewares.errorLog,
  );
});
