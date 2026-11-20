import { IconCheck, IconClock, IconEdit, IconTrash } from './Icons.jsx'
import { dueLabel } from '../utils.js'

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === 'completed'
  const due = dueLabel(task.due_date, task.status)

  const dateClass =
    due.state === 'overdue' ? 'is-overdue' : due.state === 'today' ? 'is-today' : ''

  return (
    <div className={`task ${done ? 'is-done' : ''}`}>
      <button
        className={`task__check ${done ? 'is-done' : ''}`}
        onClick={() => onToggle(task)}
        aria-label={done ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
        title={done ? 'Mark as pending' : 'Mark as completed'}
      >
        <IconCheck size={14} />
      </button>

      <div className="task__body">
        <div className="task__title">{task.title}</div>
        {task.description && <p className="task__desc">{task.description}</p>}

        <div className="task__meta">
          <span className="badge badge--cat">{task.category}</span>
          <span className={`badge badge--${task.priority.toLowerCase()}`}>{task.priority}</span>
          {task.due_date ? (
            <span className={`task__date ${dateClass}`}>
              <IconClock size={13} />
              {due.text}
            </span>
          ) : (
            <span className="task__date">
              <IconClock size={13} />
              No deadline
            </span>
          )}
        </div>
      </div>

      <div className="task__actions">
        <button className="icon-btn" onClick={() => onEdit(task)} title="Edit task" aria-label={`Edit ${task.title}`}>
          <IconEdit size={15} />
        </button>
        <button
          className="icon-btn danger"
          onClick={() => onDelete(task)}
          title="Delete task"
          aria-label={`Delete ${task.title}`}
        >
          <IconTrash size={15} />
        </button>
      </div>
    </div>
  )
}
