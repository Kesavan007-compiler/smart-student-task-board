# Smart Student Task Manager

A complete, working full-stack web app for students to track assignments, exams and
projects. It has real accounts, a real database, and a dashboard that updates as you work.

**Theme:** professional blue and white · **Works on:** desktop, tablet and phone

---

## 1. What it does

| Feature | Where |
|---|---|
| Register a new student account | `/register` |
| Log in / log out (passwords are hashed) | `/login` |
| Dashboard with task statistics | `/` |
| Add, edit, delete tasks | `/tasks` |
| Categories: Assignment, Exam, Project, Reading, Personal | task form |
| Priority levels: Low, Medium, High | task form |
| Assignment deadlines, with "Due today" / "Overdue" warnings | task form + lists |
| Show completed and pending tasks (tabs, search, filters) | `/tasks` |
| Month calendar of deadlines, click a day to see or add tasks | `/calendar` |
| Every task saved in a SQLite database, private to its owner | `data/app.db` |

Each student only ever sees their own tasks. The server checks this on every request.

---

## 2. Technology used

| Layer | Tool | Why |
|---|---|---|
| Interface | **React 18** | Builds the screens from small reusable pieces |
| Routing | **React Router 6** | Switches pages without reloading the browser |
| Styling | **Plain CSS** (`src/styles.css`) | One file, easy to read and change |
| Build tool | **Vite** | Instant dev server and optimised production build |
| Server | **Node.js + Express** | Handles the API requests |
| Database | **SQLite** (built into Node 24) | A real database that lives in one file, no install needed |
| Passwords | `node:crypto` scrypt | Passwords are hashed, never stored in plain text |
| Login tokens | Signed HMAC token | Keeps you logged in safely for 7 days |

> Node 24 is required, because it includes the built-in `node:sqlite` database module.

---

## 3. How to run it

You need **Node.js 24 or newer** installed. Check with:

```bash
node --version
```

### Step 1 - install the packages (once)

```bash
cd smart-student-task-manager
npm install
```

### Step 2 - start the app

```bash
npm run dev
```

This one command starts **both** the API server (port 4000) and the website (port 5173).

Open **http://localhost:5173** in your browser.

### Demo account

A demo student is already in the database, so you can log in straight away:

```
Email:    demo@student.com
Password: demo123
```

If you ever delete `data/app.db`, run `npm run seed` to recreate the demo account
with 12 sample tasks.

### Production build (optional)

```bash
npm run build     # creates an optimised copy in /dist
npm start         # Express serves the website AND the API on http://localhost:4000
```

### All available commands

| Command | What it does |
|---|---|
| `npm run dev` | Runs website + API together with auto-reload |
| `npm run dev:web` | Website only (port 5173) |
| `npm run dev:api` | API only (port 4000) |
| `npm run build` | Builds the production website into `/dist` |
| `npm start` | Runs the API and serves the built website on port 4000 |
| `npm run seed` | Creates the demo account with sample tasks |

---

## 4. Project structure

```
smart-student-task-manager/
├── package.json            scripts + dependencies
├── vite.config.js          dev server and the /api proxy
├── index.html              the single HTML page React lives in
├── data/
│   └── app.db              the SQLite database (created automatically)
├── server/                 everything that runs on the server
│   ├── index.js            the API routes (login, tasks, statistics)
│   ├── db.js               database connection + table definitions
│   ├── auth.js             password hashing and login tokens
│   └── seed.js             creates the demo account
└── src/                    everything that runs in the browser
    ├── main.jsx            starts React
    ├── App.jsx             decides which page to show for which URL
    ├── api.js              all fetch() calls to the server
    ├── auth.jsx            remembers who is logged in
    ├── utils.js            date and colour helpers
    ├── styles.css          all the styling
    ├── components/
    │   ├── Layout.jsx      sidebar + top bar that wrap every page
    │   ├── TaskForm.jsx    the add / edit dialog
    │   ├── TaskItem.jsx    one row in the task list
    │   ├── Toast.jsx       little confirmation messages
    │   └── Icons.jsx       inline SVG icons
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── Tasks.jsx
        └── Calendar.jsx
```

---

## 5. How the app works, in plain language

