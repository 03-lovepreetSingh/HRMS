# AI-HRMS Documentation

Welcome to the AI-HRMS (Human Resource Management System) documentation.

## Overview

AI-HRMS is a production-grade, full-stack HR management system built as a Turborepo monorepo. It provides comprehensive HR functionality including employee management, attendance tracking, leave management, payroll processing, and performance reviews.

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](./architecture/overview.md) | System architecture and design patterns |
| [Getting Started](./guides/getting-started.md) | Installation and setup instructions |
| [API Reference](./api/README.md) | REST API documentation |
| [Database](./database/schema.md) | Database schema and migrations |
| [Deployment](./deployment/docker.md) | Deployment guides |
| [Development](./development/workflow.md) | Development workflow and conventions |

## Project Structure

```
ai-hrms/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express backend API
│   ├── realtime/     # WebSocket server (Phase 2)
│   └── ai/           # AI services (Phase 5)
├── packages/
│   ├── ui/           # Shared React components
│   ├── db/           # Drizzle ORM schemas
│   ├── auth/         # JWT + RBAC utilities
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configurations
├── docker/           # Docker configurations
└── docs/             # Documentation
```

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend  | Node.js, Express, TypeScript  |
| Database | PostgreSQL + Drizzle ORM      |
| Auth     | JWT (access + refresh tokens) |
| Monorepo | Turborepo + pnpm              |
| Docker   | PostgreSQL, Redis, Nginx      |

## Modules

| Module          | Status | Description                     |
|-----------------|--------|---------------------------------|
| Authentication  | ✅     | JWT auth, password reset, RBAC  |
| Employees       | ✅     | CRUD with manager hierarchy     |
| Departments     | ✅     | Department management           |
| Designations    | ✅     | Job title management            |
| Attendance      | ✅     | Punch in/out, admin override    |
| Leave           | ✅     | Types, requests, approval flow  |
| Payroll         | ✅     | Salaries, payroll generation    |
| Performance     | ✅     | Review cycles, ratings          |
| Notifications   | ✅     | User notifications              |
| Tickets         | ✅     | Internal helpdesk               |
| Audit Logs      | ✅     | Activity tracking               |

## RBAC Roles

| Role     | Access Level                         |
|----------|--------------------------------------|
| ADMIN    | Full system access                   |
| HR       | Employee, payroll, leave management  |
| MANAGER  | Team attendance, leave approvals     |
| EMPLOYEE | Own profile, attendance, requests    |

## Getting Help

- Check the [Troubleshooting](./guides/troubleshooting.md) guide
- Review [Common Issues](./guides/common-issues.md)
- See [Development FAQ](./development/faq.md)
