const prisma = require('./prisma')

// ─── Users ───────────────────────────────────────────────────────────────────
const Users = {
  findByGithubId: async (githubId) => {
    return prisma.user.findUnique({ where: { githubId: String(githubId) } })
  },
  findById: async (id) => {
    return prisma.user.findUnique({ where: { id } })
  },
  findByEmail: async (email) => {
    return prisma.user.findUnique({ where: { email } })
  },
  findByLogin: async (login) => {
    return prisma.user.findUnique({ where: { login } })
  },
  findAll: async () => {
    return prisma.user.findMany()
  },

  upsert: async (data) => {
    const { githubId, email, login, password, name, avatarUrl, githubAccessToken } = data
    
    // If githubId is provided, we use it as the primary key for sync
    if (githubId) {
      return prisma.user.upsert({
        where: { githubId: String(githubId) },
        update: { login, name, avatarUrl, email, githubAccessToken, updatedAt: new Date() },
        create: {
          githubId: String(githubId),
          login,
          name,
          avatarUrl,
          email,
          githubAccessToken,
          momentumPoints: 0,
          vibeScore: 50,
          streak: 0,
          badges: [],
        },
      })
    }

    // Otherwise, we use email as the primary key for real auth
    return prisma.user.upsert({
      where: { email },
      update: { password, name, login, updatedAt: new Date() },
      create: {
        email,
        password,
        name,
        login,
        momentumPoints: 0,
        vibeScore: 50,
        streak: 0,
        badges: [],
      },
    })
  },

  addMomentumPoints: async (userId, points) => {
    return prisma.user.update({
      where: { id: userId },
      data: { momentumPoints: { increment: points } },
    })
  },

  addBadge: async (userId, badge) => {
    const user = await Users.findById(userId)
    if (!user) return null
    
    const badges = Array.isArray(user.badges) ? user.badges : []
    if (!badges.find(b => b.type === badge.type)) {
      badges.push({ ...badge, earnedAt: new Date().toISOString() })
      return prisma.user.update({
        where: { id: userId },
        data: { badges },
      })
    }
    return user
  },
}

// ─── Projects ─────────────────────────────────────────────────────────────────
const Projects = {
  findByUser: async (userId) => {
    return prisma.project.findMany({ where: { userId } })
  },
  findById: async (id) => {
    return prisma.project.findUnique({ where: { id } })
  },

  create: async (data) => {
    return prisma.project.create({
      data: {
        phase: 'vibe',
        vibeScore: 50,
        momentumPoints: 0,
        commitCount: 0,
        healthScore: 100,
        ...data,
      },
    })
  },

  update: async (id, data) => {
    return prisma.project.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    })
  },

  delete: async (id) => {
    return prisma.project.delete({ where: { id } })
  }
}

// ─── Milestones ───────────────────────────────────────────────────────────────
const Milestones = {
  findByProject: async (projectId) => {
    return prisma.milestone.findMany({ 
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
  },
  findByUser: async (userId) => {
    return prisma.milestone.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },
  findById: async (id) => {
    return prisma.milestone.findUnique({ where: { id } })
  },
  findAll: async () => {
    return prisma.milestone.findMany({ orderBy: { createdAt: 'desc' } })
  },

  create: async (data) => {
    return prisma.milestone.create({
      data: {
        type: 'auto',
        vibeShift: 0,
        boosts: 0,
        published: false,
        ...data,
      },
    })
  },

  boost: async (id) => {
    return prisma.milestone.update({
      where: { id },
      data: { boosts: { increment: 1 } },
    })
  },

  publish: async (id) => {
    return prisma.milestone.update({
      where: { id },
      data: { published: true },
    })
  }
}

// ─── DevLogs ──────────────────────────────────────────────────────────────────
const DevLogs = {
  findByProject: async (projectId) => {
    return prisma.devLog.findMany({ 
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
  },
  findByUser: async (userId) => {
    return prisma.devLog.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  create: async (data) => {
    return prisma.devLog.create({
      data: {
        createdAt: new Date().toISOString(),
        ...data,
      },
    })
  }
}

// ─── Build Circles ────────────────────────────────────────────────────────────
const Circles = {
  findById: async (id) => {
    return prisma.circle.findUnique({ 
      where: { id },
      include: { members: true, owner: true }
    })
  },
  findByUser: async (userId) => {
    return prisma.circle.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } }
        ]
      },
      include: { members: true }
    })
  },
  findAll: async () => {
    return prisma.circle.findMany({ include: { owner: true } })
  },

  create: async (data) => {
    return prisma.circle.create({
      data: {
        inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
        ...data,
      },
    })
  },

  join: async (circleId, userId) => {
    return prisma.circle.update({
      where: { id: circleId },
      data: {
        members: { connect: { id: userId } }
      }
    })
  },

  findByInviteCode: async (code) => {
    return prisma.circle.findUnique({ where: { inviteCode: code } })
  },
}

