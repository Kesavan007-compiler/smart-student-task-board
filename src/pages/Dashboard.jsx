import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { dueLabel, categoryColor, PRIORITIES } from '../utils.js'
import {
  IconAlert,
  IconCheck,
  IconClock,
  IconInbox,
  IconList,
  IconPlus,
  IconTarget,
} from '../components/Icons.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api
      .stats()
      .then((data) => alive && setStats(data))
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <div className="boot">
        <div className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  if (error) return <div className="alert">{error}</div>

  const firstName = (user?.name || 'student').split(' ')[0]
  const priorities = PRIORITIES.map(
    (p) => stats.byPriority.find((row) => row.priority === p) || { priority: p, total: 0, pending: 0 }
  )

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, letterSpacing: '-0.6px' }}>
          Hi {firstName}, here is your week.
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 5 }}>
          {stats.pending === 0
            ? 'Everything is done. Enjoy the free time.'
            : `You have ${stats.pending} task${stats.pending === 1 ? '' : 's'} left${
                stats.dueToday ? `, ${stats.dueToday} due today` : ''
              }.`}
        </p>
      </div>

      {/* ---------- Stat cards ---------- */}
      <div className="grid-stats">
        <div className="stat">
          <div className="stat__top">
            <span className="stat__label">Total tasks</span>
            <span className="stat__icon">
              <IconList size={17} />
            </span>
          </div>
          <div className="stat__value">{stats.total}</div>
          <div className="stat__sub">Everything you have added</div>
        </div>

        <div className="stat stat--green">
          <div className="stat__top">
            <span className="stat__label">Completed</span>
            <span className="stat__icon">
              <IconCheck size={17} />
            </span>
          </div>
          <div className="stat__value">{stats.completed}</div>
          <div className="stat__sub">{stats.completionRate}% of all tasks</div>
        </div>

        <div className="stat stat--amber">
          <div className="stat__top">
            <span className="stat__label">Pending</span>
            <span className="stat__icon">
              <IconClock size={17} />
            </span>
          </div>
          <div className="stat__value">{stats.pending}</div>
          <div className="stat__sub">
            {stats.dueToday > 0 ? `${stats.dueToday} due today` : 'Nothing due today'}
          </div>
        </div>

        <div className="stat stat--red">
          <div className="stat__top">
            <span className="stat__label">Overdue</span>
            <span className="stat__icon">
              <IconAlert size={17} />
            </span>
          </div>
          <div className="stat__value">{stats.overdue}</div>
          <div className="stat__sub">
            {stats.overdue > 0 ? 'Deadline already passed' : 'Nothing overdue'}
          </div>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__icon">
              <IconInbox size={26} />
            </div>
            <h3>No tasks yet</h3>
            <p>Add your first assignment or exam and your dashboard will come to life.</p>
            <button
              className="btn btn--primary"
              style={{ marginTop: 18 }}
              onClick={() => navigate('/tasks?new=1')}
            >
              <IconPlus size={16} />
              Add your first task
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            {/* ---------- Progress ---------- */}
            <div className="card">
              <div className="card__head">
                <h2>Overall progress</h2>
                <span className="badge badge--cat">{stats.completionRate}% done</span>
              </div>
              <div className="card__body">
                <div className="ring-row">
                  <div className="ring" style={{ '--value': stats.completionRate }}>
                    <div className="ring__inner">
                      <strong>{stats.completionRate}%</strong>
                      <span>completed</span>
                    </div>
                  </div>
                  <div className="ring-row__facts">
                    <div className="fact">
                      <span>
                        <i className="dot" style={{ background: 'var(--blue-600)' }} /> Completed
                      </span>
                      <b>{stats.completed}</b>
                    </div>
                    <div className="fact">
                      <span>
                        <i className="dot" style={{ background: '#cbd5e1' }} /> Pending
                      </span>
                      <b>{stats.pending}</b>
                    </div>
                    <div className="fact">
                      <span>
                        <i className="dot" style={{ background: 'var(--amber)' }} /> Due today
                      </span>
                      <b>{stats.dueToday}</b>
                    </div>
                    <div className="fact">
                      <span>
                        <i className="dot" style={{ background: 'var(--red)' }} /> Overdue
                      </span>
                      <b>{stats.overdue}</b>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <div className="progress">
                    <div className="progress__fill" style={{ width: `${stats.completionRate}%` }} />
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 9 }}>
                    {stats.completed} of {stats.total} tasks finished.
                  </p>
                </div>
              </div>
            </div>

            {/* ---------- Upcoming ---------- */}
            <div className="card">
              <div className="card__head">
                <h2>Upcoming deadlines</h2>
                <button className="btn btn--ghost btn--sm" onClick={() => navigate('/calendar')}>
                  Calendar
                </button>
              </div>
              <div className="card__body" style={{ display: 'grid', gap: 10 }}>
                {stats.upcoming.length === 0 && (
                  <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                    No upcoming deadlines. Add a date to a task to see it here.
                  </p>
                )}
                {stats.upcoming.map((task) => {
                  const due = dueLabel(task.due_date, task.status)
                  return (
                    <div className="mini-task" key={task.id}>
                      <strong>{task.title}</strong>
                      <small>
                        <span
                          className={`badge badge--${task.priority.toLowerCase()}`}
                          style={{ marginRight: 8 }}
                        >
                          {task.priority}
                        </span>
                        <span
                          style={{
                            color:
                              due.state === 'overdue'
                                ? 'var(--red)'
                                : due.state === 'today'
                                  ? 'var(--amber)'
                                  : 'var(--muted)',
                            fontWeight: due.state === 'none' ? 400 : 600,
                          }}
                        >
                          {due.text}
                        </span>
                      </small>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* ---------- Categories ---------- */}
            <div className="card">
              <div className="card__head">
                <h2>Tasks by category</h2>
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Completed / total</span>
              </div>
              <div className="card__body">
                {stats.byCategory.map((row) => {
                  const pct = row.total ? Math.round((row.completed / row.total) * 100) : 0
                  return (
                    <div className="cat" key={row.category}>
                      <div className="cat__top">
                        <b>
                          <i
                            className="dot"
                            style={{
                              background: categoryColor[row.category] || 'var(--blue-500)',
                              display: 'inline-block',
                              marginRight: 8,
                            }}
                          />
                          {row.category}
                        </b>
                        <span>
                          {row.completed}/{row.total}
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress__fill"
                          style={{
                            width: `${pct}%`,
                            background: categoryColor[row.category] || 'var(--blue-600)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ---------- Priorities ---------- */}
            <div className="card">
              <div className="card__head">
                <h2>Workload by priority</h2>
                <span className="stat__icon" style={{ width: 30, height: 30 }}>
                  <IconTarget size={16} />
                </span>
              </div>
              <div className="card__body" style={{ display: 'grid', gap: 14 }}>
                {priorities.map((row) => (
                  <div className="fact" key={row.priority}>
                    <span>
                      <span className={`badge badge--${row.priority.toLowerCase()}`}>{row.priority}</span>
                    </span>
                    <b>
                      {row.pending} pending
                      <span style={{ color: 'var(--muted)', fontWeight: 500 }}> / {row.total}</span>
                    </b>
                  </div>
                ))}
                <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.6 }}>
                  High priority tasks are shown first in your task list, so tackle those when you
                  have the most energy.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
