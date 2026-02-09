// Working days configuration
export interface WorkingDays {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
}

// Office hours configuration
export interface OfficeHours {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
    graceMinutes: number;
}

// Company settings interface
export interface CompanySettings {
    id: string;
    companyName: string;
    workingDays: WorkingDays;
    officeHours: OfficeHours;
    fiscalYearStart: number; // Month (1-12)
    leaveYearStart: number; // Month (1-12)
    currency: string;
    dateFormat: string;
    createdAt: Date;
    updatedAt: Date;
}

// Update company settings input
export interface UpdateCompanySettingsInput {
    companyName?: string;
    workingDays?: Partial<WorkingDays>;
    officeHours?: Partial<OfficeHours>;
    fiscalYearStart?: number;
    leaveYearStart?: number;
    currency?: string;
    dateFormat?: string;
}
