import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

const NAV = [
  { to: '/', label: 'Track', icon: '⏱' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/pricing', label: 'Upgrade', icon: '✦' },
]

export default function Layout({ children }) {
  const { dark, toggleDark, tier } = useApp()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              trackyowork
            </span>
            {tier === 'paid' && (
              <span className="text-xs px-1.5 py-0.5 rounded-md font-mono font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
                PRO
              </span>
            )}
          </NavLink>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''} ${to === '/pricing' && tier === 'free' ? 'text-amber-500!' : ''}`
                }
              >
                <span className="text-xs">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? '☀' : '◑'}
          </button>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex border-t px-2 pb-1.5 pt-1 gap-1" style={{ borderColor: 'var(--border)' }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 nav-link flex flex-col items-center gap-0.5 py-1.5 text-center ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 animate-fade-in">
        {children}
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        trackyowork — measure your focus, own your time
      </footer>
    </div>
  )
}
