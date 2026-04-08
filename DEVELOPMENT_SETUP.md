# 🚀 COD MVP — Local Development Setup

**Last Updated:** April 8, 2026  
**Status:** Environment Ready for Phase 2 Development

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Docker Desktop** (or Docker + Docker Compose)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Verify: `docker --version` && `docker-compose --version`

- **Node.js 18+** (for frontend dev)
  - [Download Node.js](https://nodejs.org/)
  - Verify: `node --version`

- **Python 3.11+** (for FastAPI dev)
  - [Download Python](https://www.python.org/)
  - Verify: `python --version`

- **Git**
  - Verify: `git --version`

---

## 🔧 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/prasunr17/COD-.git
cd cod-mvp
```

### 2. Set Environment Variables

```bash
# Copy from template
cp .env.example .env

# Edit .env with your config (defaults work for local dev)
# On Windows:
notepad .env
# On Mac/Linux:
nano .env
```

### 3. Start Services with Docker

```bash
# Start all services (PostgreSQL, Redis, FastAPI, Node.js)
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Verify Services Are Running

```bash
# Node.js service (Auth + Payments)
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"COD MVP - Node.js","version":"0.1.0",...}

# FastAPI service (Insights + Trades + Portfolio)
curl http://localhost:8000/docs
# Expected: Swagger UI at http://localhost:8000/docs

# PostgreSQL
psql -h localhost -U cod_user -d cod_mvp
# Password: secure_password

# Redis
redis-cli ping
# Expected: PONG
```

---

## 🏗️ Project Structure

```
cod-mvp/
├── backend/
│   ├── fastapi-service/           # AI Insights + Trading Journal
│   │   ├── app/
│   │   │   ├── main.py            # FastAPI app entry
│   │   │   ├── api/
│   │   │   │   ├── insights.py    # GET /insights/*
│   │   │   │   ├── trades.py      # POST/GET /trades/*
│   │   │   │   ├── portfolio.py   # GET /portfolio/*
│   │   │   ├── models/            # Pydantic models
│   │   │   ├── services/          # Business logic
│   │   │   └── utils/             # Helpers
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── tests/
│   │
│   ├── node-service/              # Auth + Payments
│   │   ├── src/
│   │   │   ├── index.ts           # Express app entry
│   │   │   ├── auth/
│   │   │   │   └── routes.ts      # POST /auth/register, login, logout
│   │   │   ├── payments/
│   │   │   │   └── routes.ts      # POST /payments/create, GET /payments/:id
│   │   │   ├── services/
│   │   │   │   └── userService.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts        # JWT validation
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── rateLimiter.ts
│   │   │   └── db/
│   │   │       └── connection.ts
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── tests/
│   │
│   └── docker-compose.yml         # Orchestrate all services
│
├── frontend/                      # Next.js 15 + TailwindCSS
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/             # /dashboard/* pages
│   │   ├── auth/                  # /auth/* pages
│   │   └── learn/                 # /learn/* pages
│   ├── components/                # Reusable components
│   ├── lib/
│   │   ├── api-client.ts          # Axios instance + interceptors
│   │   └── auth-store.ts          # Auth context (Zustand)
│   ├── package.json
│   └── Dockerfile
│
├── migrations/
│   └── versions/                  # Alembic migration files
│
├── docs/
│   ├── API.md                     # API endpoint documentation
│   ├── SETUP.md                   # Deployment setup
│   └── DEPLOYMENT.md              # Production deployment
│
├── init.sql                       # PostgreSQL schema
├── docker-compose.yml             # Development environment
│
├── .env.example                   # Environment template
├── .env                          # Local env vars (git-ignored)
├── .gitignore
├── README.md
└── DEVELOPMENT_SETUP.md          # This file
```

---

## 🛠️ Development Workflows

### Backend Development (Node.js Service)

**Install Dependencies:**
```bash
cd backend/node-service
npm install
```

**Run in Dev Mode (Hot Reload):**
```bash
npm run dev
# Service runs on http://localhost:3001
```

**Build for Production:**
```bash
npm run build
npm start
```

**Run Tests:**
```bash
npm test
npm run test:watch
```

**Lint & Format:**
```bash
npm run lint
npm run format
```

---

### Backend Development (FastAPI Service)

**Create Virtual Environment:**
```bash
cd backend/fastapi-service
python -m venv venv

# Activate on Windows:
venv\Scripts\activate
# Activate on Mac/Linux:
source venv/bin/activate
```

**Install Requirements:**
```bash
pip install -r requirements.txt
```

**Run Development Server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Service runs on http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

**Run Tests:**
```bash
pytest -v
pytest --cov=app tests/
```

---

### Frontend Development (Next.js)

**Install Dependencies:**
```bash
cd frontend
npm install
```

**Run Development Server:**
```bash
npm run dev
# App runs on http://localhost:3000
```

**Build for Production:**
```bash
npm run build
npm start
```

**Run Tests:**
```bash
npm test
npm run test:watch
```

---

## 🗄️ Database Management

### Connect to PostgreSQL

```bash
# From docker container:
docker-compose exec postgres psql -U cod_user -d cod_mvp

# From local machine (if psql installed):
psql -h localhost -U cod_user -d cod_mvp
# Password: secure_password
```

### View Database Schema

```bash
\dt                    # List all tables
\d users               # Describe users table
\d portfolio_assets    # Describe portfolio_assets table
```

### Create Database Backup

```bash
docker-compose exec postgres pg_dump -U cod_user -d cod_mvp > backup.sql
```

### Restore from Backup

```bash
psql -h localhost -U cod_user -d cod_mvp < backup.sql
```

### Run Migrations (Alembic)

```bash
cd backend/fastapi-service

# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Downgrade
alembic downgrade -1
```

---

## 📡 API Endpoints (Phase 2)

### Authentication (Node.js - Port 3001)

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Response includes JWT token for subsequent requests

# Refresh Token
curl -X POST http://localhost:3001/auth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Protected route example
curl -X GET http://localhost:3001/api/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Insights (FastAPI - Port 8000)

```bash
# Get all assets
curl http://localhost:8000/api/v1/insights/assets

# Get specific asset
curl http://localhost:8000/api/v1/insights/BTC

# Get sentiment data
curl http://localhost:8000/api/v1/insights/sentiment
```

### Trades (FastAPI - Port 8000)

```bash
# Add trade
curl -X POST http://localhost:8000/api/v1/trades/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"symbol":"BTC","entry":45000,"exit":48000,"quantity":0.1,"notes":"Bull breakout"}'

# Get trades
curl http://localhost:8000/api/v1/trades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get trade stats
curl http://localhost:8000/api/v1/trades/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Portfolio (FastAPI - Port 8000)

```bash
# Get portfolio
curl http://localhost:8000/api/v1/portfolio \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add asset
curl -X POST http://localhost:8000/api/v1/portfolio/add-asset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"symbol":"BTC","quantity":1.5,"avg_cost":45000,"tags":"long-term"}'
```

---

## 🧪 Testing

### Unit Tests

```bash
# Node.js
cd backend/node-service
npm test

# FastAPI
cd backend/fastapi-service
pytest -v
```

### Integration Tests

```bash
# Tests auth flow, database, and API responses
cd backend/node-service
npm run test:integration
```

### E2E Tests

```bash
# Full user flows (signup → login → create trade → view portfolio)
cd frontend
npm run test:e2e
```

---

## 🐛 Debugging

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f fastapi
docker-compose logs -f node-service
docker-compose logs -f postgres
```

### SSH into Container

```bash
# Access node service shell
docker-compose exec node-service /bin/bash

# Access fastapi service shell
docker-compose exec fastapi /bin/bash

# Access postgres shell
docker-compose exec postgres /bin/bash
```

### Debug Mode

For **Node.js**, add breakpoints in VS Code:
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/backend/node-service/dist/index.js",
  "restart": true,
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

For **FastAPI**, use the built-in Swagger UI:
- Navigate to http://localhost:8000/docs
- Test endpoints directly in the browser

---

## 🔐 Security Checklist

- [ ] Create strong `JWT_SECRET` (min 32 chars) in `.env`
- [ ] Never commit `.env` to git (already in `.gitignore`)
- [ ] Use HTTPS in production (currently localhost for development)
- [ ] Change default database password before production deployment
- [ ] Enable rate limiting (already configured: 100 req/min per user)
- [ ] Add CORS validation (whitelist frontend domains)
- [ ] Hash passwords with bcrypt (already implemented)
- [ ] Validate all inputs (express-validator + Pydantic)

---

## 📊 Monitoring & Observability

### Docker Resource Usage

```bash
docker stats
```

### Database Query Performance

```bash
# In PostgreSQL:
EXPLAIN ANALYZE SELECT * FROM portfolio_assets WHERE user_id='...';
```

### Redis Cache Stats

```bash
redis-cli INFO stats
```

### API Performance Metrics

Via **Swagger UI** at:
- FastAPI: http://localhost:8000/docs
- Node.js: http://localhost:3001/swagger (if added)

---

## 📚 Useful Commands

```bash
# Clean up all containers, volumes, networks
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Run a one-off command in a container
docker-compose run fastapi pip list

# Copy file from container
docker cp cod-fastapi:/app/logs.txt ./logs.txt

# Export data from PostgreSQL
docker-compose exec postgres pg_dump -U cod_user -d cod_mvp -F c > backup.dump
```

---

## 🚨 Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
netstat -an | grep LISTEN  # Windows
lsof -i -P -n | grep LISTEN  # Mac/Linux

# Kill process on port
lsof -i :3001  # Find process
kill -9 <PID>
```

### Database Connection Errors

```bash
# Verify postgres is running
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# Check connection string
echo $DATABASE_URL
```

### Redis Connection Issues

```bash
# Verify redis is running
docker-compose logs redis

# Test connection
redis-cli ping
```

### Frontend Can't Reach Backend

```bash
# Check CORS_ORIGINS in .env
grep CORS_ORIGINS .env

# Test connectivity from frontend container
curl http://node-service:3001/health
```

---

## 📞 Support & Resources

- **GitHub Issues:** https://github.com/prasunr17/COD-/issues
- **API Documentation:** `http://localhost:8000/docs` (FastAPI Swagger)
- **Database Schema:** See [init.sql](./init.sql)
- **Execution Plan:** See [COD_MVP_EXECUTION_PLAN.md](../COD_MVP_EXECUTION_PLAN.md)

---

## ✅ Next Steps

1. **Set up local environment** (this guide)
2. **Run `docker-compose up -d`** to start services
3. **Verify endpoints** with curl commands above
4. **Start development** on Phase 2 APIs
5. **Run tests** before committing

---

**Happy coding! 🚀**
