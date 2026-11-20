/**
 * A very small "toast" system: little messages in the corner
 * that confirm an action ("Task created") or show an error.
 */
import { createContext, useCallback, useContext, useState } from 'react'
import { IconCheck, IconAlert } from './Icons.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((all) => [...all, { id, message, type }])
    setTimeout(() => {
      setToasts((all) => all.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const value = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            {t.type === 'success' ? <IconCheck size={16} /> : <IconAlert size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
