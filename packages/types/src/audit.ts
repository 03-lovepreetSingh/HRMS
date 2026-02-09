// Audit log interface
export interface AuditLog {
    id: string;
    actorId: string | null;
    action: AuditAction;
    entity: string;
    entityId: string | null;
    oldValue: Record<string, unknown> | null;
    newValue: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

// Audit action enum
export const AuditAction = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    PASSWORD_RESET: 'PASSWORD_RESET',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// Create audit log input
export interface CreateAuditLogInput {
    actorId?: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

// Audit log filter
export interface AuditLogFilter {
    actorId?: string;
    entity?: string;
    entityId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
}
