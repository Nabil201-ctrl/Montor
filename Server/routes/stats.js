const router = require('express').Router()
const { Projects, Milestones, DevLogs } = require('../db')
const { requireAuth } = require('../middleware/auth')

// GET /api/stats — dashboard summary for current user
router.get('/', requireAuth, async (req, res) => {
  const projects = await Projects.findByUser(req.user.id)
  const allMilestonesArrays = await Promise.all(projects.map(p => Milestones.findByProject(p.id)))
  const allMilestones = allMilestonesArrays.flat()
  const allDevLogs = await DevLogs.findByUser(req.user.id)

  const vibeProjects = projects.filter(p => p.phase === 'vibe').length
  const systemProjects = projects.filter(p => p.phase === 'system').length
  const avgHealth = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.healthScore || 100), 0) / projects.length)
    : 100

  // Calculate weekly activity (last 7 days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const weeklyLabels = []
  const weeklyCommits = []
  const weeklyMomentum = []
  const weeklyVelocity = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = days[d.getDay()]
    const dateStr = d.toISOString().split('T')[0]

    const dayLogs = allDevLogs.filter(l => l.createdAt && l.createdAt.startsWith(dateStr))
    weeklyLabels.push(label)
    weeklyCommits.push(dayLogs.reduce((s, l) => s + (l.commits || 0), 0))
    weeklyMomentum.push(dayLogs.length * 20) // 20 pts per session
    weeklyVelocity.push(dayLogs.reduce((s, l) => s + (l.commits || 0), 0) * 5) // 5 pts per commit
  }

  res.json({
    activeProjects: projects.length,
    totalMilestones: allMilestones.length,
    totalDevLogs: allDevLogs.length,
    momentumPoints: req.user.momentumPoints || 0,
    vibeScore: req.user.vibeScore || 50,
    avgHealth,
    vibeProjects,
    systemProjects,
    weeklyActivity: {
      labels: weeklyLabels,
      commits: weeklyCommits,
      momentum: weeklyMomentum,
      velocity: weeklyVelocity,
    },
    radarMetrics: [
      projects.length ? Math.min(100, Math.round(projects.reduce((s, p) => s + (p.commitCount || 0), 0) / (projects.length * 5))) : 0, // Commit Freq
      allMilestones.length ? Math.min(100, Math.round((allMilestones.filter(m => m.sentiment === 'excited').length / allMilestones.length) * 100)) : 50, // Sentiment
      req.user.streak ? Math.min(100, req.user.streak * 10) : 20, // Consistency
      vibeProjects > 0 ? Math.round((systemProjects / projects.length) * 100) : 50, // Phase
      allDevLogs.length ? Math.min(100, allDevLogs.length * 5) : 10, // Documentation
      projects.filter(p => p.phase === 'system').length * 20, // Test Coverage (proxy)
    ],
    recentMilestones: allMilestones.slice(-5).reverse(),
    recentDevLogs: allDevLogs.slice(0, 5),
  })
})

// GET /api/stats/health — lightweight health check (no auth)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = router
