import type { Request, Response, NextFunction } from 'express';

import type { ApiError } from '@ai-hrms/types';

// Custom error class
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('Error:', err);

    if (err instanceof AppError) {
        const errorResponse: { success: false; error: ApiError } = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        };
        res.status(err.statusCode).json(errorResponse);
        return;
    }

    // Zod validation error
    if (err.name === 'ZodError') {
        const zodError = err as { errors: Array<{ path: string[]; message: string }> };
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: { errors: zodError.errors },
            },
        });
        return;
    }

    // Default server error
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    });
}

// Not found handler
export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
        },
    });
}
