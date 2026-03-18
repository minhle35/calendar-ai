# Calendar AI - Documentation

A modern, business-focused calendar management web application designed for professionals to manage, share, and collaborate on events with clients and partners.

## Quick Links

- [Frontend Design](./frontend/DESIGN.md)
- [Backend Design](./backend/DESIGN.md)
- [API Specification](./api/README.md)
- [Architecture Overview](./architecture/README.md)
- [Testing Strategy](./testing/README.md)
- [Deployment Guide](./deployment/README.md)

## Project Vision

Calendar AI enables business professionals to:
- **Ingest** calendar data from multiple sources
- **Manage** events with intelligent, intuitive interfaces
- **Export** calendars to local storage or shareable URLs
- **Collaborate** with clients and partners seamlessly
- **Schedule** important business events effortlessly

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Testing**: Playwright
- **UI Philosophy**: Modern, minimalist design focused on usability
- **State Management**: TBD
- **Build Tool**: TBD

### Backend
- **Language**: Java Enterprise Edition
- **Testing**: JUnit, Mockito, Integration Tests
- **Architecture**: Clean Architecture / Hexagonal Architecture
- **Database**: TBD
- **API**: RESTful

## Core Features

1. **Calendar Management**
   - Create, read, update, delete events
   - Multi-calendar support
   - Event categorization and tagging

2. **Import/Export**
   - Import from iCal, Google Calendar, Outlook
   - Export to local formats (iCal, JSON, CSV)
   - API-based import/export

3. **Sharing & Collaboration**
   - Generate shareable URLs
   - Permission levels (view-only, edit, admin)
   - Real-time collaboration notifications

4. **User Experience**
   - Responsive design across devices
   - Keyboard navigation support
   - Accessibility compliance (WCAG 2.1 AA)
   - Dark/Light mode support

## Documentation Structure

```
docs/
├── architecture/          # System design and architecture diagrams
├── api/                  # API specifications and endpoints
├── frontend/             # Frontend design and components
├── backend/              # Backend design and services
├── testing/              # Testing strategies and guides
├── deployment/           # Deployment procedures
└── README.md            # This file
```

## Getting Started

1. Review [Architecture Overview](./architecture/README.md)
2. Understand [Frontend Design](./frontend/DESIGN.md)
3. Review [Backend Design](./backend/DESIGN.md)
4. Check [API Specification](./api/README.md)
5. Review testing strategies in [Testing Guide](./testing/README.md)

## Design Principles

### User-First Approach
- Minimize cognitive load
- Intuitive navigation
- Business context-aware UX

### Performance
- Optimized frontend rendering
- Efficient backend queries
- Scalable architecture

### Quality
- Comprehensive test coverage
- Automated testing pipelines
- Code review standards

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
