// User roles enum
export const UserRole = {
    ADMIN: 'ADMIN',
    HR: 'HR',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// User interface
export interface User {
    id: string;
    email: string;
    role: UserRole;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// User without sensitive data
export interface UserPublic {
    id: string;
    email: string;
    role: UserRole;
    status: boolean;
}

// Create user input
export interface CreateUserInput {
    email: string;
    password: string;
    role: UserRole;
}

// Update user input
export interface UpdateUserInput {
    email?: string;
    role?: UserRole;
    status?: boolean;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Auth tokens
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// JWT payload
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}

// Password reset
export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
}
