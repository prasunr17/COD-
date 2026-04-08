# GitHub Secrets Configuration for CI/CD

This document describes all GitHub Secrets required for the CI/CD pipeline to function properly.

## Setup Instructions

1. Go to your GitHub repository: `https://github.com/prasunr17/COD-`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## Required Secrets

### Docker Registry & Deployment

**`GITHUB_TOKEN`**
- **Description:** Automatically provided by GitHub Actions
- **Value:** `${{ secrets.GITHUB_TOKEN }}`
- **Used for:** GitHub Container Registry authentication

### Staging Environment

**`STAGING_HOST`**
- **Description:** Hostname/IP of your staging server
- **Example:** `staging-app.example.com`
- **Used in:** Staging deployment job

**`STAGING_USER`**
- **Description:** SSH username for staging server
- **Example:** `deploy`
- **Used in:** Staging deployment job

**`STAGING_DEPLOY_KEY`**
- **Description:** Private SSH key for staging deployment (RSA or ED25519)
- **How to generate:**
  ```bash
  ssh-keygen -t ed25519 -f staging_deploy_key -C "cod-staging-deploy"
  cat staging_deploy_key  # Copy this as the secret value
  # Add staging_deploy_key.pub to your staging server's ~/.ssh/authorized_keys
  ```
- **Used in:** Staging deployment job

### Production Environment

**`PROD_HOST`**
- **Description:** Hostname/IP of your production server
- **Example:** `api.cod-mvp.app`
- **Used in:** Production deployment job

**`PROD_USER`**
- **Description:** SSH username for production server
- **Example:** `deploy`
- **Used in:** Production deployment job

**`PROD_DEPLOY_KEY`**
- **Description:** Private SSH key for production deployment
- **How to generate:**
  ```bash
  ssh-keygen -t ed25519 -f prod_deploy_key -C "cod-prod-deploy"
  cat prod_deploy_key  # Copy this as the secret value
  # Add prod_deploy_key.pub to your production server's ~/.ssh/authorized_keys
  ```
- **Used in:** Production deployment job

### API & Application Secrets

**`NEXT_PUBLIC_API_URL`**
- **Description:** Public API URL for frontend to call
- **Development:** `http://localhost:3001`
- **Production:** `https://api.cod-mvp.app`
- **Used in:** Frontend build process

**`JWT_SECRET`**
- **Description:** Secret key for JWT token signing (min 32 characters)
- **How to generate:**
  ```bash
  openssl rand -base64 32
  ```
- **Required length:** Minimum 32 characters
- **Used in:** Node.js authentication service

**`DATABASE_PASSWORD`**
- **Description:** PostgreSQL password
- **How to generate:**
  ```bash
  openssl rand -base64 24
  ```
- **Used in:** Database services

**`REDIS_PASSWORD`**
- **Description:** Redis authentication password
- **How to generate:**
  ```bash
  openssl rand -base64 24
  ```
- **Used in:** Redis cache service

### Monitoring & Notifications

**`SLACK_WEBHOOK`**
- **Description:** Slack webhook URL for deployment notifications
- **How to get:**
  1. Go to your Slack workspace
  2. Navigate to **Apps** → **Search for "Incoming Webhooks"**
  3. Click **Add Configuration**
  4. Select a channel
  5. Copy the webhook URL
- **Used in:** Deployment notifications

**`SENTRY_DSN`**
- **Description:** Sentry project DSN for error tracking (Optional)
- **How to get:**
  1. Create account at sentry.io
  2. Create a project
  3. Copy the DSN from project settings
- **Format:** `https://<key>@sentry.io/<project-id>`
- **Used in:** Error tracking in services

### External APIs (Optional)

**`COINGECKO_API_KEY`**
- **Description:** CoinGecko API key for market data
- **Free tier:** No key required
- **Used in:** FastAPI insights service

**`TRON_PRIVATE_KEY`**
- **Description:** Tron network private key for payments
- **Used in:** Node.js payments service

**`TRON_RPC_URL`**
- **Description:** Tron RPC endpoint
- **Example:** `https://api.trongrid.io`
- **Used in:** Payment detection service

---

## Environment Variables Setup

Create a `.env.production` file on your production server:

```bash
# Database
DB_USER=cod_user
DB_PASSWORD=<value from GITHUB_SECRET>
DB_NAME=cod_mvp

# Redis
REDIS_PASSWORD=<value from GITHUB_SECRET>

# JWT
JWT_SECRET=<value from GITHUB_SECRET>

# CORS
CORS_ORIGINS=https://cod-mvp.app,https://api.cod-mvp.app

# API URLs
NEXT_PUBLIC_API_URL=https://api.cod-mvp.app
FRONTEND_URL=https://cod-mvp.app

# Blockchain
TRON_PRIVATE_KEY=<value from GITHUB_SECRET>
TRON_RPC_URL=https://api.trongrid.io

# Monitoring
SENTRY_DSN=<value from GITHUB_SECRET>

# Registry
REGISTRY=ghcr.io
DOCKER_TAG=latest
```

---

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Update `JWT_SECRET`, `DATABASE_PASSWORD`, and `REDIS_PASSWORD` every 3-6 months
   - Create new SSH keys annually

2. **Use Strong Passwords**
   - Min 32 characters for JWT_SECRET and passwords
   - Use `openssl rand -base64 32` for generation

3. **Limit Secret Access**
   - Only expose secrets to necessary GitHub Actions jobs
   - Use GitHub's environment protection rules for production

4. **Monitor Secret Usage**
   - Review GitHub Actions logs for secret exposure
   - Set up Slack alerts for deployment failures

5. **Backup Deploy Keys**
   - Store SSH keys in a secure vault (1Password, LastPass, etc.)
   - Never commit private keys to Git

---

## Verifying Secrets Are Set

Run this in your local terminal to validate secrets (requires GitHub CLI):

```bash
gh secret list -R prasunr17/COD-
```

Expected output should include:
```
SLACK_WEBHOOK                Set
STAGING_DEPLOY_KEY           Set
STAGING_HOST                 Set
STAGING_USER                 Set
PROD_DEPLOY_KEY              Set
PROD_HOST                    Set
PROD_USER                    Set
GITHUB_TOKEN                 Set
```

---

## Troubleshooting

### Deployment fails with "Permission denied"
- Verify SSH key is in production server's `~/.ssh/authorized_keys`
- Check SSH key permissions: `chmod 600 ~/.ssh/authorized_keys`

### Docker push fails
- Verify `GITHUB_TOKEN` is valid (only set by GitHub, don't override)
- Check repository visibility (must be public or private with access)

### Slack notifications not working
- Verify webhook URL is correct
- Test webhook with: `curl -X POST $SLACK_WEBHOOK -d '{"text":"test"}'`

### Database connection fails in CI
- Verify `DATABASE_PASSWORD` matches test fixtures
- Check PostgreSQL service health in GitHub Actions logs

---

## Reference

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
