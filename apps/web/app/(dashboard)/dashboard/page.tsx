import { Users, Clock, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const stats = [
    { name: 'Total Employees', value: '156', icon: Users, change: '+12%', trend: 'up' },
    { name: 'Present Today', value: '142', icon: Clock, change: '91%', trend: 'up' },
    { name: 'Leave Requests', value: '8', icon: Calendar, change: 'Pending', trend: 'neutral' },
    { name: 'Payroll This Month', value: '$284,500', icon: DollarSign, change: '+5%', trend: 'up' },
];

const recentActivities = [
    { type: 'leave', message: 'John Doe requested annual leave', time: '5 minutes ago' },
    { type: 'attendance', message: 'Alice Smith punched in', time: '10 minutes ago' },
    { type: 'ticket', message: 'New IT support ticket created', time: '1 hour ago' },
    { type: 'employee', message: 'Bob Johnson profile updated', time: '2 hours ago' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span
                                className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                                    }`}
                            >
                                {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                                {stat.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{stat.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-slate-900 dark:text-white">{activity.message}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {[
                            { label: 'Add Employee', href: '/dashboard/employees/new' },
                            { label: 'Generate Payroll', href: '/dashboard/payroll/generate' },
                            { label: 'View Reports', href: '/dashboard/reports' },
                            { label: 'Create Ticket', href: '/dashboard/tickets/new' },
                        ].map((action, index) => (
                            <button
                                key={index}
                                className="w-full px-4 py-3 text-left bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-900 dark:text-white font-medium"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
