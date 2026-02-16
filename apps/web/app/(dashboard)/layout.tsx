'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    Clock,
    Calendar,
    DollarSign,
    BarChart3,
    Ticket,
    Bell,
    Settings,
    LogOut,
    Menu
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
    { name: 'Leave', href: '/dashboard/leave', icon: Calendar },
    { name: 'Payroll', href: '/dashboard/payroll', icon: DollarSign },
    { name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:block">
                <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">AI-HRMS</span>
                </div>

                <nav className="p-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-40 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
                    <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user?.email?.split('@')[0] || 'User'}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {user?.role || 'EMPLOYEE'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
