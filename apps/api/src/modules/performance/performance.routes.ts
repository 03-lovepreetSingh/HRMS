import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, reviewCycles, performanceReviews } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const performanceRouter = Router();

// Get review cycles
performanceRouter.get('/cycles', authGuard, async (_req, res, next) => {
    try {
        const cycles = await db.query.reviewCycles.findMany({
            orderBy: (rc, { desc }) => [desc(rc.startDate)],
        });
        res.json({ success: true, data: cycles });
    } catch (error) {
        next(error);
    }
});

// Create review cycle
performanceRouter.post('/cycles', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { name, startDate, endDate } = req.body;
        const [cycle] = await db.insert(reviewCycles).values({ name, startDate, endDate }).returning();
        await createAuditLog(req.user!.userId, 'CREATE', 'review_cycles', cycle?.id);
        res.status(201).json({ success: true, data: cycle });
    } catch (error) {
        next(error);
    }
});

// Get reviews
performanceRouter.get('/reviews', authGuard, async (req, res, next) => {
    try {
        const reviews = await db.query.performanceReviews.findMany({
            with: {
                employee: { with: { user: true } },
                manager: { with: { user: true } },
                reviewCycle: true,
            },
            orderBy: (pr, { desc }) => [desc(pr.createdAt)],
        });
        res.json({ success: true, data: reviews });
    } catch (error) {
        next(error);
    }
});

// Create review
performanceRouter.post('/reviews', authGuard, roleGuard('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
    try {
        const { employeeId, managerId, reviewCycleId, rating, feedback } = req.body;

        if (rating < 1 || rating > 5) {
            throw new AppError(400, 'INVALID_INPUT', 'Rating must be between 1 and 5');
        }

        const [review] = await db.insert(performanceReviews).values({
            employeeId,
            managerId,
            reviewCycleId,
            rating,
            feedback,
        }).returning();

        await createAuditLog(req.user!.userId, 'CREATE', 'performance_reviews', review?.id);
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
});

// Update review
performanceRouter.patch('/reviews/:id', authGuard, roleGuard('ADMIN', 'HR', 'MANAGER'), async (req, res, next) => {
    try {
        const { rating, feedback } = req.body;

        const [updated] = await db.update(performanceReviews)
            .set({ rating, feedback })
            .where(eq(performanceReviews.id, req.params.id!))
            .returning();

        if (!updated) {
            throw new AppError(404, 'NOT_FOUND', 'Review not found');
        }

        await createAuditLog(req.user!.userId, 'UPDATE', 'performance_reviews', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});
