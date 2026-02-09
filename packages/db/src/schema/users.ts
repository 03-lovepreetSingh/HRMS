import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User role enum
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']);

// Users table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('EMPLOYEE'),
    status: boolean('status').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// User relations
export const usersRelations = relations(users, ({ one }) => ({
    employee: one(employees, {
        fields: [users.id],
        references: [employees.userId],
    }),
}));

// Import employees for relations (circular import resolved at runtime)
import { employees } from './employees.js';

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
