const router = require('express').Router()
const { Circles, Users } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { calculateVelocity } = require('../services/velocity')

// GET /api/circles — list user's circles
router.get('/', requireAuth, async (req, res) => {
  const circles = await Circles.findByUser(req.user.id)
  const enriched = circles.map(c => ({
    ...c,
    memberCount: c.members.length,
    members: c.members.map(u => ({ id: u.id, login: u.login, name: u.name, avatarUrl: u.avatarUrl })),
  }))
  res.json(enriched)
})

// POST /api/circles — create a circle
router.post('/', requireAuth, async (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const circle = await Circles.create({ name, description: description || '', ownerId: req.user.id })
  res.status(201).json(circle)
})

// POST /api/circles/join — join by invite code
router.post('/join', requireAuth, async (req, res) => {
  const { inviteCode } = req.body
  if (!inviteCode) return res.status(400).json({ error: 'inviteCode is required' })
  const circle = await Circles.findByInviteCode(inviteCode.toUpperCase())
  if (!circle) return res.status(404).json({ error: 'Invalid invite code' })
  await Circles.join(circle.id, req.user.id)
  res.json(circle)
})

// GET /api/circles/:id — single circle detail
router.get('/:id', requireAuth, async (req, res) => {
  const circle = await Circles.findById(req.params.id)
  if (!circle) return res.status(404).json({ error: 'Not found' })
  
  const isMember = circle.members.some(m => m.id === req.user.id) || circle.ownerId === req.user.id
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const members = await Promise.all(circle.members.map(async (u) => {
    return {
      id: u.id, login: u.login, name: u.name, avatarUrl: u.avatarUrl,
      velocity: await calculateVelocity(u.id), momentumPoints: u.momentumPoints || 0,
    }
  }))
  
  members.sort((a, b) => b.velocity - a.velocity)

  res.json({ ...circle, members })
})

module.exports = router
