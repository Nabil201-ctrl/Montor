const router = require('express').Router()
const { Sprints, Users } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { calculateVelocity } = require('../services/velocity')

// GET /api/sprints — list active sprints
router.get('/', async (req, res) => {
  const sprints = await Sprints.findAll()
  const formatted = sprints.map(s => {
    return {
      ...s,
      participantCount: s.participants?.length || 0,
      creator: s.creator ? { login: s.creator.login, name: s.creator.name, avatarUrl: s.creator.avatarUrl } : null,
      isActive: new Date(s.endsAt) > new Date(),
    }
  })
  res.json(formatted)
})

// POST /api/sprints — create a sprint
router.post('/', requireAuth, async (req, res) => {
  const { name, description, durationHours } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const hours = durationHours || 48
  const startsAt = new Date().toISOString()
  const endsAt = new Date(Date.now() + hours * 3600 * 1000).toISOString()
  
  const scores = {}
  scores[req.user.id] = 0

  const sprint = await Sprints.create({
    title: name,
    description: description || '',
    creatorId: req.user.id,
    startsAt,
    endsAt,
    scores
  })
  
  res.status(201).json(sprint)
})

// POST /api/sprints/:id/join — join a sprint
router.post('/:id/join', requireAuth, async (req, res) => {
  const sprint = await Sprints.join(req.params.id, req.user.id)
  if (!sprint) return res.status(404).json({ error: 'Sprint not found' })
  res.json(sprint)
})

// GET /api/sprints/:id — sprint detail with scoreboard
router.get('/:id', async (req, res) => {
  const sprint = await Sprints.findById(req.params.id)
  if (!sprint) return res.status(404).json({ error: 'Not found' })

  const scoreboard = await Promise.all((sprint.participants || []).map(async (u) => {
    return {
      id: u.id, login: u.login, name: u.name, avatarUrl: u.avatarUrl,
      score: sprint.scores?.[u.id] || 0,
      velocity: await calculateVelocity(u.id),
    }
  }))
  
  scoreboard.sort((a, b) => b.score - a.score)
  const ranked = scoreboard.map((u, i) => ({ ...u, rank: i + 1 }))

  res.json({
    ...sprint,
    scoreboard: ranked,
    isActive: new Date(sprint.endsAt) > new Date(),
    timeRemaining: Math.max(0, new Date(sprint.endsAt) - new Date()),
  })
})

module.exports = router
