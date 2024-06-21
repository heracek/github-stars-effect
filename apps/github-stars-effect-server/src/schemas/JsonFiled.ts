import { Effect, pipe } from 'effect';
import { ParseResult } from '@effect/schema';
import * as S from '@effect/schema/Schema';

/** Transforms string JSON field to given `outSchema` */
export const JsonFiled = <A>(outSchema: S.Schema<A>) =>
  pipe(
    S.String,
    S.transformOrFail(outSchema, {
      decode: (topicsString, _, ast) =>
        pipe(
          JSON.parse(topicsString),
          S.decodeUnknown(outSchema),
          Effect.mapError(
            (error) => new ParseResult.Type(ast, topicsString, error.message),
          ),
        ),
      encode: (topics, _, ast) =>
        pipe(
          topics,
          S.encodeUnknown(outSchema),
          Effect.mapBoth({
            onFailure: (e) => new ParseResult.Type(ast, topics, e.message),
            onSuccess: (data) => JSON.stringify(data),
          }),
        ),
    }),
  );
