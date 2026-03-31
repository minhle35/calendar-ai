# Backend Setup Guide

Step-by-step documentation of how the Java Spring Boot backend was scaffolded, what each file does, and the reasoning behind each configuration choice.

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Java JDK | 17+ (LTS) | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| IDE | IntelliJ IDEA recommended | — |

---

## Step 1 — Create the Directory Structure

```bash
mkdir -p backend/src/main/java/com/calendarai/{config,entity,enums,repository,dto,service,controller,exception}
mkdir -p backend/src/main/resources
mkdir -p backend/src/test/java/com/calendarai/{controller,service}
```

This creates the standard Maven source layout:
- `src/main/java` — application source code
- `src/main/resources` — config files (`application.properties`, `data.sql`)
- `src/test/java` — test classes mirroring the main package structure

**Why this package structure?**
`com.calendarai` is the base package. Sub-packages map to architectural layers:

```
com.calendarai/
├── config/       → Spring configuration beans (CORS, security, etc.)
├── entity/       → JPA-managed database entities
├── enums/        → Shared enumerations (e.g. RsvpStatus)
├── repository/   → Spring Data JPA interfaces
├── dto/          → Data Transfer Objects (API request/response shapes)
├── service/      → Business logic
├── controller/   → REST endpoint handlers
└── exception/    → Custom exceptions and global error handler
```

---

## Step 2 — Create `pom.xml`

**File:** `backend/pom.xml`

The POM (Project Object Model) is Maven's build descriptor. It defines the project identity, Java version, dependencies, and build plugins.

### Parent declaration

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.3</version>
</parent>
```

Inheriting from `spring-boot-starter-parent` gives you:
- Pre-configured dependency version management (no need to specify versions for Spring dependencies)
- Sensible Maven plugin defaults (compiler plugin set to Java 17, resource filtering, etc.)
- UTF-8 encoding defaults
- ```<groupId>org.springframework.boot```: an address for finding a library on the Internet
- ```Maven``` downloads dependencies from a central repository (like an appstore for Java libraries)

```
<groupId></groupId> <!-- WHO made it - the organization -->
<artifact></artifact> <!-- WHAT is it - the libraries -->
```

```org.springframework.boot``` is Spring's company name in Maven terms.

### Java version property

```xml
<properties>
    <java.version>17</java.version>
</properties>
```

Tells the Maven compiler plugin to compile to Java 17 bytecode. Java 17 is the current LTS release and required for Spring Boot 3.x.

### Dependencies explained

```xml
<!-- Spring MVC + embedded Tomcat server -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
Provides: `@RestController`, `@RequestMapping`, `ResponseEntity`, embedded Tomcat on port 8080.

```xml
<!-- JPA + Hibernate ORM -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
Provides: `@Entity`, `@Repository`, `JpaRepository<T, ID>`, Hibernate as the JPA provider, connection pooling via HikariCP.

```xml
<!-- JSR-380 Bean Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```
Provides: `@Valid`, `@NotNull`, `@NotBlank`, `@Size` etc. on request body fields. Spring MVC automatically validates `@RequestBody` arguments annotated with `@Valid`.

```xml
<!-- H2 in-memory database (runtime only) -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```
An embedded Java database. `scope=runtime` means it is available when the app runs but not compiled against directly. Used here so the app runs without any external database setup.
**Not for production** — replace with PostgreSQL driver in the `prod` profile.

```xml
<!-- Lombok code generation -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```
Generates boilerplate at compile time via annotations:
- `@Getter` / `@Setter` — generates getters and setters
- `@NoArgsConstructor` — generates a no-arg constructor (required by JPA)
- `@AllArgsConstructor` — all-fields constructor
- `@Builder` — builder pattern

`optional=true` means it does not propagate to projects that depend on this one.

```xml
<!-- Test dependencies: JUnit 5, Mockito, MockMvc -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```
Provides: `@SpringBootTest`, `@WebMvcTest`, `MockMvc`, `Mockito`, `AssertJ`, `JUnit 5`.

### Build plugin

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>
```

The Spring Boot Maven plugin packages the app as a fat executable JAR (`mvn package` → `target/calendar-ai-backend-0.0.1-SNAPSHOT.jar`). Lombok is excluded from the final JAR since it is only needed at compile time.

### Commands

