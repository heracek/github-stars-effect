import { pipe, Effect, Random } from 'effect';

const program = pipe(Effect.succeed(2000));

console.log(await Effect.runPromise(program));
