import { Effect, pipe } from 'effect';
import { Path } from '@effect/platform';
import { NodePath } from '@effect/platform-node';
import { defineConfig } from 'drizzle-kit';

import { AppConfig, AppConfigLive } from './src/layers/AppConfig';

const config = Effect.runSync(
  pipe(
    Effect.gen(function* () {
      const { dbFilename, appRootDir } = yield* AppConfig;
      const path = yield* Path.Path;

      return defineConfig({
        schema: path.join(appRootDir, 'src', 'db', 'schema.ts'),
        out: path.join(appRootDir, 'drizzle'),
        dialect: 'sqlite',
        dbCredentials: {
          url: dbFilename,
        },
        verbose: true,
        strict: true,
        breakpoints: true,
        tablesFilter: ['starred_repo'],
        introspect: {
          casing: 'preserve',
        },
      });
    }),
    Effect.provide(AppConfigLive),
    Effect.provide(NodePath.layer),
  ),
);

export default config;