```
Browser (React)  ──HTTP request with token──►  Express server  ──SQL──►  SQLite file
     ▲                                              │
     └──────────────JSON answer─────────────────────┘
```

1. You fill in the login form. React sends your email and password to `POST /api/auth/login`.
2. The server finds your account and compares your password with the stored **hash**.
   If it matches, the server sends back a **token** (a long signed string).
3. React saves that token in `localStorage`, so refreshing the page keeps you logged in.
4. Every later request sends the token in the `Authorization: Bearer ...` header.
   The server verifies the signature and knows which student is asking.
5. When you add a task, React sends the task details to `POST /api/tasks`. The server
   validates them and inserts a row in the `tasks` table with your user id.
6. When you open the dashboard, React calls `GET /api/stats`, and the server runs SQL
   `COUNT` queries to work out totals, overdue tasks and the completion percentage.

### The two database tables

```sql
users                              tasks
-----                              -----
id            integer  (key)       id           integer (key)
name          text                 user_id      integer (who owns it)
email         text (unique)        title        text
password_hash text                 description  text
created_at    text                 category     text
                                   priority     text
                                   status       'pending' | 'completed'
                                   due_date     'YYYY-MM-DD'
                                   created_at / updated_at
```

`tasks.user_id` points at `users.id`. Because of `ON DELETE CASCADE`, deleting a user
would also delete their tasks. Every task query includes `WHERE user_id = ?`, which is
what keeps each student's data private.

---

## 6. API endpoints

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a token |
| POST | `/api/auth/login` | Log in, returns a token |
| GET | `/api/auth/me` | Who is this token for? |
| GET | `/api/tasks` | List tasks (supports `?status=&category=&priority=&search=`) |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a whole task |
| PATCH | `/api/tasks/:id` | Change only the status (the checkbox) |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/stats` | Dashboard numbers (`?today=YYYY-MM-DD`) |

All `/api/tasks` and `/api/stats` routes require a valid token.

---

## 7. Design notes

- **Colours:** primary blue `#2563eb`, dark blue `#1d4ed8`, page background `#f5f8fd`,
  white cards, slate text `#0f172a`.
- **Sidebar:** fixed 258px white panel with a blue pill for the active page.
- **Responsive:** at 900px the sidebar slides away behind a menu button; the stat cards
  go from 4 columns to 2, then to a compact layout at 620px.
- **Priority colours:** High = red, Medium = amber, Low = green, everywhere in the app.

To change the whole colour scheme, edit the CSS variables at the top of `src/styles.css`.
That one block controls every button, badge and card.

---

## 8. What was tested

The finished app was tested automatically, not just clicked through by eye:

- **30 API checks:** registration, duplicate email, short password, wrong password,
  login, token required, create/edit/delete task, invalid input, filtering, search,
  statistics, and one student being unable to touch another student's task.
- **44 browser checks:** login, dashboard numbers, adding a task with category,
  priority and deadline, editing, completing, filtering, searching, deleting (with the
  confirmation), calendar navigation, adding a task from a calendar day, logout,
  registration, validation errors, protected pages, and mobile layout with no
  horizontal scrolling.

All checks pass.

---

## 9. If something goes wrong

| Problem | Fix |
|---|---|
| `EADDRINUSE` (port already used) | Something is already on 4000 or 5173. Stop it, or run `PORT=4001 npm run dev:api` |
| "Cannot reach the server" | The API is not running. Use `npm run dev`, not `npm run dev:web` |
| `node:sqlite` not found | You are on Node older than 22. Upgrade to Node 24 |
| Want to start from a clean database | Delete `data/app.db`, then `npm run seed` |
| Logged out unexpectedly | Tokens last 7 days, or `JWT_SECRET` changed |

---

## 10. Ideas to extend it

Good next steps for learning:

1. Add a "notes" field per task that opens in a side panel.
2. Email reminders 24 hours before a deadline.
3. A weekly study-hours chart on the dashboard.
4. Sub-tasks inside a task.
5. Drag and drop to reorder tasks.
6. A "Study groups" feature where classmates share a task list.

Each of these follows the same pattern already used in the code: add a column or table in
`server/db.js`, add a route in `server/index.js`, then call it from a page in `src/pages/`.
