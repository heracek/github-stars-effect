import { Effect } from 'effect';
import * as S from '@effect/schema/Schema';
import * as sqlite from '@effect/sql-sqlite-node';

import { ResponseStar } from '../schemas/ResponseStar';

export const tryInitiateStarsDbRepository = () =>
  Effect.gen(function* tryInitiateStarsDbRepository() {
    const sql = yield* sqlite.client.SqliteClient;

    yield* sql`CREATE TABLE IF NOT EXISTS starred_repo (
      id INTEGER PRIMARY KEY,
      starred_at TEXT,
      name: TEXT,
      full_name: TEXT UNIQUE,
      url: TEXT,
      description: TEXT,
      owner_id: INTEGER,
      created_at: TEXT,
      updated_at: TEXT,
      pushed_at: TEXT,
      stargazers_count: INTEGER,
      watchers_count: INTEGER,
      forks_count: INTEGER,
      open_issues_count: INTEGER,
      language: TEXT,
      archived: BOOLEAN,
      disabled: BOOLEAN,
      license_key: TEXT,
      license_name: TEXT,
      topics: TEXT,
      default_branch: TEXT
    )`;

    yield* sql`CREATE TABLE IF NOT EXISTS owner (
      id INTEGER PRIMARY KEY,
      login: TEXT UNIQUE,
      url: TEXT,
      avatar_url: TEXT
    )`;
  });

export const makeStarsDbRepository = () =>
  Effect.gen(function* makeStarsDbRepository() {
    // yield* tryInitiateStarsDbRepository();

    const sql = yield* sqlite.client.SqliteClient;

    const GetStar = sqlite.schema.single({
      Request: S.Number,
      Result: ResponseStar,
      execute: (id) => sql`SELECT * FROM starred_repo WHERE id = ${id}`,
    });

    return { GetStar };
  });
