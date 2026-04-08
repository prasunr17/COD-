# 🚀 CI/CD Pipeline Documentation

**Last Updated:** April 8, 2026  
**Version:** 1.0  
**Status:** Production Ready

---

## 📋 Overview

The COD MVP project uses **GitHub Actions** for continuous integration and continuous deployment. The pipeline automates testing, security checks, Docker builds, and production deployments.

**Pipeline Flow:**
```
Code Push
    ↓
├─→ Lint & Code Quality
├─→ Security & Dependency Checks
├─→ Backend Tests (FastAPI + Node.js)
├─→ Frontend Tests
    ↓
├─→ Docker Build & Push (main/staging only)
├─→ Integration Tests (PRs only)
    ↓
├─→ Deploy to Staging (staging branch)
│
├─→ Deploy to Production (main branch)
└─→ Health Checks & Notifications
```

---

## 🔄 Pipeline Jobs

### 1. **Lint & Code Quality** (`lint`)
Runs on: Every push and PR

**Tasks:**
- ESLint for Next.js frontend
- ESLint for Node.js backend
- Black/Flake8 for Python
- Continues on error (non-blocking)

**Failure Impact:** ⚠️ Warning only

---

### 2. **Security & Dependency Checks** (`security`)
Runs on: Every push and PR

**Tasks:**
- npm dependency checks
- Python safety scans
- OWASP dependency check
- Continues on error (informational)

**Failure Impact:** ⚠️ Warning only

---

### 3. **Backend Tests** (`backend-tests`)
Runs on: Every push and PR  
**Services:** PostgreSQL 16 + Redis 7

**FastAPI Tests:**
- Pytest with coverage (70% minimum)
- Test database: `cod_mvp_test`
- Coverage uploaded to Codecov

**Node.js Tests:**
- Jest/Mocha test suite
- Coverage reporting
- Environment: `test`

**Failure Impact:** 🔴 **BLOCKS** Docker build

---

### 4. **Frontend Tests** (`frontend-tests`)
Runs on: Every push and PR

**Tasks:**
- ESLint
- Jest/Vitest tests (skip if empty)
- Production build validation
- Next.js compilation

**Failure Impact:** 🔴 **BLOCKS** Docker build

---

### 5. **Docker Build & Push** (`docker-build`)
Runs on: Push to `main` or `staging` branches

**Builds:**
- `ghcr.io/prasunr17/COD-/fastapi:latest`
- `ghcr.io/prasunr17/COD-/nodejs:latest`
- `ghcr.io/prasunr17/COD-/frontend:latest`

**Tags:**
- `latest`
- Git SHA (e.g., `main-abc123def`)
- Git tag (for releases)

**Registry:** GitHub Container Registry (GHCR)

**Failure Impact:** 🔴 **BLOCKS** deployment

---

### 6. **Integration Tests** (`integration-tests`)
Runs on: Pull requests only  
**Services:** PostgreSQL 16 + Redis 7 + Both services

**Tests:**
- Service startup validation
- API endpoint health checks
- Full user authentication flow
- Database migration validation

**Failure Impact:** ⚠️ Warning only

---

### 7. **Deploy to Staging** (`deploy-staging`)
Runs on: Push to `staging` branch

**Steps:**
1. SSH into staging server
2. Pull latest Docker images
3. Run database migrations
4. Stop old containers
5. Start new containers
6. Wait for health checks
7. Run smoke tests
8. Notify Slack

**Server Env Vars Needed:** `STAGING_HOST`, `STAGING_USER`, `STAGING_DEPLOY_KEY`

**Failure Impact:** 🔴 **Deployment fails** (rollback available)

---

### 8. **Deploy to Production** (`deploy-production`)
Runs on: Push to `main` branch  
**Requires:** Manual approval (GitHub environment)

**Steps:**
1. Create GitHub release
2. SSH into production server
3. Execute `./deploy.sh` script
4. Server runs migrations
5. Containers restart
6. Health checks (30 retries)
7. Smoke tests
8. Slack notification
9. Database backup created

**Server Env Vars Needed:** `PROD_HOST`, `PROD_USER`, `PROD_DEPLOY_KEY`

**Failure Impact:** 🔴 **Critical** (alerts sent, rollback manual)

---

## 🔐 Required GitHub Secrets

### Essential Secrets (Must Set)
```
✅ SLACK_WEBHOOK          - For deployment notifications
✅ JWT_SECRET             - auth service
✅ DATABASE_PASSWORD      - PostgreSQL
✅ REDIS_PASSWORD         - Redis cache
✅ NEXT_PUBLIC_API_URL    - Frontend API endpoint
```

### Staging Deployment
```
✅ STAGING_HOST           - Staging server IP/hostname
✅ STAGING_USER           - SSH username (e.g., deploy)
✅ STAGING_DEPLOY_KEY     - SSH private key
```

### Production Deployment
```
✅ PROD_HOST              - Production server IP/hostname
✅ PROD_USER              - SSH username (e.g., deploy)
✅ PROD_DEPLOY_KEY        - SSH private key
```

### Optional Secrets
```
⚪ SENTRY_DSN             - Error tracking
⚪ COINGECKO_API_KEY      - Market data
⚪ TRON_PRIVATE_KEY       - Blockchain payments
⚪ TRON_RPC_URL           - Tron network
```

👉 [Setup guide: GITHUB_SECRETS.md](./GITHUB_SECRETS.md)

---

## 🌳 Branch Strategy

| Branch | Trigger | Deploy | Requirements |
|--------|---------|--------|--------------|
| `main` | PR + Merge | Production | All tests pass |
| `staging` | Push | Staging | All tests pass |
| `develop` | PR | None | None |
| Feature | PR | None | None |

