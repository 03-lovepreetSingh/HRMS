import { pgTable, uuid, text, boolean, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { employees } from './employees.js';

// Ticket status enum
export const ticketStatusEnum = pgEnum('ticket_status', ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']);

// Ticket priority enum
export const ticketPriorityEnum = pgEnum('ticket_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

// Tickets table
export const tickets = pgTable('tickets', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    subject: text('subject').notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('OPEN'),
    priority: ticketPriorityEnum('priority').notNull().default('MEDIUM'),
    assignedTo: uuid('assigned_to').references(() => employees.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

// Tickets relations
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
    employee: one(employees, {
        fields: [tickets.employeeId],
        references: [employees.id],
    }),
    assignee: one(employees, {
        fields: [tickets.assignedTo],
        references: [employees.id],
    }),
    comments: many(ticketComments),
    attachments: many(ticketAttachments),
}));

// Ticket comments table
export const ticketComments = pgTable('ticket_comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
    comment: text('comment').notNull(),
    isInternal: boolean('is_internal').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Ticket comments relations
export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
    ticket: one(tickets, {
        fields: [ticketComments.ticketId],
        references: [tickets.id],
    }),
    author: one(employees, {
        fields: [ticketComments.authorId],
        references: [employees.id],
    }),
}));

// Ticket attachments table
export const ticketAttachments = pgTable('ticket_attachments', {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

// Ticket attachments relations
export const ticketAttachmentsRelations = relations(ticketAttachments, ({ one }) => ({
    ticket: one(tickets, {
        fields: [ticketAttachments.ticketId],
        references: [tickets.id],
    }),
}));

// Type exports
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketComment = typeof ticketComments.$inferSelect;
export type NewTicketComment = typeof ticketComments.$inferInsert;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type NewTicketAttachment = typeof ticketAttachments.$inferInsert;
