import { Config, Context, Effect, Layer, type Redacted } from 'effect';
import { Path } from '@effect/platform';

export class AppConfig extends Context.Tag('AppConfig')<
  AppConfig,
  {
    readonly port: number;
    readonly dbFilename: string;
    readonly appRootDir: string;
    readonly githubToken: Redacted.Redacted;
  }
>() {}

export const AppConfigLive = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const path = yield* Path.Path;

    const port = yield* Config.integer('PORT').pipe(Config.withDefault(4000));

    const appRootDir = yield* Config.string('APP_ROOT_DIR');

    const dbFilename = yield* Config.string('DB_FILENAME').pipe(
      Config.withDefault(path.join(appRootDir, 'db', 'github-stars.db')),
    );

    const githubToken = yield* Config.redacted('GITHUB_TOKEN');

    return AppConfig.of({
      port,
      appRootDir,
      dbFilename,
      githubToken,
    });
  }).pipe(Effect.orDie),
);
