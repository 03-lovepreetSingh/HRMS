// @ts-check
/** @type {import('drizzle-kit').Config} */
module.exports = {
    schema: './src/schema/index.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hrms',
    },
    verbose: true,
    strict: true,
};
