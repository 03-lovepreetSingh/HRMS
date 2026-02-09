import { pgTable, uuid, jsonb, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Working days type
interface WorkingDays {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
}

// Office hours type
interface OfficeHours {
    startTime: string;
    endTime: string;
    timezone: string;
    graceMinutes: number;
}

// Company settings table
export const companySettings = pgTable('company_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    companyName: text('company_name').notNull().default('AI-HRMS'),
    workingDays: jsonb('working_days').$type<WorkingDays>().notNull().default({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    }),
    officeHours: jsonb('office_hours').$type<OfficeHours>().notNull().default({
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'UTC',
        graceMinutes: 15,
    }),
    fiscalYearStart: integer('fiscal_year_start').notNull().default(4), // April
    leaveYearStart: integer('leave_year_start').notNull().default(1), // January
    currency: text('currency').notNull().default('USD'),
    dateFormat: text('date_format').notNull().default('YYYY-MM-DD'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Type exports
export type CompanySettings = typeof companySettings.$inferSelect;
export type NewCompanySettings = typeof companySettings.$inferInsert;
