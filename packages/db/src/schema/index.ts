// Enums
export { userRoleEnum } from './users';
export { leaveStatusEnum } from './leave';
export { ticketStatusEnum, ticketPriorityEnum } from './tickets';
export { notificationTypeEnum } from './notifications';
export { auditActionEnum } from './audit';

// Users
export { users, usersRelations, type User, type NewUser } from './users';

// Departments
export { departments, departmentsRelations, type Department, type NewDepartment } from './departments';

// Designations
export { designations, designationsRelations, type Designation, type NewDesignation } from './designations';

// Employees
export { employees, employeesRelations, type Employee, type NewEmployee } from './employees';

// Attendance
export { attendance, attendanceRelations, type Attendance, type NewAttendance } from './attendance';

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
} from './leave';

// Payroll
export {
    salaries,
    salariesRelations,
    payrollRuns,
    type Salary,
    type NewSalary,
    type PayrollRun,
    type NewPayrollRun,
} from './payroll';

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
} from './performance';

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
} from './tickets';

// Notifications
export {
    notifications,
    notificationsRelations,
    type Notification,
    type NewNotification,
} from './notifications';

// Audit
export { auditLogs, auditLogsRelations, type AuditLog, type NewAuditLog } from './audit';

// Company
export { companySettings, type CompanySettings, type NewCompanySettings } from './company';
