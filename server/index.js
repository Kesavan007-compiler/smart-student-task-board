/**
 * THE SERVER (API)
 * -------------------------------------------------------------
 * Express handles HTTP requests. Every route below lives under /api.
 * The React app calls these routes to log in and to read/write tasks.
 */
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { query } from './db.js'
import { hashPassword, verifyPassword, createToken, requireAuth } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

/* ------------------------------------------------------------------ */
/* Shared validation                                                   */
/* ------------------------------------------------------------------ */

const CATEGORIES = ['Assignment', 'Exam', 'Project', 'Reading', 'Personal']
const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['pending', 'completed']

const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value))
const todayString = () => new Date().toISOString().slice(0, 10)

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, created_at: row.created_at }
}

/* ------------------------------------------------------------------ */
/* AUTH ROUTES                                                         */
/* ------------------------------------------------------------------ */

// Register: create an account and log the student in straight away.
app.post('/api/auth/register', (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your full name.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  const existing = query.get('SELECT id FROM users WHERE email = ?', email)
  if (existing) return res.status(409).json({ error: 'That email is already registered.' })

  const result = query.run(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    name,
    email,
    hashPassword(password)
  )
  const user = query.get('SELECT * FROM users WHERE id = ?', result.lastInsertRowid)
  res.status(201).json({ token: createToken(user.id), user: publicUser(user) })
})

// Login: check the password and return a fresh token.
app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  const user = query.get('SELECT * FROM users WHERE email = ?', email)
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' })
  }
  res.json({ token: createToken(user.id), user: publicUser(user) })
})

// "Who am I?" - used when the page reloads and we already have a token.
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = query.get('SELECT * FROM users WHERE id = ?', req.userId)
  if (!user) return res.status(401).json({ error: 'Account not found.' })
  res.json({ user: publicUser(user) })
})

/* ------------------------------------------------------------------ */
/* TASK ROUTES (all require login)                                     */
/* ------------------------------------------------------------------ */

// Read tasks with optional filters: ?status=pending&category=Exam&search=math
app.get('/api/tasks', requireAuth, (req, res) => {
  const { status, category, priority, search } = req.query
  const where = ['user_id = ?']
  const params = [req.userId]

  if (STATUSES.includes(status)) {
    where.push('status = ?')
    params.push(status)
  }
  if (CATEGORIES.includes(category)) {
    where.push('category = ?')
    params.push(category)
  }
  if (PRIORITIES.includes(priority)) {
    where.push('priority = ?')
    params.push(priority)
  }
  if (search && String(search).trim()) {
    where.push('(title LIKE ? OR description LIKE ?)')
    const like = `%${String(search).trim()}%`
    params.push(like, like)
  }

  // Sort: unfinished work first, then the closest deadline.
  const tasks = query.all(
    `SELECT * FROM tasks WHERE ${where.join(' AND ')}
     ORDER BY status = 'completed' ASC,
              CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END ASC,
              due_date ASC,
              CASE priority WHEN 'High' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END ASC,
              id DESC`,
    ...params
  )
  res.json({ tasks })
})

// Create a task.
app.post('/api/tasks', requireAuth, (req, res) => {
  const task = readTaskBody(req.body)
  if (task.error) return res.status(400).json({ error: task.error })

  const result = query.run(
    `INSERT INTO tasks (user_id, title, description, category, priority, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    req.userId,
    task.title,
    task.description,
    task.category,
    task.priority,
    task.status,
    task.due_date
  )
  const created = query.get('SELECT * FROM tasks WHERE id = ?', result.lastInsertRowid)
  res.status(201).json({ task: created })
})

// Edit a task (full update).
app.put('/api/tasks/:id', requireAuth, (req, res) => {
  const existing = ownedTask(req.userId, req.params.id)
  if (!existing) return res.status(404).json({ error: 'Task not found.' })

  const task = readTaskBody(req.body)
  if (task.error) return res.status(400).json({ error: task.error })

  query.run(
    `UPDATE tasks
        SET title = ?, description = ?, category = ?, priority = ?, status = ?, due_date = ?,
            updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
    task.title,
    task.description,
    task.category,
    task.priority,
    task.status,
    task.due_date,
    existing.id,
    req.userId
  )
  res.json({ task: query.get('SELECT * FROM tasks WHERE id = ?', existing.id) })
})

