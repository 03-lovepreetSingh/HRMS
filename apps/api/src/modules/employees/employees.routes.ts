import { Router } from 'express';
import { eq, and, isNull } from 'drizzle-orm';

import { authGuard, roleGuard } from '@ai-hrms/auth';
import { db, employees, users, departments, designations } from '@ai-hrms/db';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

export const employeesRouter = Router();

// Get all employees
employeesRouter.get('/', authGuard, async (req, res, next) => {
    try {
        const result = await db.query.employees.findMany({
            where: eq(employees.isDeleted, false),
            with: {
                user: true,
                department: true,
                designation: true,
                manager: {
                    with: { user: true }
                },
            },
        });

        const formatted = result.map((emp) => ({
            id: emp.id,
            email: emp.user.email,
            role: emp.user.role,
            status: emp.user.status,
            department: emp.department?.name || null,
            designation: emp.designation?.title || null,
            manager: emp.manager?.user?.email || null,
            joiningDate: emp.joiningDate,
            profilePhoto: emp.profilePhoto,
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        next(error);
    }
});

// Get employee by ID
employeesRouter.get('/:id', authGuard, async (req, res, next) => {
    try {
        const employee = await db.query.employees.findFirst({
            where: and(eq(employees.id, req.params.id!), eq(employees.isDeleted, false)),
            with: {
                user: true,
                department: true,
                designation: true,
                manager: { with: { user: true } },
            },
        });

        if (!employee) {
            throw new AppError(404, 'NOT_FOUND', 'Employee not found');
        }

        res.json({ success: true, data: employee });
    } catch (error) {
        next(error);
    }
});

// Create employee
employeesRouter.post('/', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const { userId, departmentId, designationId, managerId, joiningDate, profilePhoto } = req.body;

        // Verify user exists
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        if (!user) {
            throw new AppError(404, 'NOT_FOUND', 'User not found');
        }

        // Check if employee already exists for this user
        const existing = await db.query.employees.findFirst({
            where: eq(employees.userId, userId),
        });
        if (existing) {
            throw new AppError(409, 'ALREADY_EXISTS', 'Employee record already exists for this user');
        }

        const [newEmployee] = await db.insert(employees).values({
            userId,
            departmentId: departmentId || null,
            designationId: designationId || null,
            managerId: managerId || null,
            joiningDate: joiningDate || null,
            profilePhoto: profilePhoto || null,
        }).returning();

        await createAuditLog(req.user!.userId, 'CREATE', 'employees', newEmployee?.id);

        res.status(201).json({ success: true, data: newEmployee });
    } catch (error) {
        next(error);
    }
});

// Update employee
employeesRouter.patch('/:id', authGuard, roleGuard('ADMIN', 'HR'), async (req, res, next) => {
    try {
        const employee = await db.query.employees.findFirst({
            where: eq(employees.id, req.params.id!),
        });

        if (!employee) {
            throw new AppError(404, 'NOT_FOUND', 'Employee not found');
        }

        const { departmentId, designationId, managerId, joiningDate, profilePhoto } = req.body;

        const [updated] = await db.update(employees).set({
            departmentId: departmentId !== undefined ? departmentId : employee.departmentId,
            designationId: designationId !== undefined ? designationId : employee.designationId,
            managerId: managerId !== undefined ? managerId : employee.managerId,
            joiningDate: joiningDate !== undefined ? joiningDate : employee.joiningDate,
            profilePhoto: profilePhoto !== undefined ? profilePhoto : employee.profilePhoto,
        }).where(eq(employees.id, req.params.id!)).returning();

        await createAuditLog(req.user!.userId, 'UPDATE', 'employees', req.params.id);

        res.json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
});

// Soft delete employee
employeesRouter.delete('/:id', authGuard, roleGuard('ADMIN'), async (req, res, next) => {
    try {
        const employee = await db.query.employees.findFirst({
            where: eq(employees.id, req.params.id!),
        });

        if (!employee) {
            throw new AppError(404, 'NOT_FOUND', 'Employee not found');
        }

        await db.update(employees).set({ isDeleted: true }).where(eq(employees.id, req.params.id!));
        await createAuditLog(req.user!.userId, 'DELETE', 'employees', req.params.id);

        res.json({ success: true, data: { message: 'Employee deleted successfully' } });
    } catch (error) {
        next(error);
    }
});
