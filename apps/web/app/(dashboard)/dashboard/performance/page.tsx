'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart3, Plus, Calendar } from 'lucide-react';

export default function PerformancePage() {
    const [reviewCycles, setReviewCycles] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewCycle, setShowNewCycle] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [cyclesRes, reviewsRes] = await Promise.all([
            api.getReviewCycles(),
            api.getPerformanceReviews(),
        ]);

        if (cyclesRes.success) setReviewCycles(cyclesRes.data || []);
        if (reviewsRes.success) setReviews(reviewsRes.data || []);
        setLoading(false);
    }

    async function handleCreateCycle(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            description: formData.get('description') as string,
        };

        const response = await api.createReviewCycle(data);
        if (response.success) {
            alert('Review cycle created successfully!');
            setShowNewCycle(false);
            loadData();
        } else {
            alert(response.error?.message || 'Failed to create cycle');
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'COMPLETED': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            case 'DRAFT': return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
            default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Track and manage employee performance</p>
                </div>
                <button
                    onClick={() => setShowNewCycle(!showNewCycle)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Review Cycle
                </button>
            </div>

            {/* New Cycle Form */}
            {showNewCycle && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create Review Cycle</h2>
                    <form onSubmit={handleCreateCycle} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Cycle Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Q1 2024 Performance Review"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Enter cycle description..."
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Create Cycle
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewCycle(false)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Review Cycles */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Review Cycles</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : reviewCycles.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No review cycles found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviewCycles.map((cycle) => (
                                <div
                                    key={cycle.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{cycle.name}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                                            {cycle.status}
                                        </span>
                                    </div>
                                    {cycle.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{cycle.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Reviews */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Performance Reviews</h2>
                </div>
                <div className="p-6">
                    {reviews.length === 0 ? (
                        <div className="text-center py-8">
                            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No performance reviews found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {review.employee?.user?.email}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Reviewed by: {review.reviewer?.user?.email}
                                            </p>
                                        </div>
                                        {review.rating && (
                                            <div className="text-2xl font-bold text-blue-600">
                                                {review.rating}/5
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
