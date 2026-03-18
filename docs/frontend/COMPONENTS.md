# Frontend Components & UI Guidelines

## Overview

This document outlines the frontend component structure, UI patterns, and guidelines for Calendar AI.

## Component Library Structure

### Atoms (Base Components)

Smallest, most reusable components without dependencies on other components.

**Button**
- Variants: primary, secondary, tertiary, danger
- Sizes: sm, md, lg
- States: default, hover, focus, disabled, loading
- Props: onClick, disabled, loading, type

**Input Field**
- Types: text, email, password, number, date, time, search
- Variants: default, error, success
- Props: placeholder, value, onChange, onBlur, disabled, error

**Label**
- Props: htmlFor, text, required

**Icon**
- Props: name, size, color, onClick

**Badge**
- Props: label, variant (info, success, warning, error), size

**Spinner**
- Props: size, color

### Molecules (Simple Component Groups)

Collections of atoms bonded together by a functional purpose.

**Form Group**
- Composition: Label + Input + Error Message
- Props: label, error, required, helpText

**Search Bar**
- Composition: Input + Icon + Clear Button
- Props: placeholder, onSearch, value, onChange

**Breadcrumb**
- Composition: Breadcrumb items with separators
- Props: items (array of {label, path})

**Card**
- Composition: Container + optional header/footer
- Props: title, children, footer, onClick, hoverable

**Modal Header/Footer**
- Composition: Title + Close button / Action buttons

### Organisms (Complex Components)

Large, complex components composed of molecules and/or atoms.

**Calendar Grid**
- Displays month/week/day calendar view
- Props: date, events, onDateSelect, onEventClick, view (month/week/day)

**Event Form**
- Multi-field form for creating/editing events
- Props: initialData, onSubmit, onCancel, loading

**Navigation Header**
- Top navigation with logo, menu, user profile
- Props: user, onLogout

**Sidebar**
- Navigation menu with calendar list
- Props: calendars, selectedCalendar, onSelectCalendar, onCreateCalendar

**Event Card**
- Event information display
- Props: event, onClick, onDelete, onEdit

**Permission Manager**
- List of shared users with permission levels
- Props: permissions, onUpdate, onDelete, onAdd

## Page Layouts

### Dashboard Page
```
┌─────────────────────────────────────────┐
│            Navigation Header            │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │      Main Content Area           │
│ bar  │      (Calendar Overview)         │
│      │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

### Calendar Page
```
┌─────────────────────────────────────────┐
│            Navigation Header            │
├──────┬──────────────────────────────────┤
│      │        Calendar Toolbar          │
│ Side │    (Month/Week/Day picker)       │
│ bar  ├──────────────────────────────────┤
│      │                                  │
│      │      Calendar Grid View          │
│      │      (Events displayed)          │
│      │                                  │
└──────┴──────────────────────────────────┘
```

## Design Tokens

### Color Variables
```css
/* Neutral */
--color-text-primary: #1a1a1a;
--color-text-secondary: #666666;
--color-text-tertiary: #999999;

--color-bg-primary: #ffffff;
--color-bg-secondary: #f5f5f5;
--color-bg-tertiary: #eeeeee;

--color-border: #e0e0e0;
--color-border-strong: #cccccc;

/* Interactive */
--color-primary: #0066cc;
--color-primary-light: #e6f0ff;
--color-primary-dark: #004d99;

--color-success: #00cc66;
--color-warning: #ffaa00;
--color-error: #cc0000;
--color-info: #0099cc;
```

### Typography
```css
/* Font Families */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;

/* Font Sizes */
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing
```css
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## State Management Pattern

### Redux/Context Flow

```
Component
    ↓
Dispatch Action
    ↓
Reducer
    ↓
Update State
    ↓
Component Re-render
```

## Responsive Design Breakpoints

```css
/* Mobile First */
$breakpoint-sm: 640px;   /* Small devices */
$breakpoint-md: 768px;   /* Tablets */
$breakpoint-lg: 1024px;  /* Desktops */
$breakpoint-xl: 1280px;  /* Large screens */
```

## Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Color is not the only indicator of state
- [ ] Focus indicators are visible
- [ ] ARIA labels present on icons
- [ ] Form fields properly labeled
- [ ] Image alt text provided
- [ ] Heading hierarchy logical
- [ ] Contrast ratio ≥ 4.5:1 for text
- [ ] Touch targets ≥ 48px

## Performance Optimization

### Code Splitting
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendar = lazy(() => import('./pages/Calendar'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/calendar" element={<Calendar />} />
  </Routes>
</Suspense>
```

### Memoization
```typescript
const EventCard = memo(({ event, onSelect }) => {
  return <div onClick={() => onSelect(event)}>{event.title}</div>;
}, (prev, next) => {
  return prev.event.id === next.event.id;
});
```

### Virtual Scrolling (for long lists)
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={events.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <EventItem style={style} event={events[index]} />
  )}
</FixedSizeList>
```

## Form Validation

### Pattern
```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

const validate = (value, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required && !value) return 'This field is required';
    if (rule.minLength && value.length < rule.minLength) 
      return `Minimum ${rule.minLength} characters`;
    if (rule.pattern && !rule.pattern.test(value)) 
      return 'Invalid format';
  }
  return null;
};
```

## Storybook Documentation

All components documented in Storybook with:
- Primary usage example
- All variants
- Interactive controls
- Accessibility panel
- Code snippet

```typescript
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://figma.com/...'
    }
  }
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
};
```
