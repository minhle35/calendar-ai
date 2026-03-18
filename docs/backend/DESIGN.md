# Backend Design Document

## Executive Summary

The Calendar AI backend is a robust, scalable Java Enterprise Edition application that provides comprehensive calendar management, event scheduling, and collaboration features. Designed with clean architecture principles, it emphasizes security, performance, and maintainability.

## Architecture Overview

### Architectural Pattern: Hexagonal Architecture (Ports & Adapters)

```
Domain (Core Business Logic)
    ↓
Application Layer (Use Cases & Orchestration)
    ↓
Infrastructure Layer (Data Access, External Services)
    ↓
Presentation Layer (REST API, Controllers)
```

## Core Domains

### 1. Calendar Domain
- Calendar management (create, update, delete)
- Calendar metadata (name, description, color/theme)
- Calendar sharing and permissions
- Multi-calendar support per user
- Calendar synchronization

### 2. Event Domain
- Event CRUD operations
- Event scheduling (single and recurring)
- Event details (title, description, location, attendees)
- Event attachments
- Event status and workflow (draft, published, cancelled)

### 3. User Domain
- User registration and authentication
- User profile management
- User preferences and settings
- Timezone preferences
- Notification preferences

### 4. Collaboration Domain
- Attendee management
- Sharing and permissions
- Shareable URLs/tokens
- Activity logging
- Real-time notifications

### 5. Integration Domain
- Import/Export functionality
- Third-party calendar integrations (Google, Outlook, iCal)
- Webhook support for external triggers
- Data synchronization

## Technology Stack

### Runtime & Framework
- **Java Version**: Java 17+ (LTS)
- **Framework**: Spring Boot 3.x
- **Container**: Docker
- **Build Tool**: Maven/Gradle

### Data Storage
- **Primary Database**: PostgreSQL
- **Cache**: Redis (for performance, sessions)
- **Message Queue**: RabbitMQ/Kafka (for async operations)
- **File Storage**: Cloud Storage (S3-compatible or Cloud Storage)

### External Services
- **Authentication**: OAuth 2.0 / OpenID Connect (JWT)
- **Email Service**: SMTP or third-party (SendGrid, AWS SES)
- **Logging**: ELK Stack or cloud logging
- **Monitoring**: Prometheus + Grafana

## API Design

### REST API Principles
- Resource-oriented endpoints
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Consistent response format (JSON)
- Pagination and filtering support
- API versioning (v1, v2, etc.)
- OpenAPI/Swagger documentation

### Main Endpoints

**Authentication**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

**Calendars**
```
GET    /api/v1/calendars
POST   /api/v1/calendars
GET    /api/v1/calendars/{id}
PUT    /api/v1/calendars/{id}
DELETE /api/v1/calendars/{id}
GET    /api/v1/calendars/{id}/events
```

**Events**
```
GET    /api/v1/events
POST   /api/v1/events
GET    /api/v1/events/{id}
PUT    /api/v1/events/{id}
DELETE /api/v1/events/{id}
POST   /api/v1/events/{id}/attendees
DELETE /api/v1/events/{id}/attendees/{attendeeId}
```

**Sharing**
```
POST   /api/v1/calendars/{id}/share
GET    /api/v1/calendars/{id}/permissions
PUT    /api/v1/calendars/{id}/permissions/{userId}
DELETE /api/v1/calendars/{id}/permissions/{userId}
POST   /api/v1/share/{token}/join
```

**Import/Export**
```
POST   /api/v1/calendars/import
POST   /api/v1/calendars/{id}/export
GET    /api/v1/calendars/{id}/export/{format}
POST   /api/v1/integrations/{provider}/connect
```

**Users**
```
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/preferences
PUT    /api/v1/users/preferences
```

## Data Models

### Core Entities

**User**
- id (UUID)
- email (unique)
- password_hash
- first_name
- last_name
- profile_picture_url
- timezone
- created_at
- updated_at
- deleted_at

**Calendar**
- id (UUID)
- user_id (FK)
- name
- description
- color/theme
- is_default
- is_public
- created_at
- updated_at
- deleted_at

**Event**
- id (UUID)
- calendar_id (FK)
- title
- description
- location
- start_time
- end_time
- is_recurring
- recurrence_rule (iCal format)
- status (draft, published, cancelled)
- created_by_id (FK)
- created_at
- updated_at
- deleted_at

**Attendee**
- id (UUID)
- event_id (FK)
- user_id (FK) or email
- role (organizer, required, optional)
- response_status (pending, accepted, declined, tentative)
- response_date
- created_at

**Permission**
- id (UUID)
- calendar_id (FK)
- user_id or role (authenticated_user, anonymous)
- level (view, edit, admin)
- created_at
- expires_at

**ShareToken**
- id (UUID)
- calendar_id (FK)
- token (unique)
- permission_level
- is_active
- created_at
- expires_at

## Service Layer Architecture

### Core Services

