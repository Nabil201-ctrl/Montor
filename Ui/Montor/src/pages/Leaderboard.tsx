import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { leaderboard as api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import '../lib/chart-setup'
import { CHART_COLORS } from '../lib/chart-setup'

const tierColors: Record<string, string> = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-orange-400',
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [board, setBoard] = useState<any[]>([])
  const [myRank, setMyRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.global(50), api.me()])
      .then(([b, r]: any) => { setBoard(b); setMyRank(r) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">Velocity Leaderboard</h1>
        <p className="text-text-muted text-sm">Ranked by AI-verified progress, not busy work.</p>
      </div>

      {/* My rank card */}
      {myRank && (
        <div className="bg-accent/5 border border-accent/20 rounded-radius p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center text-2xl font-black text-white">
              #{myRank.rank}
            </div>
            <div>
              <div className="font-bold">Your Position</div>
              <div className="text-text-muted text-sm">Top {myRank.percentile}% of all builders</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-accent">{myRank.velocity}</div>
            <div className="text-xs text-text-muted font-mono">VELOCITY</div>
          </div>
        </div>
      )}

      {/* Velocity comparison chart */}
      {board.length > 0 && (
        <div className="bg-bg-card border border-border rounded-radius p-6 mb-8">
          <h3 className="font-bold mb-1 text-sm">Velocity Comparison</h3>
          <p className="text-xs text-text-muted mb-4">Top builders ranked by AI-verified quality progress</p>
          <div className="h-[200px]">
            <Bar
              data={{
                labels: board.slice(0, 10).map((e: any) => `@${e.login}`),
                datasets: [{
                  label: 'Velocity',
                  data: board.slice(0, 10).map((e: any) => e.velocity),
                  backgroundColor: board.slice(0, 10).map((_: any, i: number) =>
                    i === 0 ? CHART_COLORS.green : i < 3 ? CHART_COLORS.accent : CHART_COLORS.accentLight
                  ),
                  borderRadius: 6,
                  borderSkipped: false,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(39,39,42,0.4)' }, beginAtZero: true },
                  y: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="bg-bg-card border border-border rounded-radius overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-3 border-b border-border text-xs font-mono text-text-muted uppercase tracking-wider">
          <span>Rank</span>
          <span>Builder</span>
          <span className="text-right">Velocity</span>
          <span className="text-right">Momentum</span>
          <span className="text-right">Badges</span>
        </div>
        {board.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">
            No builders yet. Be the first to earn velocity points!
          </div>
        ) : board.map((entry: any) => (
          <div
            key={entry.id}
            className={`grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-4 border-b border-border last:border-0 items-center transition-all hover:bg-surface ${
              entry.id === user?.id ? 'bg-accent/5' : ''
            }`}
          >
            <span className={`text-lg font-black ${tierColors[entry.rank] || 'text-text-muted'}`}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </span>
            <div className="flex items-center gap-3 min-w-0">
              <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold truncate">{entry.name}</div>
                <div className="text-xs text-text-muted truncate">@{entry.login} · {entry.projectCount} projects</div>
              </div>
            </div>
            <div className="text-right font-black text-accent">{entry.velocity}</div>
            <div className="text-right text-text-secondary">⚡ {entry.momentumPoints}</div>
            <div className="text-right text-text-muted">{entry.badges} 🏅</div>
          </div>
        ))}
      </div>
    </div>
  )
}
