import { Router } from 'express';
import { eq, and, between, sql } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, attendance, employees } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const attendanceRouter = Router();

// Punch in
attendanceRouter.post('/punch-in', authGuard, async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Check for existing punch-in today
        const existing = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.employeeId, employeeId),
                eq(attendance.date, today!)
            ),
        });

        if (existing?.punchIn) {
            throw new AppError(409, 'DUPLICATE_ENTRY', 'Already punched in today');
        }

        if (existing) {
            // Update existing record
            const [updated] = await db.update(attendance)
                .set({ punchIn: new Date() })
                .where(eq(attendance.id, existing.id))
                .returning();
            res.json({ success: true, data: updated });
        } else {
            // Create new record
            const [record] = await db.insert(attendance).values({
                employeeId,
                date: today!,
                punchIn: new Date(),
            }).returning();
            res.status(201).json({ success: true, data: record });
        }
    } catch (error) {
        next(error);
    }
});

// Punch out
attendanceRouter.post('/punch-out', authGuard, async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        const today = new Date().toISOString().split('T')[0];

        const existing = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.employeeId, employeeId),
                eq(attendance.date, today!)
            ),
        });

        if (!existing) {
            throw new AppError(400, 'INVALID_INPUT', 'No punch-in record found for today');
        }

        if (existing.punchOut) {
            throw new AppError(409, 'DUPLICATE_ENTRY', 'Already punched out today');
        }

        const [updated] = await db.update(attendance)
            .set({ punchOut: new Date() })
            .where(eq(attendance.id, existing.id))
            .returning();

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Get attendance records (with filters)
attendanceRouter.get('/', authGuard, async (req, res, next) => {
    try {
        const { employeeId, startDate, endDate } = req.query;

        let query = db.query.attendance.findMany({
            with: { employee: { with: { user: true } } },
            orderBy: (att, { desc }) => [desc(att.date)],
        });

        const records = await query;
        res.json({ success: true, data: records });
    } catch (error) {
        next(error);
    }
});

// Admin override
attendanceRouter.post('/override', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { employeeId, date, punchIn, punchOut } = req.body;

        const existing = await db.query.attendance.findFirst({
            where: and(eq(attendance.employeeId, employeeId), eq(attendance.date, date)),
        });

        if (existing) {
            const [updated] = await db.update(attendance)
                .set({
                    punchIn: punchIn ? new Date(punchIn) : existing.punchIn,
                    punchOut: punchOut ? new Date(punchOut) : existing.punchOut,
                })
                .where(eq(attendance.id, existing.id))
                .returning();

            await createAuditLog(req.user!.userId, 'UPDATE', 'attendance', existing.id);
            res.json({ success: true, data: updated });
        } else {
            const [record] = await db.insert(attendance).values({
                employeeId,
                date,
                punchIn: punchIn ? new Date(punchIn) : null,
                punchOut: punchOut ? new Date(punchOut) : null,
            }).returning();

            await createAuditLog(req.user!.userId, 'CREATE', 'attendance', record?.id);
            res.status(201).json({ success: true, data: record });
        }
    } catch (error) {
        next(error);
    }
});

// Get monthly summary
attendanceRouter.get('/summary/:employeeId/:year/:month', authGuard, async (req, res, next) => {
    try {
        const { employeeId, year, month } = req.params;
        const startDate = `${year}-${month!.padStart(2, '0')}-01`;
        // Calculate last day of month properly
        const lastDay = new Date(Number(year), Number(month), 0).getDate();
        const endDate = `${year}-${month!.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

        const records = await db.query.attendance.findMany({
            where: and(
                eq(attendance.employeeId, employeeId!),
                between(attendance.date, startDate, endDate)
            ),
        });

        const summary = {
            employeeId,
            month: Number(month),
            year: Number(year),
            totalDays: records.length,
            presentDays: records.filter(r => r.punchIn).length,
        };

        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
});
