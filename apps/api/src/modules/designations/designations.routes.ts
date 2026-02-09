import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, designations } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const designationsRouter = Router();

// Get all designations
designationsRouter.get('/', authGuard, async (_req, res, next) => {
    try {
        const result = await db.query.designations.findMany();
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Create designation
designationsRouter.post('/', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { title } = req.body;

        const [desig] = await db.insert(designations).values({ title }).returning();
        await createAuditLog(req.user!.userId, 'CREATE', 'designations', desig?.id);

        res.status(201).json({ success: true, data: desig });
    } catch (error) {
        next(error);
    }
});

// Update designation
designationsRouter.patch('/:id', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { title } = req.body;

        const [updated] = await db.update(designations)
            .set({ title })
            .where(eq(designations.id, req.params.id!))
            .returning();

        if (!updated) {
            throw new AppError(404, 'NOT_FOUND', 'Designation not found');
        }

        await createAuditLog(req.user!.userId, 'UPDATE', 'designations', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Delete designation
designationsRouter.delete('/:id', authGuard, roleGuard('ADMIN'), async (req, res, next) => {
    try {
        const deleted = await db.delete(designations).where(eq(designations.id, req.params.id!)).returning();

        if (deleted.length === 0) {
            throw new AppError(404, 'NOT_FOUND', 'Designation not found');
        }

        await createAuditLog(req.user!.userId, 'DELETE', 'designations', req.params.id);
        res.json({ success: true, data: { message: 'Designation deleted' } });
    } catch (error) {
        next(error);
    }
});