```bash
# Compile and run all tests
mvn clean test

# Package into a runnable JAR
mvn clean package

# Run the application directly via Maven
mvn spring-boot:run

# Skip tests during packaging
mvn clean package -DskipTests
```

---

## Step 3 — Create `application.properties`

**File:** `backend/src/main/resources/application.properties`

Spring Boot auto-reads this file on startup. Each property maps to a Spring auto-configuration class.

### Server

```properties
server.port=8080
```
Tomcat listens on port 8080. Change to `8081` if another service already occupies 8080.

### H2 datasource

```properties
spring.datasource.url=jdbc:h2:mem:calendardb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```

- `mem:calendardb` — in-memory database named `calendardb`
- `DB_CLOSE_DELAY=-1` — keep the database alive as long as the JVM runs
- `DB_CLOSE_ON_EXIT=FALSE` — do not close when the last connection closes

### JPA / Hibernate

```properties
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
```

| Setting | Value | Meaning |
|---|---|---|
| `database-platform` | `H2Dialect` | Hibernate generates H2-compatible SQL |
| `ddl-auto` | `create-drop` | Schema is created on startup, dropped on shutdown |
| `show-sql` | `false` | Set to `true` during debugging to print every SQL statement |

> **Production note:** `ddl-auto=create-drop` destroys data on every restart.
> For production, use `validate` with Flyway or Liquibase managing schema migrations.

### H2 Console

```properties
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Enables a browser-based SQL console at `http://localhost:8080/h2-console`.
Use JDBC URL `jdbc:h2:mem:calendardb`, username `sa`, empty password to connect.

> **Production note:** Disable this entirely (`enabled=false`). It is a security risk in public environments.

### Seed data ordering

```properties
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true
```

`defer-datasource-initialization=true` ensures Hibernate creates the schema from `@Entity` classes **before** Spring runs `data.sql`. Without this, `data.sql` executes against an empty schema and fails.

---

## Step 4 — Create Base Package - src/main/java/com/calendarai/
`CalendarAiApplication.java`


**File:** `backend/src/main/java/com/calendarai/CalendarAiApplication.java`

```java
@SpringBootApplication
public class CalendarAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(CalendarAiApplication.class, args);
    }
}
```

`@SpringBootApplication` is a composed annotation equivalent to:
- `@Configuration` — this class can define `@Bean` methods
- `@EnableAutoConfiguration` — Spring Boot auto-configures beans based on classpath
- `@ComponentScan` — scans `com.calendarai` and all sub-packages for Spring components

The `main` method is the JVM entry point. `SpringApplication.run` bootstraps the entire application context.

---

## Step 5 — Create Config Class: a spring bean that sets up CORS rules `CorsConfig.java`

**File:** `backend/src/main/java/com/calendarai/config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
```

**Why is CORS needed?**
Browsers block JavaScript from calling APIs on a different origin (domain/port). The React frontend runs on `localhost:3000` while this backend runs on `localhost:8080` — different ports = different origins = CORS required.

**What each setting does:**

| Setting | Current (dev) | Recommended (prod) |
|---|---|---|
| `addMapping("/api/**")` | Applies CORS only to API routes | Same |
| `allowedOrigins("*")` | Any origin can call the API | `"https://calendar-ai.com"` |
| `allowedMethods(...)` | Explicit HTTP verbs | Same |
| `allowedHeaders("*")` | Any request header | Explicit list |

> **Production note:** Replace `allowedOrigins("*")` with the exact frontend URL.
> If using JWT in cookies, add `.allowCredentials(true)` and change to `.allowedOriginPatterns("https://*.calendar-ai.com")` — wildcard origins are incompatible with `allowCredentials(true)`.

---

## How to Run

```bash
cd backend

# Run with Maven
mvn spring-boot:run

# Or build a JAR and run it
mvn clean package -DskipTests
java -jar target/calendar-ai-backend-0.0.1-SNAPSHOT.jar
```

Once running:
- API base: `http://localhost:8080/api/v1`
- H2 console: `http://localhost:8080/h2-console`

---

## What Comes Next

| Step | Files |
|---|---|
| Enums & Entities | `RsvpStatus`, `User`, `Calendar`, `Event`, `Participant`, `UserPreference` |
| Repositories | One `JpaRepository` interface per entity |
| DTOs | Java records for request/response shapes |
| Services | Business logic layer |
| Controllers | REST endpoints |
| Seed data | `data.sql` — sample user, calendars, events |
