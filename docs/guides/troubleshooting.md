# Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### pnpm install fails

**Problem**: Installation fails with permission errors

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall
pnpm install
```

### bcrypt build errors

**Problem**: bcrypt fails to compile native modules

**Solution**:
```bash
# Install build tools
npm install -g node-gyp

# Rebuild
pnpm rebuild bcrypt
```

## Database Issues

### Connection refused

**Problem**: `ECONNREFUSED` when connecting to database

**Solution**:
1. Check if PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Verify port is not in use:
   ```bash
   # Windows
   netstat -ano | findstr :5432

   # macOS/Linux
   lsof -i :5432
   ```

3. Restart the container:
   ```bash
   docker-compose restart postgres
   ```

### Migration failures

**Problem**: Drizzle migrations fail to apply

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d postgres
pnpm db:push
```

## Runtime Issues

### Port already in use

**Problem**: `EADDRINUSE` when starting dev servers

**Solution**:
```bash
# Find and kill process on port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### CORS errors

**Problem**: Frontend can't connect to API due to CORS

**Solution**:
1. Check `CORS_ORIGIN` in `.env`
2. Ensure it matches your frontend URL
3. Restart the API server

### JWT authentication fails

**Problem**: "Invalid token" or "Unauthorized" errors

**Solution**:
1. Check `JWT_SECRET` is set in `.env`
2. Verify token hasn't expired
3. Clear browser cookies and localStorage
4. Re-authenticate

## Build Issues

### TypeScript errors

**Problem**: Build fails with type errors

**Solution**:
```bash
# Run type check separately
pnpm type-check

# Fix errors, then rebuild
pnpm build
```

### Module not found

**Problem**: Cannot resolve internal packages

**Solution**:
```bash
# Rebuild packages
pnpm build

# If still failing, clean and reinstall
pnpm clean
pnpm install
pnpm build
```

## Performance Issues

### Slow hot reload

**Problem**: Changes take too long to reflect

**Solution**:
1. Increase Node.js memory:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. Disable TypeScript checking in dev:
   Edit `turbo.json` to remove type-check from dev pipeline

### High memory usage

**Problem**: Node.js using too much memory

**Solution**:
```bash
# Run garbage collection
pnpm exec turbo daemon clean

# Restart dev servers
# (Ctrl+C, then pnpm dev)
```

## Getting Help

If issues persist:

1. Check [Common Issues](./common-issues.md)
2. Review application logs
3. Check Docker container logs
4. Verify environment configuration
