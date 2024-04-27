import { Context, Effect, Layer } from 'effect';
import { SqlClient } from '@effect/sql';
import { SqliteClient } from '@effect/sql-sqlite-node';

import { AppConfig } from './AppConfig';

export const SqliteClientLive = Layer.scopedContext(
  Effect.gen(function* () {
    const { dbFilename } = yield* AppConfig;

    const client = yield* SqliteClient.make({
      filename: dbFilename,
    });

    return Context.make(SqliteClient.SqliteClient, client).pipe(
      Context.add(SqlClient.SqlClient, client),
    );
  }),
);
