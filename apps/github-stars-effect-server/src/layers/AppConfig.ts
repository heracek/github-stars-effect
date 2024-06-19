import { Config, Context, Effect, Layer } from 'effect';
import { Path } from '@effect/platform';

export class AppConfig extends Context.Tag('AppConfig')<
  AppConfig,
  {
    readonly port: number;
    readonly dbFilename: string;
  }
>() {}

export const AppConfigLive = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const path = yield* Path.Path;

    const port = yield* Config.integer('PORT').pipe(Config.withDefault(4000));
    const dbFilename = yield* Config.string('DB_FILENAME').pipe(
      Config.withDefault(
        path.resolve(
          'apps',
          'github-stars-effect-server',
          'db',
          'github-stars.db',
        ),
      ),
    );

    return AppConfig.of({
      port,
      dbFilename,
    });
  }).pipe(Effect.orDie),
);
