import { useEffect, useState } from 'react'
import { feed as api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function SocialFeed() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.list(50).then((data: any) => setItems(data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleBoost = async (id: string) => {
    await api.boost(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, boosts: (i.boosts || 0) + 1 } : i))
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">Momentum Feed</h1>
        <p className="text-text-muted text-sm">See what builders are shipping — in real-time.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-bg-card border border-dashed border-border rounded-radius p-16 text-center">
          <div className="text-4xl mb-4">📡</div>
          <h3 className="font-bold text-lg mb-2">The feed is quiet</h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Publish your first milestone from a project detail page to start the conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item: any) => (
            <div key={item.id} className="bg-bg-card border border-border rounded-radius p-6 hover:border-accent/30 transition-all">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                {item.user?.avatarUrl && (
                  <img src={item.user.avatarUrl} alt="" className="w-9 h-9 rounded-full" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.user?.name || 'Anonymous'}</div>
                  <div className="text-xs text-text-muted">@{item.user?.login} · {new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="text-xl">{item.sentimentEmoji || '🚀'}</span>
              </div>

              {/* Content */}
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">{item.summary}</p>
              {item.message && <p className="text-text-muted text-sm italic mb-4">"{item.message}"</p>}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags?.map((tag: string) => (
                  <span key={tag} className="text-[10px] font-mono text-accent-light bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button
                  onClick={() => handleBoost(item.id)}
                  className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item.boosts || 0} Boosts
                </button>
                <span className="text-sm text-text-muted">{item.comments?.length || 0} Comments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
