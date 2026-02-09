// Department interface
export interface Department {
    id: string;
    name: string;
}

export interface CreateDepartmentInput {
    name: string;
}

// Designation interface
export interface Designation {
    id: string;
    title: string;
}

export interface CreateDesignationInput {
    title: string;
}

// Employee interface
export interface Employee {
    id: string;
    userId: string;
    departmentId: string | null;
    designationId: string | null;
    managerId: string | null;
    joiningDate: Date | null;
    profilePhoto: string | null;
    isDeleted: boolean;
    createdAt: Date;
}

// Employee with relations
export interface EmployeeWithRelations extends Employee {
    department: Department | null;
    designation: Designation | null;
    manager: Employee | null;
    user: {
        id: string;
        email: string;
        role: string;
        status: boolean;
    };
}

// Create employee input
export interface CreateEmployeeInput {
    userId: string;
    departmentId?: string;
    designationId?: string;
    managerId?: string;
    joiningDate?: Date;
    profilePhoto?: string;
}

// Update employee input
export interface UpdateEmployeeInput {
    departmentId?: string;
    designationId?: string;
    managerId?: string;
    joiningDate?: Date;
    profilePhoto?: string;
}

// Employee hierarchy node
export interface EmployeeHierarchyNode {
    id: string;
    name: string;
    designation: string | null;
    children: EmployeeHierarchyNode[];
}
