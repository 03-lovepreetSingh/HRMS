import { pgTable, uuid, numeric, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees';

// Salaries table
export const salaries = pgTable('salaries', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }).unique(),
    baseSalary: numeric('base_salary', { precision: 12, scale: 2 }).notNull(),
    allowances: jsonb('allowances').$type<Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>>().default([]),
    deductions: jsonb('deductions').$type<Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>>().default([]),
});

// Salaries relations
export const salariesRelations = relations(salaries, ({ one }) => ({
    employee: one(employees, {
        fields: [salaries.employeeId],
        references: [employees.id],
    }),
}));

// Payroll runs table
export const payrollRuns = pgTable('payroll_runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    month: integer('month').notNull(),
    year: integer('year').notNull(),
    isLocked: boolean('is_locked').notNull().default(false),
});

// Type exports
export type Salary = typeof salaries.$inferSelect;
export type NewSalary = typeof salaries.$inferInsert;
export type PayrollRun = typeof payrollRuns.$inferSelect;
export type NewPayrollRun = typeof payrollRuns.$inferInsert;
