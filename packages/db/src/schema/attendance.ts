import { pgTable, uuid, date, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees';

// Attendance table
export const attendance = pgTable('attendance', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    punchIn: timestamp('punch_in', { withTimezone: true }),
    punchOut: timestamp('punch_out', { withTimezone: true }),
}, (table) => ({
    // Unique constraint on employee + date
    employeeDateUnique: unique('attendance_employee_date_unique').on(table.employeeId, table.date),
}));

// Attendance relations
export const attendanceRelations = relations(attendance, ({ one }) => ({
    employee: one(employees, {
        fields: [attendance.employeeId],
        references: [employees.id],
    }),
}));

// Type exports
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
