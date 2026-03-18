# Backend Services & Implementation Guide

## Overview

This document outlines the backend service layer architecture, implementation patterns, and guidelines for Calendar AI.

## Service Layer Architecture

### Layered Architecture Pattern

```
Controller Layer (REST Endpoints)
        ↓
Application Service Layer (Use Cases & Orchestration)
        ↓
Domain Service Layer (Core Business Logic)
        ↓
Repository Layer (Data Access)
        ↓
Database / External Services
```

## Core Services

### 1. UserService

**Responsibilities**:
- User registration and authentication
- Profile management
- Preference management

**Key Methods**:
```java
public class UserService {
  public User registerUser(RegisterUserCommand command);
  public AuthToken login(LoginCommand command);
  public User getCurrentUser();
  public void updateProfile(UpdateProfileCommand command);
  public UserPreferences getPreferences();
  public void updatePreferences(UpdatePreferencesCommand command);
}
```

**Dependencies**:
- UserRepository
- PasswordEncoder
- TokenProvider (JWT)
- EmailService

### 2. CalendarService

**Responsibilities**:
- Calendar CRUD operations
- Multi-calendar management
- Calendar metadata handling

**Key Methods**:
```java
public class CalendarService {
  public Calendar createCalendar(CreateCalendarCommand command);
  public Calendar getCalendar(UUID calendarId);
  public List<Calendar> getUserCalendars(UUID userId);
  public void updateCalendar(UUID calendarId, UpdateCalendarCommand command);
  public void deleteCalendar(UUID calendarId);
  public void setDefaultCalendar(UUID calendarId);
}
```

**Dependencies**:
- CalendarRepository
- UserService
- ValidationService

### 3. EventService

**Responsibilities**:
- Event CRUD operations
- Recurring event expansion
- Event notifications

**Key Methods**:
```java
public class EventService {
  public Event createEvent(CreateEventCommand command);
  public Event getEvent(UUID eventId);
  public List<Event> getCalendarEvents(UUID calendarId, LocalDate startDate, LocalDate endDate);
  public void updateEvent(UUID eventId, UpdateEventCommand command);
  public void deleteEvent(UUID eventId, boolean notifyAttendees);
  public List<Event> expandRecurringEvent(Event event, LocalDate startDate, LocalDate endDate);
}
```

**Dependencies**:
- EventRepository
- CalendarService
- AttendeeService
- NotificationService
- RecurrenceService

### 4. SharingService

**Responsibilities**:
- Permission management
- Share URL generation
- Access control

**Key Methods**:
```java
public class SharingService {
  public void shareCalendar(UUID calendarId, ShareCalendarCommand command);
  public List<Permission> getPermissions(UUID calendarId);
  public void updatePermission(UUID calendarId, UUID userId, PermissionLevel level);
  public void removePermission(UUID calendarId, UUID userId);
  public String generateShareToken(UUID calendarId, PermissionLevel level);
  public boolean validateShareToken(String token);
}
```

**Dependencies**:
- PermissionRepository
- ShareTokenRepository
- UserService
- NotificationService

### 5. ImportExportService

**Responsibilities**:
- Calendar import/export
- Format conversion
- Data validation

**Key Methods**:
```java
public class ImportExportService {
  public CalendarImportResult importCalendar(CalendarImportCommand command);
  public InputStream exportCalendar(UUID calendarId, ExportFormat format);
  public List<Event> parseICalFile(MultipartFile file);
  public String generateICalContent(Calendar calendar, List<Event> events);
}
```

**Dependencies**:
- EventRepository
- CalendarRepository
- CalendarFileParser (iCal, CSV, JSON)

### 6. NotificationService

**Responsibilities**:
- Event notifications
- Email notifications
- Real-time alerts

**Key Methods**:
```java
public class NotificationService {
  public void notifyEventCreated(Event event);
  public void notifyEventUpdated(Event event, Event previousEvent);
  public void notifyEventDeleted(Event event);
  public void notifyAttendeeAdded(Attendee attendee);
  public void sendEventReminder(Event event);
}
```

