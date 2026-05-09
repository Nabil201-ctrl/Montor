import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projects as api } from '../lib/api'

export default function Projects() {
  const [projs, setProjs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = () => {
    api.list().then((p: any) => setProjs(p)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const syncAll = async () => {
    setSyncing(true)
    await load()
    setSyncing(false)
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Projects</h1>
          <p className="text-text-muted text-sm">{projs.length} repos connected to Montor</p>
        </div>
        <button
          onClick={syncAll}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-radius-sm hover:bg-accent-light transition-all disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {syncing ? 'Syncing...' : 'Sync GitHub'}
        </button>
      </div>

      {projs.length === 0 ? (
        <div className="bg-bg-card border border-dashed border-border rounded-radius p-16 text-center">
          <div className="text-4xl mb-4">🛠️</div>
          <h3 className="font-bold text-lg mb-2">No projects yet</h3>
          <p className="text-text-muted text-sm mb-6">Click "Sync GitHub" to import your repositories automatically.</p>
          <button onClick={syncAll} className="px-6 py-2 bg-accent text-white font-semibold rounded-radius-sm text-sm hover:bg-accent-light transition-all">
            Import from GitHub
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projs.map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="bg-bg-card border border-border rounded-radius p-6 hover:border-accent transition-all group block">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold group-hover:text-accent transition-colors truncate">{p.name}</h3>
                  <p className="text-xs text-text-muted truncate mt-0.5">{p.description || 'No description'}</p>
                </div>
                <span className={`ml-2 text-[10px] font-mono uppercase px-2 py-1 rounded border flex-shrink-0 ${
                  p.phase === 'vibe' ? 'text-accent border-accent/30 bg-accent/5' :
                  p.phase === 'system' ? 'text-green border-green/30 bg-green/5' :
                  'text-orange-400 border-orange-400/30 bg-orange-400/5'
                }`}>{p.phase}</span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-text-muted mb-1">
                  <span>Vibe</span><span>System</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full" style={{ width: `${p.vibeScore || 50}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-3">
                  <span>⚡ {p.momentumPoints || 0}</span>
                  <span>{p.commitCount || 0} commits</span>
                </div>
                {p.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    {p.language}
                  </span>
                )}
              </div>

              {p.healthScore !== undefined && (
                <div className={`mt-3 text-[10px] font-mono ${p.healthScore > 70 ? 'text-green' : p.healthScore > 40 ? 'text-orange-400' : 'text-red-400'}`}>
                  ● Health {p.healthScore}% — {p.healthLabel || 'healthy'}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
