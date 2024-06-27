import { Context, Data, type Effect } from 'effect';

import { type ResponseStarred } from './schema';

export class GithubApiRepositoryApiError extends Data.TaggedError(
  'GithubApiRepositoryApiError',
)<{ message: string }> {}

export class GithubApiRepository extends Context.Tag('GithubApiRepository')<
  GithubApiRepository,
  {
    getStarred: (options: {
      page: number;
    }) => Effect.Effect<ResponseStarred, GithubApiRepositoryApiError>;
  }
>() {}
