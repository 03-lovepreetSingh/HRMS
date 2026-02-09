/** @type {import('drizzle-kit').Config} */
export default {
    schema: './src/schema/index.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hrms',
    },
    verbose: true,
    strict: true,
};
