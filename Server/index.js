const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/stats', require('./routes/stats'))
app.use('/api/webhooks', require('./routes/webhooks'))
app.use('/api/devlogs', require('./routes/devlogs'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/circles', require('./routes/circles'))
app.use('/api/feed', require('./routes/feed'))
app.use('/api/sprints', require('./routes/sprints'))
app.use('/api/badges', require('./routes/badges'))

// Health check (no auth)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  const isProd = process.env.NODE_ENV === 'production'
  res.status(500).json({ 
    error: isProd ? 'Internal server error' : (err.message || 'Internal server error')
  })
})

app.listen(PORT, () => {
  console.log(`\n🚀 Montor Server → http://localhost:${PORT}`)
  console.log(`   GitHub OAuth    → /api/auth/github`)
  console.log(`   Leaderboard     → /api/leaderboard`)
  console.log(`   Social Feed     → /api/feed`)
  console.log(`   Build Circles   → /api/circles`)
  console.log(`   Sprints         → /api/sprints`)
  console.log(`   Badges          → /api/badges\n`)
})
