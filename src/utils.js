/** Small shared helpers used by several pages. */

export const CATEGORIES = ['Assignment', 'Exam', 'Project', 'Reading', 'Personal']
export const PRIORITIES = ['Low', 'Medium', 'High']

/** Today's date as YYYY-MM-DD using the student's own timezone. */
export function todayStr() {
  return new Date().toLocaleDateString('en-CA')
}

/** Turn "2026-11-24" into a real Date at local midnight. */
export function parseDate(value) {
  if (!value) return null
  const [y, m, d] = String(value).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** "Tue, Nov 24" */
export function formatDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

/** How many days between a deadline and today (negative = in the past). */
export function daysFromToday(value) {
  const date = parseDate(value)
  if (!date) return null
  const today = parseDate(todayStr())
  return Math.round((date - today) / 86400000)
}

/** A friendly deadline label plus its state for styling. */
export function dueLabel(value, status) {
  if (!value) return { text: 'No deadline', state: 'none' }
  const diff = daysFromToday(value)

  if (status === 'completed') return { text: formatDate(value), state: 'none' }
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'}`, state: 'overdue' }
  if (diff === 0) return { text: 'Due today', state: 'today' }
  if (diff === 1) return { text: 'Due tomorrow', state: 'soon' }
  return { text: formatDate(value), state: 'none' }
}

export const categoryColor = {
  Assignment: '#2563eb',
  Exam: '#dc2626',
  Project: '#7c3aed',
  Reading: '#0891b2',
  Personal: '#d97706',
}

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'S'
