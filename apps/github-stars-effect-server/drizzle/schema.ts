import { sql } from 'drizzle-orm';
import {
  AnySQLiteColumn,
  integer,
  numeric,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const starred_repo = sqliteTable('starred_repo', {
  id: integer('id').primaryKey().notNull(),
  starred_at: numeric('starred_at').notNull(),
  name: text('name').notNull(),
  full_name: text('full_name').notNull(),
  owner: text('owner').notNull(),
  html_url: text('html_url').notNull(),
  language: text('language'),
  description: text('description'),
  topics: text('topics'),
});