// ─── Social Feed ──────────────────────────────────────────────────────────────
const Feed = {
  findAll: async (limit = 50) => {
    return prisma.feedItem.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
  },
  findByUser: async (userId) => {
    return prisma.feedItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  },

  create: async (data) => {
    return prisma.feedItem.create({
      data: {
        boosts: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        ...data,
      },
    })
  },

  boost: async (id) => {
    return prisma.feedItem.update({
      where: { id },
      data: { boosts: { increment: 1 } },
    })
  },

  addComment: async (feedId, comment) => {
    const item = await prisma.feedItem.findUnique({ where: { id: feedId } })
    if (!item) return null

    const comments = Array.isArray(item.comments) ? item.comments : []
    comments.push({ 
      id: Math.random().toString(36).slice(2, 9), 
      ...comment, 
      createdAt: new Date().toISOString() 
    })

    return prisma.feedItem.update({
      where: { id: feedId },
      data: { comments },
    })
  }
}

// ─── Badges ───────────────────────────────────────────────────────────────────
const BadgeTypes = {
  FIRST_MILESTONE: { type: 'first_milestone', name: 'First Milestone', desc: 'Earned your first AI milestone', icon: '🚀', tier: 'bronze' },
  VIBE_TO_SYSTEM: { type: 'vibe_to_system', name: 'Vibe → System', desc: 'Transitioned a project from vibe to system', icon: '⚡', tier: 'gold' },
  FLOW_STATE: { type: 'flow_state', name: 'Flow State', desc: '5+ commits in a single session', icon: '🌊', tier: 'silver' },
  STREAK_7: { type: 'streak_7', name: 'Weekly Warrior', desc: '7-day momentum streak', icon: '🔥', tier: 'silver' },
  STREAK_30: { type: 'streak_30', name: 'Monthly Machine', desc: '30-day momentum streak', icon: '💎', tier: 'gold' },
  VELOCITY_100: { type: 'velocity_100', name: 'Speed Demon', desc: 'Reached 100 velocity score', icon: '🏎️', tier: 'bronze' },
  VELOCITY_500: { type: 'velocity_500', name: 'Hyperdrive', desc: 'Reached 500 velocity score', icon: '✨', tier: 'gold' },
  VERIFIED_SHIP: { type: 'verified_ship', name: 'Verified Ship', desc: 'AI verified your vibe→production journey', icon: '✅', tier: 'platinum' },
  BUILD_BUDDY: { type: 'build_buddy', name: 'Build Buddy', desc: 'Connected with a complementary builder', icon: '🤝', tier: 'bronze' },
  SPRINT_WINNER: { type: 'sprint_winner', name: 'Sprint Champion', desc: 'Won a Build-Off sprint', icon: '🏆', tier: 'gold' },
}

// ─── Sprints ──────────────────────────────────────────────────────────────────
const Sprints = {
  findById: async (id) => {
    return prisma.sprint.findUnique({ where: { id }, include: { creator: true, participants: true } })
  },
  findActive: async () => {
    const now = new Date().toISOString()
    return prisma.sprint.findMany({
      where: { endsAt: { gt: now } },
      include: { creator: true }
    })
  },
  findAll: async () => {
    return prisma.sprint.findMany({ include: { creator: true } })
  },

  create: async (data) => {
    return prisma.sprint.create({
      data: {
        status: 'active',
        createdAt: new Date(),
        ...data,
      },
    })
  },

  join: async (sprintId, userId) => {
    const s = await Sprints.findById(sprintId)
    if (!s) return null
    
    const scores = s.scores || {}
    scores[userId] = 0

    return prisma.sprint.update({
      where: { id: sprintId },
      data: {
        participants: { connect: { id: userId } },
        scores
      }
    })
  },

  addScore: async (sprintId, userId, points) => {
    const s = await Sprints.findById(sprintId)
    if (!s) return null

    const scores = s.scores || {}
    scores[userId] = (scores[userId] || 0) + points

    return prisma.sprint.update({
      where: { id: sprintId },
      data: { scores }
    })
  },
}

module.exports = { Users, Projects, Milestones, DevLogs, Circles, Feed, BadgeTypes, Sprints }
