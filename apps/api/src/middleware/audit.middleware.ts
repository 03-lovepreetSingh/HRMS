import type { Request, Response, NextFunction } from 'express';

import { db, auditLogs } from '@ai-hrms/db';
import type { AuditAction } from '@ai-hrms/types';

/**
 * Create an audit log entry
 */
export async function createAuditLog(
    actorId: string | undefined,
    action: AuditAction,
    entity: string,
    entityId?: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    try {
        await db.insert(auditLogs).values({
            actorId,
            action,
            entity,
            entityId,
            oldValue,
            newValue,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Audit middleware factory for automatic logging
 */
export function auditMiddleware(entity: string, action: AuditAction) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        // Store audit info for use after request completion
        req.auditInfo = {
            entity,
            action,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
        };
        next();
    };
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            auditInfo?: {
                entity: string;
                action: AuditAction;
                ipAddress?: string;
                userAgent?: string;
            };
        }
    }
}
