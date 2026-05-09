import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { projects as api } from '../lib/api'
import '../lib/chart-setup'
import { CHART_COLORS, accentGradient } from '../lib/chart-setup'

// Detail page for a specific project with charts and logs
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [devlogs, setDevlogs] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'milestones' | 'devlogs'>('overview')
  const [generating, setGenerating] = useState(false)
  const [rubberDuck, setRubberDuck] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([api.get(id), api.milestones(id), api.devlogs(id)])
      .then(([p, m, d]: any) => { setProject(p); setMilestones(m); setDevlogs(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const generateMilestone = async () => {
    if (!id) return
    setGenerating(true)
    try {
      const m = await api.createMilestone(id, { commitMessage: 'Manual session', diff: '' }) as any
      setMilestones(prev => [m, ...prev])
      setRubberDuck(m.suggestions?.[0] || '')
    } catch (e) { console.error(e) }
    setGenerating(false)
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>
  if (!project) return <div className="p-8 text-text-muted">Project not found.</div>

  const tabClass = (t: string) => `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
    tab === t ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text'
  }`

  const history = project?.history || { labels: [], commits: [], vibeScore: [], milestones: [] }

  // ─── Chart Data ─────────────────────────────────────────────────────────
  const commitLineData = {
    labels: history.labels,
    datasets: [{
      label: 'Commits',
      data: history.commits,
      borderColor: CHART_COLORS.accent,
      backgroundColor: (ctx: any) => accentGradient(ctx.chart.ctx, ctx.chart.height),
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: CHART_COLORS.accent,
      pointBorderColor: CHART_COLORS.bgCard,
      pointBorderWidth: 2,
    }],
  }

  const vibeLineData = {
    labels: history.labels,
    datasets: [{
      label: 'Vibe → System Score',
      data: history.vibeScore,
      borderColor: CHART_COLORS.green,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: CHART_COLORS.green,
      pointBorderColor: CHART_COLORS.bgCard,
      pointBorderWidth: 2,
      fill: false,
    }],
  }

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: CHART_COLORS.bgCard, borderColor: CHART_COLORS.border, borderWidth: 1, titleColor: '#fafafa', bodyColor: '#a1a1aa', padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { color: 'rgba(39,39,42,0.4)' }, ticks: { maxRotation: 45, font: { size: 10 } } },
      y: { grid: { color: 'rgba(39,39,42,0.4)' }, beginAtZero: true },
    },
  }

  const sentimentData = {
    labels: ['Excited', 'Neutral', 'Frustrated'],
    datasets: [{
      data: [
        milestones.filter(m => m.sentiment === 'excited').length || 1,
        milestones.filter(m => m.sentiment === 'neutral').length || 2,
        milestones.filter(m => m.sentiment === 'frustrated').length || 0,
      ],
      backgroundColor: [CHART_COLORS.green, CHART_COLORS.accent, CHART_COLORS.orange],
      borderColor: CHART_COLORS.bgCard,
      borderWidth: 3,
    }],
  }

  const sentimentOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { display: false } },
  }

  const milestoneBarData = {
    labels: history.labels.slice(-7),
    datasets: [{
      label: 'Milestones',
      data: history.milestones?.slice(-7) || [],
      backgroundColor: CHART_COLORS.accentLight,
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(39,39,42,0.4)' }, beginAtZero: true, ticks: { stepSize: 1 } },
    },
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/projects" className="hover:text-text transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-text">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black tracking-tight">{project.name}</h1>
            <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${
              project.phase === 'vibe' ? 'text-accent border-accent/30 bg-accent/5' :
              project.phase === 'system' ? 'text-green border-green/30 bg-green/5' :
              'text-orange-400 border-orange-400/30 bg-orange-400/5'
            }`}>{project.phase}</span>
          </div>
          <p className="text-text-muted text-sm">{project.description || 'No description set'}</p>
        </div>
        <div className="flex gap-3">
          <a href={project.repoUrl} target="_blank" rel="noopener" className="px-3 py-2 border border-border rounded-radius-sm text-sm text-text-secondary hover:border-accent hover:text-text transition-all">
            GitHub ↗
          </a>
          <button onClick={generateMilestone} disabled={generating} className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-radius-sm hover:bg-accent-light transition-all disabled:opacity-50">
            {generating ? 'Generating...' : '✦ Generate Milestone'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Commits', value: project.commitCount || 0 },
          { label: 'Momentum', value: `⚡ ${project.momentumPoints || 0}` },
          { label: 'Milestones', value: milestones.length },
          { label: 'Health', value: `${project.healthScore || 100}%` },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-border rounded-radius p-4 text-center">
            <div className="text-2xl font-black text-accent mb-1">{s.value}</div>
            <div className="text-xs text-text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Rubber Duck */}
      {rubberDuck && (
        <div className="bg-accent/5 border border-accent/20 rounded-radius p-5 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-accent mb-2">
            <span>🦆</span> AI Rubber Duck
          </div>
          <p className="text-sm text-text-secondary italic">"{rubberDuck}"</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={tabClass('overview')} onClick={() => setTab('overview')}>Overview</button>
        <button className={tabClass('milestones')} onClick={() => setTab('milestones')}>Milestones ({milestones.length})</button>
        <button className={tabClass('devlogs')} onClick={() => setTab('devlogs')}>DevLogs ({devlogs.length})</button>
      </div>

      {/* ─── Overview Tab (Charts) ──────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Commit activity + Vibe progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-card border border-border rounded-radius p-6">
              <h3 className="font-bold mb-1 text-sm">Commit Activity</h3>
              <p className="text-xs text-text-muted mb-4">Last 14 days</p>
              <div className="h-[220px]">
                <Line data={commitLineData} options={lineOpts} />
              </div>
            </div>
            <div className="bg-bg-card border border-border rounded-radius p-6">
              <h3 className="font-bold mb-1 text-sm">Vibe → System Progression</h3>
              <p className="text-xs text-text-muted mb-4">AI-detected phase score over time</p>
              <div className="h-[220px]">
                <Line data={vibeLineData} options={lineOpts} />
              </div>
            </div>
          </div>

          {/* Sentiment + Milestone frequency */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-bg-card border border-border rounded-radius p-6">
              <h3 className="font-bold mb-1 text-sm">Commit Sentiment</h3>
              <p className="text-xs text-text-muted mb-4">AI mood analysis</p>
              <div className="h-[180px] flex items-center justify-center">
                <Doughnut data={sentimentData} options={sentimentOpts} />
              </div>
              <div className="flex justify-center gap-3 mt-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green inline-block"></span> Excited</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block"></span> Neutral</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Frustrated</span>
              </div>
            </div>
            <div className="lg:col-span-2 bg-bg-card border border-border rounded-radius p-6">
              <h3 className="font-bold mb-1 text-sm">Milestone Frequency</h3>
              <p className="text-xs text-text-muted mb-4">AI milestones generated per day</p>
              <div className="h-[220px]">
                <Bar data={milestoneBarData} options={barOpts} />
              </div>
            </div>
          </div>

          {/* Vibe bar */}
          <div className="bg-bg-card border border-border rounded-radius p-5">
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span className="text-accent font-mono">Vibe Coding</span>
              <span className="font-mono">System Platform</span>
            </div>
            <div className="h-2.5 bg-surface rounded-full overflow-hidden border border-border">
              <div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${project.vibeScore || 50}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Milestones Tab ─────────────────────────────────────────── */}
      {tab === 'milestones' && (
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              No milestones yet. Click "Generate Milestone" to create your first one.
            </div>
          ) : milestones.map((m: any) => (
            <div key={m.id} className="bg-bg-card border border-border rounded-radius p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.sentimentEmoji || '🚀'}</span>
                  <h3 className="font-bold">{m.title}</h3>
                </div>
                <span className="text-[10px] font-mono text-text-muted">{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-text-secondary text-sm mb-4">{m.summary}</p>
              <div className="flex gap-2 mb-4">
                {m.tags?.map((t: string) => (
                  <span key={t} className="text-[10px] font-mono text-accent-light bg-accent/5 px-2 py-0.5 rounded border border-accent/10">{t}</span>
                ))}
              </div>
              {m.suggestions?.length > 0 && (
                <div className="border-t border-border pt-3">
                  <div className="text-[10px] font-mono text-text-muted mb-2">AI SUGGESTIONS</div>
                  <ul className="space-y-1">
                    {m.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                        <span className="text-green mt-0.5">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── DevLogs Tab ────────────────────────────────────────────── */}
      {tab === 'devlogs' && (
        <div className="space-y-4">
          {devlogs.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">No DevLogs yet — they auto-generate on commit spikes.</div>
          ) : devlogs.map((d: any) => (
            <div key={d.id} className="bg-bg-card border border-border rounded-radius p-5">
              <div className="font-semibold mb-1">{d.title}</div>
              <div className="text-sm text-text-secondary">{d.content}</div>
              <div className="text-[10px] text-text-muted mt-2">{new Date(d.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
