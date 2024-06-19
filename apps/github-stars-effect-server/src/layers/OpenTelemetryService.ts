import { NodeSdk } from '@effect/opentelemetry';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';

const ENABLE_DOCKER_TELEMETRY = true;

export const OpenTelemetryService = NodeSdk.layer(() => ({
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
