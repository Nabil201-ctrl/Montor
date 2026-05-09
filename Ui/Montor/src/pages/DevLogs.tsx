import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import '../lib/chart-setup'
import { CHART_COLORS } from '../lib/chart-setup'
import api from '../lib/api'

const moodConfig: Record<string, { emoji: string; color: string; label: string; bg: string }> = {
  flow: { emoji: '🌊', color: 'text-blue-400', label: 'Flow State', bg: 'bg-blue-500/10 border-blue-500/20' },
  productive: { emoji: '⚡', color: 'text-green', label: 'Productive', bg: 'bg-green/10 border-green/20' },
  exploring: { emoji: '🧭', color: 'text-accent-light', label: 'Exploring', bg: 'bg-accent/10 border-accent/20' },
  struggling: { emoji: '🧱', color: 'text-orange-400', label: 'Hitting a Wall', bg: 'bg-orange-500/10 border-orange-500/20' },
  frustrated: { emoji: '😤', color: 'text-red-400', label: 'Frustrated', bg: 'bg-red-500/10 border-red-500/20' },
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function DevLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    api.get('/devlogs')
      .then((data: any) => {
        const sorted = (data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setLogs(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>

  // Group logs by date
  const grouped: Record<string, any[]> = {}
  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.projectName === filter)
  filteredLogs.forEach(l => {
    const day = new Date(l.createdAt).toDateString()
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(l)
  })

  // Unique project names for filter
  const projectNames = [...new Set(logs.map(l => l.projectName).filter(Boolean))]

  // Stats
  const totalDuration = logs.reduce((s, l) => s + (l.duration || 0), 0)
  const totalCommits = logs.reduce((s, l) => s + (l.commits || 0), 0)
  const moodCounts: Record<string, number> = {}
  logs.forEach(l => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1 })

  // Activity chart data (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toDateString()
    const dayLogs = logs.filter(l => new Date(l.createdAt).toDateString() === key)
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      duration: dayLogs.reduce((s, l) => s + (l.duration || 0), 0),
      commits: dayLogs.reduce((s, l) => s + (l.commits || 0), 0),
    }
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">DevLog Timeline</h1>
        <p className="text-text-muted text-sm">Your development journey — across all projects, told chronologically.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card border border-border rounded-radius p-5 text-center">
          <div className="text-2xl font-black text-accent">{logs.length}</div>
          <div className="text-xs text-text-muted">Sessions</div>
        </div>
        <div className="bg-bg-card border border-border rounded-radius p-5 text-center">
          <div className="text-2xl font-black text-green">{formatDuration(totalDuration)}</div>
          <div className="text-xs text-text-muted">Total Coding</div>
        </div>
        <div className="bg-bg-card border border-border rounded-radius p-5 text-center">
          <div className="text-2xl font-black text-orange-400">{totalCommits}</div>
          <div className="text-xs text-text-muted">Commits</div>
        </div>
        <div className="bg-bg-card border border-border rounded-radius p-5 text-center">
          <div className="text-2xl font-black text-accent-light">{projectNames.length}</div>
          <div className="text-xs text-text-muted">Projects</div>
        </div>
      </div>

      {/* Activity chart */}
      <div className="bg-bg-card border border-border rounded-radius p-6 mb-8">
        <h3 className="font-bold text-sm mb-1">Weekly Activity</h3>
        <p className="text-xs text-text-muted mb-4">Minutes coded and commits per day</p>
        <div className="h-[180px]">
          <Bar
            data={{
              labels: last7.map(d => d.label),
              datasets: [
                {
                  label: 'Minutes',
                  data: last7.map(d => d.duration),
                  backgroundColor: CHART_COLORS.accent,
                  borderRadius: 6,
                  borderSkipped: false,
                },
                {
                  label: 'Commits',
                  data: last7.map(d => d.commits),
                  backgroundColor: CHART_COLORS.green,
                  borderRadius: 6,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: 'top' as const, labels: { usePointStyle: true, padding: 16 } },
                tooltip: { backgroundColor: CHART_COLORS.bgCard, borderColor: CHART_COLORS.border, borderWidth: 1, titleColor: '#fafafa', bodyColor: '#a1a1aa', padding: 12, cornerRadius: 8 },
              },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(39,39,42,0.4)' }, beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      {/* Mood breakdown */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(moodCounts).map(([mood, count]) => {
          const cfg = moodConfig[mood]
          if (!cfg) return null
          return (
            <div key={mood} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg}`}>
              <span className="text-lg">{cfg.emoji}</span>
              <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
              <span className="text-xs text-text-muted">×{count}</span>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex-shrink-0 ${
            filter === 'all' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-muted hover:text-text bg-surface border border-border'
          }`}
        >
          All Projects
        </button>
        {projectNames.map(name => (
          <button
            key={name}
            onClick={() => setFilter(name)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex-shrink-0 ${
              filter === name ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-muted hover:text-text bg-surface border border-border'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="bg-bg-card border border-dashed border-border rounded-radius p-16 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="font-bold text-lg mb-2">No DevLogs yet</h3>
          <p className="text-text-muted text-sm">DevLogs auto-generate when AI detects commit spikes in your projects.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />

          {Object.entries(grouped).map(([day, dayLogs]) => (
            <div key={day} className="mb-10">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-[47px] h-7 bg-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                  <span className="text-[10px] font-black text-white">{formatRelative(dayLogs[0].createdAt).toUpperCase().slice(0, 3)}</span>
                </div>
                <span className="text-sm font-semibold">{formatDate(dayLogs[0].createdAt)}</span>
                <span className="text-xs text-text-muted">
                  {dayLogs.length} session{dayLogs.length > 1 ? 's' : ''} · {formatDuration(dayLogs.reduce((s: number, l: any) => s + (l.duration || 0), 0))}
                </span>
              </div>

              {/* Day's entries */}
              <div className="space-y-4 ml-[23px] pl-8 border-l border-transparent">
                {dayLogs.map((log: any) => {
                  const mood = moodConfig[log.mood] || moodConfig.productive
                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[41px] top-5 w-3 h-3 rounded-full bg-bg border-2 border-border group-hover:border-accent transition-colors" />

                      {/* Card */}
                      <div className="bg-bg-card border border-border rounded-radius p-6 hover:border-accent/30 transition-all">
                        {/* Top bar */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg">{mood.emoji}</span>
                            <h3 className="font-bold truncate">{log.title}</h3>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono flex-shrink-0 ${mood.bg}`}>
                            <span className={mood.color}>{mood.label}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-text-secondary text-sm leading-relaxed mb-4">{log.content}</p>

                        {/* Meta bar */}
                        <div className="flex items-center gap-5 text-xs text-text-muted mb-3">
                          <Link to={`/projects/${log.projectId}`} className="flex items-center gap-1 hover:text-accent transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round"/></svg>
                            {log.projectName}
                          </Link>
                          {log.duration && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {formatDuration(log.duration)}
                            </span>
                          )}
                          {log.commits && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>
                              {log.commits} commits
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {log.tags && log.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {log.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] font-mono text-accent-light bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
