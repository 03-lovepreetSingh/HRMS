import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, departments } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const departmentsRouter = Router();

// Get all departments
departmentsRouter.get('/', authGuard, async (_req, res, next) => {
    try {
        const result = await db.query.departments.findMany();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Create department
departmentsRouter.post('/', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { name } = req.body;

        const existing = await db.query.departments.findFirst({
            where: eq(departments.name, name),
        });
        if (existing) {
            throw new AppError(409, 'ALREADY_EXISTS', 'Department already exists');
        }

        const [dept] = await db.insert(departments).values({ name }).returning();
        await createAuditLog(req.user!.userId, 'CREATE', 'departments', dept?.id);

        res.status(201).json({ success: true, data: dept });
    } catch (error) {
        next(error);
    }
});

// Update department
departmentsRouter.patch('/:id', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { name } = req.body;

        const [updated] = await db.update(departments)
            .set({ name })
            .where(eq(departments.id, req.params.id!))
            .returning();

        if (!updated) {
            throw new AppError(404, 'NOT_FOUND', 'Department not found');
        }

        await createAuditLog(req.user!.userId, 'UPDATE', 'departments', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Delete department
departmentsRouter.delete('/:id', authGuard, roleGuard('ADMIN'), async (req, res, next) => {
    try {
        const deleted = await db.delete(departments).where(eq(departments.id, req.params.id!)).returning();

        if (deleted.length === 0) {
            throw new AppError(404, 'NOT_FOUND', 'Department not found');
        }

        await createAuditLog(req.user!.userId, 'DELETE', 'departments', req.params.id);
        res.json({ success: true, data: { message: 'Department deleted' } });
    } catch (error) {
        next(error);
    }
});
