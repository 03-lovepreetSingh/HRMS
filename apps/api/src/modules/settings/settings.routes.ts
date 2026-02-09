import { Router } from 'express';
import { eq } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, companySettings } from '@ai-hrms/db';

import { createAuditLog } from '../../middleware/audit.middleware.js';

export const settingsRouter = Router();

// Get company settings
settingsRouter.get('/', authGuard, async (_req, res, next) => {
    try {
        const settings = await db.query.companySettings.findFirst();
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
});

// Update company settings
settingsRouter.patch('/', authGuard, roleGuard('ADMIN'), async (req, res, next) => {
    try {
        const existing = await db.query.companySettings.findFirst();

        if (existing) {
            const [updated] = await db.update(companySettings)
                .set({
                    ...req.body,
                    updatedAt: new Date(),
                })
                .where(eq(companySettings.id, existing.id))
                .returning();

            await createAuditLog(req.user!.userId, 'UPDATE', 'company_settings', existing.id);
            res.json({ success: true, data: updated });
        } else {
            const [created] = await db.insert(companySettings)
                .values(req.body)
                .returning();

            await createAuditLog(req.user!.userId, 'CREATE', 'company_settings', created?.id);
            res.status(201).json({ success: true, data: created });
        }
    } catch (error) {
        next(error);
    }
});
