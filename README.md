# Join – Kanban Board Application

A collaborative task management system built with Angular 21 and Supabase, featuring drag-and-drop functionality and real-time updates.

## Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | Angular 21, TypeScript, SCSS |
| UI Framework     | Bootstrap 5                  |
| Backend          | Supabase (BaaS)              |
| State Management | Angular Signals              |
| Version Control  | Git (single main branch)     |

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd join

# Install dependencies (supabase, bootstrap, ng cdk ..)
npm install

# Start development server
npm start

# Start production server
ng build --configuration=production && npx http-server dist/join/browser
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
│   │   ├── components/           # Form components
│   │   │   ├── contact-add-form/
│   │   │   ├── contact-edit-form/
│   │   │   ├── login-form/
│   │   │   ├── signup-form/
│   │   │   └── task-add-form/
│   │   ├── core/                 # Core utilities & services
│   │   │   ├── constants/        # App-wide constants (colors, etc.)
│   │   │   ├── db/               # Supabase database services
│   │   │   ├── guards/           # Route guards (auth)
│   │   │   └── utils/            # Validation & helper functions
│   │   ├── interfaces/           # TypeScript interfaces & types
│   │   ├── layout/               # Layout shell
│   │   │   ├── header/           # App header with user menu
│   │   │   └── navi/             # Sidebar navigation
│   │   ├── pages/                # Route-level components
│   │   │   ├── add-task/
│   │   │   ├── board/            # Kanban board
│   │   │   │   ├── task-board/
│   │   │   │   ├── task-card/
│   │   │   │   └── task-detail/
│   │   │   ├── contacts/         # Contact management
│   │   │   │   ├── contact-details/
│   │   │   │   ├── contact-header/
│   │   │   │   └── contact-list/
│   │   │   ├── help/
│   │   │   ├── legal-notice/
│   │   │   ├── login/
│   │   │   ├── privacy-policy/
│   │   │   ├── signup/
│   │   │   └── summary/
│   │   ├── services/             # Pipes, directives, Supabase service
│   │   ├── shared/               # Shared UI components
│   │   │   └── ui/
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── forms/        # Reusable form controls
│   │   │       │   ├── back-button/
│   │   │       │   ├── contact-picker/
│   │   │       │   ├── input-field/
│   │   │       │   ├── select/
│   │   │       │   ├── subtask-input-group/
│   │   │       │   └── textarea/
│   │   │       ├── modal-wrapper/
│   │   │       └── user-feedback/
│   │   └── tests/
│   ├── environments/             # Environment configuration
│   ├── styles/                   # Global style partials
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
- All forms with validation
- Real-time updates via Signals

## Design

UI components follow Figma specifications. Interactive elements include hover states and toast notifications with 75–125ms transitions.

## Environment

Create `src/environments/env.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

## Browser Support

Chrome, Firefox, Edge, Safari (latest versions)

---

**Team Project** · DA Web Development Frontend
