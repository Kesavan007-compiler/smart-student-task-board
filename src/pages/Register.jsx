import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { IconBook, IconCheck } from '../components/Icons.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.name.trim().length < 2) return setError('Please enter your full name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('The two passwords do not match.')

    setBusy(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
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
          <h2>Start the semester organised.</h2>
          <p>
            Create a free account and add your first task in under a minute. Your tasks stay
            private to your account.
          </p>
          <ul className="auth__list">
            {['Free to use', 'Works on phone and laptop', 'Your data stays yours'].map((item) => (
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
          <h1>Create your account</h1>
          <p>It takes less than a minute.</p>

          {error && <div className="alert">{error}</div>}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              placeholder="Kesavan R"
              value={form.name}
              onChange={update('name')}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@student.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="input"
              type="password"
              placeholder="Type it again"
              value={form.confirm}
              onChange={update('confirm')}
              autoComplete="new-password"
            />
          </div>

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Creating account...' : 'Create account'}
          </button>

          <p className="auth__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  )
}
