import * as S from '@effect/schema/Schema';

export const RepositoryOwnerSchema = S.Struct({
  id: S.Number,
  login: S.String,
});
export type RepositoryOwner = typeof RepositoryOwnerSchema.Type;

export const StarredRepoSchema = S.Struct({
  id: S.Number,
  starred_at: S.Date,
  name: S.String,
  full_name: S.String,
  owner: RepositoryOwnerSchema,
  html_url: S.String,
  language: S.String.pipe(S.NullOr),
  description: S.String.pipe(S.NullOr),
  topics: S.Array(S.String),
});
export type StarredRepo = typeof StarredRepoSchema.Type;

export const GetStarsResponseSchema = S.Struct({
  error: S.String.pipe(S.NullOr),
  results: S.Array(StarredRepoSchema),
});
export type GetStarsResponse = typeof GetStarsResponseSchema.Type;
