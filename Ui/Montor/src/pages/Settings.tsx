import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">Settings</h1>
        <p className="text-text-muted text-sm">Manage your account and integrations.</p>
      </div>

      {/* Profile */}
      <section className="bg-bg-card border border-border rounded-radius p-6 mb-6">
        <h2 className="font-bold mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          {user?.avatarUrl && <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full border-2 border-border" />}
          <div>
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="text-text-muted text-sm">@{user?.login}</div>
          </div>
        </div>
      </section>

      {/* GitHub integration */}
      <section className="bg-bg-card border border-border rounded-radius p-6 mb-6">
        <h2 className="font-bold mb-2">GitHub Integration</h2>
        <p className="text-text-muted text-sm mb-4">Montor is connected to your GitHub account via OAuth.</p>
        <div className="flex items-center gap-2 text-sm text-green">
          <span className="w-2 h-2 rounded-full bg-green inline-block" />
          Connected as @{user?.login}
        </div>
      </section>

      {/* Webhook setup */}
      <section className="bg-bg-card border border-border rounded-radius p-6 mb-6">
        <h2 className="font-bold mb-2">GitHub Webhooks</h2>
        <p className="text-text-muted text-sm mb-4">Add this webhook URL to your repos for auto-milestone generation:</p>
        <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg font-mono text-xs text-text-secondary">
          <span className="text-accent">POST</span>
          http://localhost:3001/api/webhooks/github
        </div>
        <p className="text-text-muted text-xs mt-2">Content type: <code className="text-accent">application/json</code> · Events: <code className="text-accent">push</code></p>
      </section>

      {/* Danger zone */}
      <section className="bg-bg-card border border-red-900/30 rounded-radius p-6">
        <h2 className="font-bold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-text-muted text-sm mb-4">Signing out will require you to reconnect your GitHub account.</p>
        <button onClick={logout} className="px-4 py-2 border border-red-900/50 text-red-400 text-sm font-semibold rounded-radius-sm hover:bg-red-900/20 transition-all">
          Sign Out
        </button>
      </section>
    </div>
  )
}
