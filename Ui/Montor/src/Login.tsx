import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { auth } from './lib/api'
import { useAuth } from './context/AuthContext'

const Login = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await auth.login({ email, password }) as any
      localStorage.setItem('montor_token', res.token)
      setUser(res.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = () => {
    window.location.href = auth.loginUrl()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative overflow-hidden px-6 py-12">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-light/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] mx-auto mb-6">
            M
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text mb-3">Welcome Back</h1>
          <p className="text-text-secondary">Sign in to resume your project momentum.</p>
        </div>

        <div className="bg-bg-card border border-border rounded-radius p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-light/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-radius pointer-events-none" />
          
          <form onSubmit={handleEmailLogin} className="space-y-4 relative z-10">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-surface border border-border rounded-radius-sm px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-mono text-accent hover:underline uppercase tracking-widest">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-radius-sm px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-3.5 bg-accent text-white font-bold rounded-radius-sm hover:bg-accent-light transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bg-card px-3 text-text-muted font-mono tracking-widest">or</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-black font-bold rounded-radius-sm hover:bg-white/90 transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-secondary text-sm">
            Don't have an account? <Link to="/signup" className="text-accent font-bold hover:underline">Sign up</Link>
          </p>
          <div className="mt-12 flex justify-center gap-6 text-xs font-mono text-text-muted">
            <Link to="/" className="hover:text-accent transition-colors">← Back to Home</Link>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
