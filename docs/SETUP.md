# Setup Guide

## Local Development Setup

### Prerequisites

- **Docker & Docker Compose** (recommended)
  ```bash
  # macOS with Homebrew
  brew install docker docker-compose
  
  # or download Docker Desktop
  # https://www.docker.com/products/docker-desktop
  ```

- **Node.js 20+** (if running locally without Docker)
  ```bash
  node --version  # Should be v20 or higher
  ```

- **Python 3.11+** (if running FastAPI locally)
  ```bash
  python --version
  ```

### Option 1: Docker Compose (Recommended)

Fastest way to get the full stack running locally.

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/cod-mvp.git
   cd cod-mvp
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to start** (~30 seconds)
   ```bash
   docker-compose ps
   ```

5. **Access services**
   - Frontend: http://localhost:3000
   - FastAPI: http://localhost:8000/docs
   - Node.js: http://localhost:3001/health
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

---

### Option 2: Local Development (Without Docker)

#### A. PostgreSQL + Redis

Install locally or use Docker containers:

```bash
# PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=secure_password -p 5432:5432 postgres:16-alpine

# Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### B. FastAPI Service

```bash
cd backend/fastapi-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://cod_user:secure_password@localhost:5432/cod_mvp"
export REDIS_URL="redis://localhost:6379"

# Run
uvicorn app.main:app --reload
```

#### C. Node.js Service

```bash
cd backend/node-service

# Install dependencies
npm install

# Create .env
cat > .env << EOF
PORT=3001
DATABASE_URL=postgresql://cod_user:secure_password@localhost:5432/cod_mvp
JWT_SECRET=dev-secret-key
EOF

# Run
npm run dev
```

#### D. Next.js Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Run
npm run dev
```

---

## Database Setup

### Create Database

```bash
# Connect to PostgreSQL
psql -h localhost -U cod_user -d postgres

# Run init script
psql -h localhost -U cod_user -d cod_mvp -f init.sql
```

### Verify Schema

```bash
psql -h localhost -U cod_user -d cod_mvp -c "\dt"
```

You should see all tables created:
- users
- wallets
- payments
- portfolio_assets
- trades
- insights
- alerts
- notifications

---

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
# Database
DB_USER=cod_user
DB_PASSWORD=secure_password
DB_NAME=cod_mvp

# JWT Secret (change in production!)
JWT_SECRET=dev-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Blockchain (optional for MVP)
TRON_PRIVATE_KEY=your_key_here
```

---

## Testing

### API Integration Tests

```bash
# FastAPI
cd backend/fastapi-service
pytest tests/

# Node.js
cd backend/node-service
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## Debugging

### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f fastapi
docker-compose logs -f nodejs
docker-compose logs -f frontend
```

### Local Debugging

**FastAPI:**
```bash
# Running with debug output
uvicorn app.main:app --reload --log-level debug
```

**Node.js:**
```bash
# Debug output
DEBUG=* npm run dev
```

**Frontend:**
```bash
# Next.js debug mode
npm run dev -- --inspect
```

---

## Common Issues

### "Connection refused" on localhost:5432

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running
docker start postgres
```

### "Cannot find module" error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS errors

Double-check `.env` file:
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Port already in use

```bash
# Find process using port
lsof -i :3000  # or :5432, :6379, :8000

# Kill process
kill -9 <PID>
```

---

## Useful Commands

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild containers
docker-compose build

# Run command in container
docker-compose exec fastapi bash
docker-compose exec nodejs bash

# View volumes
docker volume ls
```

### Database

```bash
# Connect to PostgreSQL
psql -h localhost -U cod_user -d cod_mvp

# Run SQL file
psql -h localhost -U cod_user -d cod_mvp -f init.sql

# Backup database
pg_dump -h localhost -U cod_user cod_mvp > backup.sql

# Restore database
psql -h localhost -U cod_user cod_mvp < backup.sql
```

### Git

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "Add feature"

# Push to origin
git push origin feature/my-feature

# Create pull request
# (via GitHub UI)
```

---

## Next Steps

1. ✅ Local setup complete
2. → Read [API.md](./API.md) for endpoint documentation
3. → Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

---

**Questions?** Check logs, read error messages carefully, or ask team lead.