**Dependencies**:
- EmailService
- WebSocketService
- NotificationRepository
- SchedulingService

### 7. IntegrationService

**Responsibilities**:
- Third-party calendar integrations
- OAuth handling
- Webhook management

**Key Methods**:
```java
public class IntegrationService {
  public void connectGoogleCalendar(OAuth2Token token);
  public void connectOutlookCalendar(OAuth2Token token);
  public List<Event> syncExternalCalendar(ExternalCalendarProvider provider);
  public void setupWebhook(WebhookConfig config);
}
```

**Dependencies**:
- OAuth2Client
- ExternalCalendarConnector
- WebhookRepository
- EventSyncService

## Domain Models

### User Entity

```java
@Entity
@Table(name = "users")
public class User {
  @Id
  private UUID id;
  
  @Column(unique = true, nullable = false)
  private String email;
  
  @Column(nullable = false)
  private String passwordHash;
  
  private String firstName;
  private String lastName;
  private String profilePictureUrl;
  private String timezone;
  
  @CreationTimestamp
  private LocalDateTime createdAt;
  
  @UpdateTimestamp
  private LocalDateTime updatedAt;
  
  @SoftDelete
  private LocalDateTime deletedAt;
  
  // Relationships
  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  private List<Calendar> calendars;
  
  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  private List<Permission> permissions;
}
```

### Calendar Entity

```java
@Entity
@Table(name = "calendars")
public class Calendar {
  @Id
  private UUID id;
  
  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User owner;
  
  @Column(nullable = false)
  private String name;
  
  private String description;
  private String color;
  private boolean isDefault;
  private boolean isPublic;
  
  @CreationTimestamp
  private LocalDateTime createdAt;
  
  @UpdateTimestamp
  private LocalDateTime updatedAt;
  
  // Relationships
  @OneToMany(mappedBy = "calendar", cascade = CascadeType.ALL)
  private List<Event> events;
  
  @OneToMany(mappedBy = "calendar")
  private List<Permission> permissions;
  
  @OneToMany(mappedBy = "calendar")
  private List<ShareToken> shareTokens;
}
```

### Event Entity

```java
@Entity
@Table(name = "events")
@Index(name = "idx_calendar_start", columnList = "calendar_id, start_time")
public class Event {
  @Id
  private UUID id;
  
  @ManyToOne
  @JoinColumn(name = "calendar_id", nullable = false)
  private Calendar calendar;
  
  @Column(nullable = false)
  private String title;
  
  private String description;
  private String location;
  
  @Column(nullable = false)
  private LocalDateTime startTime;
  
  @Column(nullable = false)
  private LocalDateTime endTime;
  
  private boolean isRecurring;
  private String recurrenceRule;
  
  @Enumerated(EnumType.STRING)
  private EventStatus status;
  
  @ManyToOne
  @JoinColumn(name = "created_by_id")
  private User createdBy;
  
  @CreationTimestamp
  private LocalDateTime createdAt;
  
  @UpdateTimestamp
  private LocalDateTime updatedAt;
  
  // Relationships
  @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
  private List<Attendee> attendees;
}
```

## Repository Pattern

### Repository Interface

```java
@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
  List<Event> findByCalendarIdAndStartTimeGreaterThanEqualAndEndTimeLessThan(
    UUID calendarId,
    LocalDateTime startTime,
    LocalDateTime endTime,
    Pageable pageable
  );
  
  @Query("SELECT e FROM Event e WHERE e.calendar.id = :calendarId AND e.status = 'PUBLISHED'")
  List<Event> findPublishedEvents(@Param("calendarId") UUID calendarId);
  
  @Query(value = "SELECT * FROM events WHERE recurring_event_id = :recurringEventId", 
         nativeQuery = true)
  List<Event> findRecurrenceInstances(@Param("recurringEventId") UUID recurringEventId);
}
```

