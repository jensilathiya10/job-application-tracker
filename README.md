# Job Application Tracker

A full-stack web app to track job applications — company, role, status, and notes — with a dashboard summarizing your job search progress at a glance.

Built this after realizing spreadsheets and email search weren't cutting it while applying to 200+ software engineering roles. Solves a real problem: one place to see what's pending, what got rejected, and what needs follow-up.

## Features

- Add, edit, and delete job applications (company, role, location, status, date applied, notes)
- Track status through the pipeline: Applied → Under Review → Interview → Offer / Rejected
- Dashboard with live stats: total applications, breakdown by status, response rate
- Search by company/role and filter by status
- REST API backend with persistent JSON storage (no external database required)

## Tech Stack

**Frontend:** React 18, Vite, plain CSS (no framework overhead)
**Backend:** Node.js, Express, lowdb (file-based JSON storage)

## Project Structure

```
job-application-tracker/
├── backend/          # Express REST API
│   ├── server.js
│   ├── db.json        # seed/data storage
│   └── package.json
└── frontend/          # React + Vite client
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── api.js
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and talks to the API above.

## API Endpoints

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/applications`     | List all applications      |
| POST   | `/api/applications`     | Create a new application   |
| PUT    | `/api/applications/:id` | Update an application      |
| DELETE | `/api/applications/:id` | Delete an application      |
| GET    | `/api/stats`            | Get summary statistics     |

## Possible Next Steps

- Add authentication so multiple users can track their own applications
- Deploy backend to a small cloud instance (AWS/Render) and connect a real database (PostgreSQL/MongoDB)
- Add email reminders for stale applications (no update in X days)
- Kanban-style drag-and-drop board view

## License

MIT
