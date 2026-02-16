'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Ticket, Plus, AlertCircle } from 'lucide-react';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [ticketsRes, empRes] = await Promise.all([
            api.getTickets(),
            api.getEmployees(),
        ]);

        if (ticketsRes.success) setTickets(ticketsRes.data || []);
        if (empRes.success) setEmployees(empRes.data || []);
        setLoading(false);
    }

    async function handleCreateTicket(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const data = {
            employeeId: formData.get('employeeId') as string,
            subject: formData.get('subject') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as string,
            category: formData.get('category') as string,
        };

        const response = await api.createTicket(data);
        if (response.success) {
            alert('Ticket created successfully!');
            setShowNewTicket(false);
            loadData();
        } else {
            alert(response.error?.message || 'Failed to create ticket');
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            case 'LOW': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            case 'RESOLVED': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'CLOSED': return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
            default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage employee support requests</p>
                </div>
                <button
                    onClick={() => setShowNewTicket(!showNewTicket)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Ticket
                </button>
            </div>

            {/* New Ticket Form */}
            {showNewTicket && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create New Ticket</h2>
                    <form onSubmit={handleCreateTicket} className="space-y-4">
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
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                required
                                placeholder="Brief description of the issue"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="IT_SUPPORT">IT Support</option>
                                    <option value="HR">HR</option>
                                    <option value="FACILITIES">Facilities</option>
                                    <option value="PAYROLL">Payroll</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                placeholder="Detailed description of the issue..."
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Create Ticket
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowNewTicket(false)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tickets List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white">All Tickets</h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-8">
                            <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">No tickets found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {ticket.subject}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                {ticket.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                <span>By: {ticket.employee?.user?.email}</span>
                                                <span>Category: {ticket.category}</span>
                                                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
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
