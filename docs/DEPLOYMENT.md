# Deployment Guide

## Production Deployment

Guide for deploying COD MVP to AWS/production environment.

---

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups tested
- [ ] SSL certificates configured
- [ ] API rate limits set appropriately
- [ ] Monitoring + alerts configured
- [ ] Disaster recovery plan documented

---

## AWS Deployment (Recommended)

### Architecture

```
Internet Gateway
    ↓
ALB (Application Load Balancer)
    ↓
┌─────────────────────────────────────┐
│ EC2 Instance (or ECS Cluster)       │
├─────────────────────────────────────┤
│ Frontend (Next.js)                  │
│ Node.js Service (Auth + Payments)   │
│ FastAPI Service (Data + Insights)   │
└─────────────────────────────────────┘
    ↓
RDS PostgreSQL
RDS Redis (ElastiCache)
S3 (logs, reports)
```

### 1. Create AWS Resources

```bash
# RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier cod-mvp-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username coduser \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 20

# ElastiCache (Redis)
aws elasticache create-cache-cluster \
  --cache-cluster-id cod-mvp-cache \
  --cache-node-type cache.t3.micro \
  --engine redis

# S3 Bucket
aws s3 mb s3://cod-mvp-prod-logs
```

### 2. Deploy with Docker

```bash
# Build images
docker build -t cod-fastapi ./backend/fastapi-service
docker build -t cod-nodejs ./backend/node-service
docker build -t cod-frontend ./frontend

# Tag for ECR
docker tag cod-fastapi:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/cod-fastapi:latest
docker tag cod-nodejs:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/cod-nodejs:latest
docker tag cod-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/cod-frontend:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cod-fastapi:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cod-nodejs:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/cod-frontend:latest
```

### 3. Deploy to ECS/EC2

Create `ecs-task-definition.json`:

```json
{
  "family": "cod-mvp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "fastapi",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/cod-fastapi:latest",
      "portMappings": [{ "containerPort": 8000, "hostPort": 8000 }],
      "environment": [
        { "name": "ENVIRONMENT", "value": "production" }
      ]
    },
    {
      "name": "nodejs",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/cod-nodejs:latest",
      "portMappings": [{ "containerPort": 3001, "hostPort": 3001 }]
    },
    {
      "name": "frontend",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/cod-frontend:latest",
      "portMappings": [{ "containerPort": 3000, "hostPort": 3000 }]
    }
  ]
}
```

Register and run:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
aws ecs run-task --cluster cod-mvp-cluster --task-definition cod-mvp:1 --launch-type FARGATE
```

---

## Environment Variables (Production)

Create `prod.env`:

```bash
# Database
DATABASE_URL=postgresql://coduser:***@cod-mvp-db.xxxxx.us-east-1.rds.amazonaws.com/cod_mvp
REDIS_URL=redis://cod-mvp-cache.xxxxx.cache.amazonaws.com:6379

# Security
JWT_SECRET=<generate-with-openssl-rand-base64>
TRON_PRIVATE_KEY=<mainnet-key>
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Frontend
NEXT_PUBLIC_API_URL=https://api.cod-mvp.com

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
DATADOG_API_KEY=<key>

# Email (for alerts)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_USER=<ses-user>
SMTP_PASSWORD=<ses-password>

# Cloud Storage
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-1
```

---

## SSL/HTTPS Configuration

### Using CloudFront + ALB

1. **Request SSL certificate via AWS Certificate Manager**
2. **Attach to ALB**
3. **Configure CloudFront CDN**
4. **Add custom domain DNS**

```bash
# Point domain to CloudFront distribution
# Example using Route 53:
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123ABC \
  --change-batch file://route53-changes.json
```

---

## Database Backup & Recovery

### Automated Backups

```bash
# Enable RDS automated backups (AWS Console or CLI)
aws rds modify-db-instance \
  --db-instance-identifier cod-mvp-db \
  --backup-retention-period 30 \
  --apply-immediately
```

### Manual Backup

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier cod-mvp-db \
  --db-snapshot-identifier cod-mvp-backup-$(date +%Y-%m-%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier cod-mvp-db-restored \
  --db-snapshot-identifier cod-mvp-backup-2026-04-07
```

---

## Monitoring & Logging

### CloudWatch Alarms

```bash
# Create alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name ECS-HighCPU \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Application Logging

Send logs to CloudWatch:

```bash
# In docker-compose.prod.yml
logging:
  driver: awslogs
  options:
    awslogs-group: /ecs/cod-mvp
    awslogs-region: us-east-1
    awslogs-stream-prefix: ecs
```

### Error Tracking (Sentry)

```bash
# In .env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# FastAPI
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=0.1,
    environment="production"
)

# Node.js
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## Auto-Scaling

### ECS Autoscaling

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/cod-mvp-cluster/cod-mvp-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name cod-mvp-scale-policy \
  --service-namespace ecs \
  --resource-id service/cod-mvp-cluster/cod-mvp-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## Disaster Recovery

### Failover Plan

1. **Primary Region:** us-east-1
2. **Backup Region:** us-west-2 (standby)

Automate failover with Route 53 health checks:

```bash
aws route53 create-health-check \
  --health-check-config file://health-check-config.json
```

### Runbook (When Things Break)

1. **Check CloudWatch logs:** `aws logs tail /ecs/cod-mvp --follow`
2. **Verify DB:** `aws rds describe-db-instances`
3. **Restart service:** `aws ecs update-service --service cod-mvp-service --force-new-deployment`
4. **Check DNS:** `dig api.cod-mvp.com`

---

## Performance Optimization

### Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_portfolio_user_created ON portfolio_assets(user_id, created_at);

-- Run EXPLAIN ANALYZE on slow queries
EXPLAIN ANALYZE SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC;
```

### Caching Strategy

```
Frontend (Next.js)
    ↓ HTTP cache headers
CloudFront CDN
    ↓ Stale-while-revalidate
Node.js / FastAPI
    ↓ Redis cache
PostgreSQL
```

### Load Balancing

Configure ALB target groups:

```bash
aws elbv2 create-target-group \
  --name cod-mvp-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxx \
  --health-check-enabled \
  --health-check-path /health
```

---

## Post-Deployment Validation

- [ ] Frontend loads at https://cod-mvp.com
- [ ] API endpoints respond: `curl https://api.cod-mvp.com/health`
- [ ] Database connection works
- [ ] Payments can be created
- [ ] User signup/login flow works
- [ ] Trading journal accessible
- [ ] No 5xx errors in CloudWatch
- [ ] Response times < 200ms (P95)

---

## Rollback Plan

If deployment fails:

```bash
# Revert ECS task definition
aws ecs update-service \
  --service cod-mvp-service \
  --task-definition cod-mvp:previous-version

# Or restore database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier cod-mvp-db \
  --db-snapshot-identifier cod-mvp-backup-2026-04-07
```

---

**Deployment Complete!** 🚀

Next: Monitor logs and set up on-call rotation.
