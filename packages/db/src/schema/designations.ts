import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees';

// Designations table
export const designations = pgTable('designations', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
});

// Designation relations
export const designationsRelations = relations(designations, ({ many }) => ({
    employees: many(employees),
}));

// Type exports
export type Designation = typeof designations.$inferSelect;
export type NewDesignation = typeof designations.$inferInsert;
