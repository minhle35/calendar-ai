## Database Column in Entity - ```@Column```, ```@PrePersist```, ```@PreUpdate```
### 1. ```@Column```
- This is ```JPA (Java Persistent API)```. A specification that defines how Java objects map to database tables. We use ```Hibernate``` - the most common implementation of JPA. These are annotations telling JPA/Hibernate how to handle the Entities

```java
@Column(name="first_name", nullable = false)
private String firstName;
```

- Use ```@Column``` to let JPA map the field to a column with naming strategy, explicit about nullability
- ```nullale```, ```unique```, ```updatable```

### 2. ```@PrePersist```

- This is a lifecycle callback that runs automatically just before a new entity is inserted into the database for the ```first time```

```java
@PrePersist
protected void onCreate(){
    this.createdAt = LocalDateTime.now();
    this.updateAt = LocalDateTime.now();
    if (this.profilePictureUrl == null){
        this.profilePictureUrl = generateAvatarUrl(this.email);
    }
}
```

the process will be 
```

userRepository.save(newUser)
        ↓
Hibernate prepares INSERT statement
        ↓
@PrePersist fires ← runs the onCreate() method
        ↓
INSERT INTO users (...) VALUES (...)  ← now includes createdAt, updatedAt, profilePictureUrl

```

By using ```@PrePersist```, we never have to manually set ```createdAt``` in the service (wherever using this entity) or constructor. So there is a layer created here for us to create this field

- Same with ```@PreUpdate```

### 3. ```@PreUpdate```
- This is fired just before an existing entity is ```updated```

```java
@PreUpdate
protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
}
```

The flow:
```
userRepository.save(existingUser)
        ↓
Hibernate detects changes (dirty checking)
        ↓
@PreUpdate fires ← runs your onUpdate() method
        ↓
UPDATE users SET updated_at = NOW(), ... WHERE user_id = '...'
```

## All JPA Lifecycle Callbacks

`@PrePersist` and `@PreUpdate` are part of a larger family worth knowing:

| Annotation | Fires |
|---|---|
| `@PrePersist` | Before INSERT |
| `@PostPersist` | After INSERT |
| `@PreUpdate` | Before UPDATE |
| `@PostUpdate` | After UPDATE |
| `@PreRemove` | Before DELETE |
| `@PostRemove` | After DELETE |
| `@PostLoad` | After entity is loaded from DB |

Use case (other callbacks than PrePersist, PreUpdate): audit logging, cache invalidation, or cleanup logic on delete.

---
