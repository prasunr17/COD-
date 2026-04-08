# 🚀 CI/CD Quick-Start Setup

**Time Required:** 15-30 minutes  
**Difficulty:** Intermediate

Complete these steps to activate the CI/CD pipeline.

---

## ✅ Step 1: Review Existing Configuration

The pipeline is pre-configured in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) and ready to use.

**Current Setup:**
- ✅ 12 automated jobs
- ✅ Test stages
- ✅ Docker builds
- ✅ Deployment scripts
- ⏳ **Missing:** GitHub Secrets (configure below)

---

## 🔐 Step 2: Set Up GitHub Secrets

### Option A: Via GitHub Web UI (Recommended)

1. Go to: https://github.com/prasunr17/COD-/settings/secrets/actions
2. Click **New repository secret**
3. Add each secret below:

**Required Secrets (Copy-Paste)**

```
SLACK_WEBHOOK
Value: [Get from Slack] https://api.slack.com/apps

JWT_SECRET
Value: openssl rand -base64 32

DATABASE_PASSWORD
Value: openssl rand -base64 24

REDIS_PASSWORD
Value: openssl rand -base64 24

NEXT_PUBLIC_API_URL
Value: http://localhost:3001 (dev) or https://api.cod-mvp.app (prod)
```

**Staging Secrets (Optional)**

```
STAGING_HOST
Value: staging-ip-or-hostname

STAGING_USER
Value: deploy (or your SSH user)

STAGING_DEPLOY_KEY
Value: [Your SSH private key - see Step 3]
```

**Production Secrets (Required for deployments)**

```
PROD_HOST
Value: prod-ip-or-hostname

PROD_USER
Value: deploy

PROD_DEPLOY_KEY
Value: [Your SSH private key - see Step 3]
```

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI: https://cli.github.com
gh auth login

# Set secrets
gh secret set SLACK_WEBHOOK --body "$(cat slack-webhook.txt)"
gh secret set JWT_SECRET --body "$(openssl rand -base64 32)"
gh secret set DATABASE_PASSWORD --body "$(openssl rand -base64 24)"
gh secret set REDIS_PASSWORD --body "$(openssl rand -base64 24)"
gh secret set NEXT_PUBLIC_API_URL --body "http://localhost:3001"

# Verify
gh secret list
```

---

## 🔑 Step 3: Set Up SSH Deployment Keys

**For Staging & Production Deployments**

### Generate SSH Key Pair

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -f prod_deploy -C "cod-prod-deploy"
ssh-keygen -t ed25519 -f staging_deploy -C "cod-staging-deploy"

# List files created
ls -la prod_deploy prod_deploy.pub
```

### Add GitHub Secret

Copy the **private key** to GitHub:

```bash
# Copy private key
cat prod_deploy | pbcopy  # macOS
xclip -i < prod_deploy   # Linux
type prod_deploy         # Windows (output to GitHub)

# Add as secret in GitHub UI:
# Settings → Secrets → New Repository Secret
# Name: PROD_DEPLOY_KEY
# Value: [paste private key contents]
```

### Configure Server (Production/Staging)

SSH into your production server and add the **public key**:

```bash
# On production server
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Append public key
cat prod_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Verify connectivity
ssh -i prod_deploy deploy@prod-server-ip "echo 'SSH works!'"
```

---

## 📚 Step 4: Configure Slack Notifications

### Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Click **Create New App** → **From scratch**
3. Name: "COD MVP Deployments"
4. Select your workspace
5. Go to **Incoming Webhooks**
6. Click **Add New Webhook to Workspace**
7. Select a channel (e.g., #deployments)
8. Copy the Webhook URL
9. Add to GitHub Secrets as `SLACK_WEBHOOK`

---

## 🧪 Step 5: Test the Pipeline

### Trigger Pipeline with a PR

```bash
# Create feature branch
git checkout -b test/cicd-pipeline

# Make a dummy change
echo "# CI/CD Test" >> README.md

# Commit and push
git add .
git commit -m "Test: Trigger CI/CD pipeline"
git push origin test/cicd-pipeline

# Go to: https://github.com/prasunr17/COD-/pulls
# Open your PR and watch Actions tab
```

**Expected Flow:**
1. ✅ Lint checks (2 min)
2. ✅ Security scans (3 min)
3. ✅ Backend tests (5 min)
4. ✅ Frontend tests (4 min)
5. ⏸️ Docker build (blocked until merge)

### Monitor Pipeline Execution

```bash
# View workflows
gh run list

# Watch specific run
gh run view <run-id> --log

# Or view in browser:
# https://github.com/prasunr17/COD-/actions
```

---

## 🌿 Step 6: Configure Branch Protection

**Protect `main` branch from accidental pushes:**

1. Go to: https://github.com/prasunr17/COD-/settings/branches
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

---

## 🚀 Step 7: Set Up Production Deployment Approval

**Add manual approval step for production:**

1. Go to: https://github.com/prasunr17/COD-/settings/environments
2. Click **New environment**
3. Name: `production`
4. Enable: **Required reviewers**
   - Add your team members who can approve deployments
5. Click **Create environment**

---

## 📋 Step 8: Configure Environment Variables

### Create `.env.production` on Your Server

SSH to your production server:

```bash
cd /app
cat > .env.production << 'EOF'
# Database
DB_USER=cod_user
DB_PASSWORD=<PASSWORD_FROM_GITHUB_SECRET>
DB_NAME=cod_mvp

# Redis
REDIS_PASSWORD=<PASSWORD_FROM_GITHUB_SECRET>

# JWT
JWT_SECRET=<JWT_FROM_GITHUB_SECRET>

# API
NEXT_PUBLIC_API_URL=https://api.cod-mvp.app
CORS_ORIGINS=https://cod-mvp.app,https://api.cod-mvp.app

# Blockchain (if using)
TRON_PRIVATE_KEY=<from GitHub Secret>
TRON_RPC_URL=https://api.trongrid.io

# Monitoring
SENTRY_DSN=<optional>

# Docker
REGISTRY=ghcr.io
IMAGE_NAME=prasunr17/COD-
EOF

chmod 600 .env.production
```

---

## 🔍 Step 9: Verify Everything

### Checklist

- [ ] All GitHub Secrets are set (`gh secret list`)
- [ ] SSH keys configured on staging/prod servers
- [ ] Slack webhook tested
- [ ] Test PR passed all checks
- [ ] `.env.production` created on server
- [ ] Branch protection enabled on `main`
- [ ] Production approval environment created

### Test Commands

```bash
# Verify secrets
gh secret list -R prasunr17/COD-

# Check SSH connectivity
ssh -i prod_deploy deploy@$PROD_HOST "hostname"

# Validate workflow syntax
gh workflow view .github/workflows/ci.yml

# Test Slack webhook
curl -X POST $SLACK_WEBHOOK -d '{"text":"CI/CD pipeline is ready ✅"}'
```

---

## 🎯 Usage Examples

### Example 1: Trigger Staging Deployment

```bash
git checkout develop
git pull origin develop

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to staging branch
git push origin HEAD:staging

# Monitor in Actions tab
# Pipeline runs:
# 1. Tests
# 2. Docker build
# 3. Deploy to staging (automatic)
```

### Example 2: Trigger Production Deployment

```bash
# Create PR from main
git checkout main
git pull origin main

# Everything happens automatically:
# 1. Run all tests on merge
# 2. Build Docker images
# 3. Wait for approval
# 4. Deploy to production
# 5. Run health checks
# 6. Send Slack notification
```

### Example 3: Emergency Hotfix

```bash
git checkout -b hotfix/critical-bug

# Fix the bug
git add .
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug

# Create PR to main
# Get approvals
# Merge
# Deployment triggers automatically
```

---

## 🐛 Troubleshooting

### Pipeline stuck in "In Progress"

```bash
# Cancel the run
gh run cancel <run-id>

# View logs for errors
gh run view <run-id> --log | tail -100
```

### Secret not recognized

```bash
# Verify secret exists
gh secret list | grep JWT_SECRET

# Recreate if needed
gh secret delete JWT_SECRET
gh secret set JWT_SECRET --body "$(openssl rand -base64 32)"
```

### Deployment fails on SSH

```bash
# Test connectivity manually
ssh -i prod_deploy -v deploy@$PROD_HOST

# Check key permissions
chmod 600 ~/.ssh/authorized_keys
```

### Docker build fails

```bash
# Test build locally
docker build -t cod-fastapi:test ./backend/fastapi-service

# Check Dockerfile
cat backend/fastapi-service/Dockerfile
```

---

## 📖 Reference Documentation

- [CI/CD Pipeline Overview](./CI_CD_PIPELINE.md) — Full documentation
- [GitHub Secrets Reference](./GITHUB_SECRETS.md) — All secrets explained
- [Deployment Script Details](./deploy.sh) — Automated deployment steps
- [Development Setup](./DEVELOPMENT_SETUP.md) — Local dev environment

---

## ✨ Next Steps

1. ✅ Complete this setup guide
2. ✅ Test with a feature PR
3. ✅ Deploy to staging
4. ✅ Deploy to production
5. ✅ Monitor and celebrate! 🎉

---

**Questions?** Check the [troubleshooting section](#-troubleshooting) above.

**Push the following files for CI/CD to work:**
- ✅ `.github/workflows/ci.yml`
- ✅ `deploy.sh`
- ✅ `docker-compose.prod.yml`
- ✅ `nginx.conf`

All files are already in the repository. You just need to set the GitHub Secrets!
