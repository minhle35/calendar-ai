# Architecture Overview

## System Architecture

Calendar AI follows a modern, scalable architecture designed for business-grade performance and reliability.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │  Web Browser     │  │  Mobile (Future) │  │  Desktop App │   │
│  │  (React SPA)     │  │  (React Native)  │  │  (Electron)  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/WSS
┌────────────────────────┴────────────────────────────────────────┐
│                    CDN & Load Balancer                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   API Gateway Layer                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Authentication, Rate Limiting, Request Validation         │ │
│  │  CORS, Logging, Metrics                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐
│  REST API    │ │ WebSocket   │ │  GraphQL   │
│  Controllers │ │  Server     │ │  (Future)  │
└────────┬─────┘ └──────┬──────┘ └─────┬──────┘
         │               │              │
         └───────────────┼──────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────────────┐  ┌──────────▼────────┐
│  Application Services   │  │  Business Logic   │
│  - CalendarService      │  │  - Domain Models  │
│  - EventService         │  │  - Rules Engine   │
│  - UserService          │  │  - Validation     │
│  - SharingService       │  │  - Calculations   │
│  - ImportExportService  │  │                   │
└────────┬────────────────┘  └──────────┬────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
┌────────▼──────────┐       ┌──────────▼────────┐
│  Data Access      │       │  External         │
│  Layer            │       │  Services         │
│  - Repositories   │       │  - Email Service  │
│  - DAO            │       │  - Calendar APIs  │
│  - Query Objects  │       │  - Cloud Storage  │
└────────┬──────────┘       └──────────┬────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼──┐    ┌─────▼──┐    ┌──────▼────┐
    │PostgreSQL│   │Redis   │   │Message    │
    │Database  │   │Cache   │   │Queue      │
    │          │   │Session │   │(RabbitMQ) │
    └──────────┘   └────────┘   └───────────┘
```

## Layer Responsibilities

### 1. Presentation Layer (API Gateway)
- **Responsibility**: Handle HTTP/WebSocket requests, response formatting
- **Components**: Controllers, REST endpoints, WebSocket handlers
- **Technologies**: Spring Web MVC, Spring WebSocket

### 2. Application Layer
- **Responsibility**: Orchestrate business logic, coordinate services
- **Components**: Use cases, service coordination, transaction management
- **Technologies**: Spring Service annotations

### 3. Domain Layer
- **Responsibility**: Core business logic, validation, calculations
- **Components**: Domain models, aggregates, value objects
- **Technologies**: Plain Java classes (POJOs)

### 4. Infrastructure Layer
- **Responsibility**: Data persistence, external service integration
- **Components**: Repositories, ORM mapping, API clients
- **Technologies**: Spring Data JPA, Hibernate, REST clients

## Component Breakdown

### Frontend Components

```
src/
├── pages/                    # Page-level components
│   ├── Dashboard.tsx
│   ├── CalendarView.tsx
│   ├── EventDetail.tsx
│   └── Settings.tsx
├── components/              # Reusable UI components
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── hooks/                   # Custom React hooks
├── services/                # API client services
├── store/                   # State management
├── utils/                   # Utility functions
└── tests/                   # E2E Playwright tests
```

### Backend Components

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── calendarai/
│   │           ├── api/                 # REST Controllers
│   │           ├── application/         # Use cases & Services
│   │           ├── domain/              # Domain models
│   │           │   ├── calendar/
│   │           │   ├── event/
│   │           │   ├── user/
│   │           │   └── sharing/
│   │           ├── infrastructure/
│   │           │   ├── persistence/
│   │           │   ├── external/
│   │           │   └── config/
│   │           └── CalendarAiApplication.java
│   └── resources/
│       ├── application.yaml
│       ├── application-dev.yaml
│       └── db/migration/
└── test/
    └── java/
        ├── unit/
        ├── integration/
        └── e2e/
```

## Data Flow

### Event Creation Flow

