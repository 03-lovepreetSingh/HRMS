# Architecture Overview

## System Architecture

AI-HRMS follows a modular, service-oriented architecture built as a monorepo using Turborepo.

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (Proxy)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐   ┌────▼────┐
   │   Web   │   │    API    │   │ Realtime│
   │ (Next)  │   │ (Express) │   │(WS Svr) │
   └────┬────┘   └─────┬─────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │   (Primary DB)  │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │     Redis       │
              │  (Cache/Queue)  │
              └─────────────────┘
```

## Monorepo Structure

### Apps

#### `apps/web` - Frontend Application
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React hooks + Context for auth
- **Features**:
  - Server-side rendering (SSR)
  - API routes for BFF pattern
  - Role-based UI rendering

#### `apps/api` - Backend API
- **Framework**: Express.js with TypeScript
- **Architecture**: Modular route-based structure
- **Security**: Helmet, CORS, Rate limiting
- **Features**:
  - RESTful API endpoints
  - JWT authentication
  - RBAC authorization
  - Request audit logging

### Packages

#### `packages/ui` - Shared UI Components
- shadcn/ui component library
- Shared Tailwind configuration
- Common form components

#### `packages/db` - Database Layer
- Drizzle ORM configuration
- Database schemas
- Migration utilities

#### `packages/auth` - Authentication Utilities
- JWT token management
- Password hashing (bcrypt)
- RBAC guards and middleware

#### `packages/types` - Shared Types
- TypeScript interfaces
- API response types
- Domain models

#### `packages/config` - Shared Configuration
- ESLint presets
- TypeScript configurations
- Build tooling configs

## Data Flow

### Authentication Flow
```
1. User submits credentials
2. API validates and returns JWT tokens
3. Access token stored in memory
4. Refresh token stored in HTTP-only cookie
5. Subsequent requests include access token
6. Token refresh on 401 responses
```

### API Request Flow
```
1. Nginx receives request
2. Request routed to API service
3. Rate limiting check
4. JWT validation (if protected)
5. RBAC permission check
6. Route handler execution
7. Audit log creation
8. Response returned
```

## Security Architecture

### Authentication
- JWT with access/refresh token pair
- Access tokens: short-lived (15 min)
- Refresh tokens: longer-lived (7 days)
- HTTP-only cookies for refresh tokens

### Authorization
- Role-based access control (RBAC)
- Permission-based guards
- Resource-level ownership checks

### Data Protection
- Helmet.js for security headers
- CORS configuration
- Rate limiting per IP
- SQL injection protection (parameterized queries)
- XSS protection

## Database Design

### Core Entities
- **Users**: Authentication and basic info
- **Employees**: HR records with manager hierarchy
- **Departments**: Organizational structure
- **Designations**: Job titles and levels
- **Attendance**: Punch in/out records
- **Leave**: Leave types and requests
- **Payroll**: Salary and payment records
- **Performance**: Review cycles and ratings

### Relationships
```
Department 1:N Employee
Employee 1:N Attendance
Employee 1:N LeaveRequest
Employee 1:N PayrollRecord
Employee 1:N PerformanceReview
Employee N:1 Employee (manager)
```
