# Testing Strategy

## Overview

Calendar AI employs comprehensive testing across the entire stack to ensure reliability, performance, and quality. Testing is integrated into the development lifecycle with automated execution in CI/CD pipelines.

## Testing Pyramid

```
            ┌─────────────┐
            │   E2E Tests │  (5-10%)
            │ (Playwright)│
            └─────────────┘
                  △
             ┌────────────┐
             │Integration │  (15-25%)
             │   Tests    │
             └────────────┘
                  △
            ┌──────────────┐
            │  Unit Tests  │  (65-80%)
            └──────────────┘
```

## Unit Testing

### Frontend (Jest + React Testing Library)

**Scope**: Individual components, hooks, utilities

**File Structure**:
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── hooks/
│   ├── useCalendar.ts
│   └── useCalendar.test.ts
└── utils/
    ├── dateUtils.ts
    └── dateUtils.test.ts
```

**Example Test**:
```typescript
describe('CalendarHeader Component', () => {
  it('should render month and year', () => {
    render(<CalendarHeader date={new Date(2026, 2)} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('should call onPreviousMonth when prev button clicked', () => {
    const handlePrev = jest.fn();
    render(<CalendarHeader date={new Date(2026, 2)} onPreviousMonth={handlePrev} />);
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(handlePrev).toHaveBeenCalled();
  });
});
```

**Coverage Goals**: ≥ 80%

### Backend (JUnit 5 + Mockito)

**Scope**: Service methods, domain logic, utilities

**File Structure**:
```
src/test/java/
├── unit/
│   ├── service/
│   │   ├── EventServiceTest.java
│   │   └── CalendarServiceTest.java
│   ├── domain/
│   │   ├── EventTest.java
│   │   └── CalendarTest.java
│   └── util/
│       └── DateUtilTest.java
```

**Example Test**:
```java
@DisplayName("EventService")
class EventServiceTest {
  
  private EventService eventService;
  private EventRepository eventRepository;
  private UserService userService;
  
  @BeforeEach
  void setup() {
    eventRepository = mock(EventRepository.class);
    userService = mock(UserService.class);
    eventService = new EventService(eventRepository, userService);
  }
  
  @Test
  @DisplayName("should create event with valid data")
  void testCreateEventSuccess() {
    // Arrange
    CreateEventCommand command = new CreateEventCommand(...)
    User user = new User(...);
    when(userService.getCurrentUser()).thenReturn(user);
    
    // Act
    Event event = eventService.createEvent(command);
    
    // Assert
    assertThat(event.getTitle()).isEqualTo("Team Meeting");
    verify(eventRepository).save(event);
  }
  
  @Test
  @DisplayName("should throw exception for invalid time range")
  void testCreateEventInvalidTimeRange() {
    // Arrange
    CreateEventCommand command = new CreateEventCommand(
      "Meeting",
      "2026-03-20 15:00",
      "2026-03-20 14:00"  // End before start
    );
    
    // Act & Assert
    assertThrows(IllegalArgumentException.class, 
      () -> eventService.createEvent(command));
  }
}
```

**Coverage Goals**: ≥ 80%

## Integration Testing

### Frontend Integration (React Testing Library + API Mocking)

**Scope**: Component integration, user workflows, API interactions

**Tools**: 
- React Testing Library
- MSW (Mock Service Worker)
- Jest

**Example Test**:
```typescript
describe('Calendar View Integration', () => {
  it('should load and display events', async () => {
    // Mock API response
    server.use(
      rest.get('/api/v1/calendars/:id/events', (req, res, ctx) => {
        return res(ctx.json([
          { id: '1', title: 'Meeting', startTime: '2026-03-20T10:00:00Z' },
          { id: '2', title: 'Lunch', startTime: '2026-03-20T12:00:00Z' }
        ]));
      })
    );
    
    render(<CalendarPage calendarId="123" />);
    
    // Wait for data to load
    const meetings = await screen.findAllByRole('button', { name: /meeting|lunch/i });
    expect(meetings).toHaveLength(2);
  });
  
  it('should handle create event workflow', async () => {
    server.use(
      rest.post('/api/v1/events', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json({ id: 'new-123', title: 'New Event' }));
      })
    );
    
    render(<CalendarPage />);
    
    fireEvent.click(screen.getByRole('button', { name: /new event/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: { value: 'New Event' }
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    const confirmation = await screen.findByText(/event created/i);
    expect(confirmation).toBeInTheDocument();
  });
});
```

### Backend Integration (Testcontainers + REST Assured)

**Scope**: API endpoints, database interactions, service integration

**Tools**:
- Spring Boot Test
- Testcontainers (PostgreSQL)
- REST Assured
- JUnit 5

**Example Test**:
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
class EventControllerIntegrationTest {
  
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>();
  
  @Autowired
  private TestRestTemplate restTemplate;
  
  @Autowired
  private EventRepository eventRepository;
  
  @Test
  @DisplayName("should create event via REST endpoint")
  void testCreateEventEndpoint() {
    // Arrange
    CreateEventRequest request = new CreateEventRequest(
      "Team Meeting",
      "2026-03-20T10:00:00Z",
      "2026-03-20T11:00:00Z"
    );
    
    // Act
    ResponseEntity<EventResponse> response = restTemplate.postForEntity(
      "/api/v1/events",
      request,
      EventResponse.class
    );
    
    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    assertThat(response.getBody().getTitle()).isEqualTo("Team Meeting");
    assertThat(eventRepository.count()).isEqualTo(1);
  }
}
```

## End-to-End Testing

### Playwright Tests

**Scope**: Complete user workflows, cross-browser testing, responsive design

**File Structure**:
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── calendar.spec.ts
│   ├── events.spec.ts
│   ├── sharing.spec.ts
│   └── fixtures/
│       └── auth.fixture.ts
└── playwright.config.ts
```

**Example Test**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Calendar Application E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup: Login before each test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForNavigation();
  });
  
  test('should create event from dashboard', async ({ page }) => {
    // Navigate to calendar
    await page.goto('http://localhost:3000/calendar');
    
    // Click new event button
    await page.click('button:has-text("New Event")');
    
    // Fill form
    await page.fill('input[name="title"]', 'Team Standup');
    await page.fill('input[name="location"]', 'Zoom');
    await page.fill('input[name="date"]', '03/20/2026');
    await page.fill('input[name="time"]', '10:00 AM');
    
    // Submit
    await page.click('button:has-text("Save Event")');
    
    // Verify
    await expect(page.locator('text=Team Standup')).toBeVisible();
    await expect(page.locator('text=Event created successfully')).toBeVisible();
  });
  
  test('should share calendar with shareable link', async ({ page }) => {
    await page.goto('http://localhost:3000/calendar');
    
    // Open sharing settings
    await page.click('button[aria-label="Share"]');
    
    // Generate share link
    await page.click('button:has-text("Generate Link")');
    
    // Copy button visible
    await expect(page.locator('button:has-text("Copy Link")')).toBeVisible();
    
    // Copy link
    const link = await page.locator('input[readonly]').inputValue();
    expect(link).toMatch(/http.*\/share\//);
  });
  
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/calendar');
    
    // Mobile menu should be visible
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
    
    // Desktop header items hidden
    await expect(page.locator('nav.desktop')).toBeHidden();
  });
});
```

**Browser Coverage**:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari/WebKit (latest)
- Mobile Chrome

**Test Scenarios**:
- User authentication (login, logout, session expiry)
- Calendar creation and deletion
- Event CRUD operations
- Event filtering and search
- Calendar sharing
- Import/export workflows
- Real-time updates
- Error handling
- Accessibility verification

## Performance Testing

### Frontend Performance

**Tools**: Lighthouse, WebPageTest

**Metrics**:
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

### Backend Performance

**Tools**: JMeter, Gatling, Load Runner

**Scenarios**:
- 1000 concurrent users
- Event creation rate: 100/second
- Calendar query performance
- Report generation load

## Accessibility Testing

### Tools
- Axe DevTools
- Pa11y
- WAVE
- Manual keyboard navigation

### Checklist
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- ARIA labels
- Form accessibility

## Security Testing

### OWASP Top 10 Coverage
- SQL Injection prevention
- XSS protection
- CSRF tokens
- Authentication/Authorization
- Sensitive data exposure
- XXE prevention
- Broken access control
- Security misconfiguration

### Tools
- OWASP ZAP
- Burp Suite
- SonarQube
- Dependency scanning

## Test Automation & CI/CD

### Pipeline Stages

```
1. Unit Tests (5 min)
   ↓ (if pass)
2. Integration Tests (15 min)
   ↓ (if pass)
3. E2E Tests (30 min)
   ↓ (if pass)
4. Performance Tests (20 min)
   ↓ (if pass)
5. Security Scan (10 min)
   ↓ (if all pass)
6. Deploy to Staging
```

### GitHub Actions Configuration
- Trigger on PR and main branch
- Parallel test execution
- Coverage reports
- Test result artifacts

## Test Data Management

### Data Setup
- Factory patterns for test data creation
- Database seeds for integration tests
- Mock data generators
- Consistent test datasets

### Cleanup
- Automatic rollback after integration tests
- Database snapshot restoration
- Mock server reset

## Coverage Goals

| Layer | Target | Tool |
|-------|--------|------|
| Frontend Unit | 80% | Jest |
| Backend Unit | 85% | JaCoCo |
| Frontend Integration | 70% | React Testing Library |
| Backend Integration | 75% | Spring Boot Test |
| E2E Critical Paths | 100% | Playwright |

## Continuous Improvement

- Weekly coverage review
- Test failure analysis
- Performance trend tracking
- Bug to test ratio monitoring
- Test efficiency optimization
