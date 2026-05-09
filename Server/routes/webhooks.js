const router = require('express').Router()
const { Projects, Milestones, DevLogs, Users } = require('../db')
const { generateMilestone, analyzeHealth, generateDevLogContent, detectPhaseWithAI } = require('../services/ai')

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
    const allProjects = await Projects.findAll ? await Projects.findAll() : []
    const project = allProjects.find(p => p.repoUrl === repoUrl)

    if (!project) return

    console.log(`\n📥 Webhook Push: ${commits.length} commits to "${project.name}"`)

    // Update commit count
    await Projects.update(project.id, {
      commitCount: (project.commitCount || 0) + commits.length,
      lastCommitAt: new Date().toISOString(),
    })

    // 🧠 AI: Generate a DevLog for every push
    const dateStr = new Date().toISOString().split('T')[0]
    const aiLog = await generateDevLogContent({ project, commits, dateStr })
    await DevLogs.create({
      userId: project.userId,
      projectId: project.id,
      projectName: project.name,
      title: aiLog.title,
      content: aiLog.content,
      mood: aiLog.mood,
      duration: commits.length * 15,
      commits: commits.length,
    })

    // 🧠 AI: Generate a milestone if spike detected (>= 3 commits in one push)
    if (commits.length >= 3) {
      const latestCommit = commits[commits.length - 1]
      const aiData = await generateMilestone({
        project,
        commitMessage: latestCommit.message,
        commitCount: commits.length,
      })
      await Milestones.create({ projectId: project.id, userId: project.userId, ...aiData })
      await Users.addMomentumPoints(project.userId, commits.length * 5)
    }

    // 🧠 AI: Run health analysis
    const health = analyzeHealth(commits)
    await Projects.update(project.id, { healthScore: health.score })

    // 🧠 AI: Detect phase shift
    const recentCommitMessages = commits.map(c => c.message).join('\n')
    const phaseResult = await detectPhaseWithAI({ project, recentCommitMessages })
    if (phaseResult.phase !== project.phase) {
      await Projects.update(project.id, { phase: phaseResult.phase })
      console.log(`🔄 Phase shift detected: ${project.name} → ${phaseResult.phase}`)
    }

  } catch (err) {
    console.error('Webhook handler error:', err.message)
  }
}

module.exports = router
