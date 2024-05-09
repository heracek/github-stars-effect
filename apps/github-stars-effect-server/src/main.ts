import 'dotenv-flow/config';

import { Config, Effect } from 'effect';
import { NodeServer } from 'effect-http-node';
import { NodeSdk } from '@effect/opentelemetry';
import { NodeRuntime } from '@effect/platform-node';
import * as sqlite from '@effect/sql-sqlite-node';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';

import { app } from './app';

const OpenTelemetryService = NodeSdk.layer(() => ({
  resource: { serviceName: 'notes' },
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

app.pipe(
  Effect.flatMap(NodeServer.listen({ port: 3000 })),
  Effect.provide(
    sqlite.client.layer({
      filename: Config.succeed('github-stars.db'),
    }),
  ),
  Effect.provide(OpenTelemetryService),
  NodeRuntime.runMain,
);
