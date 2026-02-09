# Development FAQ

Frequently asked questions about development.

## General

### How do I add a new package?

```bash
# Create directory
mkdir packages/new-package
cd packages/new-package
pnpm init

# Add to pnpm-workspace.yaml if not already included

# Install dependencies
pnpm add some-dependency
```

### How do I run a single app?

```bash
# Run only API
pnpm --filter @ai-hrms/api dev

# Run only web
pnpm --filter @ai-hrms/web dev
```

### How do I add an environment variable?

1. Add to `.env.example`
2. Add to `.env` (local)
3. Update relevant app's configuration
4. Document in `docs/guides/environment.md`

## Database

### How do I create a migration?

```bash
# After modifying schema files
pnpm db:generate

# Apply migration
pnpm db:push
```

### How do I reset the database?

```bash
# WARNING: This deletes all data!
docker-compose down -v
docker-compose up -d postgres
pnpm db:push
```

### How do I view the database?

```bash
# Drizzle Studio (recommended)
pnpm db:studio

# Or use psql
docker-compose exec postgres psql -U hrms_user -d ai_hrms
```

## API Development

### How do I add a new endpoint?

1. Define route in `apps/api/src/modules/<module>/<module>.routes.ts`
2. Add controller function
3. Implement service logic
4. Add validation schema
5. Register route in `apps/api/src/routes/index.ts`

### How do I protect a route?

```typescript
import { authenticate, requireRole } from '@ai-hrms/auth';

router.get('/protected', authenticate, requireRole(['ADMIN', 'HR']), controller);
```

### How do I log requests?

Request logging is automatic via middleware. Check logs:
```bash
docker-compose logs -f api
```

## Frontend Development

### How do I add a new page?

1. Create file in `apps/web/app/` for App Router
2. Or in `apps/web/pages/` for Pages Router
3. Follow existing patterns for data fetching

### How do I use shared UI components?

```tsx
import { Button } from '@ai-hrms/ui/components/button';

export default function Page() {
  return <Button>Click me</Button>;
}
```

### How do I make API calls?

```typescript
// Client-side
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`);

// Server-side (Next.js)
const data = await fetch(`${process.env.API_URL}/employees`);
```

## Testing

### How do I run tests?

```bash
# All tests
pnpm test

# Single file
pnpm test auth.test.ts

# With coverage
pnpm test --coverage
```

### Where do I put tests?

Place test files next to source files:
```
service.ts
service.test.ts
```

## Deployment

### How do I deploy to production?

See [Docker Deployment Guide](../deployment/docker.md) for detailed instructions.

Quick steps:
1. Set up production `.env`
2. Build images: `docker-compose -f docker-compose.prod.yml build`
3. Start services: `docker-compose -f docker-compose.prod.yml up -d`

### How do I update production?

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec api pnpm db:push
```
