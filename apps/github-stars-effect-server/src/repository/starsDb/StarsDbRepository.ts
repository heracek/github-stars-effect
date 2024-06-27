import { Context, Data, type Effect } from 'effect';

import {
  type StarsDbRepositoryInsertResult,
  type StarsDbRepositoryStarredRepo,
} from './schema';

export class StarsDbRepositoryError extends Data.TaggedError(
  'StarsDbRepositoryError',
)<{ message: string }> {}

export class StarsDbRepository extends Context.Tag('StarsDbRepository')<
  StarsDbRepository,
  {
    insertOrUpdateStarredRepo: (
      input: StarsDbRepositoryStarredRepo,
    ) => Effect.Effect<StarsDbRepositoryInsertResult, StarsDbRepositoryError>;

    fullTextSearch: (
      fullText: string,
    ) => Effect.Effect<
      ReadonlyArray<StarsDbRepositoryStarredRepo>,
      StarsDbRepositoryError
    >;
  }
>() {}