## Application Service Pattern

### Command Pattern

```java
// Commands
public record CreateEventCommand(
  UUID calendarId,
  String title,
  String description,
  String location,
  LocalDateTime startTime,
  LocalDateTime endTime,
  List<AttendeeInfo> attendees
) {}

// Command Handler / Application Service
@Service
@Transactional
public class CreateEventHandler {
  private final EventRepository eventRepository;
  private final EventDomainService eventDomainService;
  private final NotificationService notificationService;
  
  public Event handle(CreateEventCommand command) {
    // Validate
    eventDomainService.validateEventTimes(command.startTime(), command.endTime());
    
    // Create
    Event event = Event.create(command);
    
    // Persist
    eventRepository.save(event);
    
    // Notify
    notificationService.notifyEventCreated(event);
    
    return event;
  }
}
```

### Query Pattern

```java
// Queries
public record GetEventsByDateRangeQuery(
  UUID calendarId,
  LocalDate startDate,
  LocalDate endDate,
  int page,
  int size
) {}

// Query Handler
@Service
@Transactional(readOnly = true)
public class GetEventsByDateRangeHandler {
  private final EventRepository eventRepository;
  
  public Page<EventDto> handle(GetEventsByDateRangeQuery query) {
    Pageable pageable = PageRequest.of(query.page(), query.size());
    
    return eventRepository
      .findByCalendarIdAndStartTimeGreaterThanEqualAndEndTimeLessThan(
        query.calendarId(),
        query.startDate().atStartOfDay(),
        query.endDate().atTime(23, 59, 59),
        pageable
      )
      .map(EventDto::from);
  }
}
```

## Validation Pattern

### Custom Validators

```java
@Validated
public class EventValidator {
  
  @Transactional(readOnly = true)
  public void validateEventTimes(LocalDateTime start, LocalDateTime end) {
    if (start.isAfter(end)) {
      throw new InvalidEventException("Start time must be before end time");
    }
    
    if (start.isBefore(LocalDateTime.now())) {
      throw new InvalidEventException("Cannot create events in the past");
    }
  }
  
  @Transactional(readOnly = true)
  public void validateCalendarOwnership(UUID calendarId, User user) {
    Calendar calendar = calendarRepository.findById(calendarId)
      .orElseThrow(() -> new ResourceNotFoundException("Calendar not found"));
    
    if (!calendar.getOwner().getId().equals(user.getId())) {
      throw new AccessDeniedException("User does not own this calendar");
    }
  }
}
```

## Exception Handling

### Custom Exceptions

```java
public abstract class BusinessException extends RuntimeException {
  public abstract String getCode();
  public abstract HttpStatus getHttpStatus();
}

public class ResourceNotFoundException extends BusinessException {
  private String resourceType;
  
  @Override
  public String getCode() {
    return "RESOURCE_NOT_FOUND";
  }
  
  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.NOT_FOUND;
  }
}

public class AccessDeniedException extends BusinessException {
  @Override
  public String getCode() {
    return "ACCESS_DENIED";
  }
  
  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.FORBIDDEN;
  }
}
```

### Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
    ErrorResponse error = new ErrorResponse(
      ex.getCode(),
      ex.getMessage()
    );
    return ResponseEntity
      .status(ex.getHttpStatus())
      .body(error);
  }
  
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationException(
    MethodArgumentNotValidException ex) {
    List<FieldError> errors = ex.getBindingResult().getFieldErrors();
    ErrorResponse error = new ErrorResponse(
      "VALIDATION_ERROR",
      "Validation failed",
      errors.stream()
        .map(e -> new ErrorDetail(e.getField(), e.getDefaultMessage()))
        .collect(Collectors.toList())
    );
    return ResponseEntity.badRequest().body(error);
  }
}
```

## Configuration Management

### Spring Configuration

```java
@Configuration
public class ApplicationConfig {
  
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
  
  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
  
  @Bean
  public JavaMailSender mailSender() {
    return new JavaMailSenderImpl();
  }
  