**UserService**
- User registration and authentication
- Profile management
- Preference management

**CalendarService**
- Calendar CRUD operations
- Calendar filtering and search
- Multi-calendar aggregation

**EventService**
- Event CRUD operations
- Event search and filtering
- Recurring event handling
- Event notifications

**SharingService**
- Permission management
- Share URL generation and validation
- Collaborative access control

**ImportExportService**
- iCal import/export
- CSV import/export
- Third-party integrations (Google, Outlook)
- Batch operations

**NotificationService**
- Event notifications
- Reminder scheduling
- Email notifications
- WebSocket notifications

**IntegrationService**
- Calendar provider integrations
- OAuth flows
- Webhook handling

## Security Design

### Authentication & Authorization
- JWT token-based authentication
- OAuth 2.0 for third-party integrations
- Role-based access control (RBAC)
- Permission-based access control (PBAC)
- Token refresh mechanism
- Session management

### Data Protection
- Passwords hashed with bcrypt (cost factor 12+)
- Sensitive data encryption at rest
- TLS 1.3+ for data in transit
- SQL injection prevention (parameterized queries/ORM)
- CORS configuration

### API Security
- Rate limiting per user/IP
- Request validation and sanitization
- CSRF protection for state-changing operations
- API key management for integrations
- Input validation at boundary

### Audit & Compliance
- Audit logging for critical operations
- User activity tracking
- Data retention policies
- GDPR compliance (right to be forgotten)

## Performance Design

### Database Optimization
- Indexed columns (user_id, calendar_id, start_time)
- Partitioning for large event tables (by user or date range)
- Query optimization and N+1 prevention
- Connection pooling (HikariCP)
- Read replicas for reporting

### Caching Strategy
- Redis for session storage
- Cache event queries (short TTL)
- Cache user permissions (medium TTL)
- Cache recurring event expansions
- Invalidation on update

### Async Processing
- Background tasks for email notifications
- Async event creation for bulk operations
- Background job scheduling for maintenance
- Queue-based processing for exports

### Monitoring & Profiling
- Slow query logging
- Request latency monitoring
- Database connection monitoring
- Memory usage tracking
- CPU profiling

## Scalability Design

### Horizontal Scaling
- Stateless application design
- Distributed session storage (Redis)
- Load balancing
- Database connection pooling
- Message queue for async work

### Vertical Scaling
- Pagination for large datasets
- Query optimization
- Caching strategies
- Batch processing limits

## Testing Strategy

### Unit Tests
- Service layer tests (mocked dependencies)
- Utility and helper function tests
- Business logic validation
- Coverage target: 80%+

### Integration Tests
- Service integration with in-memory database
- API endpoint integration tests
- Database transaction handling
- External service mocking

### End-to-End Tests
- Full request/response cycle
- User workflow scenarios
- Error handling and edge cases
- Performance benchmarks

### Test Tools
- **Unit/Integration**: JUnit 5, Mockito, TestContainers
- **API Testing**: REST Assured, Postman
- **Database**: Testcontainers with PostgreSQL
- **Mocking**: WireMock for external services

## Deployment & DevOps

### Containerization
- Docker image with multi-stage builds
- Spring Boot executable JAR
- Health check endpoints
- Graceful shutdown

### Kubernetes (if applicable)
- Deployment configuration
- Service discovery
- Config maps for configuration
- Secrets for sensitive data
- Horizontal pod autoscaling

### CI/CD Pipeline
- Automated builds and tests
- Code quality scanning
- Security scanning (SAST)
- Docker image building
- Deployment automation

### Configuration Management
- Environment-specific configurations
- Spring profiles (dev, test, prod)
- External configuration (environment variables, config servers)
- Feature flags

## Error Handling & Resilience

### Exception Handling
- Structured exception hierarchy
- Custom domain exceptions
- Global exception handler
- Consistent error response format

### Resilience Patterns
- Retry logic for transient failures
- Circuit breaker for external services
- Timeout handling
- Graceful degradation

## Logging & Monitoring

### Logging Strategy
- Structured logging (JSON format)
- Appropriate log levels (DEBUG, INFO, WARN, ERROR)
- Request/response logging
- Performance metrics logging
- Centralized log aggregation

### Monitoring Metrics
- API response times
- Error rates
- Database query performance
- Cache hit rates
- User engagement metrics

## API Documentation

### Documentation Tools
- OpenAPI/Swagger for API specification
- Auto-generated API documentation
- Example requests and responses
- Authentication flow documentation

## Version Control & Release Management

### Versioning
- Semantic versioning (X.Y.Z)
- API versioning (v1, v2)
- Changelog maintenance

### Release Process
- Feature branching
- Code review requirements
- Automated testing before merge
- Release notes generation

## Future Enhancements

- GraphQL API layer
- Event analytics and insights
- Advanced search with Elasticsearch
- Real-time collaboration with WebSockets
- AI-powered scheduling recommendations
- Mobile app backend optimization
- Event templates and workflows
