const router = require('express').Router()
const axios = require('axios')
const { Users } = require('../db')
const { signToken } = require('../middleware/auth')

const bcrypt = require('bcryptjs')
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
  FRONTEND_URL,
} = process.env

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await Users.upsert({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      login: email.split('@')[0], // Default login for new users
    })

    const token = signToken(user.id)
    const { password: _, ...safeUser } = user
    res.status(201).json({ token, user: safeUser })
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists' })
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const user = await Users.findByEmail(email)
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' })

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user.id)
    const { password: _, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Step 1 — redirect browser to GitHub
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'read:user user:email repo',
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

// Step 2 — GitHub redirects back here with a code
router.get('/github/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}?error=no_code`)

  try {
    // Exchange code for access token
    const { githubAxios } = require('../utils/githubClient')
    
    const tokenRes = await githubAxios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code },
      { 
        headers: { Accept: 'application/json' },
        retry: 3, 
        retryDelay: 1000 
      }
    )
    const { access_token } = tokenRes.data
    if (!access_token) return res.redirect(`${FRONTEND_URL}?error=no_token`)

    // Fetch GitHub user profile
    const { data: ghUser } = await githubAxios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github+json' },
      retry: 2,
      retryDelay: 500
    })

    // Upsert in our DB
    const user = await Users.upsert({
      githubId: ghUser.id,
      login: ghUser.login,
      name: ghUser.name || ghUser.login,
      avatarUrl: ghUser.avatar_url,
      email: ghUser.email,
      githubAccessToken: access_token
    })

    // Sync repos and ingest history in background
    const { syncReposFromGitHub } = require('../services/github')
    syncReposFromGitHub(user).catch(e => console.error('Initial sync failed:', e.message))

    const jwt = signToken(user.id)
    const callbackPath = process.env.FRONTEND_CALLBACK || '/auth/callback'
    res.redirect(`${process.env.FRONTEND_URL}${callbackPath}?token=${jwt}`)
  } catch (err) {
    const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message
    console.error('GitHub OAuth error:', msg)
    res.redirect(`${FRONTEND_URL}?error=oauth_failed`)
  }
})

// GET /api/auth/me — return current user
router.get('/me', require('../middleware/auth').requireAuth, (req, res) => {
  const { githubAccessToken, ...safe } = req.user
  res.json(safe)
})

module.exports = router