  @Bean
  public TaskExecutor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);
    executor.setMaxPoolSize(10);
    executor.setQueueCapacity(100);
    executor.initialize();
    return executor;
  }
}
```

### Application Properties

```yaml
# application-prod.yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQL10Dialect
        show_sql: false
        format_sql: true
  
  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT}
    password: ${REDIS_PASSWORD}

server:
  port: 8080
  servlet:
    context-path: /api/v1

logging:
  level:
    root: INFO
    com.calendarai: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## Testing Best Practices

### Unit Test Template

```java
@DisplayName("EventService")
class EventServiceTest {
  
  private EventService eventService;
  private EventRepository eventRepository;
  private EventValidator eventValidator;
  
  @BeforeEach
  void setup() {
    eventRepository = mock(EventRepository.class);
    eventValidator = mock(EventValidator.class);
    eventService = new EventService(eventRepository, eventValidator);
  }
  
  @Nested
  @DisplayName("create event")
  class CreateEvent {
    
    @Test
    @DisplayName("should create event with valid data")
    void shouldCreateEventWithValidData() {
      // Arrange
      CreateEventCommand command = new CreateEventCommand(...);
      Event expectedEvent = Event.create(command);
      when(eventRepository.save(any())).thenReturn(expectedEvent);
      
      // Act
      Event result = eventService.createEvent(command);
      
      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getTitle()).isEqualTo(command.title());
      verify(eventRepository).save(any());
    }
  }
}
```

### Integration Test Template

```java
@SpringBootTest
@Testcontainers
class EventServiceIntegrationTest {
  
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>()
    .withDatabaseName("test_db")
    .withUsername("test")
    .withPassword("test");
  
  @Autowired
  private EventService eventService;
  
  @Autowired
  private EventRepository eventRepository;
  
  @Test
  void shouldPersistAndRetrieveEvent() {
    // Arrange
    Event event = Event.create(...);
    
    // Act
    Event saved = eventRepository.save(event);
    Event retrieved = eventRepository.findById(saved.getId()).orElseThrow();
    
    // Assert
    assertThat(retrieved.getId()).isEqualTo(saved.getId());
    assertThat(retrieved.getTitle()).isEqualTo(event.getTitle());
  }
}
```

## Performance Optimization

### Caching Strategy

```java
@Service
public class CalendarService {
  
  @Cacheable(value = "calendars", key = "#calendarId")
  public Calendar getCalendar(UUID calendarId) {
    return calendarRepository.findById(calendarId)
      .orElseThrow();
  }
  
  @CacheEvict(value = "calendars", key = "#calendarId")
  public void updateCalendar(UUID calendarId, UpdateCalendarCommand command) {
    // Update logic
  }
}
```

### Query Optimization

```java
@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
  
  @Query("""
    SELECT DISTINCT e 
    FROM Event e 
    LEFT JOIN FETCH e.attendees 
    WHERE e.calendar.id = :calendarId 
    AND e.startTime >= :startTime 
    AND e.endTime <= :endTime
    """)
  List<Event> findWithAttendees(
    @Param("calendarId") UUID calendarId,
    @Param("startTime") LocalDateTime startTime,
    @Param("endTime") LocalDateTime endTime
  );
}
```

## Deployment Readiness

### Health Checks

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
  
  @Autowired
  private DatabaseService databaseService;
  
  @Override
  public Health health() {
    try {
      databaseService.ping();
      return Health.up().build();
    } catch (Exception e) {
      return Health.down().withDetail("error", e.getMessage()).build();
    }
  }
}
```

### Metrics

```java
@Component
public class EventMetrics {
  
  private final MeterRegistry meterRegistry;
  
  public EventMetrics(MeterRegistry meterRegistry) {
    this.meterRegistry = meterRegistry;
  }
  
  public void recordEventCreation() {
    Counter.builder("events.created")
      .description("Total events created")
      .register(meterRegistry)
      .increment();
  }
}
```
