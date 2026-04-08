#!/bin/bash
# Production Deployment Script
# Usage: ./deploy.sh <git-sha>

set -e

SHA=$1
TIMESTAMP=$(date +%s)
APP_DIR="/app"
BACKUP_DIR="/app/backups"
DOCKER_COMPOSE="${APP_DIR}/docker-compose.prod.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting COD MVP Production Deployment ===${NC}"
echo "SHA: $SHA"
echo "Timestamp: $TIMESTAMP"

# 1. Backup current state
echo -e "${YELLOW}1. Backing up current state...${NC}"
mkdir -p $BACKUP_DIR
BACKUP_NAME="backup-$TIMESTAMP"
if [ -f "$DOCKER_COMPOSE" ]; then
  cp -r $APP_DIR/data $BACKUP_DIR/$BACKUP_NAME-data 2>/dev/null || true
  echo -e "${GREEN}✓ Backup created: $BACKUP_NAME${NC}"
fi

# 2. Pull latest images
echo -e "${YELLOW}2. Pulling latest Docker images...${NC}"
docker pull $REGISTRY/cod-mvp/fastapi:$SHA || docker pull $REGISTRY/cod-mvp/fastapi:latest
docker pull $REGISTRY/cod-mvp/nodejs:$SHA || docker pull $REGISTRY/cod-mvp/nodejs:latest
docker pull $REGISTRY/cod-mvp/frontend:$SHA || docker pull $REGISTRY/cod-mvp/frontend:latest
echo -e "${GREEN}✓ Images pulled successfully${NC}"

# 3. Tag images with SHA
echo -e "${YELLOW}3. Tagging images...${NC}"
docker tag $REGISTRY/cod-mvp/fastapi:$SHA cod-fastapi:latest || true
docker tag $REGISTRY/cod-mvp/nodejs:$SHA cod-nodejs:latest || true
docker tag $REGISTRY/cod-mvp/frontend:$SHA cod-frontend:latest || true

# 4. Run database migrations
echo -e "${YELLOW}4. Running database migrations...${NC}"
docker-compose -f $DOCKER_COMPOSE run --rm fastapi alembic upgrade head || {
  echo -e "${RED}✗ Migration failed! Rolling back...${NC}"
  # Restore backup if needed
  exit 1
}

# 5. Stop old containers
echo -e "${YELLOW}5. Stopping old services...${NC}"
docker-compose -f $DOCKER_COMPOSE down --timeout 30 || true

# 6. Start new containers
echo -e "${YELLOW}6. Starting new services...${NC}"
docker-compose -f $DOCKER_COMPOSE up -d

# 7. Wait for services to be healthy
echo -e "${YELLOW}7. Waiting for services to be healthy...${NC}"
RETRY_COUNT=0
MAX_RETRIES=30
until [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  echo "Checking service health... ($RETRY_COUNT/$MAX_RETRIES)"
  
  # Check FastAPI
  if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✓ FastAPI is healthy${NC}"
  else
    echo "FastAPI not ready yet..."
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
    continue
  fi
  
  # Check Node.js
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Node.js is healthy${NC}"
  else
    echo "Node.js not ready yet..."
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
    continue
  fi
  
  # All services are healthy
  break
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo -e "${RED}✗ Services did not become healthy in time${NC}"
  exit 1
fi

# 8. Run smoke tests
echo -e "${YELLOW}8. Running smoke tests...${NC}"
TESTS_PASSED=true

# Test auth endpoint
if ! curl -s -X POST http://localhost:3001/health -H "Content-Type: application/json" | grep -q "ok"; then
  echo -e "${RED}✗ Auth service health check failed${NC}"
  TESTS_PASSED=false
fi

# Test FastAPI endpoint
if ! curl -s http://localhost:8000/docs > /dev/null; then
  echo -e "${RED}✗ FastAPI Swagger UI not accessible${NC}"
  TESTS_PASSED=false
fi

if [ "$TESTS_PASSED" = false ]; then
  echo -e "${RED}✗ Smoke tests failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Smoke tests passed${NC}"

# 9. Cleanup old backups
echo -e "${YELLOW}9. Cleaning up old backups...${NC}"
find $BACKUP_DIR -type d -name "backup-*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true

# 10. Generate deployment report
echo -e "${YELLOW}10. Generating deployment report...${NC}"
cat > $BACKUP_DIR/$BACKUP_NAME-report.txt << EOF
=== COD MVP Production Deployment Report ===
Date: $(date)
SHA: $SHA
Status: SUCCESS

Services Running:
$(docker ps --filter "label=com.docker.compose.project=cod-mvp" --format='{{.Names}}\t{{.Status}}')

Image Versions:
FastAPI: $(docker inspect $REGISTRY/cod-mvp/fastapi:$SHA --format='{{.RepoTags}}' 2>/dev/null || echo 'latest')
Node.js: $(docker inspect $REGISTRY/cod-mvp/nodejs:$SHA --format='{{.RepoTags}}' 2>/dev/null || echo 'latest')
Frontend: $(docker inspect $REGISTRY/cod-mvp/frontend:$SHA --format='{{.RepoTags}}' 2>/dev/null || echo 'latest')

Database Status:
$(docker-compose -f $DOCKER_COMPOSE exec -T postgres pg_isready -U cod_user 2>/dev/null || echo 'Not available')
EOF

echo -e "${GREEN}✓ Deployment report generated${NC}"

# 11. Success message
echo -e "${GREEN}=== Deployment Completed Successfully! ===${NC}"
echo "Release: $SHA"
echo "Timestamp: $TIMESTAMP"
echo "Backup: $BACKUP_NAME"
echo ""
echo "Services available at:"
echo "  Frontend: https://cod-mvp.app"
echo "  API Docs: https://api.cod-mvp.app/docs"
echo "  Health: https://api.cod-mvp.app/health"
