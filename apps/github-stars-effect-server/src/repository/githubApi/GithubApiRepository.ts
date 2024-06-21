import { Context, type Effect } from 'effect';

import { type ResponseStarred } from './schema';

export class GithubApiRepository extends Context.Tag('GithubApiRepository')<
  GithubApiRepository,
  {
    getStarred: (options: { page: number }) => Effect.Effect<ResponseStarred>;
  }
>() {}
