import { Context, type Effect } from 'effect';
import { type ParseResult } from '@effect/schema';
import type * as Sql from '@effect/sql';

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
      | ParseResult.ParseError
      | Sql.error.ResultLengthMismatch
      | Sql.error.SqlError
    >;
    fullTextSearch: (
      fullText: string,
    ) => Effect.Effect<
      ReadonlyArray<StarsDbRepositoryStarredRepo>,
      | ParseResult.ParseError
      | Sql.error.ResultLengthMismatch
      | Sql.error.SqlError
    >;
  }
>() {}
