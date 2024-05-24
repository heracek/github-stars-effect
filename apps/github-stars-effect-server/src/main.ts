import 'dotenv-flow/config';

import { Config, Effect, pipe } from 'effect';
import { NodeServer } from 'effect-http-node';
import { NodeSdk } from '@effect/opentelemetry';
import { NodeRuntime } from '@effect/platform-node';
import * as sqlite from '@effect/sql-sqlite-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';

import { app } from './app';

const ENABLE_DOCKER_TELEMETRY = true;

const OpenTelemetryService = NodeSdk.layer(() => ({
  resource: { serviceName: 'github-stars-effect-server' },
  spanProcessor: new BatchSpanProcessor(
    ENABLE_DOCKER_TELEMETRY
      ? new OTLPTraceExporter()
      : new ConsoleSpanExporter(),
  ),
  // metricReader: ENABLE_DOCKER_TELEMETRY
  //   ? new PrometheusExporter({ port: 9090 }, console.error)
  //   : undefined,
}));

pipe(
  Effect.gen(function* () {
    const port = yield* Config.integer('PORT').pipe(Config.withDefault(4000));
    const dbFilenameConfig = Config.string('DB_FILENAME').pipe(
      Config.withDefault('github-stars.db'),
    );

    return yield* pipe(
      app,
      Effect.flatMap(NodeServer.listen({ port })),
      Effect.provide(
        sqlite.client.layer({
          filename: dbFilenameConfig,
        }),
      ),
    );
  }),
  Effect.provide(OpenTelemetryService),
  NodeRuntime.runMain,
);
