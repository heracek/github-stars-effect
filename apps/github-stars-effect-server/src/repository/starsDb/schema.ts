import * as S from '@effect/schema/Schema';

import { JsonFiled } from '../../schemas/JsonFiled';

export const StarsDbRepositoryOwnerSchema = S.Struct({
  id: S.Number,
  login: S.String,
});

export type StarsDbRepositoryOwner = typeof StarsDbRepositoryOwnerSchema.Type;

export const StarsDbRepositoryStarredRepoSchema = S.Struct({
  id: S.Number,
  starred_at: S.Date,
  name: S.String,
  full_name: S.String,
  owner: JsonFiled(StarsDbRepositoryOwnerSchema),
  html_url: S.String,
  language: S.String.pipe(S.NullOr),
  description: S.String.pipe(S.NullOr),
  topics: JsonFiled(S.Array(S.String)),
});

export type StarsDbRepositoryStarredRepo =
  typeof StarsDbRepositoryStarredRepoSchema.Type;

export const StarsDbRepositoryInsertResultSchema = S.Struct({
  id: S.Number,
});

export type StarsDbRepositoryInsertResult =
  typeof StarsDbRepositoryInsertResultSchema.Type;
