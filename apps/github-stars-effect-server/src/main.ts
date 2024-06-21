import 'dotenv-flow/config';

import { Effect, pipe } from 'effect';
import { NodeServer } from 'effect-http-node';
import { NodePath, NodeRuntime } from '@effect/platform-node';

import { app } from './app';
import { AppConfig, AppConfigLive } from './layers/AppConfig';
import { OpenTelemetryService } from './layers/OpenTelemetryService';
import { SqliteClientLive } from './layers/SqliteClient';
import { SqliteDrizzleLive } from './layers/SqliteDrizzle';
import { GithubApiRepositoryLive } from './repository/GithubApiRepository';
import { StarsDbRepositoryLive } from './repository/starsDb/StarsDbRepositoryLive';

const liveApp = pipe(
  Effect.gen(function* () {
    const { port } = yield* AppConfig;

    yield* pipe(app, Effect.flatMap(NodeServer.listen({ port })));
  }),
  Effect.provide(GithubApiRepositoryLive),
  Effect.provide(StarsDbRepositoryLive),
  Effect.provide(SqliteDrizzleLive),
  Effect.provide(SqliteClientLive),
  Effect.provide(OpenTelemetryService),
  Effect.provide(AppConfigLive),
  Effect.provide(NodePath.layer),
);

NodeRuntime.runMain(liveApp);
