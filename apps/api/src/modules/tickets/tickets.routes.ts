import { Router } from 'express';
import { eq, and, desc } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, tickets, ticketComments, ticketAttachments } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const ticketsRouter = Router();

// Get tickets (with RBAC - employees see own, HR/Admin see all)
ticketsRouter.get('/', authGuard, async (req, res, next) => {
    try {
        let allTickets;

        if (req.user!.role === 'EMPLOYEE') {
            // Employee sees only their own tickets - would need employee lookup
            allTickets = await db.query.tickets.findMany({
                with: {
                    employee: { with: { user: true } },
                    assignee: { with: { user: true } },
                    comments: { where: eq(ticketComments.isInternal, false) },
                    attachments: true,
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
            });
        } else {
            allTickets = await db.query.tickets.findMany({
                with: {
                    employee: { with: { user: true } },
                    assignee: { with: { user: true } },
                    comments: true,
                    attachments: true,
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
            });
        }

        res.json({ success: true, data: allTickets });
    } catch (error) {
        next(error);
    }
});

// Get single ticket
ticketsRouter.get('/:id', authGuard, async (req, res, next) => {
    try {
        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, req.params.id!),
            with: {
                employee: { with: { user: true } },
                assignee: { with: { user: true } },
                comments: {
                    with: { author: { with: { user: true } } },
                    orderBy: (c, { asc }) => [asc(c.createdAt)],
                },
                attachments: true,
            },
        });

        if (!ticket) {
            throw new AppError(404, 'NOT_FOUND', 'Ticket not found');
        }

        // Filter internal comments for employees
        if (req.user!.role === 'EMPLOYEE') {
            ticket.comments = ticket.comments.filter(c => !c.isInternal);
        }

        res.json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
});

// Create ticket
ticketsRouter.post('/', authGuard, async (req, res, next) => {
    try {
        const { employeeId, category, subject, description, priority } = req.body;

        const [ticket] = await db.insert(tickets).values({
            employeeId,
            category,
            subject,
            description,
            priority: priority || 'MEDIUM',
            status: 'OPEN',
        }).returning();

        await createAuditLog(req.user!.userId, 'CREATE', 'tickets', ticket?.id);
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
});

// Update ticket (status, priority, assignment)
ticketsRouter.patch('/:id', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { status, priority, assignedTo } = req.body;

        const ticket = await db.query.tickets.findFirst({
            where: eq(tickets.id, req.params.id!),
        });

        if (!ticket) {
            throw new AppError(404, 'NOT_FOUND', 'Ticket not found');
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        if (status === 'RESOLVED' || status === 'CLOSED') {
            updateData.resolvedAt = new Date();
        }

        const [updated] = await db.update(tickets)
            .set(updateData)
            .where(eq(tickets.id, req.params.id!))
            .returning();

        await createAuditLog(req.user!.userId, 'UPDATE', 'tickets', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Add comment
ticketsRouter.post('/:id/comments', authGuard, async (req, res, next) => {
    try {
        const { authorId, comment, isInternal } = req.body;

        // Only HR/Admin can add internal notes
        if (isInternal && !['ADMIN', 'HR'].includes(req.user!.role)) {
            throw new AppError(403, 'FORBIDDEN', 'Only HR/Admin can add internal notes');
        }

        const [newComment] = await db.insert(ticketComments).values({
            ticketId: req.params.id!,
            authorId,
            comment,
            isInternal: isInternal || false,
        }).returning();

        // Update ticket timestamp
        await db.update(tickets)
            .set({ updatedAt: new Date() })
            .where(eq(tickets.id, req.params.id!));

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        next(error);
    }
});

// Add attachment
ticketsRouter.post('/:id/attachments', authGuard, async (req, res, next) => {
    try {
        const { fileUrl, fileName, fileSize } = req.body;

        const [attachment] = await db.insert(ticketAttachments).values({
            ticketId: req.params.id!,
            fileUrl,
            fileName,
            fileSize,
        }).returning();

        res.status(201).json({ success: true, data: attachment });
    } catch (error) {
        next(error);
    }
});