```
1. Frontend UI
   ↓
2. HTTP POST /api/v1/events
   ↓
3. API Controller
   ↓
4. Request Validation
   ↓
5. Application Service (EventService)
   ↓
6. Domain Logic (Event Aggregate)
   ↓
7. Repository (Data Access)
   ↓
8. Database Write
   ↓
9. Event Created Event (Domain Event)
   ↓
10. Async Processing (Email notifications, integrations)
    ↓
11. Response to Frontend
```

### Event Sharing Flow

```
1. Frontend requests share
   ↓
2. SharingService.shareCalendar()
   ↓
3. Generate ShareToken
   ↓
4. Persist Permissions
   ↓
5. Trigger Notifications
   ↓
6. Return Shareable URL
   ↓
7. Frontend displays/copies URL
```

## Database Schema (Logical)

```
Users
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── profile
└── preferences

Calendars
├── id (PK)
├── user_id (FK)
├── name
├── settings
└── created_at

Events
├── id (PK)
├── calendar_id (FK)
├── title
├── description
├── start_time (INDEX)
├── end_time
├── recurrence_rule
└── status

Attendees
├── id (PK)
├── event_id (FK)
├── user_id or email
├── role
└── response_status

Permissions
├── id (PK)
├── calendar_id (FK)
├── user_id (FK)
├── level
└── expires_at

ShareTokens
├── id (PK)
├── calendar_id (FK)
├── token (UNIQUE, INDEX)
├── permission_level
└── created_at
```

## Deployment Architecture

### Development Environment
```
Developer Machine
├── Frontend (npm run dev)
├── Backend (gradle bootRun)
└── Local Database (Docker)
```

### Production Environment
```
AWS/Cloud Provider
├── CDN (CloudFront/CloudFlare)
├── Load Balancer (ALB/NLB)
├── Kubernetes Cluster
│   ├── API Pods (multiple replicas)
│   ├── WebSocket Pods (multiple replicas)
│   └── Worker Pods (async jobs)
├── RDS PostgreSQL (Multi-AZ)
├── ElastiCache Redis
├── SQS/RabbitMQ
├── S3/Cloud Storage
└── CloudWatch/ELK (Logging & Monitoring)
```

## Integration Points

### Third-Party Services
- **Google Calendar**: OAuth integration for import/export
- **Microsoft Outlook**: API integration
- **Slack**: Event notifications, reminders
- **Email Service**: SendGrid, AWS SES
- **Analytics**: Segment, Mixpanel
- **Monitoring**: Datadog, New Relic

## Security Architecture

### Authentication Flow
```
1. User login
   ↓
2. Credentials validated
   ↓
3. JWT token generated
   ↓
4. Token returned to frontend
   ↓
5. Frontend stores token (secure HTTP-only cookie)
   ↓
6. Subsequent requests include token
   ↓
7. API validates token
```

### Authorization Flow
```
1. Request arrives with token
   ↓
2. User identified from token
   ↓
3. Resource ownership verified
   ↓
4. Permission level checked
   ↓
5. Access granted/denied
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design enables multiple instances
- Shared session store (Redis)
- Load balancing across instances
- Database read replicas for queries

### Vertical Scaling
- Optimize database queries
- Implement caching strategies
- Lazy load large datasets
- Batch processing for bulk operations

### Database Optimization
- Partition events table by date range
- Materialized views for analytics
- Archive old data
- Index optimization

## Monitoring & Observability

### Metrics
- API response times
- Error rates
- Database query performance
- Cache hit rates
- User engagement
- System resource usage

### Logging
- Structured JSON logging
- Centralized log aggregation
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs for tracing

### Tracing
- Distributed tracing across services
- Request flow visualization
- Performance bottleneck identification

## Disaster Recovery

### Backup Strategy
- Daily automated backups
- 30-day retention
- Cross-region backup replication
- Regular restore testing

### High Availability
- Multi-region deployment (future)
- Database failover
- Automatic recovery
- RTO: 1 hour, RPO: 15 minutes
