import { Layer } from 'effect';
import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';

import { SqliteClientLive } from './SqliteClient';

export const SqliteDrizzleLive = SqliteDrizzle.layer.pipe(
  Layer.provide(SqliteClientLive),
);
