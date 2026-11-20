/**
 * DEMO DATA
 * -------------------------------------------------------------
 * Run `npm run seed` once to create a demo student with sample tasks.
 * Login:  demo@student.com  /  demo123
 */
import { query } from './db.js'
import { hashPassword } from './auth.js'

const DEMO_EMAIL = 'demo@student.com'

const existing = query.get('SELECT id FROM users WHERE email = ?', DEMO_EMAIL)
if (existing) {
  console.log('Demo account already exists. Nothing to do.')
  process.exit(0)
}

const result = query.run(
  'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
  'Demo Student',
  DEMO_EMAIL,
  hashPassword('demo123')
)
const userId = result.lastInsertRowid

// Helper: a date N days from today, as YYYY-MM-DD.
const day = (offset) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-CA')
}

const tasks = [
  ['Submit physics lab report', 'Include the graphs from experiment 4 and the conclusion.', 'Assignment', 'High', 'pending', day(-3)],
  ['Read chapters 5-6 of Organic Chemistry', 'Make short notes for the quiz.', 'Reading', 'Medium', 'pending', day(-1)],
  ['Database design mini project', 'Draw the ER diagram and normalise to 3NF.', 'Project', 'High', 'pending', day(2)],
  ['Maths assignment 7', 'Questions 1 to 12 from the textbook.', 'Assignment', 'Medium', 'pending', day(0)],
  ['Prepare for Data Structures quiz', 'Revise stacks, queues and linked lists.', 'Exam', 'High', 'pending', day(1)],
  ['Group presentation slides', 'Send the first draft to the team for review.', 'Project', 'Medium', 'pending', day(4)],
  ['Return library books', 'Two books due at the campus library.', 'Personal', 'Low', 'pending', day(6)],
  ['English essay: climate policy', 'At least 800 words with three sources.', 'Assignment', 'Medium', 'pending', day(9)],
  ['Semester exam timetable check', 'Confirm dates on the university portal.', 'Exam', 'Low', 'pending', day(13)],
  ['Complete HTML/CSS practice set', 'Flexbox and grid exercises.', 'Reading', 'Low', 'completed', day(-6)],
  ['Submit attendance form', 'Done before the deadline.', 'Personal', 'Medium', 'completed', day(-4)],
  ['Statistics worksheet 3', 'Submitted online.', 'Assignment', 'Medium', 'completed', day(-2)],
]

for (const [title, description, category, priority, status, due] of tasks) {
  query.run(
    `INSERT INTO tasks (user_id, title, description, category, priority, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    userId, title, description, category, priority, status, due
  )
}

console.log(`Demo account ready: ${DEMO_EMAIL} / demo123 (${tasks.length} sample tasks)`)
