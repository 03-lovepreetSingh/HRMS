# Development Workflow

This document outlines the development workflow and conventions for AI-HRMS.

## Branch Strategy

We use a simplified Git flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

## Workflow

### 1. Start New Work

```bash
# Pull latest changes
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Development

Make changes following our coding conventions:
- Use TypeScript for type safety
- Follow existing code patterns
- Keep functions small and focused
- Add comments for complex logic

### 3. Testing

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build to verify
pnpm build
```

### 4. Commit

Follow conventional commits:

```bash
# Format: type(scope): message
feat(auth): add password reset
fix(api): resolve cors issue
docs(readme): update setup instructions
refactor(db): optimize queries
test(payroll): add unit tests
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

### 5. Push and PR

```bash
# Push branch
git push -u origin feature/your-feature-name

# Create PR via GitHub CLI or web
gh pr create --title "feat: your feature" --body "Description"
```

## Code Conventions

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type
- Use discriminated unions for complex types

```typescript
// Good
interface Employee {
  id: string;
  name: string;
  departmentId: string;
}

// Bad
const employee: any = {};
```

### File Structure

```
module-name/
├── index.ts           # Public exports
├── module.routes.ts   # Route definitions
├── module.controller.ts # Request handlers
├── module.service.ts  # Business logic
├── module.validation.ts # Input validation
└── module.types.ts    # Module-specific types
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `auth.service.ts` |
| Components | PascalCase | `UserCard.tsx` |
| Functions | camelCase | `getUserById` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Database tables | snake_case | `leave_requests` |

### Error Handling

```typescript
// Service layer
try {
  const user = await db.query.users.findFirst({...});
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
} catch (error) {
  logger.error('Failed to fetch user', { error });
  throw error;
}

// Controller layer
export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
```

## Monorepo Guidelines

### Adding Dependencies

```bash
# Root dependency
pnpm add -D package-name

# App-specific dependency
pnpm --filter @ai-hrms/api add package-name

# Package dependency
pnpm --filter @ai-hrms/db add package-name
```

### Cross-Package Imports

```typescript
// From packages
db from '@ai-hrms/db';
import { auth } from '@ai-hrms/auth';
import type { User } from '@ai-hrms/types';
```

## Database Changes

1. Modify schema in `packages/db/src/schema/`
2. Generate migration: `pnpm db:generate`
3. Review generated SQL
4. Apply migration: `pnpm db:push`
5. Commit both schema and migration files

## Testing Strategy

### Unit Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test auth.service

# Watch mode
pnpm test --watch
```

### Test File Location

Place tests next to source files:

```
service.ts
service.test.ts
```

## Code Review Checklist

Before submitting PR:

- [ ] Code follows conventions
- [ ] TypeScript compiles without errors
- [ ] No linting errors
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Commit messages are clear

## Release Process

1. Merge features to `develop`
2. Test integration
3. Create PR from `develop` to `main`
4. Review and merge
5. Tag release: `git tag -a v1.0.0 -m "Release v1.0.0"`
6. Push tags: `git push origin --tags`
