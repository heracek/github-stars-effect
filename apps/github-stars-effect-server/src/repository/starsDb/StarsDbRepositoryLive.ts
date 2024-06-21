import { Array, Console, Effect, flow, Layer } from 'effect';
import * as S from '@effect/schema/Schema';
import * as Sql from '@effect/sql';
import * as D from 'drizzle-orm';

import * as dbSchema from '../../db/schema';
import { SqliteDrizzle } from '../../layers/SqliteDrizzle';
import {
  StarsDbRepositoryInsertResultSchema,
  StarsDbRepositoryStarredRepoSchema,
} from './schema';
import { StarsDbRepository } from './StarsDbRepository';

export const StarsDbRepositoryLive = Layer.effect(
  StarsDbRepository,
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle;

    const InsertOrUpdateStarredRepo = yield* Sql.resolver.ordered(
      'InsertOrUpdateStarredRepo',
      {
        Request: StarsDbRepositoryStarredRepoSchema,
        Result: StarsDbRepositoryInsertResultSchema,
        execute: (values) =>
          db
            .insert(dbSchema.starredRepo)
            .values(values)
            .returning({ id: dbSchema.starredRepo.id }),
      },
    );

    const insertOrUpdateStarredRepo = flow(
      InsertOrUpdateStarredRepo.execute,
      Effect.withRequestBatching(true),
    );

    const fullTextSearch = Sql.schema.findAll({
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
    });

    return StarsDbRepository.of({
      insertOrUpdateStarredRepo,
      fullTextSearch,
    });
  }),
);
