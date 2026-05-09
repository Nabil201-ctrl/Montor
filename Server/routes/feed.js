const router = require('express').Router()
const { Feed, Milestones, Users } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { generateFeedCaption } = require('../services/ai')

// GET /api/feed — public momentum feed
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 30
  const items = await Feed.findAll(limit)
  
  const formatted = items.map(item => ({
    ...item,
    user: item.user ? { id: item.user.id, login: item.user.login, name: item.user.name, avatarUrl: item.user.avatarUrl } : null,
  }))
  
  res.json(formatted)
})

// POST /api/feed/publish — publish a milestone to the feed
router.post('/publish', requireAuth, async (req, res) => {
  const { milestoneId, message } = req.body
  if (!milestoneId) return res.status(400).json({ error: 'milestoneId required' })

  const milestone = await Milestones.findById(milestoneId)
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' })

  await Milestones.publish(milestoneId)

  // 🧠 AI generates an engaging caption if user didn't provide one
  const caption = message || await generateFeedCaption({ milestone, user: req.user })

  const item = await Feed.create({
    type: 'milestone',
    userId: req.user.id,
    content: JSON.stringify({
      milestoneId,
      title: milestone.title,
      summary: milestone.summary,
      sentiment: milestone.sentiment,
      sentimentEmoji: milestone.sentimentEmoji,
      tags: milestone.tags,
      message: caption,
    }),
    metadata: { milestoneId }
  })

  res.status(201).json(item)
})

// POST /api/feed/:id/boost — boost a feed item
router.post('/:id/boost', requireAuth, async (req, res) => {
  const item = await Feed.boost(req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

// POST /api/feed/:id/comment — comment on a feed item
router.post('/:id/comment', requireAuth, async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'text required' })
  const item = await Feed.addComment(req.params.id, { 
    userId: req.user.id, 
    text, 
    userName: req.user.login,
    avatarUrl: req.user.avatarUrl
  })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

module.exports = router
