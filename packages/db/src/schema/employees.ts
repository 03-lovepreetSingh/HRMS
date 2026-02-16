import { pgTable, uuid, text, boolean, timestamp, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';
import { departments } from './departments';
import { designations } from './designations';

// Employees table
export const employees = pgTable('employees', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    designationId: uuid('designation_id').references(() => designations.id, { onDelete: 'set null' }),
    managerId: uuid('manager_id'),
    joiningDate: date('joining_date'),
    profilePhoto: text('profile_photo'),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Employee relations
export const employeesRelations = relations(employees, ({ one, many }) => ({
    user: one(users, {
        fields: [employees.userId],
        references: [users.id],
    }),
    department: one(departments, {
        fields: [employees.departmentId],
        references: [departments.id],
    }),
    designation: one(designations, {
        fields: [employees.designationId],
        references: [designations.id],
    }),
    manager: one(employees, {
        fields: [employees.managerId],
        references: [employees.id],
        relationName: 'manager',
    }),
    subordinates: many(employees, {
        relationName: 'manager',
    }),
}));

// Type exports
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
