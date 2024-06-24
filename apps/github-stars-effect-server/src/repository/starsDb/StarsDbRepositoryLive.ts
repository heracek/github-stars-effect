import { Array, Effect, flow, Layer } from 'effect';
import * as S from '@effect/schema/Schema';
import { SqlResolver, SqlSchema } from '@effect/sql';
import * as D from 'drizzle-orm';

import * as dbSchema from '../../db/schema';
import { SqliteDrizzle } from '../../layers/SqliteDrizzle';
import {
  StarsDbRepositoryInsertResultSchema,
  StarsDbRepositoryStarredRepoSchema,
} from './schema';
import { StarsDbRepository, StarsDbRepositoryError } from './StarsDbRepository';

const makeError = (message: string) => new StarsDbRepositoryError({ message });

export const StarsDbRepositoryLive = Layer.effect(
  StarsDbRepository,
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle;

    const InsertOrUpdateStarredRepo = yield* SqlResolver.ordered(
      'InsertOrUpdateStarredRepo',
      {
        Request: StarsDbRepositoryStarredRepoSchema,
        Result: StarsDbRepositoryInsertResultSchema,
        execute: (values) =>
          db
            .insert(dbSchema.starredRepo)
            .values(values)
            .returning({ id: dbSchema.starredRepo.id })
            .onConflictDoUpdate({
              target: dbSchema.starredRepo.id,
              set: Object.assign(
                {},
                ...Object.keys(values[0])
                  // If row exists update all except of `id`
                  .filter((k) => k !== 'id')
                  .map((k) => ({ [k]: D.sql.raw(`excluded.${k}`) })),
              ),
            })
            .pipe(
              Effect.withSpan('InsertOrUpdateStarredRepo.upsert', {
                attributes: { valuesCount: values.length },
              }),
            ),
      },
    );

    const insertOrUpdateStarredRepo = flow(
      InsertOrUpdateStarredRepo.execute,
      Effect.withRequestBatching(true),
      Effect.catchTags({
        ParseError: () => makeError('Error parsing data from database query'),
        SqlError: () => makeError('SQL Error'),
        ResultLengthMismatch: () => makeError('Result length mismatch error'),
      }),
    );

    const fullTextSearch = flow(
      SqlSchema.findAll({
        Request: S.String,
        Result: StarsDbRepositoryStarredRepoSchema,
        execute: (fullText) =>
          db
            .select()
            .from(dbSchema.starredRepo)
            .innerJoin(
              dbSchema.starredRepoFts5,
              D.eq(dbSchema.starredRepo.id, dbSchema.starredRepoFts5.rowid),
            )
            .where(D.sql`starred_repo_idx MATCH ${fullText}`)
            .orderBy(dbSchema.starredRepoFts5.rank)
            .limit(50)
            .pipe(Effect.map(Array.map(({ starred_repo }) => starred_repo))),
      }),
      Effect.catchTags({
        ParseError: () => makeError('Error parsing data from database query'),
        SqlError: () => makeError('SQL Error'),
      }),
    );

    return StarsDbRepository.of({
      insertOrUpdateStarredRepo,
      fullTextSearch,
    });
  }),
);
