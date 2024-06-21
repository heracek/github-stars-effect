import { Context, Effect, Layer, pipe, Redacted } from 'effect';
import { HttpClient } from '@effect/platform';
import * as S from '@effect/schema/Schema';

import { AppConfig } from '../layers/AppConfig';
import { ResponseStar } from '../schemas/ResponseStar';

const ResponseStarred = S.Array(ResponseStar);

export class GithubApiRepository extends Context.Tag('GithubApiRepository')<
  GithubApiRepository,
  {
    getStarred: (options: {
      page: number;
    }) => Effect.Effect<typeof ResponseStarred.Type>;
  }
>() {}

export const GithubApiRepositoryLive = Layer.effect(
  GithubApiRepository,
  Effect.gen(function* makeGithubRepository() {
    const { githubToken } = yield* AppConfig;

    const getStarred = ({ page }: { page: number }) =>
      pipe(
        HttpClient.request.get('https://api.github.com/user/starred'),
        HttpClient.request.setHeaders({
          Accept: 'application/vnd.github.v3.star+json',
        }),
        HttpClient.request.bearerToken(Redacted.value(githubToken)),
        HttpClient.request.setUrlParams({ per_page: '100', page: `${page}` }),
        HttpClient.client.fetchOk,
        Effect.andThen(HttpClient.response.schemaBodyJson(ResponseStarred)),
        Effect.orDie,
        Effect.scoped,
        Effect.withSpan('GithubRepository.getStarred', {
          attributes: { page },
        }),
      );

    return GithubApiRepository.of({ getStarred });
  }),
);
