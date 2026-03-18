# API Specification

## Overview

Calendar AI provides a comprehensive REST API for managing calendars, events, and collaboration. The API follows RESTful principles with JSON request/response bodies and JWT-based authentication.

## Base URL

```
https://api.calendar-ai.com/api/v1
```

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require an `Authorization: Bearer <token>` header with a valid JWT token.

**Token Format**: JWT (JSON Web Token)
- **Header**: Authorization
- **Format**: Bearer {token}
- **Expiration**: Configurable (default: 1 hour)
- **Refresh Token**: Available for extending sessions

## API Security Strategy

### Transport Security
- Enforce HTTPS only (TLS 1.2+; TLS 1.3 preferred)
- Redirect all HTTP traffic to HTTPS
- Use secure headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

### Authentication & Session Security
- JWT access tokens with short TTL (default 1 hour)
- Refresh tokens rotated on each refresh request
- Revoke refresh tokens on logout/password change
- Store tokens securely (prefer HTTP-only secure cookies in browser clients)

### Authorization
- Role/permission-based access checks on every protected endpoint
- Object-level access control (users can only access owned/shared calendars/events)
- Deny-by-default policy for unknown scopes/permissions

### Request Validation & Input Hardening
- Validate payload schemas server-side for all write endpoints
- Sanitize user input to mitigate injection and XSS vectors
- Enforce max payload sizes and field length limits
- Reject unknown/extra fields for strict contracts

### Abuse Protection
- Global and per-user/IP rate limiting
- Brute-force protection on authentication endpoints
- Optional captcha/challenge after repeated failed login attempts

### CORS & CSRF
- Restrictive CORS allowlist by trusted frontend origins
- Allowed methods/headers explicitly defined
- CSRF protection enabled for cookie-based auth flows

### File Import/Export Security
- Validate file type and size on upload/import
- Virus/malware scan for uploaded files (if file persistence is enabled)
- Signed, expiring URLs for exported/shared resources

### Auditing, Monitoring, and Incident Response
- Structured audit logs for auth, permission, share-token, and destructive actions
- Correlation/trace IDs in all responses/logs
- Alerting for suspicious activity (token abuse, repeated auth failures, abnormal request bursts)

### Secrets & Key Management
- Store secrets in a dedicated secret manager (no plaintext in repo)
- Rotate signing keys and API secrets periodically
- Support key rollover for JWT verification

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-03-18T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-18T10:30:00Z",
    "trace_id": "uuid"
  }
}
```

## Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_FAILED`: Invalid credentials
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Limit**: 1000 requests per hour per user
- **Headers**: 
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 999`
  - `X-RateLimit-Reset: 1234567890`

## Pagination

Query parameters for paginated responses:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sort`: Sort field and direction (e.g., `created_at:desc`)

**Paginated Response**:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
```
**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "first_name": "John",
  "last_name": "Doe"
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "token": "jwt_token"
  }
}
```

#### Login
```
POST /auth/login
```
**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```
**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refresh_token": "refresh_jwt_token",
    "expires_in": 3600
  }
}
```

### Calendars

#### List Calendars
```
GET /calendars
```
**Query Parameters**:
- `page`: int (optional)
- `limit`: int (optional)
- `sort`: string (optional)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Work Calendar",
      "description": "Business events",
      "is_default": true,
      "is_public": false,
      "color": "blue",
      "created_at": "2026-03-01T10:00:00Z",
      "event_count": 15
    }
  ],
  "pagination": {}
}
```

#### Create Calendar
```
POST /calendars
```
**Request**:
```json
{
  "name": "New Calendar",
  "description": "Calendar description",
  "is_default": false,
  "is_public": false,
  "color": "blue"
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Calendar",
    "description": "Calendar description",
    "is_default": false,
    "is_public": false,
    "color": "blue",
    "created_at": "2026-03-18T10:30:00Z"
  }
}
```

#### Get Calendar
```
GET /calendars/{calendar_id}
```
**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Work Calendar",
    "description": "Business events",
    "is_default": true,
    "is_public": false,
    "color": "blue",
    "created_at": "2026-03-01T10:00:00Z",
    "updated_at": "2026-03-18T10:30:00Z"
  }
}
```

