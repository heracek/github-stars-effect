import * as S from '@effect/schema/Schema';

export class RepositoryOwner extends S.Class<RepositoryOwner>(
  'RepositoryOwner',
)({
  id: S.Number,
  login: S.String,
}) {}

export class StarredRepo extends S.Class<StarredRepo>('StarredRepo')({
  id: S.Number,
  starred_at: S.Date,
  name: S.String,
  full_name: S.String,
  owner: RepositoryOwner,
  html_url: S.String,
  language: S.String.pipe(S.NullOr),
  description: S.String.pipe(S.NullOr),
  topics: S.Array(S.String),
}) {}

export const GetStarsResponse = S.Array(StarredRepo);
