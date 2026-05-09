const { githubAxios } = require('../utils/githubClient')
const { Projects, Milestones, DevLogs } = require('../db')

async function syncReposFromGitHub(user) {
  if (!user.githubAccessToken) return []
  try {
    const { data: repos } = await githubAxios.get('https://api.github.com/user/repos', {
      params: { sort: 'pushed', per_page: 5 },
      headers: { Authorization: `Bearer ${user.githubAccessToken}`, Accept: 'application/vnd.github+json' },
      retry: 3,
      retryDelay: 1000
    })

    const synced = []
    for (const repo of repos) {
      const userProjects = await Projects.findByUser(user.id)
      let p = userProjects.find(proj => proj.name === repo.name)
      
      if (!p) {
        p = await Projects.create({
          userId: user.id,
          name: repo.name,
          fullName: repo.full_name,
          repoUrl: repo.html_url,
          description: repo.description || '',
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
        })
        // Background ingest history for new projects
        ingestProjectHistory(user, p).catch(e => console.error(`Ingest failed for ${p.name}:`, e.message))
      }
      synced.push(p)
    }
    return synced
  } catch (err) {
    console.error('GitHub Sync Error:', err.message)
    return []
  }
}

async function ingestProjectHistory(user, project) {
  const [, owner, repo] = project.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || []
  if (!owner || !repo) return { error: 'Invalid repo URL' }

  try {
    const { data: commits } = await githubAxios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      params: { per_page: 30 },
      headers: { Authorization: `Bearer ${user.githubAccessToken}`, Accept: 'application/vnd.github+json' },
      retry: 3,
      retryDelay: 2000
    })

    const dailyGroups = {}
    commits.forEach(c => {
      const dateStr = c.commit.author.date.split('T')[0]
      if (!dailyGroups[dateStr]) dailyGroups[dateStr] = []
      dailyGroups[dateStr].push(c)
    })

    let milestonesCreated = 0
    let logsCreated = 0

    for (const dateStr of Object.keys(dailyGroups).sort()) {
      const dayCommits = dailyGroups[dateStr]
      const mainCommit = dayCommits[0]
      const timestamp = mainCommit.commit.author.date

      const { generateDevLogContent } = require('./ai')
      const aiLog = await generateDevLogContent({ project, commits: dayCommits, dateStr })

      await DevLogs.create({
        userId: user.id,
        projectId: project.id,
        projectName: project.name,
        title: aiLog.title,
        content: aiLog.content,
        mood: aiLog.mood,
        duration: dayCommits.length * 30,
        commits: dayCommits.length,
        createdAt: timestamp,
      })
      logsCreated++

      if (dayCommits.length >= 2) {
        const { generateMilestone } = require('./ai')
        const aiData = await generateMilestone({
          project,
          commitMessage: mainCommit.commit.message,
          commitCount: dayCommits.length,
        })
        await Milestones.create({
          projectId: project.id,
          userId: user.id,
          ...aiData,
          createdAt: timestamp,
        })
        milestonesCreated++
      }
    }

    await Projects.update(project.id, { 
      commitCount: commits.length, 
      lastSyncedAt: new Date().toISOString(),
      vibeScore: Math.min(100, 30 + (milestonesCreated * 12))
    })

    return { milestonesCreated, logsCreated, totalCommits: commits.length }
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log(`GitHub repository ${project.name} is empty (409 Conflict). Initializing with zero stats.`)
      await Projects.update(project.id, { 
        commitCount: 0, 
        lastSyncedAt: new Date().toISOString(),
        vibeScore: 30 // Start at baseline vibe
      })
      return { milestonesCreated: 0, logsCreated: 0, totalCommits: 0 }
    }
    console.error(`GitHub Ingest Error for ${project.name}:`, err.message)
    return { error: err.message }
  }
}

module.exports = { syncReposFromGitHub, ingestProjectHistory }
