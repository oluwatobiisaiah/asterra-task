import { pgTable, serial, varchar, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    address: text('address').notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('users_name_idx').on(table.firstName, table.lastName),
  })
);

// Hobbies table
export const hobbies = pgTable(
  'hobbies',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    hobby: text('hobby').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('hobbies_user_id_idx').on(table.userId),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hobbies: many(hobbies),
}));

export const hobbiesRelations = relations(hobbies, ({ one }) => ({
  user: one(users, {
    fields: [hobbies.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Hobby = typeof hobbies.$inferSelect;
export type NewHobby = typeof hobbies.$inferInsert;