# AI-HRMS — Human Resource Management System

A production-grade, full-stack HRMS built as a Turborepo monorepo.

## 🚀 Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend  | Node.js, Express, TypeScript  |
| Database | PostgreSQL + Drizzle ORM      |
| Auth     | JWT (access + refresh tokens) |
| Monorepo | Turborepo                     |
| Docker   | PostgreSQL, Redis, Nginx      |

## 📁 Project Structure

```
ai-hrms/
├── apps/
│   ├── web/          # Next.js frontend (SSR + BFF)
│   ├── api/          # Express backend REST API
│   ├── realtime/     # WebSocket server (Phase 2)
│   └── ai/           # AI services (Phase 5)
├── packages/
│   ├── ui/           # Shared React components (shadcn)
│   ├── db/           # Drizzle ORM schemas
│   ├── auth/         # JWT + RBAC utilities
│   ├── types/        # Shared TypeScript types
│   └── config/       # ESLint, TypeScript configs
└── docker/
    ├── nginx/
    └── postgres/
```

## 🏃 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

### 3. Start Database

```bash
docker-compose up -d postgres
```

### 4. Run Database Migrations

```bash
pnpm db:push
```

### 5. Start Development Servers

```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## 📦 Phase 1 Modules

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

## 🔐 RBAC Roles

| Role     | Access Level                         |
|----------|--------------------------------------|
| ADMIN    | Full system access                   |
| HR       | Employee, payroll, leave management  |
| MANAGER  | Team attendance, leave approvals     |
| EMPLOYEE | Own profile, attendance, requests    |

## 📝 API Documentation

Base URL: `http://localhost:3001/api/v1`

### Authentication

```
POST /auth/register    - Register new user
POST /auth/login       - Login and get tokens
POST /auth/refresh     - Refresh access token
GET  /auth/me          - Get current user
POST /auth/change-password
```

### Employees

```
GET    /employees      - List all employees
GET    /employees/:id  - Get employee by ID
POST   /employees      - Create employee
PATCH  /employees/:id  - Update employee
DELETE /employees/:id  - Soft delete employee
```

### Attendance

```
POST /attendance/punch-in   - Punch in
POST /attendance/punch-out  - Punch out
POST /attendance/override   - Admin override
GET  /attendance/summary/:employeeId/:year/:month
```

### Leave

```
GET  /leave/types           - List leave types
POST /leave/types           - Create leave type
GET  /leave/requests        - List requests
POST /leave/requests        - Create request
POST /leave/requests/:id/approve
POST /leave/requests/:id/reject
GET  /leave/balance/:employeeId
```

### Payroll

```
GET  /payroll/salaries
POST /payroll/salaries
POST /payroll/generate
POST /payroll/lock/:id
```

## 🛠️ Development Scripts

```bash
pnpm dev           # Start all services
pnpm build         # Build all packages
pnpm lint          # Lint all packages
pnpm type-check    # Type check all packages
pnpm db:generate   # Generate migrations
pnpm db:push       # Push schema to DB
pnpm db:studio     # Open Drizzle Studio
```

## 🐳 Docker Commands

```bash
docker-compose up -d              # Start all services
docker-compose up -d postgres     # Start only Postgres
docker-compose down               # Stop all services
docker-compose logs -f postgres   # View logs
```

## 📜 License

MIT
