const jwt = require('jsonwebtoken')
const { Users } = require('../db')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

// Middleware: verify JWT and attach user to req
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await Users.findById(payload.userId)
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

module.exports = { requireAuth, signToken }
