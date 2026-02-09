# Getting Started

This guide will help you set up the AI-HRMS project on your local machine.

## Prerequisites

- **Node.js**: 18.x or higher
- **pnpm**: 8.x or higher
- **Docker**: Latest stable version
- **Git**: For cloning the repository

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-hrms
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo and its workspaces.

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials
- JWT secrets
- API/frontend URLs
- Other service configurations

### 4. Start Infrastructure Services

```bash
docker-compose up -d postgres redis
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 5. Initialize Database

Generate and apply migrations:

```bash
# Generate Drizzle migrations
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 6. Start Development Servers

```bash
pnpm dev
```

This starts:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## Verification

### Check Health Endpoints

```bash
# API health check
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Access Applications

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/v1 (when available)
- **Drizzle Studio**: Run `pnpm db:studio`

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Type check all packages |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean build artifacts |

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Start only database
docker-compose up -d postgres

# View logs
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v
```

## Next Steps

1. [Create your first admin user](../development/first-user.md)
2. [Explore the API](../api/README.md)
3. [Review the database schema](../database/schema.md)
4. [Set up your IDE](../development/ide-setup.md)
