import { pipe, Effect } from 'effect';

const program = pipe(Effect.succeed(42));

console.log(await Effect.runPromise(program));
