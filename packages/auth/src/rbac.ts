import type { UserRole } from '@ai-hrms/types';

/**
 * Permission definitions for each role
 */
export const RolePermissions = {
    ADMIN: [
        // Full access
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'employees:read',
        'employees:create',
        'employees:update',
        'employees:delete',
        'departments:read',
        'departments:create',
        'departments:update',
        'departments:delete',
        'designations:read',
        'designations:create',
        'designations:update',
        'designations:delete',
        'attendance:read',
        'attendance:create',
        'attendance:update',
        'attendance:override',
        'leave:read',
        'leave:create',
        'leave:approve',
        'leave:reject',
        'payroll:read',
        'payroll:create',
        'payroll:lock',
        'performance:read',
        'performance:create',
        'performance:update',
        'tickets:read',
        'tickets:create',
        'tickets:update',
        'tickets:assign',
        'tickets:internal-notes',
        'notifications:read',
        'notifications:create',
        'audit:read',
        'settings:read',
        'settings:update',
    ],
    HR: [
        'users:read',
        'users:create',
        'users:update',
        'employees:read',
        'employees:create',
        'employees:update',
        'departments:read',
        'departments:create',
        'departments:update',
        'designations:read',
        'designations:create',
        'designations:update',
        'attendance:read',
        'attendance:create',
        'attendance:update',
        'attendance:override',
        'leave:read',
        'leave:approve',
        'leave:reject',
        'payroll:read',
        'payroll:create',
        'performance:read',
        'performance:create',
        'tickets:read',
        'tickets:update',
        'tickets:assign',
        'tickets:internal-notes',
        'notifications:read',
        'notifications:create',
        'settings:read',
    ],
    MANAGER: [
        'employees:read',
        'attendance:read',
        'attendance:create',
        'leave:read',
        'leave:approve',
        'leave:reject',
        'performance:read',
        'performance:create',
        'performance:update',
        'tickets:read',
        'tickets:create',
        'tickets:update',
        'notifications:read',
    ],
    EMPLOYEE: [
        'employees:read:own',
        'attendance:read:own',
        'attendance:create:own',
        'leave:read:own',
        'leave:create:own',
        'leave:cancel:own',
        'performance:read:own',
        'tickets:read:own',
        'tickets:create:own',
        'notifications:read:own',
    ],
} as const;

export type Permission = string;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = RolePermissions[role];

    // Check exact match
    if (permissions.includes(permission as never)) {
        return true;
    }

    // Check for wildcard matches (e.g., 'employees:read' covers 'employees:read:own')
    const basePerm = permission.replace(/:own$/, '');
    if (basePerm !== permission && permissions.includes(basePerm as never)) {
        return true;
    }

    return false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((perm) => hasPermission(role, perm));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((perm) => hasPermission(role, perm));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): readonly string[] {
    return RolePermissions[role];
}

/**
 * Check if role can access a resource owned by another user
 * Employees can only access their own resources, managers/HR/admin can access all
 */
export function canAccessResource(
    role: UserRole,
    resourceOwnerId: string,
    currentUserId: string
): boolean {
    if (role === 'ADMIN' || role === 'HR') {
        return true;
    }
    if (role === 'MANAGER') {
        // Managers should have additional logic to check if the resource owner is their subordinate
        // For now, allow access (this should be enhanced with manager hierarchy check)
        return true;
    }
    // Employees can only access their own resources
    return resourceOwnerId === currentUserId;
}

/**
 * Role hierarchy - higher index means higher privilege
 */
export const RoleHierarchy: UserRole[] = ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'];

/**
 * Check if a role is at least as privileged as another role
 */
export function isRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
    const roleIndex = RoleHierarchy.indexOf(role);
    const minIndex = RoleHierarchy.indexOf(minimumRole);
    return roleIndex >= minIndex;
}

/**
 * Check if a role can manage another role
 * (Only higher roles can manage lower roles)
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerIndex = RoleHierarchy.indexOf(managerRole);
    const targetIndex = RoleHierarchy.indexOf(targetRole);
    return managerIndex > targetIndex;
}
