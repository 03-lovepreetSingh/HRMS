// Review cycle interface
export interface ReviewCycle {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
}

export interface CreateReviewCycleInput {
    name: string;
    startDate: Date;
    endDate: Date;
}

// Performance review interface
export interface PerformanceReview {
    id: string;
    employeeId: string;
    managerId: string;
    reviewCycleId: string;
    rating: number;
    feedback: string | null;
    createdAt: Date;
}

// Performance review with relations
export interface PerformanceReviewWithRelations extends PerformanceReview {
    employee: {
        id: string;
        user: {
            email: string;
        };
    };
    manager: {
        id: string;
        user: {
            email: string;
        };
    };
    reviewCycle: ReviewCycle;
}

// Create performance review input
export interface CreatePerformanceReviewInput {
    employeeId: string;
    managerId: string;
    reviewCycleId: string;
    rating: number;
    feedback?: string;
}

// Update performance review input
export interface UpdatePerformanceReviewInput {
    rating?: number;
    feedback?: string;
}

// Performance summary
export interface PerformanceSummary {
    employeeId: string;
    averageRating: number;
    totalReviews: number;
    reviews: PerformanceReviewWithRelations[];
}

// Rating levels
export const RatingLevel = {
    NEEDS_IMPROVEMENT: 1,
    MEETS_EXPECTATIONS: 2,
    EXCEEDS_EXPECTATIONS: 3,
    OUTSTANDING: 4,
    EXCEPTIONAL: 5,
} as const;

export type RatingLevel = (typeof RatingLevel)[keyof typeof RatingLevel];
