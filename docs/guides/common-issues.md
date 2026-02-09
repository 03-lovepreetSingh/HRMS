# Common Issues

Frequently encountered issues and their solutions.

## Installation Issues

### pnpm not found

**Problem**: `pnpm: command not found`

**Solution**:
```bash
# Install pnpm
npm install -g pnpm

# Or via corepack
corepack enable
corepack prepare pnpm@latest --activate
```

### Node version mismatch

**Problem**: `ERR_PNPM_UNSUPPORTED_ENGINE`

**Solution**:
```bash
# Check Node version
node --version  # Should be 18+

# Use nvm to switch versions
nvm install 18
nvm use 18
```

## Database Issues

### Role "hrms_user" does not exist

**Problem**: Database initialization failed

**Solution**:
```bash
# Reset Docker volumes
docker-compose down -v
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready -U hrms_user

# Push schema
pnpm db:push
```

### Drizzle schema not found

**Problem**: `Cannot find module '@ai-hrms/db'`

**Solution**:
```bash
# Rebuild packages
pnpm build

# Or specifically for db package
pnpm --filter @ai-hrms/db build
```

## Runtime Issues

### Cannot connect to API from frontend

**Problem**: Network error or CORS issue

**Solution**:
1. Check API is running: `curl http://localhost:3001/health`
2. Verify `CORS_ORIGIN` in `.env` matches frontend URL
3. Check `NEXT_PUBLIC_API_URL` is set correctly

### JWT token expired

**Problem**: Getting 401 errors after some time

**Solution**:
- Token expired, re-login to get new tokens
- Check `JWT_EXPIRES_IN` in your `.env`
- Frontend should auto-refresh tokens

## Build Issues

### Module not found errors

**Problem**: Can't resolve internal packages

**Solution**:
```bash
# Clean and reinstall
pnpm clean
pnpm install
pnpm build
```

### TypeScript errors in node_modules

**Problem**: Type errors from dependencies

**Solution**:
```bash
# Skip type checking for node_modules
# Add to tsconfig.json:
"skipLibCheck": true
```

## Docker Issues

### Port already allocated

**Problem**: `bind: address already in use`

**Solution**:
```bash
# Find process using port
lsof -ti:5432 | xargs kill -9

# Or use different ports in docker-compose.yml
```

### Permission denied on volumes

**Problem**: Docker volume permission errors

**Solution**:
```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or on Windows, run Docker as administrator
```
