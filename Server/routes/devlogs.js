const router = require('express').Router()
const { DevLogs, Projects } = require('../db')
const { requireAuth } = require('../middleware/auth')

// GET /api/devlogs — all devlogs for user across all projects
router.get('/', requireAuth, async (req, res) => {
  const logs = await DevLogs.findByUser(req.user.id)

  // Enrich with project name
  const enriched = await Promise.all(logs.map(async (log) => {
    if (log.projectName) return log
    const project = await Projects.findById(log.projectId)
    return {
      ...log,
      projectName: project?.name || 'Unknown',
    }
  }))

  res.json(enriched)
})

module.exports = router
