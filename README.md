# TaskFlow — Full-Stack Task Manager

A production-ready task management app built with **React**, **Express**, **SQLite**, and **Socket.io**.

---

## Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend    | Node.js, Express 4, better-sqlite3        |
| Realtime   | Socket.io 4 (WebSockets)                  |
| Auth       | JWT (jsonwebtoken), bcryptjs              |
| DB         | SQLite (file-based, zero config)          |
| Deployment | GitHub Actions CI + Render/Railway/Vercel |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── db/
│   │   └── database.js        # SQLite schema & prepared statements
│   ├── middleware/
│   │   └── auth.js            # JWT verify middleware
│   ├── routes/
│   │   ├── auth.js            # /api/auth/* — register, login, me
│   │   └── tasks.js           # /api/tasks/* — full CRUD + comments
│   ├── socket/
│   │   └── socketHandler.js   # Socket.io auth + event handlers
│   ├── server.js              # Express app entry point
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── api/
│       │   └── client.js      # Axios instance + auth/tasks API
│       ├── components/
│       │   ├── Auth/
│       │   │   └── ProtectedRoute.jsx
│       │   ├── Layout/
│       │   │   ├── AppLayout.jsx
│       │   │   └── Sidebar.jsx
│       │   └── Tasks/
│       │       ├── TaskCard.jsx
│       │       └── TaskModal.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── TaskContext.jsx
│       ├── hooks/
│       │   ├── useSocket.js
│       │   └── useDebounce.js
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   └── Tasks.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── .github/workflows/ci.yml
├── .gitignore
└── package.json               # Root monorepo scripts
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1 — Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
npm install           # installs concurrently at root
cd backend && cp .env.example .env && cd ..
cd frontend && cp .env.example .env && cd ..
npm run install:all   # installs backend + frontend deps
```

### 2 — Run in development

```bash
npm run dev
# Backend:  http://localhost:5000
# Frontend: http://localhost:5173
```

### 3 — Build for production

```bash
npm run build   # outputs frontend/dist/
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-long-random-secret-here
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> In production, set `VITE_API_URL=/api` and configure a reverse proxy.

---

## API Reference

### Auth

| Method | Endpoint            | Body                          | Description  |
|--------|---------------------|-------------------------------|--------------|
| POST   | /api/auth/register  | username, email, password     | Register     |
| POST   | /api/auth/login     | email, password               | Login → JWT  |
| GET    | /api/auth/me        | —                             | Current user |

### Tasks (all require `Authorization: Bearer <token>`)

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | /api/tasks                | List tasks (filterable with ?status=&priority=&search=) |
| GET    | /api/tasks/stats          | Dashboard stats       |
| GET    | /api/tasks/:id            | Single task + comments |
| POST   | /api/tasks                | Create task           |
| PUT    | /api/tasks/:id            | Update task           |
| DELETE | /api/tasks/:id            | Delete task           |
| POST   | /api/tasks/:id/comments   | Add comment           |

---

## Socket.io Events

| Event            | Direction      | Payload                |
|------------------|----------------|------------------------|
| `task:created`   | Server → Client | task object            |
| `task:updated`   | Server → Client | task object            |
| `task:deleted`   | Server → Client | `{ id }`               |
| `comment:added`  | Server → Client | `{ taskId, comment }`  |
| `task:status_change` | Client → Server | `{ taskId, status }` |

---

## Deployment

### Option A — Render (recommended)

1. Push repo to GitHub
2. Create a **Web Service** on [render.com](https://render.com) pointing to `/backend`
3. Set build command: `npm install` and start command: `node server.js`
4. Create a **Static Site** for `/frontend` with build command `npm run build` and publish dir `dist`
5. Set all env vars in Render dashboard

### Option B — Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

### Option C — Self-hosted (VPS + Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    root /var/www/taskflow/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
    }

    # Proxy WebSockets
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## Features

- ✅ JWT authentication (register / login / auto-logout on 401)
- ✅ Full CRUD for tasks with status, priority, due date, tags
- ✅ Real-time updates via Socket.io (multi-tab sync)
- ✅ Kanban board + list view with filters and search
- ✅ Task comments
- ✅ Dashboard with completion stats and progress bar
- ✅ Responsive mobile-first design
- ✅ Password strength indicator
- ✅ Overdue / urgent task highlighting
- ✅ GitHub Actions CI pipeline

---

## License

MIT
