// Enums
export { userRoleEnum } from './users.js';
export { leaveStatusEnum } from './leave.js';
export { ticketStatusEnum, ticketPriorityEnum } from './tickets.js';
export { notificationTypeEnum } from './notifications.js';
export { auditActionEnum } from './audit.js';

// Users
export { users, usersRelations, type User, type NewUser } from './users.js';

// Departments
export { departments, departmentsRelations, type Department, type NewDepartment } from './departments.js';

// Designations
export { designations, designationsRelations, type Designation, type NewDesignation } from './designations.js';

// Employees
export { employees, employeesRelations, type Employee, type NewEmployee } from './employees.js';

// Attendance
export { attendance, attendanceRelations, type Attendance, type NewAttendance } from './attendance.js';

// Leave
export {
    leaveTypes,
    leaveTypesRelations,
    leaveRequests,
    leaveRequestsRelations,
    type LeaveType,
    type NewLeaveType,
    type LeaveRequest,
    type NewLeaveRequest,
} from './leave.js';

// Payroll
export {
    salaries,
    salariesRelations,
    payrollRuns,
    type Salary,
    type NewSalary,
    type PayrollRun,
    type NewPayrollRun,
} from './payroll.js';

// Performance
export {
    reviewCycles,
    reviewCyclesRelations,
    performanceReviews,
    performanceReviewsRelations,
    type ReviewCycle,
    type NewReviewCycle,
    type PerformanceReview,
    type NewPerformanceReview,
} from './performance.js';

// Tickets
export {
    tickets,
    ticketsRelations,
    ticketComments,
    ticketCommentsRelations,
    ticketAttachments,
    ticketAttachmentsRelations,
    type Ticket,
    type NewTicket,
    type TicketComment,
    type NewTicketComment,
    type TicketAttachment,
    type NewTicketAttachment,
} from './tickets.js';

// Notifications
export {
    notifications,
    notificationsRelations,
    type Notification,
    type NewNotification,
} from './notifications.js';

// Audit
export { auditLogs, auditLogsRelations, type AuditLog, type NewAuditLog } from './audit.js';

// Company
export { companySettings, type CompanySettings, type NewCompanySettings } from './company.js';
