import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { IconBook, IconCheck } from '../components/Icons.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not log in.')
    } finally {
      setBusy(false)
    }
  }

  function useDemo() {
    setEmail('demo@student.com')
    setPassword('demo123')
    setError('')
  }

  return (
    <div className="auth">
      <aside className="auth__side">
        <div className="auth__brand">
          <div className="auth__logo">
            <IconBook size={21} />
          </div>
          StudyFlow
        </div>

        <div className="auth__pitch">
          <h2>Every deadline, one calm dashboard.</h2>
          <p>
            StudyFlow keeps your assignments, exams and projects in one place, so you always know
            what to do next.
          </p>
          <ul className="auth__list">
            {[
              'Track assignments, exams and projects',
              'See what is due today and what is overdue',
              'A calendar view of your whole month',
            ].map((item) => (
              <li key={item}>
                <span className="auth__check">
                  <IconCheck size={12} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth__foot">Smart Student Task Manager</div>
      </aside>

      <main className="auth__main">
        <form className="auth__form" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p>Log in to see your tasks and deadlines.</p>

          {error && <div className="alert">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@student.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Logging in...' : 'Log in'}
          </button>

          <p className="auth__switch">
            New here? <Link to="/register">Create an account</Link>
          </p>

          <div className="card" style={{ marginTop: 26, background: '#f8fbff' }}>
            <div className="card__body" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
                Want to look around first? Use the demo account.
              </div>
              <button type="button" className="btn btn--ghost btn--sm btn--block" onClick={useDemo}>
                Fill demo login details
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
