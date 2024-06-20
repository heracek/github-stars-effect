import { Effect, flow, pipe } from 'effect';
import { ParseResult } from '@effect/schema';
import * as S from '@effect/schema/Schema';
import * as Sql from '@effect/sql';
import { sql as drizzleSql } from 'drizzle-orm';
import * as D from 'drizzle-orm/sqlite-core';

import { SqlClient } from '../layers/SqliteClient';
import { SqliteDrizzle } from '../layers/SqliteDrizzle';

const starredRepo = D.sqliteTable('starred_repo', {
  id: D.integer('id').primaryKey(),
  starred_at: D.text('starred_at').notNull(),
  name: D.text('name').notNull(),
  full_name: D.text('').notNull(),
  owner: D.text('').notNull(),
  html_url: D.text('').notNull(),
  language: D.text(''),
  description: D.text(''),
  topics: D.text(''),
});

export const tryInitiateStarsDbRepository = () =>
  Effect.gen(function* tryInitiateStarsDbRepository() {
    const sql = yield* SqlClient;

    yield* sql`CREATE TABLE IF NOT EXISTS starred_repo (
          id INTEGER PRIMARY KEY,
          starred_at DATE,
          name TEXT,
          full_name TEXT,
          owner TEXT,
          html_url TEXT,
          language TEXT NULL,
          description TEXT NULL,
          topics TEXT
        )`;

    // See: https://sqlite.org/fts5.html#external_content_tables
    yield* sql`CREATE VIRTUAL TABLE IF NOT EXISTS starred_repo_idx
          USING fts5(
            name,
            fullName,
            owner,
            language,
            description,
            topics,
            content='tbl',
            content_rowid='starred_repo',
            tokenize="trigram remove_diacritics 1"
          )
        `;

    yield* sql`CREATE TRIGGER IF NOT EXISTS starred_repo_ai
          AFTER INSERT ON starred_repo
          BEGIN
            INSERT INTO starred_repo_idx(
              rowid,
              name,
              fullName,
              owner,
              language,
              description,
              topics
            ) VALUES (
              new.id,
              new.name,
              new.full_name,
              json_extract(new.owner, '$.login'),
              new.language,
              new.description,
              new.topics
            );
          END
        `;
  });

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
    yield* tryInitiateStarsDbRepository();
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
          .from(starredRepo)
          .where(drizzleSql`${starredRepo.id} = ${id}`),
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
