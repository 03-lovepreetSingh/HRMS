# Environment Configuration

Complete guide to environment variables for AI-HRMS.

## Quick Reference

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Required Variables

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `POSTGRES_USER` | Database username | `hrms_user` |
| `POSTGRES_PASSWORD` | Database password | `secure_password` |
| `POSTGRES_DB` | Database name | `ai_hrms` |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Access token secret (min 32 chars) | `your-super-secret-jwt-key-32chars` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret-key-32chars` |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |

### API Server

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PORT` | API server port | `3001` |
| `API_HOST` | API server host | `0.0.0.0` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API URL for client-side calls | `http://localhost:3001/api/v1` |
| `API_URL` | API URL for server-side calls | `http://api:3001/api/v1` |

### Redis (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `REDIS_PASSWORD` | Redis password | - |

### Email (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `noreply@example.com` |
| `SMTP_PASS` | SMTP password | `app_password` |
| `EMAIL_FROM` | From address | `HRMS <noreply@example.com>` |

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://hrms_user:hrms_password@localhost:5432/ai_hrms

# JWT (use simple values for dev)
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Production

```env
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0
CORS_ORIGIN=https://your-domain.com

# Database (use strong credentials)
DATABASE_URL=postgresql://hrms_prod:strong_password@postgres:5432/ai_hrms_prod

# JWT (use cryptographically secure random strings)
JWT_SECRET=use-random-64-char-string-here
JWT_REFRESH_SECRET=use-different-64-char-string-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1

# Redis
REDIS_URL=redis://:password@redis:6379
```

## Generating Secrets

Generate secure random strings:

```bash
# Linux/macOS
openssl rand -base64 64

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

## Security Best Practices

1. **Never commit `.env` files**
   - Keep `.env` in `.gitignore`
   - Only commit `.env.example` with dummy values

2. **Use different secrets per environment**
   - Development secrets should differ from production
   - Rotate secrets regularly

3. **Strong database passwords**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols
   - No dictionary words

4. **JWT secrets**
   - Minimum 32 characters
   - Cryptographically random
   - Keep them secret

## Validation

Verify your configuration:

```bash
# Check database connection
npx drizzle-kit check

# Test API with health endpoint
curl http://localhost:3001/health

# Verify environment loading
node -e "require('dotenv/config'); console.log(process.env.NODE_ENV)"
```

## Troubleshooting

### Variables not loading

1. Check `.env` file exists in project root
2. Verify file is UTF-8 encoded
3. No spaces around `=` sign
4. Quote values with spaces: `KEY="value with spaces"`

### Database connection fails

1. Verify `DATABASE_URL` format
2. Check database is running: `docker-compose ps postgres`
3. Test with psql: `psql $DATABASE_URL`

### JWT errors

1. Ensure `JWT_SECRET` is set and non-empty
2. Minimum 32 characters recommended
3. Same secret must be used for sign/verify
