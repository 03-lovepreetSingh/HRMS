import { pgTable, uuid, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { users } from './users';

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', [
    'LEAVE_REQUEST',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'TICKET_CREATED',
    'TICKET_UPDATED',
    'TICKET_RESOLVED',
    'PAYROLL_GENERATED',
    'REVIEW_PENDING',
    'GENERAL',
]);

// Notifications table
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    type: notificationTypeEnum('type').notNull().default('GENERAL'),
    isRead: boolean('is_read').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

// Type exports
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
