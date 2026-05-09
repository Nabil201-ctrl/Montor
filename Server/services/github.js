const axios = require('axios')
const { Projects, Milestones, DevLogs } = require('../db')

async function syncReposFromGitHub(user) {
  if (!user.githubAccessToken) return []
  try {
    const { data: repos } = await axios.get('https://api.github.com/user/repos', {
      params: { sort: 'pushed', per_page: 5 },
      headers: { Authorization: `Bearer ${user.githubAccessToken}`, Accept: 'application/vnd.github+json' },
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
    const { data: commits } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      params: { per_page: 30 },
      headers: { Authorization: `Bearer ${user.githubAccessToken}`, Accept: 'application/vnd.github+json' },
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

      await DevLogs.create({
        userId: user.id,
        projectId: project.id,
        projectName: project.name,
        title: `Sync: ${dayCommits.length} commits`,
        content: `GitHub history import. Key focus: ${mainCommit.commit.message.split('\n')[0]}`,
        mood: 'productive',
        duration: dayCommits.length * 30,
        commits: dayCommits.length,
        createdAt: timestamp,
      })
      logsCreated++

      if (dayCommits.length >= 2) {
        await Milestones.create({
          projectId: project.id,
          userId: user.id,
          title: `${mainCommit.commit.message.split('\n')[0]}`,
          summary: `Imported from GitHub history (${dayCommits.length} commits on ${dateStr}).`,
          sentiment: 'excited',
          sentimentEmoji: '⚡',
          vibeShift: 5,
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
