import { pgTable, uuid, text, integer, date, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees.js';

// Leave status enum
export const leaveStatusEnum = pgEnum('leave_status', ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

// Leave types table
export const leaveTypes = pgTable('leave_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    annualQuota: integer('annual_quota').notNull().default(0),
});

// Leave types relations
export const leaveTypesRelations = relations(leaveTypes, ({ many }) => ({
    leaveRequests: many(leaveRequests),
}));

// Leave requests table
export const leaveRequests = pgTable('leave_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    leaveTypeId: uuid('leave_type_id').notNull().references(() => leaveTypes.id, { onDelete: 'cascade' }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    status: leaveStatusEnum('status').notNull().default('PENDING'),
    reason: text('reason'),
    approvedBy: uuid('approved_by').references(() => employees.id, { onDelete: 'set null' }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Leave requests relations
export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
    employee: one(employees, {
        fields: [leaveRequests.employeeId],
        references: [employees.id],
    }),
    leaveType: one(leaveTypes, {
        fields: [leaveRequests.leaveTypeId],
        references: [leaveTypes.id],
    }),
    approver: one(employees, {
        fields: [leaveRequests.approvedBy],
        references: [employees.id],
    }),
}));

// Type exports
export type LeaveType = typeof leaveTypes.$inferSelect;
export type NewLeaveType = typeof leaveTypes.$inferInsert;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
