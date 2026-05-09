import { useState } from 'react'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'VIBE → SYSTEM',
    title: 'Momentum Tracking',
    desc: 'AI detects when your project shifts from rapid "vibe coding" to a structured platform — and keeps you moving through both phases.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'GITHUB NATIVE',
    title: 'AI Milestone Comments',
    desc: 'Connect your repo and let AI auto-generate milestone summaries — capturing the "why" behind every commit, not just the "what".',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" />
      </svg>
    ),
    tag: 'AUTONOMOUS',
    title: 'DevLog Generation',
    desc: 'Every development spike auto-generates a rich DevLog — perfect for portfolios, documentation, or remembering your logic after a break.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'AI-POWERED',
    title: 'Project Health Engine',
    desc: 'Sentiment analysis on commit patterns detects frustration walls and suggests high-value "small wins" to restore your momentum.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'CONTEXT',
    title: 'AI Rubber Ducking',
    desc: '"I see you added a new API route — was this to fix the bottleneck from last week?" The answers become permanent project context.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'PROOF OF WORK',
    title: 'Verified Progress Badges',
    desc: 'Blockchain-verified milestone badges — when Montor saw your work happen, your achievement becomes a credibility signal for the world.',
  },
]

const steps = [
  { num: '01', title: 'Connect GitHub', desc: 'OAuth in one click. Montor instantly sees your repos and starts building your momentum baseline.' },
  { num: '02', title: 'AI Reads Your Vibes', desc: 'Commit diffs are analyzed in real-time. The AI understands your intent, not just your code.' },
  { num: '03', title: 'Milestones Auto-Draft', desc: 'Significant spikes trigger AI milestone comments and DevLog entries — hands-free documentation.' },
  { num: '04', title: 'Share Your Journey', desc: 'Export beautiful progress graphics, earn Verified Progress badges, and build in public with proof.' },
]

const tiers = [
  {
    name: 'Builder',
    price: 'Free',
    sub: 'Forever',
    features: ['3 connected repos', 'Basic momentum tracking', 'AI milestone summaries', 'Public progress page'],
    cta: 'Start Building',
    accent: false,
  },
  {
    name: 'Momentum',
    price: '$9',
    sub: '/month',
    features: ['Unlimited repos', 'Health & sentiment engine', 'AI rubber ducking', 'Verified Progress badges', 'Social recap exports'],
    cta: 'Get Momentum',
    accent: true,
  },
  {
    name: 'Studio',
    price: '$29',
    sub: '/month',
    features: ['Everything in Momentum', 'Team hustle rooms', 'Investor-ready progress reports', 'Priority AI credits', 'Custom integrations'],
    cta: 'Launch Studio',
    accent: false,
  },
]

