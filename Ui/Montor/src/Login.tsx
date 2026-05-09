import React from 'react'

const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-bg-card border border-border rounded-radius p-10 text-center shadow-2xl animate-slide-up">
        <div className="mb-8">
          <div className="w-12 h-12 bg-accent text-white font-extrabold text-2xl grid place-items-center rounded-radius-sm mx-auto mb-5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            N
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-text-secondary text-sm">Sign in to manage your side projects</p>

        </div>

        <div className="flex flex-col gap-3 mb-8">
          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-radius-sm bg-surface text-text font-semibold transition-all duration-300 hover:border-[#24292f] hover:bg-[#24292f] hover:text-white hover:-translate-y-0.5">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Continue with GitHub
          </button>

          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-radius-sm bg-surface text-text font-semibold transition-all duration-300 hover:border-[#e24329] hover:bg-[#e24329] hover:text-white hover:-translate-y-0.5">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.74L1 9.38l.41-1.27L12 1.5l10.59 6.61.41 1.27-1.27.33 1.22 3.74a.84.84 0 0 1-.3.94z"></path>
            </svg>
            Continue with GitLab
          </button>
        </div>

        <div className="text-xs text-text-muted">
          <p>By continuing, you agree to our <a href="#" className="text-accent font-medium hover:underline">Terms of Service</a></p>
        </div>
      </div>
    </div>
  )
}

export default Login

