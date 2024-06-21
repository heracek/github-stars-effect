import * as S from '@effect/schema/Schema';

export const InputOwnerSchema = S.Struct({
  id: S.Number,
  login: S.String,
  html_url: S.String,
  avatar_url: S.String,
});
export type InputOwner = typeof InputOwnerSchema.Type;

export const ResponseRepoSchema = S.Struct({
  id: S.Number,
  name: S.String,
  full_name: S.String,
  html_url: S.String,
  description: S.String.pipe(S.NullOr),
  owner: InputOwnerSchema,
  created_at: S.Date,
  updated_at: S.Date,
  pushed_at: S.Date,
  stargazers_count: S.Number,
  watchers_count: S.Number,
  forks_count: S.Number,
  open_issues_count: S.Number,
  language: S.String.pipe(S.NullOr),
  archived: S.Boolean,
  disabled: S.Boolean,
  license: S.Struct({
    key: S.String,
    name: S.String,
  }).pipe(S.annotations({ identifier: 'License' }), S.NullOr),
  topics: S.Array(S.String),
  defaultBranch: S.propertySignature(S.String).pipe(
    S.fromKey('default_branch'),
  ),
});
export type ResponseRepo = typeof ResponseRepoSchema.Type;
