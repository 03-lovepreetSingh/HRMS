import type { Request, Response, NextFunction } from 'express';

import { authService } from './auth.service.js';
import {
    loginSchema,
    registerSchema,
    refreshTokenSchema,
    changePasswordSchema,
} from './auth.validation.js';

export class AuthController {
    /**
     * POST /api/v1/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = registerSchema.parse(req.body);
            const result = await authService.register(input, req.ip);

            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = loginSchema.parse(req.body);
            const result = await authService.login(input, req.ip);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/refresh
     */
    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = refreshTokenSchema.parse(req.body);
            const tokens = await authService.refreshTokens(refreshToken);

            res.json({
                success: true,
                data: tokens,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/auth/me
     */
    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.getUserById(req.user!.userId);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/change-password
     */
    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input = changePasswordSchema.parse(req.body);
            await authService.changePassword(req.user!.userId, input, req.ip);

            res.json({
                success: true,
                data: { message: 'Password changed successfully' },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/deactivate/:userId
     */
    async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await authService.deactivateUser(req.params.userId!, req.user!.userId);

            res.json({
                success: true,
                data: { message: 'User deactivated successfully' },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/auth/activate/:userId
     */
    async activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await authService.activateUser(req.params.userId!, req.user!.userId);

            res.json({
                success: true,
                data: { message: 'User activated successfully' },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
