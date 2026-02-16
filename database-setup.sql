-- PostgreSQL initialization script for AI-HRMS
-- Run this script on your PostgreSQL database before starting the application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: Make sure your database user has the necessary privileges
-- If you're using a managed PostgreSQL service (like Supabase, Neon, etc.),
-- these extensions are usually already available.
