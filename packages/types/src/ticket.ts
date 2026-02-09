// Ticket status enum
export const TicketStatus = {
    OPEN: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

// Ticket priority enum
export const TicketPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
} as const;

export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];

// Ticket category enum
export const TicketCategory = {
    IT_SUPPORT: 'IT_SUPPORT',
    HR_QUERY: 'HR_QUERY',
    PAYROLL: 'PAYROLL',
    LEAVE: 'LEAVE',
    FACILITIES: 'FACILITIES',
    OTHER: 'OTHER',
} as const;

export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory];

// Ticket interface
export interface Ticket {
    id: string;
    employeeId: string;
    category: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo: string | null;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
}

// Ticket with relations
export interface TicketWithRelations extends Ticket {
    employee: {
        id: string;
        user: {
            email: string;
        };
    };
    assignee: {
        id: string;
        user: {
            email: string;
        };
    } | null;
    comments: TicketComment[];
    attachments: TicketAttachment[];
}

// Create ticket input
export interface CreateTicketInput {
    employeeId: string;
    category: string;
    subject: string;
    description: string;
    priority?: TicketPriority;
}

// Update ticket input
export interface UpdateTicketInput {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
}

// Ticket comment interface
export interface TicketComment {
    id: string;
    ticketId: string;
    authorId: string;
    comment: string;
    isInternal: boolean;
    createdAt: Date;
}

// Create comment input
export interface CreateTicketCommentInput {
    ticketId: string;
    authorId: string;
    comment: string;
    isInternal?: boolean;
}

// Ticket attachment interface
export interface TicketAttachment {
    id: string;
    ticketId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: Date;
}

// Upload attachment input
export interface UploadAttachmentInput {
    ticketId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
}

// SLA config
export interface SLAConfig {
    priority: TicketPriority;
    responseTimeHours: number;
    resolutionTimeHours: number;
}

// Ticket statistics
export interface TicketStatistics {
    total: number;
    byStatus: Record<TicketStatus, number>;
    byPriority: Record<TicketPriority, number>;
    byCategory: Record<string, number>;
    averageResolutionTime: number;
    slaBreaches: number;
}
