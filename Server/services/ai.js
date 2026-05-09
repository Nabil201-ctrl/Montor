const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const sentimentWords = {
  positive: ['add', 'feat', 'implement', 'complete', 'finish', 'ship', 'launch', 'fix', 'improve', 'refactor'],
  negative: ['wip', 'broken', 'debug', 'todo', 'hack', 'temp', 'ugh', 'stuck', 'revert', 'mess'],
}

function detectSentiment(message = '') {
  const lower = message.toLowerCase()
  let score = 0
  sentimentWords.positive.forEach(w => { if (lower.includes(w)) score++ })
  sentimentWords.negative.forEach(w => { if (lower.includes(w)) score-- })
  if (score > 0) return { label: 'excited', emoji: '🚀', color: 'green' }
  if (score < 0) return { label: 'frustrated', emoji: '😤', color: 'orange' }
  return { label: 'neutral', emoji: '😐', color: 'gray' }
}

async function generateMilestone({ project, commitMessage = '', diff = '', commitCount = 1 }) {
  console.log(`\n🧠 AI Action: Generating Milestone for "${project.name}"...`)
  try {
    const prompt = `
      You are an AI developer momentum engine. Analyze this development session and generate a milestone summary.
      Project: ${project.name}
      Commit Message: ${commitMessage}
      Commits in session: ${commitCount}
      Code Diff: ${diff.slice(0, 2000)}

      Return a JSON object with:
      {
        "title": "Short catchy title (max 50 chars)",
        "summary": "Professional 1-2 sentence summary of what was achieved and the 'why' behind it.",
        "sentiment": "one of: excited, frustrated, neutral",
        "sentimentEmoji": "an appropriate emoji",
        "tags": ["#tag1", "#tag2"],
        "suggestions": ["Next step 1", "Next step 2"],
        "vibeShift": 10 (integer between 0-50 representing momentum gain)
      }
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content)
    console.log(`✅ AI Milestone Complete: "${result.title}" [Sentiment: ${result.sentimentEmoji} ${result.sentiment}]`)
    
    return {
      ...result,
      commitCount,
      rawCommitMessage: commitMessage,
    }
  } catch (err) {
    console.error('❌ Groq AI error, falling back to mock:', err.message)
    // Fallback to mock logic if AI fails
    return {
      title: commitMessage.slice(0, 50) || 'Dev Session',
      summary: `Completed a session with message: ${commitMessage}`,
      sentiment: 'neutral',
      sentimentEmoji: '😐',
      tags: ['#auto-milestone'],
      suggestions: ['Keep building'],
      vibeShift: 5,
      commitCount,
      rawCommitMessage: commitMessage,
    }
  }
}

function analyzeHealth(commits = []) {
  if (commits.length === 0) return { score: 100, label: 'healthy' }
  const messages = commits.map(c => c.message || '')
  let negCount = 0
  messages.forEach(m => {
    sentimentWords.negative.forEach(w => { if (m.toLowerCase().includes(w)) negCount++ })
  })
  const ratio = negCount / messages.length
  if (ratio > 0.5) return { score: 40, label: 'wall-hit' }
  if (ratio > 0.25) return { score: 65, label: 'struggling' }
  return { score: 90, label: 'healthy' }
}

async function generateRubberDuck({ project, lastCommitMessage }) {
  console.log(`🧠 AI Action: Generating Rubber Duck question for "${project.name}"...`)
  try {
    const prompt = `
      You are an AI rubber duck for a developer.
      Project: ${project.name}
      Last Commit: ${lastCommitMessage}
      Ask a short, insightful question (1 sentence) that makes the developer think about their next steps or potential edge cases.
    `
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    })
    const question = completion.choices[0].message.content
    console.log(`✅ AI Rubber Duck: "${question}"`)
    return question
  } catch (err) {
    return "What's the next step for this feature?"
  }
}

// ─── AI Dashboard Insight ─────────────────────────────────────────────────────
async function generateDashboardInsight({ projects, milestones, devlogs, user }) {
  console.log(`\n🧠 AI Action: Generating Dashboard Insight for "${user.name || user.login}"...`)
  try {
    const projectSummary = projects.map(p => `${p.name} (${p.phase}, ${p.commitCount} commits, health: ${p.healthScore})`).join('; ')
    const recentMilestones = milestones.slice(0, 5).map(m => m.title).join(', ')

    const prompt = `
      You are a developer momentum coach. Analyze this developer's current state and provide a short, actionable insight.
      
      Developer: ${user.name || user.login}
      Momentum Points: ${user.momentumPoints || 0}
      Streak: ${user.streak || 0} days
      Projects: ${projectSummary || 'No projects yet'}
      Recent Milestones: ${recentMilestones || 'None yet'}
      Total DevLogs: ${devlogs.length}

      Return a JSON object:
      {
        "insight": "A 1-2 sentence personalized insight about their momentum",
        "suggestion": "One specific action they should take next",
        "mood": "one of: crushing_it, steady, needs_push, getting_started"
      }
    `
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })
    const result = JSON.parse(completion.choices[0].message.content)
    console.log(`✅ AI Dashboard Insight: [${result.mood}] "${result.insight}"`)
    return result
  } catch (err) {
    console.error('❌ AI Dashboard Insight failed:', err.message)
    return { insight: 'Keep pushing — every commit counts.', suggestion: 'Try shipping one small feature today.', mood: 'steady' }
  }
}

// ─── AI DevLog Content Generator ──────────────────────────────────────────────
async function generateDevLogContent({ project, commits, dateStr }) {
  console.log(`🧠 AI Action: Generating DevLog for "${project.name}" on ${dateStr}...`)
  try {
    const commitMessages = commits.map(c => c.commit?.message || c.message || '').join('\n')
    const prompt = `
      You are an AI developer journal writer. Generate a professional DevLog entry for this coding session.
      
      Project: ${project.name}
      Date: ${dateStr}
      Commits (${commits.length}):
      ${commitMessages.slice(0, 1500)}

      Return a JSON object:
      {
        "title": "A descriptive session title (max 60 chars)",
        "content": "A 2-3 sentence professional summary of what was worked on and why",
        "mood": "one of: productive, exploratory, debugging, refactoring, shipping"
      }
    `
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })
    const result = JSON.parse(completion.choices[0].message.content)
    console.log(`✅ AI DevLog: "${result.title}" [${result.mood}]`)
    return result
  } catch (err) {
    console.error('❌ AI DevLog generation failed:', err.message)
    return { title: `Session: ${commits.length} commits`, content: `Development session on ${project.name}.`, mood: 'productive' }
  }
}

// ─── AI Phase Detection ───────────────────────────────────────────────────────
async function detectPhaseWithAI({ project, recentCommitMessages }) {
  console.log(`🧠 AI Action: Detecting project phase for "${project.name}"...`)
  try {
    const prompt = `
      You are an AI that classifies developer project maturity.
      
      Project: ${project.name}
      Current Phase: ${project.phase}
      Current Commit Count: ${project.commitCount}
      Recent Commit Messages:
      ${recentCommitMessages.slice(0, 1000)}

      Classify the project phase based on the commits:
      - "vibe": Rapid prototyping, experimenting, no tests, no structure
      - "transition": Starting to add structure (types, configs, schemas)
      - "system": Has tests, CI/CD, proper error handling, production patterns

      Return a JSON object:
      {
        "phase": "one of: vibe, transition, system",
        "confidence": 85 (integer 0-100),
        "reason": "Short explanation why"
      }
    `
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })
    const result = JSON.parse(completion.choices[0].message.content)
    console.log(`✅ AI Phase Detection: "${project.name}" → ${result.phase} (${result.confidence}% confidence)`)
    return result
  } catch (err) {
    console.error('❌ AI Phase detection failed:', err.message)
    return { phase: project.phase || 'vibe', confidence: 50, reason: 'Fallback — AI unavailable' }
  }
}

// ─── AI Feed Caption Generator ────────────────────────────────────────────────
async function generateFeedCaption({ milestone, user }) {
  console.log(`🧠 AI Action: Generating Feed Caption for milestone "${milestone.title}"...`)
  try {
    const prompt = `
      You are a social media copywriter for developers. Write a short, engaging post caption for sharing a development milestone.
      
      Developer: ${user.name || user.login}
      Milestone: ${milestone.title}
      Summary: ${milestone.summary}
      Sentiment: ${milestone.sentiment}

      Return a JSON object:
      {
        "caption": "A punchy 1-2 sentence post (include an emoji). Make it feel authentic, not corporate."
      }
    `
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })
    const result = JSON.parse(completion.choices[0].message.content)
    console.log(`✅ AI Feed Caption: "${result.caption}"`)
    return result.caption
  } catch (err) {
    console.error('❌ AI Feed Caption failed:', err.message)
    return `Just shipped: ${milestone.title} 🚀`
  }
}

module.exports = { 
  generateMilestone, analyzeHealth, detectSentiment, generateRubberDuck,
  generateDashboardInsight, generateDevLogContent, detectPhaseWithAI, generateFeedCaption
}
