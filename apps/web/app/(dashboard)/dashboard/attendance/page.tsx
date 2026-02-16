'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function AttendancePage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [punchLoading, setPunchLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            loadAttendanceSummary();
        }
    }, [selectedEmployee]);

    async function loadData() {
        const [userRes, empRes] = await Promise.all([
            api.getCurrentUser(),
            api.getEmployees(),
        ]);

        if (userRes.success) {
            setCurrentUser(userRes.data);
        }

        if (empRes.success) {
            setEmployees(empRes.data || []);
            if (empRes.data && empRes.data.length > 0) {
                setSelectedEmployee(empRes.data[0].id);
            }
        }
    }

    async function loadAttendanceSummary() {
        if (!selectedEmployee) return;
        setLoading(true);
        const response = await api.getAttendanceSummary(selectedEmployee, currentYear, currentMonth);
        if (response.success) {
            setAttendanceSummary(response.data);
        }
        setLoading(false);
    }

    async function handlePunchIn() {
        if (!selectedEmployee) return;
        setPunchLoading(true);
        const response = await api.punchIn(selectedEmployee);
        if (response.success) {
            alert('Punched in successfully!');
            loadAttendanceSummary();
        } else {
            alert(response.error?.message || 'Failed to punch in');
        }
        setPunchLoading(false);
    }

    async function handlePunchOut() {
        if (!selectedEmployee) return;
        setPunchLoading(true);
        const response = await api.punchOut(selectedEmployee);
        if (response.success) {
            alert('Punched out successfully!');
            loadAttendanceSummary();
        } else {
            alert(response.error?.message || 'Failed to punch out');
        }
        setPunchLoading(false);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
                <p className="text-slate-600 dark:text-slate-400">Track employee attendance</p>
            </div>

            {/* Employee Selector */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Select Employee
                </label>
                <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.user?.email}
                        </option>
                    ))}
                </select>
            </div>

            {/* Punch In/Out */}
            <div className="grid md:grid-cols-2 gap-6">
                <button
                    onClick={handlePunchIn}
                    disabled={punchLoading || !selectedEmployee}
                    className="flex items-center justify-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                        <div className="font-semibold text-slate-900 dark:text-white">Punch In</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Start your workday</div>
                    </div>
                </button>

                <button
                    onClick={handlePunchOut}
                    disabled={punchLoading || !selectedEmployee}
                    className="flex items-center justify-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div className="text-left">
                        <div className="font-semibold text-slate-900 dark:text-white">Punch Out</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">End your workday</div>
                    </div>
                </button>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Attendance Summary - {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : attendanceSummary ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{attendanceSummary.totalDays || 0}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Days</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{attendanceSummary.presentDays || 0}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Present Days</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">{attendanceSummary.absentDays || 0}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Absent Days</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                            No attendance data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
