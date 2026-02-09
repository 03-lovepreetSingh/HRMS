# Database Schema

AI-HRMS uses PostgreSQL with Drizzle ORM for database management.

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ departments │     │ designations│     │    users    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ name        │     │ title       │     │ email       │
│ code        │     │ level       │     │ password    │
│ createdAt   │     │ createdAt   │     │ role        │
└──────┬──────┘     └──────┬──────┘     │ createdAt   │
       │                   │            └──────┬──────┘
       │                   │                   │
       │            ┌──────┴──────┐            │
       │            │  employees  │◄───────────┘
       │            ├─────────────┤            │
       └───────────►│ id (PK)     │            │
                    │ userId (FK) │────────────┘
                    │ deptId (FK) │────────────┐
                    │ desigId(FK) │◄───────────┘
                    │ managerId   │──┐
                    │ salary      │  │
                    │ joinedAt    │  │
                    └──────┬──────┘  │
                           │         │
       ┌───────────────────┼─────────┼───────────────────┐
       │                   │         │                   │
       ▼                   ▼         ▼                   ▼
┌─────────────┐   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ attendance  │   │leaveRequests│ │payrollRecords│ │performance  │
├─────────────┤   ├─────────────┤ ├─────────────┤ ├─────────────┤
│ id (PK)     │   │ id (PK)     │ │ id (PK)     │ │ id (PK)     │
│ empId (FK)  │   │ empId (FK)  │ │ empId (FK)  │ │ empId (FK)  │
│ date        │   │ typeId (FK) │ │ month       │ │ reviewerId  │
│ punchIn     │   │ startDate   │ │ basicSalary │ │ cycleId(FK) │
│ punchOut    │   │ endDate     │ │ deductions  │ │ rating      │
│ status      │   │ status      │ │ netSalary   │ │ feedback    │
└─────────────┘   │ reason      │ │ status      │ └─────────────┘
                  └─────────────┘ └─────────────┘
```

## Core Tables

### Users

Authentication and user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| email | varchar(255) | Unique, Not Null | User email address |
| password | varchar(255) | Not Null | Hashed password (bcrypt) |
| role | enum | Not Null | ADMIN, HR, MANAGER, EMPLOYEE |
| isActive | boolean | Default true | Account status |
| lastLoginAt | timestamp | | Last login timestamp |
| createdAt | timestamp | Default now() | Creation timestamp |
| updatedAt | timestamp | | Last update timestamp |

### Departments

Organizational departments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | varchar(100) | Not Null | Department name |
| code | varchar(20) | Unique | Department code |
| description | text | | Department description |
| createdAt | timestamp | Default now() | Creation timestamp |
| updatedAt | timestamp | | Last update timestamp |

### Designations

Job titles and positions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| title | varchar(100) | Not Null | Job title |
| level | integer | | Seniority level |
| description | text | | Role description |
| createdAt | timestamp | Default now() | Creation timestamp |

### Employees

Employee HR records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| userId | uuid | FK → users | Linked user account |
| departmentId | uuid | FK → departments | Department |
| designationId | uuid | FK → designations | Job title |
| managerId | uuid | FK → employees | Reporting manager |
| employeeCode | varchar(20) | Unique | Employee ID code |
| joiningDate | date | | Date joined |
| baseSalary | decimal | | Monthly base salary |
| phone | varchar(20) | | Contact number |
| address | text | | Home address |
| emergencyContact | jsonb | | Emergency contact info |
| createdAt | timestamp | Default now() | Creation timestamp |
| updatedAt | timestamp | | Last update timestamp |

### Attendance

Daily attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| employeeId | uuid | FK → employees | Employee |
| date | date | Not Null | Attendance date |
| punchIn | time | | Clock in time |
| punchOut | time | | Clock out time |
| status | enum | Not Null | present, absent, half_day, wfh |
| notes | text | | Additional notes |
| approvedBy | uuid | FK → users | Approving manager |
| createdAt | timestamp | Default now() | Creation timestamp |

### Leave Types

Types of leave available.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | varchar(50) | Not Null | Leave type name |
| code | varchar(20) | Unique | Type code |
| daysPerYear | integer | | Annual allowance |
| isPaid | boolean | Default true | Paid/unpaid |
| requiresApproval | boolean | Default true | Approval needed |
| createdAt | timestamp | Default now() | Creation timestamp |

### Leave Requests

Employee leave applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| employeeId | uuid | FK → employees | Requesting employee |
| leaveTypeId | uuid | FK → leaveTypes | Type of leave |
| startDate | date | Not Null | Leave start |
| endDate | date | Not Null | Leave end |
| days | integer | Not Null | Number of days |
| reason | text | | Leave reason |
| status | enum | Default pending | pending, approved, rejected |
| approvedBy | uuid | FK → users | Approver |
| approvedAt | timestamp | | Approval timestamp |
| createdAt | timestamp | Default now() | Request timestamp |

### Payroll Records

Monthly payroll data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| employeeId | uuid | FK → employees | Employee |
| month | integer | Not Null | Month (1-12) |
| year | integer | Not Null | Year |
| basicSalary | decimal | Not Null | Base salary |
| allowances | decimal | Default 0 | Additional allowances |
| deductions | decimal | Default 0 | Total deductions |
| tax | decimal | Default 0 | Tax amount |
| netSalary | decimal | Not Null | Final amount |
| status | enum | Default draft | draft, locked, paid |
| paidAt | timestamp | | Payment timestamp |
| createdAt | timestamp | Default now() | Creation timestamp |

### Performance Reviews

Employee performance evaluations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| employeeId | uuid | FK → employees | Reviewed employee |
| reviewerId | uuid | FK → users | Reviewing manager |
| cycleId | uuid | FK → reviewCycles | Review period |
| rating | integer | 1-5 | Performance rating |
| goals | jsonb | | Set goals |
| achievements | text | | Accomplishments |
| feedback | text | | Manager feedback |
| status | enum | Default pending | pending, completed |
| createdAt | timestamp | Default now() | Creation timestamp |

### Review Cycles

Performance review periods.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Unique identifier |
| name | varchar(100) | Not Null | Cycle name |
| startDate | date | Not Null | Cycle start |
| endDate | date | Not Null | Cycle end |
| status | enum | Default active | active, completed |
| createdAt | timestamp | Default now() | Creation timestamp |

## Indexes

Performance-optimized indexes:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Employees
CREATE INDEX idx_employees_user_id ON employees(userId);
CREATE INDEX idx_employees_dept_id ON employees(departmentId);
CREATE INDEX idx_employees_manager_id ON employees(managerId);

-- Attendance
CREATE INDEX idx_attendance_emp_date ON attendance(employeeId, date);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Leave
CREATE INDEX idx_leave_emp_status ON leaveRequests(employeeId, status);
CREATE INDEX idx_leave_dates ON leaveRequests(startDate, endDate);

-- Payroll
CREATE INDEX idx_payroll_emp_month ON payrollRecords(employeeId, year, month);
```

## Database Operations

### Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:push

# Open Drizzle Studio for visual management
pnpm db:studio
```

### Backup & Restore

```bash
# Backup
docker exec ai-hrms-postgres pg_dump -U hrms_user ai_hrms > backup.sql

# Restore
docker exec -i ai-hrms-postgres psql -U hrms_user ai_hrms < backup.sql
```
