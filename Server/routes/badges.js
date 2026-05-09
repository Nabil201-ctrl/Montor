const router = require('express').Router()
const { Users, BadgeTypes } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { calculateVelocity } = require('../services/velocity')

// GET /api/badges — list all badge types
router.get('/', (req, res) => {
  res.json(Object.values(BadgeTypes))
})

// GET /api/badges/me — current user's badges
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user.badges || [])
})

// POST /api/badges/check — evaluate and award badges for current user
router.post('/check', requireAuth, async (req, res) => {
  const { Projects, Milestones } = require('../db')
  const user = req.user
  const velocity = await calculateVelocity(user.id)
  const projects = await Projects.findByUser(user.id)
  const allMilestonesArrays = await Promise.all(projects.map(p => Milestones.findByProject(p.id)))
  const allMilestones = allMilestonesArrays.flat()
  const awarded = []

  // First milestone
  if (allMilestones.length >= 1) {
    const b = await Users.addBadge(user.id, BadgeTypes.FIRST_MILESTONE)
    if (b) awarded.push(BadgeTypes.FIRST_MILESTONE)
  }

  // Vibe to system
  const hasSystemProject = projects.some(p => p.phase === 'system')
  if (hasSystemProject) {
    await Users.addBadge(user.id, BadgeTypes.VIBE_TO_SYSTEM)
    awarded.push(BadgeTypes.VIBE_TO_SYSTEM)
  }

  // Flow state
  const flowMilestones = allMilestones.filter(m => m.tags?.includes('#flow-state'))
  if (flowMilestones.length > 0) {
    await Users.addBadge(user.id, BadgeTypes.FLOW_STATE)
    awarded.push(BadgeTypes.FLOW_STATE)
  }

  // Velocity thresholds
  if (velocity >= 100) {
    await Users.addBadge(user.id, BadgeTypes.VELOCITY_100)
    awarded.push(BadgeTypes.VELOCITY_100)
  }
  if (velocity >= 500) {
    await Users.addBadge(user.id, BadgeTypes.VELOCITY_500)
    awarded.push(BadgeTypes.VELOCITY_500)
  }

  // Verified ship (AI confirms full journey)
  const phaseShifts = allMilestones.filter(m => m.tags?.includes('#phase-shift'))
  if (phaseShifts.length >= 3 && hasSystemProject) {
    await Users.addBadge(user.id, BadgeTypes.VERIFIED_SHIP)
    awarded.push(BadgeTypes.VERIFIED_SHIP)
  }

  const updatedUser = await Users.findById(user.id)
  res.json({ badges: updatedUser.badges || [], newlyAwarded: awarded })
})

module.exports = router
