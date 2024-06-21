import { Context, type Effect } from 'effect';
import { type ParseResult } from '@effect/schema';
import { type SqlError } from '@effect/sql';

import {
  type StarsDbRepositoryInsertResult,
  type StarsDbRepositoryStarredRepo,
} from './schema';

export class StarsDbRepository extends Context.Tag('StarsDbRepository')<
  StarsDbRepository,
  {
    insertOrUpdateStarredRepo: (
      input: StarsDbRepositoryStarredRepo,
    ) => Effect.Effect<
      StarsDbRepositoryInsertResult,
      ParseResult.ParseError | SqlError.ResultLengthMismatch | SqlError.SqlError
    >;
    fullTextSearch: (
      fullText: string,
    ) => Effect.Effect<
      ReadonlyArray<StarsDbRepositoryStarredRepo>,
      ParseResult.ParseError | SqlError.ResultLengthMismatch | SqlError.SqlError
    >;
  }
>() {}
