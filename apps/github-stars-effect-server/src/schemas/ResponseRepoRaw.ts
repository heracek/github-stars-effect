import * as S from '@effect/schema/Schema';

export const ResponseRepoRaw = S.Struct({
  id: S.Number,
  full_name: S.String,
});