// Partial update - used by the checkbox that marks a task complete.
app.patch('/api/tasks/:id', requireAuth, (req, res) => {
  const existing = ownedTask(req.userId, req.params.id)
  if (!existing) return res.status(404).json({ error: 'Task not found.' })

  const status = req.body?.status
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Status must be pending or completed.' })
  }

  query.run(
    "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
    status,
    existing.id,
    req.userId
  )
  res.json({ task: query.get('SELECT * FROM tasks WHERE id = ?', existing.id) })
})

// Delete a task.
app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  const existing = ownedTask(req.userId, req.params.id)
  if (!existing) return res.status(404).json({ error: 'Task not found.' })

  query.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', existing.id, req.userId)
  res.json({ ok: true, id: existing.id })
})

/* ------------------------------------------------------------------ */
/* DASHBOARD STATISTICS                                                */
/* ------------------------------------------------------------------ */

app.get('/api/stats', requireAuth, (req, res) => {
  // The browser sends its own local date so "today" is correct for the student.
  const today = isDate(req.query.today) ? String(req.query.today) : todayString()

  const totals = query.get(
    `SELECT
       COUNT(*)                                                       AS total,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)          AS completed,
       SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END)          AS pending,
       SUM(CASE WHEN status = 'pending' AND due_date IS NOT NULL
                AND due_date <> '' AND due_date < ?  THEN 1 ELSE 0 END) AS overdue,
       SUM(CASE WHEN status = 'pending' AND due_date = ? THEN 1 ELSE 0 END) AS due_today
     FROM tasks WHERE user_id = ?`,
    today,
    today,
    req.userId
  )

  const byCategory = query.all(
    `SELECT category,
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM tasks WHERE user_id = ?
      GROUP BY category ORDER BY total DESC`,
    req.userId
  )

  const byPriority = query.all(
    `SELECT priority,
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM tasks WHERE user_id = ?
      GROUP BY priority`,
    req.userId
  )

  const upcoming = query.all(
    `SELECT * FROM tasks
      WHERE user_id = ? AND status = 'pending' AND due_date IS NOT NULL AND due_date <> ''
      ORDER BY due_date ASC LIMIT 5`,
    req.userId
  )

  const recent = query.all(
    `SELECT * FROM tasks WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 5`,
    req.userId
  )

  const total = Number(totals.total || 0)
  const completed = Number(totals.completed || 0)

  res.json({
    today,
    total,
    completed,
    pending: Number(totals.pending || 0),
    overdue: Number(totals.overdue || 0),
    dueToday: Number(totals.due_today || 0),
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    byCategory: byCategory.map((r) => ({ ...r, total: Number(r.total), completed: Number(r.completed) })),
    byPriority: byPriority.map((r) => ({
      ...r,
      total: Number(r.total),
      pending: Number(r.pending),
    })),
    upcoming,
    recent,
  })
})

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Find a task only if it belongs to the logged-in student. */
function ownedTask(userId, id) {
  return query.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', Number(id), userId)
}

/** Clean + validate the body of a create/update request. */
function readTaskBody(body = {}) {
  const title = String(body.title || '').trim()
  if (title.length < 2) return { error: 'Task title is required.' }
  if (title.length > 120) return { error: 'Task title is too long (120 characters max).' }

  const category = CATEGORIES.includes(body.category) ? body.category : 'Assignment'
  const priority = PRIORITIES.includes(body.priority) ? body.priority : 'Medium'
  const status = STATUSES.includes(body.status) ? body.status : 'pending'

  let due_date = body.due_date ? String(body.due_date) : ''
  if (due_date && !isDate(due_date)) return { error: 'Deadline must be a valid date.' }

  return {
    title,
    description: String(body.description || '').trim().slice(0, 1000),
    category,
    priority,
    status,
    due_date: due_date || null,
  }
}

/* ------------------------------------------------------------------ */
/* Serve the built React app in production (npm run build && npm start) */
/* ------------------------------------------------------------------ */

const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// Catch-all error handler so the API always answers with JSON.
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`)
})