#### Update Calendar
```
PUT /calendars/{calendar_id}
```
**Request**:
```json
{
  "name": "Updated Calendar Name",
  "description": "Updated description",
  "is_public": true,
  "color": "green"
}
```
**Response** (200): Updated calendar object

#### Delete Calendar
```
DELETE /calendars/{calendar_id}
```
**Response** (204): No content

### Events

#### List Events
```
GET /events
```
**Query Parameters**:
- `calendar_id`: uuid (optional)
- `start_date`: ISO 8601 date (optional)
- `end_date`: ISO 8601 date (optional)
- `page`: int (optional)
- `limit`: int (optional)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "calendar_id": "uuid",
      "title": "Team Meeting",
      "description": "Weekly sync",
      "location": "Conference Room A",
      "start_time": "2026-03-20T10:00:00Z",
      "end_time": "2026-03-20T11:00:00Z",
      "is_recurring": false,
      "status": "published",
      "attendee_count": 5,
      "created_at": "2026-03-18T10:30:00Z"
    }
  ],
  "pagination": {}
}
```

#### Create Event
```
POST /events
```
**Request**:
```json
{
  "calendar_id": "uuid",
  "title": "Team Meeting",
  "description": "Weekly sync",
  "location": "Conference Room A",
  "start_time": "2026-03-20T10:00:00Z",
  "end_time": "2026-03-20T11:00:00Z",
  "is_recurring": false,
  "status": "published",
  "attendees": [
    {
      "email": "attendee@example.com",
      "role": "required"
    }
  ]
}
```
**Response** (201): Created event object

#### Get Event
```
GET /events/{event_id}
```
**Response** (200): Event object with full details

#### Update Event
```
PUT /events/{event_id}
```
**Request**: Event update object (partial)
**Response** (200): Updated event object

#### Delete Event
```
DELETE /events/{event_id}
```
**Query Parameters**:
- `notify_attendees`: boolean (optional, default: true)

**Response** (204): No content

### Sharing & Permissions

#### Share Calendar
```
POST /calendars/{calendar_id}/share
```
**Request**:
```json
{
  "user_ids": ["uuid1", "uuid2"],
  "permission_level": "view",
  "expires_at": "2026-04-18T10:30:00Z"
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "share_url": "https://calendar-ai.com/share/token123",
    "permissions": []
  }
}
```

#### Get Permissions
```
GET /calendars/{calendar_id}/permissions
```
**Response** (200): List of permissions

#### Update Permission
```
PUT /calendars/{calendar_id}/permissions/{user_id}
```
**Request**:
```json
{
  "permission_level": "edit"
}
```
**Response** (200): Updated permission

#### Delete Permission
```
DELETE /calendars/{calendar_id}/permissions/{user_id}
```
**Response** (204): No content

### Import/Export

#### Export Calendar
```
POST /calendars/{calendar_id}/export
```
**Query Parameters**:
- `format`: "ical" | "json" | "csv" (default: "ical")

**Response** (200): File download or data

#### Import Calendar
```
POST /calendars/import
```
**Request**: (multipart/form-data)
- `file`: File upload
- `calendar_id`: uuid (optional - creates new calendar if not provided)
- `format`: "ical" | "json" | "csv"

**Response** (201):
```json
{
  "success": true,
  "data": {
    "imported_count": 25,
    "calendar_id": "uuid"
  }
}
```

## Rate Limiting & Quotas

- **API Requests**: 1000/hour per user
- **Events per Calendar**: Unlimited
- **Calendars per User**: 50
- **Attendees per Event**: 100
- **Export Size**: 50MB max

## Versioning & Deprecation

- Current API Version: v1
- Deprecated endpoints marked with `X-API-Warn` header
- Deprecation notice period: 6 months before removal

## Support & Documentation

- **Documentation**: https://docs.calendar-ai.com
- **Issues**: https://github.com/calendar-ai/issues
- **Contact**: support@calendar-ai.com
