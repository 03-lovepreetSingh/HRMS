import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                <p className="text-white/60 mt-2">Sign in to your account</p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center">
                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
                    Forgot your password?
                </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-white/60 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
