# CodeArenA

[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb?style=for-the-badge&logo=react&logoColor=white)](frontend/package.json)
[![Vite](https://img.shields.io/badge/Build-Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)](frontend/package.json)
[![Python](https://img.shields.io/badge/Backend-Python%2F%20Flask-3776ab?style=for-the-badge&logo=python&logoColor=white)](backend/app.py)
[![MySQL](https://img.shields.io/badge/Database-MySQL-00758f?style=for-the-badge&logo=mysql&logoColor=white)](database/schema.sql)

CodeArena is a full-stack online coding contest platform for managing programming contests, problems, participation, submissions, and live rankings.

## Features

- **JWT Authentication** with bcrypt password hashing and role-based access
- **Contest Management** — create, update, delete with lifecycle states (UPCOMING, ONGOING, ENDED)
- **Problem Management** — CRUD with difficulty levels and max-score
- **Participation & Submissions** — join contests, submit solutions with validation
- **Leaderboards** — global and contest-specific rankings
- **Dashboard** — platform-wide statistics

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, React Router, TypeScript |
| Backend | Python, Flask, Flask-CORS |
| Database | MySQL |
| Auth | JWT (PyJWT), bcrypt |

## Project Structure

```
CodeArena/
├── backend/
│   ├── app.py                    # Flask entry point
│   ├── config/
│   │   └── db.py                 # MySQL pool & DB init
│   ├── middleware/
│   │   └── auth.py               # JWT protect & admin decorators
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── contest_routes.py
│   │   ├── problem_routes.py
│   │   ├── submission_routes.py
│   │   ├── leaderboard_routes.py
│   │   └── dashboard_routes.py
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql
│   └── seed.sql
├── frontend/
│   └── src/
│       ├── api/api.ts
│       ├── pages/
│       │   ├── Contests.tsx
│       │   ├── ContestDetail.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Leaderboard.tsx
│       │   ├── Login.tsx
│       │   ├── MySubmissions.tsx
│       │   ├── ProblemDetails.tsx
│       │   ├── Problems.tsx
│       │   ├── Register.tsx
│       │   └── Submit.tsx
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
└── README.md
```

## Setup

### Prerequisites

- Python 3.10+
- MySQL Server running locally
- Node.js 18+ (for the frontend)

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd OnlineCodingContestManagementSystem
```

Create `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key
PORT=5001
```

### 2. Install and run the backend

```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3. Install and run the frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Note: if you use the VS Code task `frontend:dev`, make sure the task runs inside the `frontend/` directory. Running `npm run dev` from the project root will fail because there is no root-level `package.json`.

### 4. Seed sample data

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 5. Open the app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

## Verified Local Run (3 April 2026)

The backend and frontend were connected and started successfully with:

```bash
# Terminal 1
cd backend
source ../.venv/bin/activate
python app.py

# Terminal 2
cd frontend
npm run dev
```

Compatibility notes for the current API/frontend integration:

- `GET /api/dashboard/stats` includes both `total*` keys and frontend keys: `users_count`, `contests_count`, `submissions_count`.
- `GET /api/leaderboard/` returns `{ "leaderboard": [...] }`.
- `POST /api/submissions/` accepts frontend payload without `contest_id` and infers a contest from problem mappings.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@codearena.com` | `admin123` |
| User | `sayan@codearena.com` | `user123` |
| User | `alice@codearena.com` | `user123` |
| User | `bob@codearena.com` | `user123` |
| User | `charlie@codearena.com` | `user123` |

## API Endpoints

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/me` | Update profile |
| PUT | `/api/auth/me/password` | Change password |

### Contests
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/contests` | List contests |
| GET | `/api/contests/:id` | Get contest |
| POST | `/api/contests` | Create (admin) |
| PUT | `/api/contests/:id` | Update (admin) |
| DELETE | `/api/contests/:id` | Delete (admin) |
| GET | `/api/contests/:id/problems` | Contest problems |
| POST | `/api/contests/:id/problems` | Add problem (admin) |
| DELETE | `/api/contests/:id/problems/:pid` | Remove problem (admin) |

### Problems
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/problems` | List problems |
| GET | `/api/problems/:id` | Get problem |
| POST | `/api/problems` | Create (admin) |
| PUT | `/api/problems/:id` | Update (admin) |
| DELETE | `/api/problems/:id` | Delete (admin) |

### Submissions & Participation
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/submissions` | List submissions |
| POST | `/api/submissions` | Submit solution |
| GET | `/api/submissions/participations` | List participations |
| POST | `/api/submissions/participations` | Join contest |

### Leaderboard & Dashboard
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/leaderboard/:contestId` | Contest leaderboard |
| GET | `/api/dashboard/stats` | Platform stats |
