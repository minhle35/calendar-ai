# Deployment Guide

## Overview

This document outlines the deployment strategy for Calendar AI across development, staging, and production environments.

## Deployment Environments

### Development
- **Purpose**: Local development and feature testing
- **Infrastructure**: Local machine or Docker Compose
- **Database**: Local PostgreSQL container
- **CI/CD**: None (manual)

### Staging
- **Purpose**: Pre-production testing and validation
- **Infrastructure**: Cloud environment (AWS/Azure/GCP)
- **Database**: Managed PostgreSQL
- **CI/CD**: Automated from develop branch
- **Access**: Team only

### Production
- **Purpose**: Live customer environment
- **Infrastructure**: Highly available cloud setup
- **Database**: Multi-AZ managed database with backups
- **CI/CD**: Automated from main branch with approvals
- **Access**: End users

## Development Environment Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Java 17+
- Maven/Gradle

### Local Setup

```bash
# Clone repository
git clone https://github.com/calendar-ai/calendar-ai.git
cd calendar-ai

# Start infrastructure
docker-compose -f docker-compose.dev.yml up

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
mvn clean install

# Start frontend (new terminal)
npm run dev

# Start backend (new terminal)
mvn spring-boot:run
```

### Docker Compose Configuration

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: calendar_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

volumes:
  postgres_data:
```

## Frontend Deployment

### Build Process

```bash
# Production build
npm run build

# Output directory: dist/

# Build artifacts:
# - index.html
# - js/main.*.js (tree-shaken, minified)
# - css/main.*.css (minified)
# - static assets
```

### Staging Deployment

```bash
# 1. Build application
npm run build

# 2. Run tests
npm run test:e2e

# 3. Deploy to CDN
aws s3 sync dist/ s3://calendar-ai-staging-cdn/ \
  --cache-control "public, max-age=31536000"

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id STAGING_DIST_ID \
  --paths "/"

# 5. Smoke tests
npm run test:smoke-staging
```

### Production Deployment

```bash
# 1. Verify all tests pass in CI
# 2. Manual approval required

# 3. Build for production
npm run build:prod

# 4. Deploy to CDN
aws s3 sync dist/ s3://calendar-ai-prod-cdn/ \
  --cache-control "public, max-age=31536000"

# 5. Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id PROD_DIST_ID \
  --paths "/"

# 6. Verify deployment
npm run test:smoke-prod
```

### Frontend Hosting

**CDN**: CloudFront
- **Origin**: S3 bucket
- **Cache Policy**: Aggressive for versioned assets
- **SSL**: TLS 1.3+
- **Security Headers**: HSTS, CSP, X-Frame-Options

## Backend Deployment

### Build Process

```bash
# Package application
mvn clean package -DskipTests

# Output: target/calendar-api.jar
```

### Docker Image Build

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/calendar-api.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

### Docker Image Build & Push

```bash
# Build image
docker build -t calendar-ai/api:1.0.0 .

# Push to registry
docker tag calendar-ai/api:1.0.0 registry.example.com/calendar-ai/api:1.0.0
docker push registry.example.com/calendar-ai/api:1.0.0
```

### Kubernetes Deployment (Production)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: calendar-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: calendar-api
  template:
    metadata:
      labels:
        app: calendar-api
    spec:
      containers:
      - name: api
        image: registry.example.com/calendar-ai/api:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: calendar-api-service
spec:
  selector:
    app: calendar-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### Database Migration

```bash
# Using Flyway
mvn flyway:migrate \
  -Dflyway.url=jdbc:postgresql://prod-db:5432/calendar_ai \
  -Dflyway.user=admin \
  -Dflyway.password=<password>
```

### Deployment Steps (Staging)

```bash
# 1. Build Docker image
docker build -t calendar-ai/api:staging-1.0.0 .

# 2. Push to registry
docker push registry.example.com/calendar-ai/api:staging-1.0.0

# 3. Update Kubernetes manifest
kubectl set image deployment/calendar-api \
  api=registry.example.com/calendar-ai/api:staging-1.0.0 \
  -n staging --record

# 4. Wait for rollout
kubectl rollout status deployment/calendar-api -n staging

# 5. Run integration tests
./gradlew integrationTest -Denv=staging

# 6. Run E2E tests
npm run test:e2e:staging
```

### Production Deployment

```bash
# 1. Create release version
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# 2. Build and push
docker build -t calendar-ai/api:1.0.0 .
docker push registry.example.com/calendar-ai/api:1.0.0

