import 'dotenv-flow/config';

import { serve } from '@hono/node-server';
import {
  Config,
  Console,
  Context,
  Effect,
  Layer,
  pipe,
  Runtime,
  Secret,
} from 'effect';
import * as S from '@effect/schema/Schema';
import { HttpClient } from '@effect/platform';
import { NodeRuntime } from '@effect/platform-node';
import * as hono from 'hono';

class Hono extends Context.Tag('Hono')<Hono, hono.Hono>() {}
const HonoLive = Layer.sync(Hono, () => new hono.Hono());
type HoneResponse = Response | hono.TypedResponse;

const ResponseRepo = S.Struct({
  id: S.Number,
  name: S.String,
  full_name: S.String,
  html_url: S.String,
  description: S.String.pipe(S.NullOr),
  owner: S.Struct({
    id: S.Number,
    login: S.String,
    html_url: S.String,
    avatar_url: S.String,
  }).pipe(
    S.rename({
      html_url: 'url',
      avatar_url: 'avatarUrl',
    }),
  ),
  created_at: S.Date,
  updated_at: S.Date,
  pushed_at: S.Date,
  stargazers_count: S.Number,
  watchers_count: S.Number,
  forks_count: S.Number,
  open_issues_count: S.Number,
  language: S.String.pipe(S.NullOr),
  archived: S.Boolean,
  disabled: S.Boolean,
  license: S.Struct({
    key: S.String,
    name: S.String,
  }).pipe(S.NullOr),
  topics: S.Array(S.String),
  default_branch: S.String,
}).pipe(
  S.rename({
    full_name: 'fullName',
    html_url: 'url',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    pushed_at: 'pushedAt',
    stargazers_count: 'stars',
    watchers_count: 'watchers',
    forks_count: 'forks',
    open_issues_count: 'openIssues',
    default_branch: 'defaultBranch',
  }),
);

const ResponseStar = S.Struct({
  starred_at: S.Date,
  repo: ResponseRepo,
}).pipe(
  S.rename({
    starred_at: 'starredAt',
  }),
);

const ResponseStarred = S.Array(ResponseStar);

const get = <R>(
  path: string,
  body: (req: hono.Context) => Effect.Effect<HoneResponse, never, R>,
) =>
  Effect.gen(function* () {
    const app = yield* Hono;
    const runPromise = Runtime.runPromise(yield* Effect.runtime<R>());

    app.get(path, (context) => runPromise(body(context)));
  });

const IndexRouteLive = Layer.effectDiscard(
  Effect.gen(function* () {
    yield* get('/', (c) =>
      Effect.gen(function* () {
        const githubToken = yield* pipe(
          Config.secret('GITHUB_TOKEN'),
          Effect.orDie,
        );

        const response = yield* pipe(
          HttpClient.request.get('https://api.github.com/user/starred'),
          HttpClient.request.setHeaders({
            Accept: 'application/vnd.github.v3.star+json',
          }),
          HttpClient.request.bearerToken(Secret.value(githubToken)),
          HttpClient.client.fetchOk,
          Effect.tap((response) => Effect.log(response)),
          // HttpClient.response.json,
          Effect.andThen(HttpClient.response.schemaBodyJson(ResponseStarred)),
          Effect.orDie,
          Effect.scoped,
        );

        //       curl -L \
        // -H "Accept: application/vnd.github.v3.star+json" \
        // -H "Authorization: Bearer <YOUR-TOKEN>" \
        // -H "X-GitHub-Api-Version: 2022-11-28" \
        // https://api.github.com/user/starred

        return c.json({ response });
      }).pipe(Effect.withSpan('route_index')),
    );

    yield* get('/abc', (c) =>
      Effect.gen(function* () {
        return c.json({ data: 'abc' });
      }).pipe(Effect.withSpan('route_index')),
    );
  }),
);

// Server Setup
const ServerLive = Layer.scopedDiscard(
  Effect.gen(function* (_) {
    const port = 3000;
    const app = yield* _(Hono);
    const runFork = Runtime.runFork(yield* _(Effect.runtime<never>()));

    yield* _(
      Effect.acquireRelease(
        Effect.sync(() =>
          serve({
            fetch: app.fetch,
            port,
          }).once('listening', () =>
            runFork(
              Console.log(`➡️ Server running on: http://127.0.0.1:${port}`),
            ),
          ),
        ),
        (server) =>
          Effect.sync(() => {
            server.close();
            console.log('--- closed');
          }),
      ),
    );
  }),
);

const AppLive = ServerLive.pipe(
  Layer.provide(IndexRouteLive),
  Layer.provide(HonoLive),
);

NodeRuntime.runMain(Layer.launch(AppLive));
