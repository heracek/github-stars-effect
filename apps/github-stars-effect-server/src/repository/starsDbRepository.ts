import { Array, Effect, flow, pipe } from 'effect';
import { ParseResult } from '@effect/schema';
import * as S from '@effect/schema/Schema';
import * as Sql from '@effect/sql';
import * as D from 'drizzle-orm';

import * as dbSchema from '../db/schema';
import { SqlClient } from '../layers/SqliteClient';
import { SqliteDrizzle } from '../layers/SqliteDrizzle';

class RepositoryOwner extends S.Class<RepositoryOwner>('RepositoryOwner')({
  id: S.Number,
  login: S.String,
}) {}

const JsonFiled = <A>(outSchema: S.Schema<A>) =>
  pipe(
    S.String,
    S.transformOrFail(outSchema, {
      decode: (topicsString, _, ast) =>
        pipe(
          JSON.parse(topicsString),
          S.decodeUnknown(outSchema),
          Effect.mapError(
            (error) => new ParseResult.Type(ast, topicsString, error.message),
          ),
        ),
      encode: (topics, _, ast) =>
        pipe(
          topics,
          S.encodeUnknown(outSchema),
          Effect.mapBoth({
            onFailure: (e) => new ParseResult.Type(ast, topics, e.message),
            onSuccess: (data) => JSON.stringify(data),
          }),
        ),
    }),
  );

export class RepositoryStarredRepo extends S.Class<RepositoryStarredRepo>(
  'RepositoryStarredRepo',
)({
  id: S.Number,
  starred_at: S.Date,
  name: S.String,
  full_name: S.String,
  owner: JsonFiled(RepositoryOwner),
  html_url: S.String,
  language: S.String.pipe(S.NullOr),
  description: S.String.pipe(S.NullOr),
  topics: JsonFiled(S.Array(S.String)),
}) {}

export const makeStarsDbRepository = () =>
  Effect.gen(function* makeStarsDbRepository() {
    const sql = yield* SqlClient;
    const db = yield* SqliteDrizzle;

    const InsertOrUpdateStarredRepo = yield* Sql.resolver.ordered(
      'InsertOrUpdateStarredRepo',
      {
        Request: RepositoryStarredRepo,
        Result: S.Struct({ id: S.Number }),
        execute: (values) =>
          sql`INSERT OR REPLACE INTO starred_repo
            ${sql.insert(values)}
            RETURNING id`,
      },
    );

    const GetStar = Sql.schema.single({
      Request: S.Number,
      Result: RepositoryStarredRepo,
      execute: (id) =>
        db
          .select()
          .from(dbSchema.starredRepo)
          .where(D.eq(dbSchema.starredRepo.id, id)),
    });

    const fullTextSearch = Sql.schema.findAll({
      Request: S.String,
      Result: RepositoryStarredRepo,
      execute: (fullText) =>
        sql`
          SELECT starred_repo.* FROM starred_repo
          JOIN starred_repo_idx ON
            starred_repo.id = starred_repo_idx.rowid
          WHERE
            starred_repo_idx MATCH ${fullText}
          ORDER BY rank, date(starred_repo.starred_at) DESC
          LIMIT 50
        `,
    });

    const FunctionList = Sql.schema.findAll({
      Request: S.Undefined,
      Result: S.Any,
      execute: () => sql`PRAGMA function_list`,
    });

    return {
      GetStar,
      FunctionList,
      insertOrUpdateStarredRepo: flow(
        InsertOrUpdateStarredRepo.execute,
        Effect.withRequestBatching(true),
      ),
      fullTextSearch,
    };
  });
