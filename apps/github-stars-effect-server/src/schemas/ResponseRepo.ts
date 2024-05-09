import * as S from '@effect/schema/Schema';

export const ResponseRepo = S.Struct({
  id: S.Number,
  name: S.String,
  full_name: S.String,
  html_url: S.String,
  description: S.String.pipe(S.NullOr),
  owner: S.Struct({
    id: S.Number,
    login: S.String,
    html_url: S.String,
    avatar_url: S.String,
  }).pipe(
    S.rename({
      html_url: 'url',
      avatar_url: 'avatarUrl',
    }),
  ),
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
  }).pipe(S.NullOr),
  topics: S.Array(S.String),
  default_branch: S.String,
}).pipe(
  S.rename({
    full_name: 'fullName',
    html_url: 'url',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    pushed_at: 'pushedAt',
    stargazers_count: 'stars',
    watchers_count: 'watchers',
    forks_count: 'forks',
    open_issues_count: 'openIssues',
    default_branch: 'defaultBranch',
  }),
);
