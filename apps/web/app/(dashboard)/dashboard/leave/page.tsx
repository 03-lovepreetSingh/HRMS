'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function LeavePage() {
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewRequest, setShowNewRequest] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [requestsRes, typesRes, empRes] = await Promise.all([
            api.getLeaveRequests(),
            api.getLeaveTypes(),
            api.getEmployees(),
        ]);

        if (requestsRes.success) setLeaveRequests(requestsRes.data || []);
        if (typesRes.success) setLeaveTypes(typesRes.data || []);
        if (empRes.success) setEmployees(empRes.data || []);
        setLoading(false);
    }

    async function handleSubmitRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const data = {
            employeeId: formData.get('employeeId') as string,
            leaveTypeId: formData.get('leaveTypeId') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            reason: formData.get('reason') as string,
        };

        const response = await api.createLeaveRequest(data);
        if (response.success) {
            alert('Leave request submitted successfully!');
            setShowNewRequest(false);
            loadData();
        } else {
            alert(response.error?.message || 'Failed to submit request');
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'REJECTED': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage leave requests and balances</p>
                </div>
                <button
                    onClick={() => setShowNewRequest(!showNewRequest)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Request
                </button>
            </div>

            {/* New Request Form */}
            {showNewRequest && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">New Leave Request</h2>
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Employee
                                </label>
                                <select
                                    name="employeeId"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.user?.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Leave Type
                                </label>
                                <select
                                    name="leaveTypeId"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select type</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} ({type.daysAllowed} days)
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                Reason
                            </label>
                            <textarea
                                name="reason"
                                required
                                rows={3}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter reason for leave..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Submit Request
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewRequest(false)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Leave Requests */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Leave Requests</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : leaveRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No leave requests found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leaveRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {request.employee?.user?.email}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            <span className="font-medium">{request.leaveType?.name}</span>
                                            {' • '}
                                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{request.reason}</p>
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
