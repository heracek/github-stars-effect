import {
  integer,
  numeric,
  real,
  sqliteTable,
  sqliteView,
  text,
} from 'drizzle-orm/sqlite-core';

export const starredRepo = sqliteTable('starred_repo', {
  id: integer('id').primaryKey(),
  starred_at: numeric('starred_at').notNull(),
  name: text('name').notNull(),
  full_name: text('full_name').notNull(),
  owner: text('owner').notNull(),
  html_url: text('html_url').notNull(),
  language: text('language'),
  description: text('description'),
  topics: text('topics'),
});

export const starredRepoFts5 = sqliteView('starred_repo_idx', {
  rowid: integer('rowid').primaryKey(),
  rank: real('rank'),
}).existing();
