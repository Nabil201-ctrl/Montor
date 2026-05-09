import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { setToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')
    if (token) {
      setToken(token)
      navigate('/dashboard', { replace: true })
    } else {
      console.error('Auth error:', error)
      navigate('/?error=' + (error || 'unknown'), { replace: true })
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg text-text">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">Authenticating with GitHub...</p>
      </div>
    </div>
  )
}
