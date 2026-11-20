/**
 * The "add / edit task" dialog.
 * If `task` is passed in we are editing, otherwise we are creating.
 */
import { useEffect, useState } from 'react'
import { IconX } from './Icons.jsx'

const CATEGORIES = ['Assignment', 'Exam', 'Project', 'Reading', 'Personal']
const PRIORITIES = ['Low', 'Medium', 'High']

const emptyForm = { title: '', description: '', category: 'Assignment', priority: 'Medium', due_date: '' }

export default function TaskForm({ open, task, defaultDate = '', onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Fill the form when the dialog opens (edit mode) or reset it (create mode).
  useEffect(() => {
    if (!open) return
    setError('')
    setSaving(false)
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'Assignment',
        priority: task.priority || 'Medium',
        due_date: task.due_date || '',
      })
    } else {
      setForm({ ...emptyForm, due_date: defaultDate || '' })
    }
  }, [open, task, defaultDate])

  // Close with the Escape key.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.title.trim().length < 2) {
      setError('Please give the task a title (at least 2 characters).')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit({ ...form, title: form.title.trim(), due_date: form.due_date || null })
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save the task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <form onSubmit={handleSubmit}>
          <div className="modal__head">
            <div>
              <h2 id="task-form-title">{task ? 'Edit task' : 'Add a new task'}</h2>
              <p>{task ? 'Update the details and save your changes.' : 'What do you need to get done?'}</p>
            </div>
            <button type="button" className="close-x" onClick={onClose} aria-label="Close">
              <IconX size={18} />
            </button>
          </div>

          <div className="modal__body">
            {error && <div className="alert">{error}</div>}

            <div className="field">
              <label htmlFor="title">Task title</label>
              <input
                id="title"
                className="input"
                placeholder="e.g. Finish physics lab report"
                value={form.title}
                onChange={update('title')}
                maxLength={120}
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="description">Notes (optional)</label>
              <textarea
                id="description"
                className="textarea"
                placeholder="Chapters to cover, links, what to submit..."
                value={form.description}
                onChange={update('description')}
                maxLength={1000}
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label htmlFor="category">Category</label>
                <select id="category" className="select" value={form.category} onChange={update('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select id="priority" className="select" value={form.priority} onChange={update('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="due_date">Deadline</label>
              <input
                id="due_date"
                type="date"
                className="input"
                value={form.due_date}
                onChange={update('due_date')}
              />
              <div className="field__hint">Leave empty if this task has no deadline.</div>
            </div>
          </div>

          <div className="modal__foot">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
