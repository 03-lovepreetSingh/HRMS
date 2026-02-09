import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, leaveRequests, leaveTypes } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const leaveRouter = Router();

// Get leave types
leaveRouter.get('/types', authGuard, async (_req, res, next) => {
    try {
        const types = await db.query.leaveTypes.findMany();
        res.json({ success: true, data: types });
    } catch (error) {
        next(error);
    }
});

// Create leave type (Admin/HR only)
leaveRouter.post('/types', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { name, annualQuota } = req.body;
        const [type] = await db.insert(leaveTypes).values({ name, annualQuota }).returning();
        res.status(201).json({ success: true, data: type });
    } catch (error) {
        next(error);
    }
});

// Get leave requests
leaveRouter.get('/requests', authGuard, async (req, res, next) => {
    try {
        const requests = await db.query.leaveRequests.findMany({
            with: {
                employee: { with: { user: true } },
                leaveType: true,
            },
            orderBy: (lr, { desc }) => [desc(lr.createdAt)],
        });
        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
});

// Create leave request
leaveRouter.post('/requests', authGuard, async (req, res, next) => {
    try {
        const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;

        const [request] = await db.insert(leaveRequests).values({
            employeeId,
            leaveTypeId,
            startDate,
            endDate,
            reason,
            status: 'PENDING',
        }).returning();

        await createAuditLog(req.user!.userId, 'CREATE', 'leave_requests', request?.id);
        res.status(201).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
});

// Approve leave request
leaveRouter.post('/requests/:id/approve', authGuard, roleGuard('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
    try {
        const request = await db.query.leaveRequests.findFirst({
            where: eq(leaveRequests.id, req.params.id!),
        });

        if (!request) {
            throw new AppError(404, 'NOT_FOUND', 'Leave request not found');
        }

        if (request.status !== 'PENDING') {
            throw new AppError(400, 'INVALID_INPUT', 'Leave request is not pending');
        }

        const [updated] = await db.update(leaveRequests)
            .set({ status: 'APPROVED', approvedAt: new Date() })
            .where(eq(leaveRequests.id, req.params.id!))
            .returning();

        await createAuditLog(req.user!.userId, 'APPROVE', 'leave_requests', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Reject leave request
leaveRouter.post('/requests/:id/reject', authGuard, roleGuard('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
    try {
        const request = await db.query.leaveRequests.findFirst({
            where: eq(leaveRequests.id, req.params.id!),
        });

        if (!request) {
            throw new AppError(404, 'NOT_FOUND', 'Leave request not found');
        }

        if (request.status !== 'PENDING') {
            throw new AppError(400, 'INVALID_INPUT', 'Leave request is not pending');
        }

        const [updated] = await db.update(leaveRequests)
            .set({ status: 'REJECTED' })
            .where(eq(leaveRequests.id, req.params.id!))
            .returning();

        await createAuditLog(req.user!.userId, 'REJECT', 'leave_requests', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Cancel leave request (employee can cancel their own pending requests)
leaveRouter.post('/requests/:id/cancel', authGuard, async (req, res, next) => {
    try {
        const request = await db.query.leaveRequests.findFirst({
            where: eq(leaveRequests.id, req.params.id!),
        });

        if (!request) {
            throw new AppError(404, 'NOT_FOUND', 'Leave request not found');
        }

        if (request.status !== 'PENDING') {
            throw new AppError(400, 'INVALID_INPUT', 'Can only cancel pending requests');
        }

        const [updated] = await db.update(leaveRequests)
            .set({ status: 'CANCELLED' })
            .where(eq(leaveRequests.id, req.params.id!))
            .returning();

        await createAuditLog(req.user!.userId, 'UPDATE', 'leave_requests', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Get leave balance for an employee
leaveRouter.get('/balance/:employeeId', authGuard, async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        const currentYear = new Date().getFullYear();

        const types = await db.query.leaveTypes.findMany();
        const requests = await db.query.leaveRequests.findMany({
            where: eq(leaveRequests.employeeId, employeeId!),
        });

        const balances = types.map((type) => {
            const approved = requests.filter(
                (r) => r.leaveTypeId === type.id && r.status === 'APPROVED'
            );
            const pending = requests.filter(
                (r) => r.leaveTypeId === type.id && r.status === 'PENDING'
            );

            // Calculate days (simplified - assumes full days)
            const usedDays = approved.reduce((sum, r) => {
                const start = new Date(r.startDate);
                const end = new Date(r.endDate);
                return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }, 0);

            const pendingDays = pending.reduce((sum, r) => {
                const start = new Date(r.startDate);
                const end = new Date(r.endDate);
                return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }, 0);

            return {
                leaveTypeId: type.id,
                leaveTypeName: type.name,
                totalQuota: type.annualQuota,
                used: usedDays,
                pending: pendingDays,
                available: type.annualQuota - usedDays,
            };
        });

        res.json({ success: true, data: { employeeId, year: currentYear, balances } });
    } catch (error) {
        next(error);
    }
});
