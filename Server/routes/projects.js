const router = require('express').Router()
const { Projects, Milestones, DevLogs, Users } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { generateMilestone } = require('../services/ai')
const { ingestProjectHistory } = require('../services/github')

// GET /api/projects — list all for user
router.get('/', requireAuth, async (req, res) => {
  res.json(await Projects.findByUser(req.user.id))
})

// GET /api/projects/:id — single project detail
router.get('/:id', requireAuth, async (req, res) => {
  const project = await Projects.findById(req.params.id)
  if (!project || project.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })

  // Calculate 14-day history
  const historyLabels = []
  const historyCommits = []
  const historyVibeScore = []
  const historyMilestones = []

  const now = new Date()
  const allMilestones = await Milestones.findByProject(project.id)
  const allDevLogs = await DevLogs.findByProject(project.id)

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
    const dateStr = d.toISOString().split('T')[0]

    const dayLogs = allDevLogs.filter(l => l.createdAt && l.createdAt.startsWith(dateStr))
    const dayMilestones = allMilestones.filter(m => m.createdAt && m.createdAt.startsWith(dateStr))

    historyLabels.push(label)
    historyCommits.push(dayLogs.reduce((s, l) => s + (l.commits || 0), 0))
    historyMilestones.push(dayMilestones.length)
    historyVibeScore.push(Math.max(30, (project.vibeScore || 50) - (i * 2)))
  }

  res.json({
    ...project,
    history: {
      labels: historyLabels,
      commits: historyCommits,
      vibeScore: historyVibeScore,
      milestones: historyMilestones,
    }
  })
})

// POST /api/projects — manually add a project
router.post('/', requireAuth, async (req, res) => {
  const { name, repoUrl, description, language } = req.body
  const p = await Projects.create({ userId: req.user.id, name, repoUrl, description, language })
  res.status(201).json(p)
})

// POST /api/projects/:id/milestones — manually generate a milestone
router.post('/:id/milestones', requireAuth, async (req, res) => {
  const project = await Projects.findById(req.params.id)
  if (!project || project.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
  
  const { commitMessage, diff } = req.body
  const aiData = generateMilestone({ project, commitMessage, diff })
  const milestone = await Milestones.create({ projectId: project.id, userId: req.user.id, ...aiData })
  await Users.addMomentumPoints(req.user.id, 10)
  res.status(201).json(milestone)
})

// GET /api/projects/:id/milestones
router.get('/:id/milestones', requireAuth, async (req, res) => {
  const project = await Projects.findById(req.params.id)
  if (!project || project.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
  res.json(await Milestones.findByProject(req.params.id))
})

// GET /api/projects/:id/devlogs
router.get('/:id/devlogs', requireAuth, async (req, res) => {
  const project = await Projects.findById(req.params.id)
  if (!project || project.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
  res.json(await DevLogs.findByProject(req.params.id))
})

// POST /api/projects/:id/sync — re-sync history from GitHub
router.post('/:id/sync', requireAuth, async (req, res) => {
  const project = await Projects.findById(req.params.id)
  if (!project || project.userId !== req.user.id) return res.status(404).json({ error: 'Not found' })
  try {
    const stats = await ingestProjectHistory(req.user, project)
    if (stats.error) {
      return res.status(500).json({ error: 'Sync failed', detail: stats.error })
    }
    res.json({ message: 'Sync complete', stats })
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', detail: err.message })
  }
})

module.exports = router
