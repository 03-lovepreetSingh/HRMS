# Docker Deployment Guide

This guide covers deploying AI-HRMS using Docker Compose.

## Overview

The project includes Docker configurations for:
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Nginx**: Reverse proxy (production)

## Development Deployment

### Quick Start

```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up -d postgres redis
```

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5432 | hrms_user / hrms_password |
| Redis | localhost:6379 | No auth (dev) |

### Environment Variables

Docker services use these defaults (customize in `.env`):

```env
# Database
POSTGRES_USER=hrms_user
POSTGRES_PASSWORD=hrms_password
POSTGRES_DB=ai_hrms

# API
API_PORT=3001
API_HOST=0.0.0.0
DATABASE_URL=postgresql://hrms_user:hrms_password@localhost:5432/ai_hrms
```

## Production Deployment

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Domain name with DNS configured
- SSL certificates (Let's Encrypt or custom)

### Production Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ai-hrms-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - hrms-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ai-hrms-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - hrms-network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: ai-hrms-api
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - hrms-network

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: ai-hrms-web
    restart: always
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    depends_on:
      - api
    networks:
      - hrms-network

  nginx:
    image: nginx:alpine
    container_name: ai-hrms-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
      - api
    networks:
      - hrms-network

volumes:
  postgres_data:
  redis_data:

networks:
  hrms-network:
    driver: bridge
```

### Deployment Steps

1. **Set up environment**:
   ```bash
   # Create production .env
   cp .env.example .env.production
   # Edit and fill in production values
   ```

2. **Build and start**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Run migrations**:
   ```bash
   docker-compose -f docker-compose.prod.yml exec api pnpm db:push
   ```

4. **Verify deployment**:
   ```bash
   curl https://your-domain.com/api/health
   ```

## SSL/TLS with Let's Encrypt

1. **Install certbot**:
   ```bash
   docker run -it --rm \
     -v /opt/nginx/ssl:/etc/letsencrypt \
     -v /opt/nginx/www:/var/www/certbot \
     certbot/certbot certonly \
     --standalone -d your-domain.com
   ```

2. **Auto-renewal** (add to crontab):
   ```bash
   0 12 * * * docker run -it --rm \
     -v /opt/nginx/ssl:/etc/letsencrypt \
     certbot/certbot renew --quiet
   ```

## Useful Commands

| Command | Description |
|---------|-------------|
| `docker-compose ps` | List running containers |
| `docker-compose logs -f` | Follow logs |
| `docker-compose logs -f api` | Follow API logs |
| `docker-compose down` | Stop all services |
| `docker-compose down -v` | Stop and remove volumes |
| `docker-compose exec postgres psql -U hrms_user -d ai_hrms` | Access database |
| `docker-compose exec redis redis-cli` | Access Redis |

## Backup Strategy

### Automated Backups

Create `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec ai-hrms-postgres pg_dump -U hrms_user ai_hrms \
  | gzip > "$BACKUP_DIR/hrms_db_$DATE.sql.gz"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/scripts/backup.sh
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name
```

### Database connection issues

```bash
# Verify postgres is healthy
docker-compose exec postgres pg_isready -U hrms_user

# Check network connectivity
docker-compose exec api ping postgres
```

### Out of disk space

```bash
# Clean unused images
docker image prune -a

# Clean volumes (caution: data loss)
docker volume prune
```
