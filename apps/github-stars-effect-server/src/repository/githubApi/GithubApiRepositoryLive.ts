import { Effect, Layer, pipe, Redacted } from 'effect';
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform';

import { AppConfig } from '../../layers/AppConfig';
import {
  GithubApiRepository,
  GithubApiRepositoryApiError,
} from './GithubApiRepository';
import { ResponseStarredSchema } from './schema';

const makeError = (message: string) =>
  new GithubApiRepositoryApiError({ message });

export const GithubApiRepositoryLive = Layer.effect(
  GithubApiRepository,
  Effect.gen(function* makeGithubRepository() {
    const { githubToken } = yield* AppConfig;

    const getStarredRepositoriesWithPage = ({ page }: { page: number }) =>
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
        Effect.catchTags({
          RequestError: () => makeError('Error requesting GitHub API'),
          ResponseError: () => makeError('Incorrect response from GitHub API'),
          ParseError: () => makeError('Error parsing GitHub API response'),
        }),
        Effect.scoped,
        Effect.withSpan('GithubRepository.getStarred', {
          attributes: { page },
        }),
      );

    return GithubApiRepository.of({
      getStarredRepositoriesWithPage,
    });
  }),
);