export default function Landing({ onLogin }: { onLogin: () => void }) {
  const [vibeProgress] = useState(65)

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6">

      {/* NAV */}
      <nav className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">M</div>
          <span className="font-bold text-lg tracking-tight">Montor</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text transition-colors">Features</a>
          <a href="#how" className="hover:text-text transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-text transition-colors">Pricing</a>
        </div>
        <button onClick={onLogin} className="px-5 py-2 bg-accent text-white font-semibold text-sm rounded-radius-sm hover:bg-accent-light transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5">
          Sign In with GitHub →
        </button>
      </nav>

      {/* HERO */}
      <section className="pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-glow border border-accent/30 rounded-full text-xs font-mono text-accent-light mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block"></span>
          Now live — GitHub OAuth beta
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
          Your side projects<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">deserve a record.</span>
        </h1>

        <p className="text-text-secondary text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Montor is a Developer Momentum Engine. It watches your GitHub repos, understands your <em>intent</em>, and auto-generates milestone documentation — so your "vibe coded" ideas become provable, professional work.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={onLogin} className="px-8 py-4 bg-accent text-white font-bold text-lg rounded-radius-sm hover:bg-accent-light transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 w-full sm:w-auto">
            Connect GitHub — it's free
          </button>
        </div>

        <p className="text-text-muted text-sm mt-6">No credit card. No setup. Just connect and go.</p>
      </section>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
        {[
          { n: '2,400+', l: 'Projects Tracked' },
          { n: '18k+', l: 'Milestones Generated' },
          { n: '94%', l: 'Momentum Retention' },
          { n: '< 2min', l: 'Setup Time' },
        ].map((s, i) => (
          <div key={i} className="bg-bg-card border border-border rounded-radius p-5 text-center">
            <div className="text-2xl font-black text-text mb-1">{s.n}</div>
            <div className="text-xs text-text-muted font-mono uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>

      {/* VIBE-TO-SYSTEM BAR */}
      <section className="mb-24">
        <div className="bg-bg-card border border-border rounded-radius p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Your Project Phase — AI Detected</span>
          </div>
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-xl font-bold text-accent">Vibe Coding</div>
              <div className="text-xs text-text-muted">Rapid, exploratory, pure momentum</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-text-secondary">System Platform</div>
              <div className="text-xs text-text-muted">Structured, tested, production-ready</div>
            </div>
          </div>
          <div className="relative h-3 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-accent-light rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
              style={{ width: `${vibeProgress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-4 italic">
            ✦ AI detected a 12% shift toward "Platform" after you added <code className="text-accent">vitest</code> and a <code className="text-accent">types/</code> directory yesterday.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Everything you need to<br />build in public, with proof.</h2>
          <p className="text-text-secondary max-w-xl mx-auto">Not just monitoring — a full momentum engine that turns your messy creative process into a professional narrative.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-radius p-7 transition-all duration-300 hover:border-accent hover:-translate-y-1 group">
              <div className="w-11 h-11 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-all">
                {f.icon}
              </div>
              <div className="text-[10px] font-mono text-accent-light uppercase tracking-[0.15em] mb-2">{f.tag}</div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mb-32 overflow-hidden px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">From repo to record<br />in four steps.</h2>
          <p className="text-text-secondary text-lg">The zero-friction path to professional proof of work.</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Timeline Connector Line */}
          <div className="absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-border hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent-light to-accent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Step Marker */}
                <div className="w-24 h-24 mb-10 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100" />
                  <div className="w-16 h-16 bg-bg-card border-2 border-border rounded-2xl flex items-center justify-center font-black text-2xl text-accent shadow-2xl relative z-10 transition-all duration-300 group-hover:border-accent group-hover:-translate-y-2 group-hover:rotate-3">
                    {s.num}
                  </div>
                  {/* Floating particle */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-bounce delay-150" />
                </div>

                <h3 className="text-xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-[240px]">
                  {s.desc}
                </p>

                {/* Mobile Connector */}
                {i < steps.length - 1 && (
                  <div className="w-px h-12 bg-border my-6 md:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVLOG PREVIEW */}
      <section className="mb-24">
        <div className="bg-bg-card border border-border rounded-radius p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <span className="text-xs font-mono text-text-muted">AI-Generated Milestone — montor-bot commented on your commit</span>
          </div>
          <div className="font-mono text-sm space-y-3 text-text-secondary">
            <p><span className="text-green">✦ MILESTONE:</span> <span className="text-text font-semibold">Auth Flow Complete — OAuth + Session Management</span></p>
            <p><span className="text-accent">INTENT:</span> You added GitHub OAuth to remove friction from the login flow. Previous 3 sessions showed repeated "auth" mentions — this resolves the bottleneck.</p>
            <p><span className="text-text-muted">VIBE SCORE:</span> <span className="text-accent">+24pts</span> — commit density doubled, indicating high momentum state.</p>
            <p><span className="text-text-muted">NEXT AI SUGGESTION:</span> File structure suggests you're ready to move from vibe phase → system. Consider adding tests for the session handler.</p>
            <div className="flex gap-3 pt-2">
              <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded border border-accent/20">#auth</span>
              <span className="px-2 py-1 bg-green/10 text-green text-xs rounded border border-green/20">#milestone</span>
              <span className="px-2 py-1 bg-surface text-text-muted text-xs rounded border border-border">#vibe-to-system</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Invest in your momentum.</h2>
          <p className="text-text-secondary max-w-lg mx-auto">Start free. Scale when your projects do.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <div key={i} className={`rounded-radius p-7 border transition-all duration-300 hover:-translate-y-1 relative ${t.accent ? 'bg-accent border-accent shadow-[0_0_40px_rgba(99,102,241,0.25)]' : 'bg-bg-card border-border hover:border-accent'}`}>
              {t.accent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green text-bg text-xs font-bold rounded-full">MOST POPULAR</div>}
              <div className={`text-sm font-mono uppercase tracking-widest mb-4 ${t.accent ? 'text-white/70' : 'text-text-muted'}`}>{t.name}</div>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-4xl font-black ${t.accent ? 'text-white' : 'text-text'}`}>{t.price}</span>
                <span className={`text-sm mb-1 ${t.accent ? 'text-white/60' : 'text-text-muted'}`}>{t.sub}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-2 text-sm ${t.accent ? 'text-white/80' : 'text-text-secondary'}`}>
                    <svg className={`w-4 h-4 flex-shrink-0 ${t.accent ? 'text-white' : 'text-green'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-radius-sm font-bold text-sm transition-all hover:-translate-y-0.5 ${t.accent ? 'bg-white text-accent hover:bg-white/90' : 'bg-surface border border-border hover:border-accent text-text'}`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mb-16">
        <div className="relative bg-bg-card border border-border rounded-radius p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-light/5 pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 relative z-10">
            Your next commit should be<br />a milestone.
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto mb-8 relative z-10">
            Join builders who've stopped letting their best work go undocumented. Connect your GitHub in 60 seconds.
          </p>
          <button
            onClick={onLogin}
            className="relative z-10 px-10 py-4 bg-accent text-white font-bold text-lg rounded-radius-sm hover:bg-accent-light transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1"
          >
            Connect GitHub — free forever
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent rounded flex items-center justify-center font-black text-white text-xs">M</div>
            <span className="font-bold text-sm">Montor</span>
            <span className="text-text-muted text-xs">— Developer Momentum Engine</span>
          </div>
          <div className="flex gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-accent transition-colors">Docs</a>
            <a href="#" className="hover:text-accent transition-colors">GitHub</a>
            <a href="#" className="hover:text-accent transition-colors">Twitter</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          </div>
        </div>
        <p className="text-text-muted text-xs text-center md:text-left mt-6">© 2026 Montor. Built for the side project revolution.</p>
      </footer>
    </div>
  )
}
