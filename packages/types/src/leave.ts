// Leave status enum
export const LeaveStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
} as const;

export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

// Leave type interface
export interface LeaveType {
    id: string;
    name: string;
    annualQuota: number;
}

export interface CreateLeaveTypeInput {
    name: string;
    annualQuota: number;
}

// Leave request interface
export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    status: LeaveStatus;
    reason: string | null;
    createdAt: Date;
}

// Leave request with relations
export interface LeaveRequestWithRelations extends LeaveRequest {
    employee: {
        id: string;
        user: {
            email: string;
        };
    };
    leaveType: LeaveType;
}

// Create leave request input
export interface CreateLeaveRequestInput {
    employeeId: string;
    leaveTypeId: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
}

// Update leave status input
export interface UpdateLeaveStatusInput {
    status: LeaveStatus;
    remarks?: string;
}

// Leave balance
export interface LeaveBalance {
    leaveTypeId: string;
    leaveTypeName: string;
    totalQuota: number;
    used: number;
    pending: number;
    available: number;
}

// Employee leave balance summary
export interface EmployeeLeaveBalance {
    employeeId: string;
    year: number;
    balances: LeaveBalance[];
}
