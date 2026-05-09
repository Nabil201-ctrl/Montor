import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './Landing'
import Login from './Login'
import Signup from './Signup'
import AuthCallback from './pages/AuthCallback'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import DevLogs from './pages/DevLogs'
import Settings from './pages/Settings'
import Leaderboard from './pages/Leaderboard'
import SocialFeed from './pages/SocialFeed'
import Badges from './pages/Badges'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-bg text-text-muted">Loading...</div>
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function RootPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <Landing onLogin={() => navigate('/login')} />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/devlogs" element={<DevLogs />} />
        <Route path="/feed" element={<SocialFeed />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
