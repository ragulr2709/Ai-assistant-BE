import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  // Store hashed refresh token (nullable),
  role: text('role').notNull().default('user'),
  refresh_token: text('refresh_token'),
});
