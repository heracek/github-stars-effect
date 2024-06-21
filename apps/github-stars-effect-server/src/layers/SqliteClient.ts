import { Context, Effect, Layer } from 'effect';
import * as Client from '@effect/sql/Client';
import * as Sqlite from '@effect/sql-sqlite-node';
import { SqliteClient } from '@effect/sql-sqlite-node/Client';

import { AppConfig } from './AppConfig';

export const SqliteClientLive = Layer.scopedContext(
  Effect.gen(function* () {
    const { dbFilename } = yield* AppConfig;

    yield* Effect.log('SqliteClientLive', dbFilename);

    const client = yield* Sqlite.client.make({
      filename: dbFilename,
    });

    return Context.make(SqliteClient, client).pipe(
      Context.add(Client.Client, client),
    );
  }),
);
