import { Router } from 'express';

import { authGuard, roleGuard } from '@ai-hrms/auth';

import { authController } from './auth.controller.js';

export const authRouter = Router();

// Public routes
authRouter.post('/register', authController.register.bind(authController));
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/refresh', authController.refresh.bind(authController));

// Protected routes
authRouter.get('/me', authGuard, authController.me.bind(authController));
authRouter.post('/change-password', authGuard, authController.changePassword.bind(authController));

// Admin only routes
authRouter.post(
    '/deactivate/:userId',
    authGuard,
    roleGuard('ADMIN', 'HR'),
    authController.deactivateUser.bind(authController)
);
authRouter.post(
    '/activate/:userId',
    authGuard,
    roleGuard('ADMIN', 'HR'),
    authController.activateUser.bind(authController)
);
