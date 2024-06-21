import { Effect, Layer, pipe, Redacted } from 'effect';
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform';

import { AppConfig } from '../../layers/AppConfig';
import { GithubApiRepository } from './GithubApiRepository';
import { ResponseStarredSchema } from './schema';

export const GithubApiRepositoryLive = Layer.effect(
  GithubApiRepository,
  Effect.gen(function* makeGithubRepository() {
    const { githubToken } = yield* AppConfig;

    const getStarred = ({ page }: { page: number }) =>
      pipe(
        HttpClientRequest.get('https://api.github.com/user/starred'),
        HttpClientRequest.setHeaders({
          Accept: 'application/vnd.github.v3.star+json',
        }),
        HttpClientRequest.bearerToken(Redacted.value(githubToken)),
        HttpClientRequest.setUrlParams({ per_page: '100', page: `${page}` }),
        HttpClient.fetchOk,
        Effect.andThen(
          HttpClientResponse.schemaBodyJson(ResponseStarredSchema),
        ),
        Effect.orDie,
        Effect.scoped,
        Effect.withSpan('GithubRepository.getStarred', {
          attributes: { page },
        }),
      );

    return GithubApiRepository.of({ getStarred });
  }),
);
