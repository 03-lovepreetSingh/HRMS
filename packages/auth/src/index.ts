// Password utilities
export {
    hashPassword,
    verifyPassword,
    validatePasswordStrength,
    generateResetToken,
} from './password.js';

// JWT utilities
export {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    isTokenExpired,
    extractBearerToken,
} from './jwt.js';

// RBAC utilities
export {
    RolePermissions,
    RoleHierarchy,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    canAccessResource,
    isRoleAtLeast,
    canManageRole,
    type Permission,
} from './rbac.js';

// Guards/Middleware
export {
    authGuard,
    roleGuard,
    permissionGuard,
    minRoleGuard,
    ownerOrRoleGuard,
} from './guards.js';
