import jwt from 'jsonwebtoken';

import type { UserRole, JWTPayload } from '@ai-hrms/types';

// Configuration (should be set via environment)
const config = {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-key-min-32-characters-long',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-min-32-characters-long',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

/**
 * Generate access token
 */
export function generateAccessToken(
    userId: string,
    email: string,
    role: UserRole
): string {
    const payload = {
        userId,
        email,
        role,
        type: 'access' as const,
    };

    return jwt.sign(payload, config.accessSecret, {
        expiresIn: config.accessExpiry as jwt.SignOptions['expiresIn']
    });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(
    userId: string,
    email: string,
    role: UserRole
): string {
    const payload = {
        userId,
        email,
        role,
        type: 'refresh' as const,
    };

    return jwt.sign(payload, config.refreshSecret, {
        expiresIn: config.refreshExpiry as jwt.SignOptions['expiresIn']
    });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(
    userId: string,
    email: string,
    role: UserRole
): { accessToken: string; refreshToken: string } {
    return {
        accessToken: generateAccessToken(userId, email, role),
        refreshToken: generateRefreshToken(userId, email, role),
    };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, config.accessSecret) as JWTPayload;
        if (decoded.type !== 'access') {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, config.refreshSecret) as JWTPayload;
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.decode(token) as JWTPayload | null;
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }
    return Date.now() >= decoded.exp * 1000;
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}
