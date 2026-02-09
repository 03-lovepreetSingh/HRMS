import { pgTable, uuid, text, date, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees.js';

// Review cycles table
export const reviewCycles = pgTable('review_cycles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
});

// Review cycles relations
export const reviewCyclesRelations = relations(reviewCycles, ({ many }) => ({
    performanceReviews: many(performanceReviews),
}));

// Performance reviews table
export const performanceReviews = pgTable('performance_reviews', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    managerId: uuid('manager_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    reviewCycleId: uuid('review_cycle_id').notNull().references(() => reviewCycles.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    feedback: text('feedback'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Performance reviews relations
export const performanceReviewsRelations = relations(performanceReviews, ({ one }) => ({
    employee: one(employees, {
        fields: [performanceReviews.employeeId],
        references: [employees.id],
        relationName: 'reviewsReceived',
    }),
    manager: one(employees, {
        fields: [performanceReviews.managerId],
        references: [employees.id],
        relationName: 'reviewsGiven',
    }),
    reviewCycle: one(reviewCycles, {
        fields: [performanceReviews.reviewCycleId],
        references: [reviewCycles.id],
    }),
}));

// Type exports
export type ReviewCycle = typeof reviewCycles.$inferSelect;
export type NewReviewCycle = typeof reviewCycles.$inferInsert;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type NewPerformanceReview = typeof performanceReviews.$inferInsert;
