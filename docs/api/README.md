# API Documentation

Base URL: `http://localhost:3001/api/v1`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/change-password` | Change password | Yes |

#### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "departmentId": "uuid",
  "designationId": "uuid"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbG..."
  }
}
```

### Employees

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/employees` | List all employees | Yes |
| GET | `/employees/:id` | Get employee by ID | Yes |
| POST | `/employees` | Create employee | HR/Admin |
| PATCH | `/employees/:id` | Update employee | HR/Admin |
| DELETE | `/employees/:id` | Soft delete employee | Admin |

#### List Employees
```bash
GET /employees?page=1&limit=10&departmentId=uuid

Response:
{
  "success": true,
  "data": {
    "employees": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Departments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/departments` | List departments | Yes |
| GET | `/departments/:id` | Get department | Yes |
| POST | `/departments` | Create department | Admin |
| PATCH | `/departments/:id` | Update department | Admin |
| DELETE | `/departments/:id` | Delete department | Admin |

### Designations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/designations` | List designations | Yes |
| POST | `/designations` | Create designation | Admin |
| PATCH | `/designations/:id` | Update designation | Admin |
| DELETE | `/designations/:id` | Delete designation | Admin |

### Attendance

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/attendance/punch-in` | Punch in | Yes |
| POST | `/attendance/punch-out` | Punch out | Yes |
| POST | `/attendance/override` | Admin override | HR/Admin |
| GET | `/attendance/summary/:employeeId/:year/:month` | Get monthly summary | Yes |

#### Punch In
```bash
POST /attendance/punch-in
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "attendance": {
      "id": "uuid",
      "employeeId": "uuid",
      "date": "2024-01-01",
      "punchIn": "09:00:00",
      "status": "present"
    }
  }
}
```

### Leave Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leave/types` | List leave types | Yes |
| POST | `/leave/types` | Create leave type | Admin |
| GET | `/leave/requests` | List leave requests | Yes |
| POST | `/leave/requests` | Create leave request | Yes |
| POST | `/leave/requests/:id/approve` | Approve request | Manager/HR |
| POST | `/leave/requests/:id/reject` | Reject request | Manager/HR |
| GET | `/leave/balance/:employeeId` | Get leave balance | Yes |

#### Create Leave Request
```bash
POST /leave/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "leaveTypeId": "uuid",
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "reason": "Personal reasons",
  "isHalfDay": false
}
```

### Payroll

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/payroll/salaries` | List salaries | HR/Admin |
| POST | `/payroll/salaries` | Create salary record | Admin |
| POST | `/payroll/generate` | Generate payroll | HR/Admin |
| POST | `/payroll/lock/:id` | Lock payroll record | Admin |

### Performance Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/performance/cycles` | List review cycles | Yes |
| POST | `/performance/cycles` | Create review cycle | HR/Admin |
| GET | `/performance/reviews` | List reviews | Yes |
| POST | `/performance/reviews` | Create review | Manager |
| PATCH | `/performance/reviews/:id` | Update review | Manager |

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination info:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Filtering & Sorting

Many list endpoints support filtering:

```bash
# Filter by department
GET /employees?departmentId=uuid

# Filter by date range
GET /attendance?startDate=2024-01-01&endDate=2024-01-31

# Search
GET /employees?search=john
```
