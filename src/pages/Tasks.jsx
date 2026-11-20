import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useToast } from '../components/Toast.jsx'
import TaskForm from '../components/TaskForm.jsx'
import TaskItem from '../components/TaskItem.jsx'
import { CATEGORIES, PRIORITIES } from '../utils.js'
import { IconInbox, IconPlus, IconSearch } from '../components/Icons.jsx'

export default function Tasks() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [priority, setPriority] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // Wait until the student stops typing before searching.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(id)
  }, [searchInput])

  const load = useCallback(async () => {
    try {
      setError('')
      const data = await api.listTasks({ status, category, priority, search })
      setTasks(data.tasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [status, category, priority, search])

  useEffect(() => {
    load()
  }, [load])

  // The "New Task" button in the top bar links to /tasks?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null)
      setModalOpen(true)
      searchParams.delete('new')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function handleSubmit(payload) {
    if (editing) {
      await api.updateTask(editing.id, { ...payload, status: editing.status })
      toast.success('Task updated')
    } else {
      await api.createTask(payload)
      toast.success('Task created')
    }
    await load()
  }

  async function handleToggle(task) {
    const next = task.status === 'completed' ? 'pending' : 'completed'
    // Update the screen instantly, then save.
    setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, status: next } : t)))
    try {
      await api.setTaskStatus(task.id, next)
      toast.success(next === 'completed' ? 'Marked as completed' : 'Moved back to pending')
      await load()
    } catch (err) {
      toast.error(err.message)
      await load()
    }
  }

  async function handleDelete(task) {
    const sure = window.confirm(`Delete "${task.title}"? This cannot be undone.`)
    if (!sure) return
    try {
      await api.deleteTask(task.id)
      setTasks((all) => all.filter((t) => t.id !== task.id))
      toast.success('Task deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditing(task)
    setModalOpen(true)
  }

  const counts = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending').length
    return { pending, completed: tasks.length - pending }
  }, [tasks])

  const hasFilters = status !== 'all' || category !== 'all' || priority !== 'all' || search !== ''

  return (
    <>
      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Filter by status">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={status === tab.key}
              className={status === tab.key ? 'is-active' : ''}
              onClick={() => setStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="toolbar__search">
          <IconSearch size={17} />
          <input
            className="input"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search tasks"
          />
        </div>

        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {loading ? 'Loading...' : `${counts.pending} pending · ${counts.completed} completed`}
          {hasFilters && !loading ? ' · filtered' : ''}
        </p>
        <button className="btn btn--primary btn--sm" onClick={openCreate}>
          <IconPlus size={15} />
          Add task
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="boot" style={{ height: 220 }}>
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__icon">
              <IconInbox size={26} />
            </div>
            <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
            <p>
              {hasFilters
                ? 'Try clearing the search or choosing a different category.'
                : 'Add your first assignment, exam or project to get started.'}
            </p>
            {hasFilters ? (
              <button
                className="btn btn--ghost"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setStatus('all')
                  setCategory('all')
                  setPriority('all')
                  setSearchInput('')
                }}
              >
                Clear filters
              </button>
            ) : (
              <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={openCreate}>
                <IconPlus size={16} />
                Add your first task
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskForm
        open={modalOpen}
        task={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}