**Recommended Workflow:**
```
feature/my-feature → develop → PR to staging → Deploy to staging
                                    ↓
                  Review + Test → PR to main → Deploy to production
```

---

## 📊 Test Coverage Requirements

| Service | Minimum Coverage |
|---------|------------------|
| FastAPI | 70% |
| Node.js | 60% |
| Frontend | 50% |

Coverage reports uploaded to **Codecov** and visible in PR checks.

---

## 🔔 Slack Notifications

Pipeline sends notifications to Slack for:
✅ Successful production deployments
✅ Failed deployments (with logs)
✅ Security alerts
✅ Coverage changes

**Setup:**
1. Create Slack workspace webhook
2. Add `SLACK_WEBHOOK` secret
3. Notifications sent automatically

---

## 🚨 Failure Handling

### Auto-Rollback on Deployment Failure
```bash
# Production deployment fails
# → Backups stored in /app/backups/backup-<timestamp>-data
# → Manual rollback required:

ssh $PROD_USER@$PROD_HOST
cd /app/backups/backup-<timestamp>-data
docker-compose -f docker-compose.prod.yml down
# Restore data and restart
```

### Manual Workflow Trigger
```bash
# Force re-run from GitHub UI:
# Actions → CI/CD Pipeline → Run workflow → Select branch
```

### Skip CI for Hotfixes
```bash
git commit -m "Fix critical bug [skip ci]"  # Skips all checks
git push
```

---

## 🏥 Health Checks

### Deployment Health Checks
- **Frontend:** HTTP 200 on `/`
- **Node.js:** HTTP 200 on `/health`
- **FastAPI:** HTTP 200 on `/docs`
- **Database:** `pg_isready -U cod_user`
- **Redis:** `redis-cli ping` → `PONG`

### Monitoring (Post-Deployment)
```bash
# SSH into production
curl https://cod-mvp.app                 # Frontend
curl https://api.cod-mvp.app/health      # Node.js
curl https://fastapi.cod-mvp.app/docs    # FastAPI
```

---

## 📈 Performance Metrics

| Task | Typical Time |
|------|-------------|
| Lint | 2 min |
| Security Scan | 3 min |
| Backend Tests | 5 min |
| Frontend Tests | 4 min |
| Docker Build | 8 min |
| Staging Deploy | 5 min |
| Integration Tests | 4 min |
| **Total (PR)** | **~15-20 min** |
| Production Deploy | 10 min |

---

## 🔍 Debugging Failed Builds

### Check Logs
```bash
# GitHub UI: Actions → [Workflow] → [Job] → Logs
# Or use GitHub CLI:
gh run view <run-id> --log
```

### Common Issues

**1. Test Failure**
```bash
# Reproduce locally:
cd backend/fastapi-service
pytest tests/ --cov=app  # Should match CI output
```

**2. Docker Build Fails**
```bash
# Test build locally:
docker build -t cod-fastapi:test ./backend/fastapi-service
docker run cod-fastapi:test python -m pytest
```

**3. Deployment Permission Denied**
```bash
# Verify SSH key:
ssh -i ~/.ssh/prod_deploy -v deploy@$PROD_HOST
# Should see "Authentication succeeded"
```

**4. Database Migration Fails**
```bash
# Check migration status:
ssh deploy@$PROD_HOST
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U cod_user -d cod_mvp -c "SELECT * FROM alembic_version;"
```

---

## 🔧 Configuration Files

### GitHub Actions Workflow
📄 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- 12 jobs executing in parallel
- Conditional deployments
- Slack notifications

### Deployment Scripts
📄 [`deploy.sh`](./deploy.sh)
- Backup & restore logic
- Health check loops
- Smoke tests

### Docker Compose (Production)
📄 [`docker-compose.prod.yml`](./docker-compose.prod.yml)
- SSL/TLS configuration
- Nginx reverse proxy
- Resource limits
- Logging configuration

### Reverse Proxy
📄 [`nginx.conf`](./nginx.conf)
- SSL termination
- Rate limiting
- Security headers
- Gzip compression

### Secrets Documentation
📄 [`GITHUB_SECRETS.md`](./GITHUB_SECRETS.md)
- Complete secret reference
- Security best practices
- Troubleshooting guide

---

## 📱 Local Testing

### Simulate CI Locally with act
```bash
# Install act: https://github.com/nektos/act
act -j backend-tests -s GITHUB_TOKEN=<your-token>

# Run specific job
act -l  # List all jobs
act -j lint
```

### Test Docker Build Locally
```bash
# Build images same as CI does
docker build -t cod-fastapi:test ./backend/fastapi-service
docker build -t cod-nodejs:test ./backend/node-service
docker build -t cod-frontend:test ./frontend

# Test with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 👥 Team Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Developer** | Keep tests passing, run lint before push |
| **DevOps** | Manage secrets, troubleshoot deployments |
| **QA** | Review integration tests, validate staging |
| **Product** | Approve production deployments |

---

## 📚 References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/)
- [Nginx Security](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [PostgreSQL Backups](https://www.postgresql.org/docs/current/backup.html)

---

## 🎯 Next Steps

1. ✅ Set up all GitHub Secrets (see [`GITHUB_SECRETS.md`](./GITHUB_SECRETS.md))
2. ✅ Configure staging & production servers
3. ✅ Test pipeline with PR
4. ✅ Monitor first production deployment
5. ✅ Set up Slack notifications
6. ✅ Document any custom procedures

---

**Questions?** Check the [troubleshooting section](#-debugging-failed-builds) or open a GitHub issue.
