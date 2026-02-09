import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes.js';
import { employeesRouter } from '../modules/employees/employees.routes.js';
import { departmentsRouter } from '../modules/departments/departments.routes.js';
import { designationsRouter } from '../modules/designations/designations.routes.js';
import { attendanceRouter } from '../modules/attendance/attendance.routes.js';
import { leaveRouter } from '../modules/leave/leave.routes.js';
import { payrollRouter } from '../modules/payroll/payroll.routes.js';
import { performanceRouter } from '../modules/performance/performance.routes.js';
import { ticketsRouter } from '../modules/tickets/tickets.routes.js';
import { notificationsRouter } from '../modules/notifications/notifications.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';

export const router = Router();

// Mount module routers
router.use('/auth', authRouter);
router.use('/employees', employeesRouter);
router.use('/departments', departmentsRouter);
router.use('/designations', designationsRouter);
router.use('/attendance', attendanceRouter);
router.use('/leave', leaveRouter);
router.use('/payroll', payrollRouter);
router.use('/performance', performanceRouter);
router.use('/tickets', ticketsRouter);
router.use('/notifications', notificationsRouter);
router.use('/settings', settingsRouter);
