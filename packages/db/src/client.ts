import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

// Connection string from environment
const connectionString = process.env.DATABASE_URL || 'postgresql://hrms_user:hrms_password@localhost:5432/ai_hrms';

// Create postgres client
const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;

// Export schema
export { schema };

// Graceful shutdown helper
export async function closeConnection() {
    await client.end();
}
