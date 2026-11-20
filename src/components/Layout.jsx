import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { IconGrid, IconList, IconCalendar, IconBook, IconLogout, IconMenu, IconPlus, IconX } from './Icons.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true, title: 'Dashboard', sub: 'An overview of your workload' },
  { to: '/tasks', label: 'My Tasks', icon: IconList, title: 'My Tasks', sub: 'Add, edit and track every task' },
  { to: '/calendar', label: 'Calendar', icon: IconCalendar, title: 'Calendar', sub: 'See deadlines month by month' },
]

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'S'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile drawer whenever the page changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const current = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))

  return (
    <div className="shell">
      <div
        className={`overlay ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <IconBook size={21} />
          </div>
          <div>
            <strong>StudyFlow</strong>
            <span>Task Manager</span>
          </div>
        </div>

        <nav className="nav">
          <div className="nav__label">Menu</div>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__spacer" />

        <div className="sidebar__user">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="sidebar__user-info">
            <strong title={user?.name}>{user?.name}</strong>
            <span title={user?.email}>{user?.email}</span>
          </div>
          <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
            <IconLogout size={15} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="topbar__menu"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <IconX size={18} /> : <IconMenu size={18} />}
          </button>

          <div className="topbar__title">
            <h1>{current?.title || 'StudyFlow'}</h1>
            <p>{current?.sub || 'Smart Student Task Manager'}</p>
          </div>

          <button className="btn btn--primary" onClick={() => navigate('/tasks?new=1')}>
            <IconPlus size={16} />
            <span>New Task</span>
          </button>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
