// Attendance interface
export interface Attendance {
    id: string;
    employeeId: string;
    date: Date;
    punchIn: Date | null;
    punchOut: Date | null;
}

// Attendance with employee info
export interface AttendanceWithEmployee extends Attendance {
    employee: {
        id: string;
        userId: string;
        user: {
            email: string;
        };
    };
}

// Punch in input
export interface PunchInInput {
    employeeId: string;
    timestamp?: Date;
}

// Punch out input
export interface PunchOutInput {
    employeeId: string;
    timestamp?: Date;
}

// Admin override input
export interface AttendanceOverrideInput {
    employeeId: string;
    date: Date;
    punchIn?: Date;
    punchOut?: Date;
}

// Daily summary
export interface DailyAttendanceSummary {
    date: Date;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    records: AttendanceWithEmployee[];
}

// Monthly summary for an employee
export interface MonthlyAttendanceSummary {
    employeeId: string;
    month: number;
    year: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    averageHoursPerDay: number;
}

// Attendance status
export const AttendanceStatus = {
    PRESENT: 'PRESENT',
    ABSENT: 'ABSENT',
    LATE: 'LATE',
    HALF_DAY: 'HALF_DAY',
    ON_LEAVE: 'ON_LEAVE',
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
