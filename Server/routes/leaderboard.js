const router = require('express').Router()
const { Users, Projects, Milestones, Circles } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { calculateVelocity } = require('../services/velocity')

// GET /api/leaderboard — global leaderboard
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20
  const users = await Users.findAll()

  const board = await Promise.all(users.map(async (u) => {
    const userProjects = await Projects.findByUser(u.id)
    return {
      id: u.id,
      login: u.login,
      name: u.name,
      avatarUrl: u.avatarUrl,
      velocity: await calculateVelocity(u.id),
      momentumPoints: u.momentumPoints || 0,
      projectCount: userProjects.length,
      streak: u.streak || 0,
      badges: (u.badges || []).length,
      topBadge: (u.badges || [])[0] || null,
    }
  }))

  const sorted = board
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, limit)
    .map((u, i) => ({ ...u, rank: i + 1 }))

  res.json(sorted)
})

// GET /api/leaderboard/circle/:id — circle leaderboard
router.get('/circle/:id', requireAuth, async (req, res) => {
  const circle = await Circles.findById(req.params.id)
  if (!circle) return res.status(404).json({ error: 'Circle not found' })
  
  // circle.members in Prisma include is an array of user objects if using include, 
  // or I can check member ids.
  // In my db.js, Circles.findById uses include: { members: true }
  
  const isMember = circle.members.some(m => m.id === req.user.id) || circle.ownerId === req.user.id
  if (!isMember) return res.status(403).json({ error: 'Not a member' })

  const board = await Promise.all(circle.members.map(async (u) => {
    return {
      id: u.id,
      login: u.login,
      name: u.name,
      avatarUrl: u.avatarUrl,
      velocity: await calculateVelocity(u.id),
      momentumPoints: u.momentumPoints || 0,
      streak: u.streak || 0,
    }
  }))

  const sorted = board
    .sort((a, b) => b.velocity - a.velocity)
    .map((u, i) => ({ ...u, rank: i + 1 }))

  res.json({ circle: { id: circle.id, name: circle.name, inviteCode: circle.inviteCode }, leaderboard: sorted })
})

// GET /api/leaderboard/me — current user's rank
router.get('/me', requireAuth, async (req, res) => {
  const users = await Users.findAll()
  const ranked = await Promise.all(users.map(async (u) => ({ 
    id: u.id, 
    velocity: await calculateVelocity(u.id) 
  })))

  const sorted = ranked.sort((a, b) => b.velocity - a.velocity)

  const myRank = sorted.findIndex(u => u.id === req.user.id) + 1
  const myVelocity = await calculateVelocity(req.user.id)

  res.json({
    rank: myRank || sorted.length + 1,
    velocity: myVelocity,
    totalPlayers: sorted.length,
    percentile: sorted.length > 0 ? Math.round(((sorted.length - myRank) / sorted.length) * 100) : 100,
  })
})

module.exports = router
