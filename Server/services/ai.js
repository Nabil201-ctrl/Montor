// AI Service — mock implementation
// Replace generateMilestone with a real LLM call (OpenAI, Gemini, etc.)

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

function detectPhaseShift(commitMessage = '', project = {}) {
  const testSignals = ['test', 'spec', 'jest', 'vitest', 'playwright']
  const structureSignals = ['types/', 'interfaces/', 'schemas/', 'prisma', 'migration']
  const lower = commitMessage.toLowerCase()
  const hasTest = testSignals.some(s => lower.includes(s))
  const hasStructure = structureSignals.some(s => lower.includes(s))
  if (hasTest || hasStructure) {
    return { shift: true, from: 'vibe', to: 'transition', delta: 15 }
  }
  return { shift: false, delta: 0 }
}

function generateMilestone({ project, commitMessage = '', diff = '', commitCount = 1 }) {
  const sentiment = detectSentiment(commitMessage)
  const phaseShift = detectPhaseShift(commitMessage, project)

  const templates = [
    `Shipped "${commitMessage}" — ${commitCount > 1 ? `a ${commitCount}-commit spike` : 'a focused session'} that ${sentiment.label === 'excited' ? 'showed high energy and clear direction' : 'worked through complexity'}.`,
    `Significant progress on **${project.name}**: ${commitMessage}. The AI detected a ${sentiment.emoji} ${sentiment.label} developer state.`,
    `Milestone auto-generated: ${commitMessage}. Commit density suggests a ${commitCount >= 5 ? 'flow state' : 'focused'} session.`,
  ]

  const title = commitMessage.slice(0, 80) || 'Dev Session Milestone'
  const summary = templates[Math.floor(Math.random() * templates.length)]
  const tags = ['#auto-milestone']
  if (sentiment.label === 'excited') tags.push('#momentum')
  if (phaseShift.shift) tags.push('#phase-shift')
  if (commitCount >= 5) tags.push('#flow-state')

  const suggestions = phaseShift.shift
    ? ['Consider adding a test for the new functionality', 'Update your README to reflect this change']
    : ['Keep the momentum — 2 more commits to earn a milestone badge', 'Document the "why" behind this decision']

  return {
    title,
    summary,
    sentiment: sentiment.label,
    sentimentEmoji: sentiment.emoji,
    tags,
    suggestions,
    vibeShift: phaseShift.delta,
    commitCount,
    rawCommitMessage: commitMessage,
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

function generateRubberDuck({ project, lastCommitMessage }) {
  const questions = [
    `I see you just added "${lastCommitMessage}" — was this to fix a specific bottleneck you mentioned earlier?`,
    `This commit on ${project.name} looks significant. What was the core problem you were solving?`,
    `Interesting change! Did this resolve the issue you were debugging, or is there still more to do?`,
    `Great progress! What would be your next priority after this commit?`,
  ]
  return questions[Math.floor(Math.random() * questions.length)]
}

module.exports = { generateMilestone, analyzeHealth, detectSentiment, generateRubberDuck }
