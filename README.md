# Join – Kanban Board Application

A collaborative task management system built with Angular 21 and Supabase, featuring drag-and-drop functionality and real-time updates.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 21, TypeScript, SCSS |
| UI Framework | Bootstrap 5 |
| Backend | Supabase (BaaS) |
| State Management | Angular Signals |
| Version Control | Git (single main branch) |

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd join

# Install dependencies (supabase)
npm install

# Install Bootstrap 5
npm install bootstrap@5 @popperjs/core

# Start development server
npm start
```

### Bootstrap Integration

Add to `angular.json`:

```json
"styles": [
  "src/styles.scss"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

## Project Architecture

```
join/
├── public/
│   └── assets/
│       ├── fonts/
│       ├── icons/
│       └── styles/
├── src/
│   ├── app/
│   │   ├── components/      # Reusable form components (add/edit contact)
│   │   ├── core/            # Core utilities & services
│   │   │   ├── constants/   # App-wide constants (colors, etc.)
│   │   │   ├── db/          # Supabase database services
│   │   │   └── utils/       # Validation & helper functions
│   │   ├── interfaces/      # TypeScript interfaces & types
│   │   ├── layout/          # Layout shell (header, navigation)
│   │   ├── pages/           # Route-level components
│   │   ├── services/        # Application-level services
│   │   └── shared/          # Shared UI components
│   │       └── ui/          # Button, Card, Input, Modal, Feedback
│   ├── environments/        # Environment configuration
│   ├── styles/              # Global style partials
│   └── styles.scss
```

## Development Workflow

- **Task Management:** Trello (Kanban)
- **Collaboration:** Daily standups
- **Commits:** Descriptive messages, one commit per work session minimum
- **Code Standard:** JSDoc documentation, camelCase, max 14 lines per function

## Features

- Single Page Application (SPA)
- Drag & drop task cards
- Responsive design (320px – 1440px)
- Accessible HTML (WCAG compliant)
- Contact management with form validation
- Real-time updates via Signals

## Design

UI components follow Figma specifications. Interactive elements include hover states and toast notifications with 75–125ms transitions.

## Environment

Create `src/environments/env.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

## Browser Support

Chrome, Firefox, Edge, Safari (latest versions)

---

**Team Project** · DA Web Development Frontend
