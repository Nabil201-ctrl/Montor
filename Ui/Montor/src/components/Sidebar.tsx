import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { to: '/projects', label: 'Projects', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round"/></svg>
  )},
  { to: '/feed', label: 'Feed', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" strokeLinecap="round"/><circle cx="5" cy="19" r="1"/></svg>
  )},
  { to: '/leaderboard', label: 'Leaderboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9zm12 0h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9zm-1 5.51V21H7v-6.49M5 21h14" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 4L8 9h8l-4-5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { to: '/badges', label: 'Badges', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { to: '/devlogs', label: 'DevLogs', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )},
  { to: '/settings', label: 'Settings', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  )},
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="w-60 min-h-screen bg-bg-elevated border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">M</div>
        <span className="font-bold tracking-tight">Montor</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text hover:bg-surface'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-text-muted truncate">@{user.login}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted mb-3">
            <span>⚡ {user.momentumPoints} pts</span>
            <span className="text-accent">Vibe {user.vibeScore}%</span>
          </div>
          <button onClick={handleLogout} className="w-full text-xs text-text-muted hover:text-red-400 transition-colors text-left py-1">
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
