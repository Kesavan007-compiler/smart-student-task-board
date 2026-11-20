import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../components/Toast.jsx'
import TaskForm from '../components/TaskForm.jsx'
import { categoryColor, todayStr, parseDate } from '../utils.js'
import { IconChevronLeft, IconChevronRight, IconPlus } from '../components/Icons.jsx'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Build the 6x7 grid of days for a given month. */
function buildMonth(year, month) {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return {
      date,
      key: date.toLocaleDateString('en-CA'),
      day: date.getDate(),
      outside: date.getMonth() !== month,
    }
  })
}

export default function Calendar() {
  const toast = useToast()
  const today = todayStr()
  const now = parseDate(today)

  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(today)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    try {
      const data = await api.listTasks()
      setTasks(data.tasks)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const days = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor])

  // Group tasks by their due date so each day can show its own list.
  const byDate = useMemo(() => {
    const map = new Map()
    for (const task of tasks) {
      if (!task.due_date) continue
      if (!map.has(task.due_date)) map.set(task.due_date, [])
      map.get(task.due_date).push(task)
    }
    return map
  }, [tasks])

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const monthTaskCount = days
    .filter((d) => !d.outside)
    .reduce((sum, d) => sum + (byDate.get(d.key)?.length || 0), 0)

  const selectedTasks = byDate.get(selected) || []

  function shiftMonth(step) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + step, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToday() {
    const d = parseDate(todayStr())
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    setSelected(todayStr())
  }

  async function handleCreate(payload) {
    await api.createTask(payload)
    toast.success('Task created')
    await load()
  }

  const selectedLabel = parseDate(selected)?.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="cal__layout">
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="cal__head">
          <div>
            <div className="cal__month">{monthLabel}</div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
              {loading ? 'Loading...' : `${monthTaskCount} task${monthTaskCount === 1 ? '' : 's'} with a deadline this month`}
            </p>
          </div>
          <div className="cal__nav">
            <button className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <IconChevronLeft size={17} />
            </button>
            <button className="btn btn--ghost btn--sm" onClick={goToday}>
              Today
            </button>
            <button className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
              <IconChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="cal__weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="cal__grid">
          {days.map((d) => {
            const dayTasks = byDate.get(d.key) || []
            const visible = dayTasks.slice(0, 3)
            const extra = dayTasks.length - visible.length
            return (
              <button
                key={d.key}
                type="button"
                className={[
                  'cal__cell',
                  d.outside ? 'is-outside' : '',
                  d.key === today ? 'is-today' : '',
                  d.key === selected ? 'is-selected' : '',
                ].join(' ')}
                onClick={() => setSelected(d.key)}
              >
                <span className="cal__day">{d.day}</span>
                {visible.map((t) => (
                  <span
                    key={t.id}
                    className={`cal__chip cal__chip--${t.priority.toLowerCase()} ${t.status === 'completed' ? 'is-done' : ''}`}
                    title={t.title}
                  >
                    {t.title}
                  </span>
                ))}
                {extra > 0 && <span className="cal__more">+{extra} more</span>}
              </button>
            )
          })}
        </div>

        <div className="cal__legend">
          <span><i className="dot" style={{ background: '#ef4444' }} /> High priority</span>
          <span><i className="dot" style={{ background: '#f59e0b' }} /> Medium</span>
          <span><i className="dot" style={{ background: '#94a3b8' }} /> Low</span>
          <span><i className="dot" style={{ background: 'var(--blue-600)' }} /> Today</span>
        </div>
      </div>

      <aside className="day-panel">
        <div className="day-panel__head">
          <h3>{selectedLabel}</h3>
          <p>
            {selectedTasks.length === 0
              ? 'Nothing due on this day'
              : `${selectedTasks.length} task${selectedTasks.length === 1 ? '' : 's'} due`}
          </p>
        </div>

        <div className="day-panel__body">
          {selectedTasks.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              A free day. You could add a reminder for something coming up.
            </p>
          )}

          {selectedTasks.map((t) => (
            <div key={t.id} className={`mini-task ${t.status === 'completed' ? 'is-done' : ''}`}>
              <strong>{t.title}</strong>
              <small>
                <span
                  className="dot"
                  style={{
                    background: categoryColor[t.category] || 'var(--blue-500)',
                    display: 'inline-block',
                    marginRight: 6,
                  }}
                />
                {t.category} · {t.priority} priority
                {t.status === 'completed' ? ' · completed' : ''}
              </small>
            </div>
          ))}

          <button
            className="btn btn--ghost btn--sm btn--block"
            style={{ marginTop: 6 }}
            onClick={() => setModalOpen(true)}
          >
            <IconPlus size={15} />
            Add task on this day
          </button>
        </div>
      </aside>

      <TaskForm
        open={modalOpen}
        task={null}
        defaultDate={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
