import type { Request, Response, NextFunction } from 'express';

import type { JWTPayload, UserRole } from '@ai-hrms/types';

import { verifyAccessToken, extractBearerToken } from './jwt.js';
import { hasPermission, hasAnyPermission, isRoleAtLeast, type Permission } from './rbac.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Authentication guard - verifies JWT token
 */
export function authGuard(req: Request, res: Response, next: NextFunction): void {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'No authentication token provided',
            },
        });
        return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
        res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_INVALID',
                message: 'Invalid or expired token',
            },
        });
        return;
    }

    req.user = payload;
    next();
}

/**
 * Role guard - ensures user has required role(s)
 */
export function roleGuard(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                },
            });
            return;
        }

        next();
    };
}

/**
 * Permission guard - ensures user has required permission(s)
 */
export function permissionGuard(...requiredPermissions: Permission[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        const hasRequired = hasAnyPermission(req.user.role, requiredPermissions);

        if (!hasRequired) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions',
                },
            });
            return;
        }

        next();
    };
}

/**
 * Minimum role guard - ensures user has at least the specified role level
 */
export function minRoleGuard(minimumRole: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        if (!isRoleAtLeast(req.user.role, minimumRole)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient role level',
                },
            });
            return;
        }

        next();
    };
}

/**
 * Owner or role guard - allows access if user owns the resource OR has specified role
 */
export function ownerOrRoleGuard(
    getOwnerId: (req: Request) => string | undefined,
    ...allowedRoles: UserRole[]
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
            return;
        }

        const ownerId = getOwnerId(req);
        const isOwner = ownerId === req.user.userId;
        const hasRole = allowedRoles.includes(req.user.role);

        if (!isOwner && !hasRole) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Access denied',
                },
            });
            return;
        }

        next();
    };
}
