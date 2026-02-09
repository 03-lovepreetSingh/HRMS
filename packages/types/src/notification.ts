// Notification interface
export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}

// Notification type enum
export const NotificationType = {
    LEAVE_REQUEST: 'LEAVE_REQUEST',
    LEAVE_APPROVED: 'LEAVE_APPROVED',
    LEAVE_REJECTED: 'LEAVE_REJECTED',
    TICKET_CREATED: 'TICKET_CREATED',
    TICKET_UPDATED: 'TICKET_UPDATED',
    TICKET_RESOLVED: 'TICKET_RESOLVED',
    PAYROLL_GENERATED: 'PAYROLL_GENERATED',
    REVIEW_PENDING: 'REVIEW_PENDING',
    GENERAL: 'GENERAL',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// Create notification input
export interface CreateNotificationInput {
    userId: string;
    message: string;
    type: NotificationType;
    metadata?: Record<string, unknown>;
}

// Mark as read input
export interface MarkNotificationsReadInput {
    notificationIds: string[];
}

// Notification summary
export interface NotificationSummary {
    totalCount: number;
    unreadCount: number;
    notifications: Notification[];
}
