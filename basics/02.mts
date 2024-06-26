import { pipe, Effect, Random } from 'effect';

const asyncRandom = (delay: number) =>
  Effect.gen(function* () {
    const data = yield* Random.nextIntBetween(0, 100);

    yield* Effect.sleep(delay);

    return data;
  });

const program = pipe(
  Effect.succeed(2000),
  Effect.tap(Effect.log),
  Effect.flatMap(asyncRandom),
  Effect.tap(Effect.log),
);

console.log(await Effect.runPromise(program));
