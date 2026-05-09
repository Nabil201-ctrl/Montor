// Velocity & Leaderboard System
const { Users, Projects, Milestones } = require('../db')

// Weights for velocity scoring
const WEIGHTS = {
  milestoneComplete: 25,
  phaseShift: 50,        // vibe → system transition
  flowState: 15,         // 5+ commits in one session
  consistency: 10,       // daily activity streak
  aiVerified: 35,        // AI confirmed meaningful progress
}

async function calculateVelocity(userId) {
  const projects = await Projects.findByUser(userId)
  const allMilestonesArrays = await Promise.all(projects.map(p => Milestones.findByProject(p.id)))
  const allMilestones = allMilestonesArrays.flat()
  const user = await Users.findById(userId)

  let score = 0

  // Milestone points
  score += allMilestones.length * WEIGHTS.milestoneComplete

  // Phase shift bonus
  const phaseShifts = allMilestones.filter(m => m.tags?.includes('#phase-shift'))
  score += phaseShifts.length * WEIGHTS.phaseShift

  // Flow state bonus
  const flowStates = allMilestones.filter(m => m.tags?.includes('#flow-state'))
  score += flowStates.length * WEIGHTS.flowState

  // AI verified bonus
  const verified = allMilestones.filter(m => m.vibeShift > 0)
  score += verified.length * WEIGHTS.aiVerified

  // Consistency (momentum points as proxy)
  score += (user?.momentumPoints || 0) * 0.5

  return Math.round(score)
}

module.exports = { calculateVelocity, WEIGHTS }
