import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navigation */}
            <nav className="border-b border-white/10 backdrop-blur-lg bg-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                            <span className="text-xl font-bold text-white">AI-HRMS</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        Modern HR Management
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Powered by AI
                        </span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
                        Streamline your HR operations with our comprehensive suite of tools.
                        From attendance tracking to payroll management, we've got you covered.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/25"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-lg transition-all backdrop-blur-lg border border-white/20"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="grid md:grid-cols-3 gap-8 mt-32">
                    {[
                        {
                            title: 'Employee Management',
                            description: 'Complete employee lifecycle from onboarding to offboarding.',
                            icon: '👥',
                        },
                        {
                            title: 'Attendance Tracking',
                            description: 'Real-time attendance with punch-in/out and reports.',
                            icon: '⏰',
                        },
                        {
                            title: 'Leave Management',
                            description: 'Automated leave requests with approval workflows.',
                            icon: '📅',
                        },
                        {
                            title: 'Payroll Processing',
                            description: 'Automated salary calculation and payslip generation.',
                            icon: '💰',
                        },
                        {
                            title: 'Performance Reviews',
                            description: 'Structured review cycles with feedback management.',
                            icon: '📊',
                        },
                        {
                            title: 'Help Desk',
                            description: 'Internal ticketing system for employee requests.',
                            icon: '🎫',
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-white/60">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 mt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-white/40">
                        © 2024 AI-HRMS. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
