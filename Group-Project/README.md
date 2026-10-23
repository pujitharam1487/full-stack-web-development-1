# Group Project: SpendWise – Full-Stack Expense Tracker

A MERN-stack expense tracker. The React client talks to an Express REST API that stores expenses in MongoDB.

## Team
| Name | Role |
|------|------|
| _Member 1_ | _e.g. Frontend_ |
| _Member 2_ | _e.g. Backend_ |
| _Member 3_ | _e.g. Database / Testing_ |

## Tech Stack
- **Client:** React 18, Vite
- **Server:** Node.js, Express 4
- **Database:** MongoDB with Mongoose

## Features
- Add, edit and delete expenses (saved in MongoDB)
- Client and server-side validation
- Search by title and filter by category
- Summary cards: total, count, average, top category
- Spending-by-category chart
- Responsive layout with mobile menu

## Getting Started

You need Node.js 18+ and a running MongoDB (local or Atlas).

### 1. Server
```bash
cd server
npm install
cp .env.example .env     # then edit MONGO_URI if needed
npm run dev              # http://localhost:5000
```
The server loads `server/.env` first and falls back to the project-root `.env`.

### 2. Client
```bash
cd client
npm install
npm run dev              # http://localhost:5173
```
In development the client proxies `/api` requests to the server on port 5000.

## API Reference
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/expenses` | List expenses (optional `search`, `category` query params) |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

Expense body: `{ "title": "Lunch", "amount": 250, "category": "Food", "date": "2026-10-22" }`

## Project Structure
```
Group-Project/
├── README.md
├── screenshots/
├── client/                   # React (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── utils.js
│       ├── style.css
│       └── components/
└── server/                   # Node + Express + MongoDB
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── config/db.js
    ├── models/Expense.js
    └── routes/expenses.js
```

## Screenshots
Add images to `screenshots/` and link them here, e.g. `![Dashboard](screenshots/dashboard.png)`.
