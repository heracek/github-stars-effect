import { Layer } from 'effect';
import * as SqlDrizzle from '@effect/sql-drizzle/Sqlite';

import { SqliteClientLive } from './SqliteClient';

export const SqliteDrizzle = SqlDrizzle.SqliteDrizzle;

export const SqliteDrizzleLive = SqlDrizzle.layer.pipe(
  Layer.provide(SqliteClientLive),
);
