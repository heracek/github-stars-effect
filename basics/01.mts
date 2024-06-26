import { pipe, Effect } from 'effect';

const program = pipe(
  Effect.succeed(42),
  Effect.tap(Effect.log),
  Effect.tap(Effect.sleep('2 second')),
  Effect.map((a) => a + 10_000),
  Effect.tap(Effect.log),
);

console.log(await Effect.runPromise(program));
