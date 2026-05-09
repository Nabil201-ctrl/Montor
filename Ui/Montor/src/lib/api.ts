import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('montor_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
)

export default api

export const auth = {
  me: () => api.get('/auth/me'),
  loginUrl: () => `${BASE}/auth/github`,
}

export const projects = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  sync: (id: string) => api.post(`/projects/${id}/sync`),
  milestones: (id: string) => api.get(`/projects/${id}/milestones`),
  createMilestone: (id: string, data: any) => api.post(`/projects/${id}/milestones`, data),
  devlogs: (id: string) => api.get(`/projects/${id}/devlogs`),
}

export const stats = {
  dashboard: () => api.get('/stats'),
}

export const leaderboard = {
  global: (limit = 20) => api.get(`/leaderboard?limit=${limit}`),
  circle: (id: string) => api.get(`/leaderboard/circle/${id}`),
  me: () => api.get('/leaderboard/me'),
}

export const circles = {
  list: () => api.get('/circles'),
  get: (id: string) => api.get(`/circles/${id}`),
  create: (data: any) => api.post('/circles', data),
  join: (inviteCode: string) => api.post('/circles/join', { inviteCode }),
}

export const feed = {
  list: (limit = 30) => api.get(`/feed?limit=${limit}`),
  publish: (milestoneId: string, message?: string) => api.post('/feed/publish', { milestoneId, message }),
  boost: (id: string) => api.post(`/feed/${id}/boost`),
  comment: (id: string, text: string) => api.post(`/feed/${id}/comment`, { text }),
}

export const sprints = {
  list: () => api.get('/sprints'),
  get: (id: string) => api.get(`/sprints/${id}`),
  create: (data: any) => api.post('/sprints', data),
  join: (id: string) => api.post(`/sprints/${id}/join`),
}

export const badges = {
  all: () => api.get('/badges'),
  mine: () => api.get('/badges/me'),
  check: () => api.post('/badges/check'),
}
