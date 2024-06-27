import { pipe, Effect, Random, Console } from 'effect';

const asyncRandom = (delay: number) =>
  Effect.gen(function* () {
    const data = yield* Random.nextIntBetween(0, 100);

    yield* Effect.sleep(delay);

    return data;
  });

const program = pipe(
  Effect.succeed(2000),
  Effect.tap((value) => Effect.log('before sleep', value)),
  Effect.flatMap(asyncRandom),
  Effect.tap((value) => Effect.log('after sleep', value)),
);

console.log(await Effect.runPromise(program));
