/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@ai-hrms/ui', '@ai-hrms/types'],
    experimental: {
        typedRoutes: true,
    },
};

module.exports = nextConfig;
