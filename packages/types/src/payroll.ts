// Allowance structure
export interface Allowance {
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
}

// Deduction structure
export interface Deduction {
    name: string;
    amount: number;
    type: 'fixed' | 'percentage';
}

// Salary interface
export interface Salary {
    id: string;
    employeeId: string;
    baseSalary: number;
    allowances: Allowance[];
    deductions: Deduction[];
}

// Salary with employee
export interface SalaryWithEmployee extends Salary {
    employee: {
        id: string;
        user: {
            email: string;
        };
    };
}

// Create/Update salary input
export interface UpsertSalaryInput {
    employeeId: string;
    baseSalary: number;
    allowances?: Allowance[];
    deductions?: Deduction[];
}

// Payroll run interface
export interface PayrollRun {
    id: string;
    month: number;
    year: number;
    isLocked: boolean;
}

// Payroll item (calculated for each employee)
export interface PayrollItem {
    employeeId: string;
    employeeName: string;
    baseSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    netSalary: number;
    breakdown: {
        allowances: Allowance[];
        deductions: Deduction[];
    };
}

// Payroll summary
export interface PayrollSummary {
    payrollRunId: string;
    month: number;
    year: number;
    isLocked: boolean;
    totalEmployees: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalNetSalary: number;
    items: PayrollItem[];
}

// Generate payroll input
export interface GeneratePayrollInput {
    month: number;
    year: number;
}

// Payslip
export interface Payslip {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    department: string | null;
    designation: string | null;
    month: number;
    year: number;
    baseSalary: number;
    allowances: Allowance[];
    deductions: Deduction[];
    totalAllowances: number;
    totalDeductions: number;
    netSalary: number;
    generatedAt: Date;
}
