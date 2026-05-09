import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2'
import { useAuth } from '../context/AuthContext'
import { stats, projects as projectsApi } from '../lib/api'
import '../lib/chart-setup'
import { CHART_COLORS, accentGradient, greenGradient } from '../lib/chart-setup'

function StatCard({ label, value, sub, color = 'accent' }: any) {
  const colors: any = { accent: 'text-accent', green: 'text-green', orange: 'text-orange-400' }
  return (
    <div className="bg-bg-card border border-border rounded-radius p-6">
      <div className={`text-3xl font-black mb-1 ${colors[color]}`}>{value}</div>
      <div className="text-sm font-semibold mb-0.5">{label}</div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  )
}

// Dashboard page showing momentum and health tracking
export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [projs, setProjs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const lineRef = useRef<any>(null)

  useEffect(() => {
    Promise.all([stats.dashboard(), projectsApi.list()])
      .then(([s, p]: any) => { setData(s); setProjs(p.slice(0, 4)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen text-text-muted">Loading...</div>

  const vibePercent = data ? Math.round((data.vibeProjects / (data.activeProjects || 1)) * 100) : 50
  const systemPercent = 100 - vibePercent

  const weekly = data?.weeklyActivity || { labels: [], commits: [], momentum: [], velocity: [] }

  // ─── Chart Configs ────────────────────────────────────────────────────────
  const momentumLineData = {
    labels: weekly.labels,
    datasets: [
      {
        label: 'Momentum Points',
        data: weekly.momentum,
        borderColor: CHART_COLORS.accent,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          return accentGradient(ctx, context.chart.height)
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS.accent,
        pointBorderColor: CHART_COLORS.bgCard,
        pointBorderWidth: 2,
      },
      {
        label: 'Commits',
        data: weekly.commits,
        borderColor: CHART_COLORS.green,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          return greenGradient(ctx, context.chart.height)
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS.green,
        pointBorderColor: CHART_COLORS.bgCard,
        pointBorderWidth: 2,
      },
    ],
  }

  const momentumLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const, labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: CHART_COLORS.bgCard,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { color: 'rgba(39,39,42,0.5)' } },
      y: { grid: { color: 'rgba(39,39,42,0.5)' }, beginAtZero: true },
    },
  }

  const phaseDonutData = {
    labels: ['Vibe Coding', 'Transition', 'System Platform'],
    datasets: [{
      data: [data?.vibeProjects || 1, 1, data?.systemProjects || 0],
      backgroundColor: [CHART_COLORS.accent, CHART_COLORS.orange, CHART_COLORS.green],
      borderColor: CHART_COLORS.bgCard,
      borderWidth: 3,
      hoverOffset: 8,
    }],
  }

  const phaseDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.bgCard,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        padding: 12,
        cornerRadius: 8,
      },
    },
  }

  const velocityBarData = {
    labels: weekly.labels,
    datasets: [{
      label: 'Velocity Score',
      data: weekly.velocity,
      backgroundColor: weekly.velocity.map((v: number) =>
        v > 60 ? CHART_COLORS.green : v > 35 ? CHART_COLORS.accent : CHART_COLORS.orange
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  const velocityBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.bgCard,
        borderColor: CHART_COLORS.border,
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(39,39,42,0.5)' }, beginAtZero: true },
    },
  }

  const healthRadarData = {
    labels: ['Commit Freq', 'Sentiment', 'Consistency', 'Phase Progress', 'Documentation', 'Test Coverage'],
    datasets: [{
      label: 'Project Health',
      data: data?.radarMetrics || [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: CHART_COLORS.accent,
      borderWidth: 2,
      pointBackgroundColor: CHART_COLORS.accent,
      pointBorderColor: CHART_COLORS.bgCard,
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  }

  const healthRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: 'rgba(39,39,42,0.5)' },
        angleLines: { color: 'rgba(39,39,42,0.5)' },
        pointLabels: { color: '#a1a1aa', font: { size: 11 } },
      },
    },
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-muted text-sm">Here's your momentum overview.</p>
        </div>
        <Link to="/projects" className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-radius-sm hover:bg-accent-light transition-all">
          + Add Project
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Projects" value={data?.activeProjects ?? 0} sub="across all repos" />
        <StatCard label="Milestones" value={data?.totalMilestones ?? 0} color="green" sub="AI-generated" />
        <StatCard label="Momentum Points" value={`⚡ ${data?.momentumPoints ?? 0}`} color="orange" sub="keep shipping!" />
        <StatCard label="Avg Health" value={`${data?.avgHealth ?? 100}%`} sub="across all projects" />
      </div>

      {/* Charts Row 1: Momentum Line + Phase Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-bg-card border border-border rounded-radius p-6">
          <h3 className="font-bold mb-1">Weekly Momentum</h3>
          <p className="text-xs text-text-muted mb-4">Commits and momentum points over the past week</p>
          <div className="h-[280px]">
            <Line ref={lineRef} data={momentumLineData} options={momentumLineOptions} />
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-radius p-6">
          <h3 className="font-bold mb-1">Phase Distribution</h3>
          <p className="text-xs text-text-muted mb-4">Where your projects stand</p>
          <div className="h-[200px] flex items-center justify-center">
            <Doughnut data={phaseDonutData} options={phaseDonutOptions} />
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span> Vibe</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> Transition</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green inline-block"></span> System</span>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Velocity Bar + Health Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-card border border-border rounded-radius p-6">
          <h3 className="font-bold mb-1">Daily Velocity</h3>
          <p className="text-xs text-text-muted mb-4">Quality-weighted progress score per day</p>
          <div className="h-[240px]">
            <Bar data={velocityBarData} options={velocityBarOptions} />
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-radius p-6">
          <h3 className="font-bold mb-1">Health Radar</h3>
          <p className="text-xs text-text-muted mb-4">Multi-dimensional project health analysis</p>
          <div className="h-[240px]">
            <Radar data={healthRadarData} options={healthRadarOptions} />
          </div>
        </div>
      </div>

      {/* Vibe bar */}
      <div className="bg-bg-card border border-border rounded-radius p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block"></span>
            Portfolio Phase
          </div>
          <span className="text-xs font-mono text-text-muted">{vibePercent}% Vibe · {systemPercent}% System</span>
        </div>
        <div className="relative h-2.5 bg-surface rounded-full overflow-hidden border border-border">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-accent-light shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-700"
            style={{ width: `${vibePercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>Vibe Coding</span>
          <span>System Platform</span>
        </div>
      </div>

      {/* Recent projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Recent Projects</h2>
          <Link to="/projects" className="text-accent text-sm hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projs.length === 0 ? (
            <div className="col-span-2 bg-bg-card border border-dashed border-border rounded-radius p-10 text-center text-text-muted">
              <p className="mb-3">No projects yet.</p>
              <Link to="/projects" className="text-accent text-sm hover:underline">Import from GitHub →</Link>
            </div>
          ) : projs.map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="bg-bg-card border border-border rounded-radius p-5 hover:border-accent transition-all group block">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold group-hover:text-accent transition-colors">{p.name}</h3>
                  <p className="text-xs text-text-muted truncate max-w-[200px]">{p.description || 'No description'}</p>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${
                  p.phase === 'vibe' ? 'text-accent border-accent/30 bg-accent/5' :
                  p.phase === 'system' ? 'text-green border-green/30 bg-green/5' :
                  'text-orange-400 border-orange-400/30 bg-orange-400/5'
                }`}>{p.phase}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>⚡ {p.momentumPoints || 0} pts</span>
                <span>{p.commitCount || 0} commits</span>
                {p.language && <span className="text-accent-light">{p.language}</span>}
              </div>
              <div className="mt-3 h-1 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-accent/50 rounded-full" style={{ width: `${p.vibeScore || 50}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent milestones */}
      {data?.recentMilestones?.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">Recent Milestones</h2>
          <div className="space-y-3">
            {data.recentMilestones.map((m: any) => (
              <div key={m.id} className="bg-bg-card border border-border rounded-radius p-4 flex items-start gap-3">
                <span className="text-xl">{m.sentimentEmoji || '🚀'}</span>
                <div>
                  <div className="font-semibold text-sm mb-1">{m.title}</div>
                  <div className="text-xs text-text-muted">{m.summary}</div>
                  <div className="flex gap-2 mt-2">
                    {m.tags?.map((t: string) => (
                      <span key={t} className="text-[10px] font-mono text-accent-light bg-accent/5 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