# 3. Create backup
pg_dump -h prod-db -U admin calendar_ai > backup-1.0.0.sql

# 4. Run database migration
./scripts/migrate-prod.sh

# 5. Blue-green deployment
kubectl set image deployment/calendar-api-green \
  api=registry.example.com/calendar-ai/api:1.0.0 -n prod

# 6. Verify green deployment
kubectl get pods -n prod -l deployment=calendar-api-green

# 7. Switch traffic (load balancer)
kubectl patch service calendar-api-service \
  -p '{"spec":{"selector":{"deployment":"calendar-api-green"}}}' \
  -n prod

# 8. Monitor metrics
# Check application logs, error rates, response times

# 9. Rollback if needed (switch to blue)
kubectl patch service calendar-api-service \
  -p '{"spec":{"selector":{"deployment":"calendar-api-blue"}}}' \
  -n prod
```

## Database Deployment

### Schema Management

```bash
# Create migration file
touch db/migration/V001__initial_schema.sql

# Run migrations
mvn flyway:migrate

# Validate schema
mvn flyway:validate

# Repair (if needed)
mvn flyway:repair
```

### Backup Strategy

```bash
# Daily backup
0 2 * * * pg_dump -h prod-db -U admin calendar_ai | \
  gzip > /backups/calendar_ai_$(date +\%Y\%m\%d).sql.gz

# Upload to S3
aws s3 cp /backups/calendar_ai_*.sql.gz s3://calendar-ai-backups/

# Retention: 30 days
```

## CI/CD Pipeline Configuration

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [ main, develop ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      
      - name: Run backend tests
        run: mvn clean verify
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm install
          npm run test
          npm run build
  
  deploy-staging:
    needs: build-test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy frontend to staging
        run: |
          npm run build
          aws s3 sync dist/ s3://calendar-ai-staging/
      
      - name: Deploy backend to staging
        run: |
          docker build -t calendar-ai/api:staging .
          docker push registry.example.com/calendar-ai/api:staging
          kubectl set image deployment/calendar-api \
            api=registry.example.com/calendar-ai/api:staging -n staging
  
  deploy-production:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://calendar-ai.com
    steps:
      - uses: actions/checkout@v3
      
      - name: Manual approval required
        run: echo "Waiting for approval..."
      
      - name: Deploy to production
        run: |
          # Deploy frontend
          npm run build
          aws s3 sync dist/ s3://calendar-ai-prod/
          
          # Deploy backend
          docker build -t calendar-ai/api:${{ github.ref_name }} .
          docker push registry.example.com/calendar-ai/api:${{ github.ref_name }}
          
          # Update Kubernetes
          kubectl set image deployment/calendar-api \
            api=registry.example.com/calendar-ai/api:${{ github.ref_name }} -n prod
```

## Monitoring & Rollback

### Health Checks

```
Frontend:
- Page load times
- Error tracking (Sentry)
- User interaction metrics

Backend:
- API response times
- Error rates
- Database query performance
- Cache hit rates
```

### Rollback Procedure

```bash
# Immediate rollback (if issues detected)

# Frontend rollback
aws s3 sync s3://calendar-ai-backups/frontend-1.0.0/ s3://calendar-ai-prod/
aws cloudfront create-invalidation --distribution-id PROD_DIST_ID --paths "/"

# Backend rollback
kubectl set image deployment/calendar-api \
  api=registry.example.com/calendar-ai/api:0.9.9 -n prod \
  --record

# Database rollback (if needed)
psql -h prod-db -U admin -c "
  BEGIN;
  -- Run rollback statements
  COMMIT;
"
```

## Post-Deployment Verification

- [ ] Frontend loads successfully
- [ ] API endpoints respond correctly
- [ ] Database connectivity verified
- [ ] Authentication working
- [ ] No elevated error rates
- [ ] Performance metrics acceptable
- [ ] Monitoring dashboards show healthy status
- [ ] User-facing features work as expected

## Troubleshooting

### Common Issues

**Frontend not loading**
- Check CDN cache invalidation
- Verify S3 bucket permissions
- Check browser cache

**API returning 500 errors**
- Check application logs
- Verify database connection
- Check external service integrations

**Database connectivity issues**
- Verify connection string
- Check network security groups
- Verify credentials

**Performance degradation**
- Check query performance
- Review cache hit rates
- Scale up resources if needed
