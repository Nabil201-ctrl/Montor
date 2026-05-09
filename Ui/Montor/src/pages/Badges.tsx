import { useEffect, useState } from 'react'
import { badges as api } from '../lib/api'

const tierStyles: Record<string, string> = {
  bronze: 'border-orange-700/40 bg-orange-900/10',
  silver: 'border-gray-400/40 bg-gray-500/10',
  gold: 'border-yellow-500/40 bg-yellow-900/10',
  platinum: 'border-accent/40 bg-accent/10',
}

export default function Badges() {
  const [allBadges, setAllBadges] = useState<any[]>([])
  const [myBadges, setMyBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    Promise.all([api.all(), api.mine()])
      .then(([a, m]: any) => { setAllBadges(a); setMyBadges(m) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const checkBadges = async () => {
    setChecking(true)
    try {
      const result = await api.check() as any
      setMyBadges(result.badges || [])
    } catch (e) { console.error(e) }
    setChecking(false)
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>

  const earnedTypes = new Set(myBadges.map((b: any) => b.type))

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Proof of Work</h1>
          <p className="text-text-muted text-sm">Earn badges through real, AI-verified progress.</p>
        </div>
        <button
          onClick={checkBadges}
          disabled={checking}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-radius-sm hover:bg-accent-light transition-all disabled:opacity-50"
        >
          {checking ? 'Checking...' : '✦ Check Progress'}
        </button>
      </div>

      {/* Earned badges */}
      {myBadges.length > 0 && (
        <div className="mb-10">
          <h2 className="font-bold text-lg mb-4">Earned ({myBadges.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myBadges.map((badge: any) => (
              <div key={badge.type} className={`border rounded-radius p-5 text-center ${tierStyles[badge.tier] || tierStyles.bronze}`}>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="font-bold text-sm mb-1">{badge.name}</div>
                <div className="text-xs text-text-muted">{badge.desc}</div>
                <div className="text-[10px] font-mono text-text-muted mt-2 uppercase">{badge.tier}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All badges */}
      <h2 className="font-bold text-lg mb-4">All Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allBadges.map((badge: any) => {
          const earned = earnedTypes.has(badge.type)
          return (
            <div
              key={badge.type}
              className={`border rounded-radius p-5 text-center transition-all ${
                earned
                  ? tierStyles[badge.tier] || tierStyles.bronze
                  : 'border-border bg-bg-card opacity-40 grayscale'
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <div className="font-bold text-sm mb-1">{badge.name}</div>
              <div className="text-xs text-text-muted">{badge.desc}</div>
              <div className="text-[10px] font-mono text-text-muted mt-2 uppercase">
                {earned ? '✅ earned' : badge.tier}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
