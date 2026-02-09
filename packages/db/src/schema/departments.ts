import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees.js';

// Departments table
export const departments = pgTable('departments', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
});

// Department relations
export const departmentsRelations = relations(departments, ({ many }) => ({
    employees: many(employees),
}));

// Type exports
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
