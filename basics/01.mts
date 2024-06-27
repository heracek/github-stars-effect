import { pipe, Effect } from 'effect';

const program = pipe(
  Effect.succeed(123),
  Effect.map((a) => a - 100),
  Effect.map((b) => `value: ${b}`),
  Effect.flatMap((value) => Effect.fail(`Hello, ${value}!`)),
);

console.log(await Effect.runPromise(program));
