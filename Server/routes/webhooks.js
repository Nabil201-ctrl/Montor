const router = require('express').Router()
const { Projects, Milestones, Users } = require('../db')
const { generateMilestone, analyzeHealth } = require('../services/ai')

// POST /api/webhooks/github — receive push events from GitHub App
router.post('/github', (req, res) => {
  const event = req.headers['x-github-event']
  const payload = req.body

  if (event === 'push') {
    handlePush(payload)
  } else if (event === 'ping') {
    console.log('GitHub webhook ping received')
  }

  res.status(200).json({ received: true })
})

async function handlePush(payload) {
  try {
    const repoUrl = payload.repository?.html_url
    const commits = payload.commits || []

    if (!repoUrl || commits.length === 0) return

    // Find the project by GitHub repo URL
    const allProjects = await Projects.findAll ? await Projects.findAll() : [] // This is a bit of a stretch
    const project = allProjects.find(p => p.repoUrl === repoUrl)

    if (!project) return

    // Update commit count
    await Projects.update(project.id, {
      commitCount: (project.commitCount || 0) + commits.length,
      lastCommitAt: new Date().toISOString(),
    })

    // Generate a milestone if spike detected (>= 3 commits in one push)
    if (commits.length >= 3) {
      const latestCommit = commits[commits.length - 1]
      const aiData = generateMilestone({
        project,
        commitMessage: latestCommit.message,
        commitCount: commits.length,
      })
      await Milestones.create({ projectId: project.id, userId: project.userId, ...aiData })
      await Users.addMomentumPoints(project.userId, commits.length * 5)
    }

    // Run health analysis
    const health = analyzeHealth(commits)
    await Projects.update(project.id, { healthScore: health.score, healthLabel: health.label })

  } catch (err) {
    console.error('Webhook handler error:', err.message)
  }
}

module.exports = router
