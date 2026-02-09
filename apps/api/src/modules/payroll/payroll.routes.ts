import { Router } from 'express';
import { eq, and } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, salaries, payrollRuns, employees } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const payrollRouter = Router();

// Get all salaries
payrollRouter.get('/salaries', authGuard, roleGuard('ADMIN', 'HR'), async (_req, res, next) => {
    try {
        const result = await db.query.salaries.findMany({
            with: { employee: { with: { user: true } } },
        });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Get salary by employee
payrollRouter.get('/salaries/:employeeId', authGuard, async (req, res, next) => {
    try {
        const salary = await db.query.salaries.findFirst({
            where: eq(salaries.employeeId, req.params.employeeId!),
        });
        res.json({ success: true, data: salary });
    } catch (error) {
        next(error);
    }
});

// Upsert salary
payrollRouter.post('/salaries', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { employeeId, baseSalary, allowances, deductions } = req.body;

        const existing = await db.query.salaries.findFirst({
            where: eq(salaries.employeeId, employeeId),
        });

        if (existing) {
            const [updated] = await db.update(salaries)
                .set({ baseSalary, allowances, deductions })
                .where(eq(salaries.id, existing.id))
                .returning();
            res.json({ success: true, data: updated });
        } else {
            const [created] = await db.insert(salaries).values({
                employeeId,
                baseSalary,
                allowances: allowances || [],
                deductions: deductions || [],
            }).returning();
            res.status(201).json({ success: true, data: created });
        }

        await createAuditLog(req.user!.userId, 'UPDATE', 'salaries', employeeId);
    } catch (error) {
        next(error);
    }
});

// Get payroll runs
payrollRouter.get('/runs', authGuard, roleGuard('ADMIN', 'HR'), async (_req, res, next) => {
    try {
        const runs = await db.query.payrollRuns.findMany({
            orderBy: (pr, { desc }) => [desc(pr.year), desc(pr.month)],
        });
        res.json({ success: true, data: runs });
    } catch (error) {
        next(error);
    }
});

// Generate payroll
payrollRouter.post('/generate', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { month, year } = req.body;

        // Check if already exists
        const existing = await db.query.payrollRuns.findFirst({
            where: and(eq(payrollRuns.month, month), eq(payrollRuns.year, year)),
        });

        if (existing) {
            if (existing.isLocked) {
                throw new AppError(400, 'PAYROLL_LOCKED', 'Payroll for this period is locked');
            }
        }

        // Get all salaries
        const allSalaries = await db.query.salaries.findMany({
            with: { employee: { with: { user: true, department: true, designation: true } } },
        });

        const payrollItems = allSalaries.map((sal) => {
            const totalAllowances = (sal.allowances as Array<{ amount: number }>)?.reduce((sum, a) => sum + a.amount, 0) || 0;
            const totalDeductions = (sal.deductions as Array<{ amount: number }>)?.reduce((sum, d) => sum + d.amount, 0) || 0;
            const baseSalary = Number(sal.baseSalary);

            return {
                employeeId: sal.employeeId,
                employeeName: sal.employee.user.email,
                baseSalary,
                totalAllowances,
                totalDeductions,
                netSalary: baseSalary + totalAllowances - totalDeductions,
            };
        });

        // Create or update payroll run
        let run;
        if (existing) {
            [run] = await db.update(payrollRuns)
                .set({ isLocked: false })
                .where(eq(payrollRuns.id, existing.id))
                .returning();
        } else {
            [run] = await db.insert(payrollRuns).values({ month, year }).returning();
        }

        const summary = {
            payrollRunId: run?.id,
            month,
            year,
            isLocked: false,
            totalEmployees: payrollItems.length,
            totalGrossSalary: payrollItems.reduce((sum, p) => sum + p.baseSalary + p.totalAllowances, 0),
            totalDeductions: payrollItems.reduce((sum, p) => sum + p.totalDeductions, 0),
            totalNetSalary: payrollItems.reduce((sum, p) => sum + p.netSalary, 0),
            items: payrollItems,
        };

        await createAuditLog(req.user!.userId, 'CREATE', 'payroll_runs', run?.id);
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
});

// Lock payroll
payrollRouter.post('/lock/:id', authGuard, roleGuard('ADMIN'), async (req, res, next) => {
    try {
        const [updated] = await db.update(payrollRuns)
            .set({ isLocked: true })
            .where(eq(payrollRuns.id, req.params.id!))
            .returning();

        if (!updated) {
            throw new AppError(404, 'NOT_FOUND', 'Payroll run not found');
        }

        await createAuditLog(req.user!.userId, 'UPDATE', 'payroll_runs', req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});
