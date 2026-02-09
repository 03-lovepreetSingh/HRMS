import { eq } from 'drizzle-orm';

import { db, users } from '@ai-hrms/db';
import type { UserRole, AuthTokens, UserPublic } from '@ai-hrms/types';
import {
    hashPassword,
    verifyPassword,
    generateTokenPair,
    verifyRefreshToken,
} from '@ai-hrms/auth';

import { AppError } from '../../middleware/error.middleware.js';
import { createAuditLog } from '../../middleware/audit.middleware.js';

import type { LoginInput, RegisterInput, ChangePasswordInput } from './auth.validation.js';

export class AuthService {
    /**
     * Register a new user
     */
    async register(input: RegisterInput, ipAddress?: string): Promise<{ user: UserPublic; tokens: AuthTokens }> {
        // Check if user already exists
        const existing = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        if (existing) {
            throw new AppError(409, 'ALREADY_EXISTS', 'User with this email already exists');
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create user
        const [newUser] = await db.insert(users).values({
            email: input.email,
            passwordHash,
            role: input.role as UserRole,
        }).returning();

        if (!newUser) {
            throw new AppError(500, 'INTERNAL_ERROR', 'Failed to create user');
        }

        // Generate tokens
        const tokens = generateTokenPair(newUser.id, newUser.email, newUser.role);

        // Audit log
        await createAuditLog(
            newUser.id,
            'CREATE',
            'users',
            newUser.id,
            undefined,
            { email: newUser.email, role: newUser.role },
            ipAddress
        );

        const userPublic: UserPublic = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
        };

        return { user: userPublic, tokens };
    }

    /**
     * Login user
     */
    async login(input: LoginInput, ipAddress?: string): Promise<{ user: UserPublic; tokens: AuthTokens }> {
        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        if (!user) {
            throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // Check if user is active
        if (!user.status) {
            throw new AppError(401, 'UNAUTHORIZED', 'Account is deactivated');
        }

        // Verify password
        const isValid = await verifyPassword(input.password, user.passwordHash);
        if (!isValid) {
            throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
        }

        // Generate tokens
        const tokens = generateTokenPair(user.id, user.email, user.role);

        // Audit log
        await createAuditLog(user.id, 'LOGIN', 'users', user.id, undefined, undefined, ipAddress);

        const userPublic: UserPublic = {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };

        return { user: userPublic, tokens };
    }

    /**
     * Refresh access token
     */
    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new AppError(401, 'TOKEN_INVALID', 'Invalid or expired refresh token');
        }

        // Verify user still exists and is active
        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.userId),
        });

        if (!user || !user.status) {
            throw new AppError(401, 'UNAUTHORIZED', 'User not found or deactivated');
        }

        // Generate new token pair
        return generateTokenPair(user.id, user.email, user.role);
    }

    /**
     * Change password
     */
    async changePassword(
        userId: string,
        input: ChangePasswordInput,
        ipAddress?: string
    ): Promise<void> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new AppError(404, 'NOT_FOUND', 'User not found');
        }

        // Verify current password
        const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new AppError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await hashPassword(input.newPassword);

        // Update password
        await db.update(users).set({
            passwordHash: newPasswordHash,
            updatedAt: new Date(),
        }).where(eq(users.id, userId));

        // Audit log
        await createAuditLog(userId, 'PASSWORD_RESET', 'users', userId, undefined, undefined, ipAddress);
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<UserPublic | null> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
    }

    /**
     * Deactivate user
     */
    async deactivateUser(userId: string, actorId: string): Promise<void> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new AppError(404, 'NOT_FOUND', 'User not found');
        }

        await db.update(users).set({
            status: false,
            updatedAt: new Date(),
        }).where(eq(users.id, userId));

        await createAuditLog(actorId, 'UPDATE', 'users', userId, { status: true }, { status: false });
    }

    /**
     * Activate user
     */
    async activateUser(userId: string, actorId: string): Promise<void> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new AppError(404, 'NOT_FOUND', 'User not found');
        }

        await db.update(users).set({
            status: true,
            updatedAt: new Date(),
        }).where(eq(users.id, userId));

        await createAuditLog(actorId, 'UPDATE', 'users', userId, { status: false }, { status: true });
    }
}

export const authService = new AuthService();
