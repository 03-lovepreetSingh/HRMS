import { Router } from 'express';
import { eq, desc, and, inArray } from 'drizzle-orm';

import { authGuard } from '@ai-hrms/auth';
import { db, notifications } from '@ai-hrms/db';

export const notificationsRouter = Router();

// Get notifications for current user
notificationsRouter.get('/', authGuard, async (req, res, next) => {
    try {
        const userNotifications = await db.query.notifications.findMany({
            where: eq(notifications.userId, req.user!.userId),
            orderBy: [desc(notifications.createdAt)],
            limit: 50,
        });

        const unreadCount = userNotifications.filter(n => !n.isRead).length;

        res.json({
            success: true,
            data: {
                totalCount: userNotifications.length,
                unreadCount,
                notifications: userNotifications,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Mark notifications as read
notificationsRouter.post('/mark-read', authGuard, async (req, res, next) => {
    try {
        const { notificationIds } = req.body;

        if (notificationIds && notificationIds.length > 0) {
            await db.update(notifications)
                .set({ isRead: true })
                .where(
                    and(
                        eq(notifications.userId, req.user!.userId),
                        inArray(notifications.id, notificationIds)
                    )
                );
        }

        res.json({ success: true, data: { message: 'Notifications marked as read' } });
    } catch (error) {
        next(error);
    }
});

// Mark all as read
notificationsRouter.post('/mark-all-read', authGuard, async (req, res, next) => {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, req.user!.userId));

        res.json({ success: true, data: { message: 'All notifications marked as read' } });
    } catch (error) {
        next(error);
    }
});
