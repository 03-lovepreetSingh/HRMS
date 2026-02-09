import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@ai-hrms/ui/globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata: Metadata = {
    title: 'AI-HRMS | Human Resource Management System',
    description: 'Modern, AI-powered Human Resource Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
