# ⚡ Taskly | Premium Task Management Platform

Taskly is a visually stunning, responsive, and feature-rich Single Page Application (SPA) designed to manage projects, checklist subtasks, calendars, analytics graphs, and user profiles in a seamless, glassmorphic workspace.

Built with **React**, **TypeScript**, and **Vite**, Taskly leverages custom **Vanilla CSS** rather than generic styling kits, achieving a highly polished visual aesthetic (vibrant dark/light mode switches, glowing ambient background gradients, hover elevations, and smooth layout animations).

---

## ✨ Core Features

*   **🔒 Glassmorphic Auth System**: Beautiful Login and Account Creation cards with shifting background orbs, floating labels, input validations, and a quick **Demo Account bypass** to explore preseeded data instantly.
*   **📋 Kanban Task Board**: Column layouts (*To Do*, *In Progress*, *In Review*, *Completed*) featuring HTML5 drag-and-drop status changes, progress tracker bars, and *canvas-confetti* bursts on task completion.
*   **📊 Dynamic SVG Analytics Dashboard**: Beautiful, hand-crafted responsive charts:
    *   *Completions Trend*: Smooth SVG Area Chart tracking completed tasks day-by-day over the last 7 days using activity logs.
    *   *Priority Breakdown*: SVG Doughnut Chart visualizing priority ratios.
    *   *Category Load*: Custom colored progress loader bars summarizing total and completed tasks per category tag.
*   **📅 Interactive Scheduler Calendar**: A monthly date grid displaying scheduled task pills. You can drag and drop pills from one calendar cell to another to update task due dates on the fly.
*   **📝 Detail Edit Modal**: Manage subtask checklists (with local completion tracking) and add discussion comments.
*   **⚙️ Custom settings & Category Manager**: Customize user profiles (name, bio, avatar HSL theme accents), create custom category tags with color dots, and reset the mock database.
*   **📜 Activity Log Drawer**: A slide-out panel capturing user actions (e.g. creating, completing, moving, or deleting tasks) to preserve workflow logs.

---

## 🛠️ Technology Stack

*   **Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict compilation)
*   **Build Tool**: [Vite](https://vite.dev/) (Instant hot-reloading)
*   **Styling**: Vanilla CSS (CSS Custom variables, HSL color coordinates, glassmorphic backdrops, ambient blurs)
*   **Icons**: [Lucide React](https://lucide.dev/) (Modern SaaS icons)
*   **Animations**: Native CSS `@keyframes`
*   **Persistence**: Custom `localStorage` mock database adapter
*   **Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) (Celebrations on completing tasks)

---

## 📂 Project Structure

```bash
task-manager-app/
├── schema.sql           # Complete SQL database schema & sample queries
├── index.html           # Document entry point (SEO optimized)
├── package.json         # Dependencies & script configurations
├── tsconfig.json        # TypeScript configuration settings
└── src/
    ├── main.tsx         # Application entry point
    ├── App.tsx          # App Shell layout & global filters state orchestrator
    ├── types.ts         # Global TypeScript interface declarations
    ├── index.css        # Core stylesheet (Design tokens, themes, animations)
    ├── components/      # UI Views and Components
    │   ├── AuthPage.tsx     # Login/Register view overlay
    │   ├── Sidebar.tsx      # Responsive collapsible navigation
    │   ├── TaskBoard.tsx    # Kanban Board with drag-and-drop columns
    │   ├── TaskList.tsx     # Filterable checklist grid row layout
    │   ├── CalendarView.tsx # Monthly grid task due-date scheduler
    │   ├── AnalyticsView.tsx# Responsive SVG chart stats graphs
    │   ├── SettingsView.tsx # Profiles, categories, and database wipe
    │   └── TaskModal.tsx    # Task edit/comments dialog
    └── utils/
        └── mockDb.ts    # Seed data & localStorage DB CRUD functions
```

---

## 🚀 Local Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Install Dependencies
Navigate to the project root and run:
```bash
npm install
```

### 2. Run Development Server
Spin up the local hot-reloading server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to view the application.

### 3. Build for Production
Bundle and optimize the app for production deployment:
```bash
npm run build
```
Production assets will compile into the `/dist` directory.

---

## 🗄️ Database Architecture (SQL)

While Taskly runs on the client-side using `localStorage` for sandbox accessibility, a fully drafted **[schema.sql](file:///C:/Users/Yashvardhan%20Singh/.gemini/antigravity/scratch/task-manager-app/schema.sql)** file is provided in the project root directory.

It outlines standard SQLite, PostgreSQL, and MySQL compatible schema designs detailing:
*   **Tables**: `users`, `categories`, `tasks`, `subtasks`, `comments`, and `activity_logs` tables.
*   **Index Optimizations**: Performance indices on usernames, user_id lookups, and task status scopes.
*   **Operational Queries**: Registration insertion, authentication search logic, task updates, subtask toggling, and complex dashboard metric aggregations.
