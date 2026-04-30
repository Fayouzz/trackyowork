import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

const FREE_FEATURES = [
  'Start & stop deep work sessions',
  'Live distraction tracking',
  'Focus score after each session',
  'Last 5 sessions only',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited session history',
  'Weekly analytics dashboard',
  'Export data as CSV',
  'Dark mode',
  'Priority support',
]

export default function Pricing() {
  const { tier, upgrade, downgrade } = useApp()
  const [billing, setBilling] = useState('monthly') // monthly | lifetime
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpgrade = async () => {
    setLoading(true)
    // Mock Stripe — in production, call your backend to create a Stripe checkout session
    await new Promise(r => setTimeout(r, 1200))
    upgrade()
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>
          Simple, honest pricing
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          One product. Pay once or monthly. No bullshit.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center mt-6 rounded-xl p-1" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {[['monthly', '$3 / month'], ['lifetime', '$5 once']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setBilling(v)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: billing === v ? 'var(--surface)' : 'transparent',
                color: billing === v ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: billing === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="card flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Free</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>$0</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>forever</span>
            </div>
          </div>

          <ul className="space-y-2 flex-1">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5" style={{ color: 'var(--text-muted)' }}>◦</span>
                {f}
              </li>
            ))}
          </ul>

          {tier === 'free' ? (
            <div className="btn-ghost text-center cursor-default opacity-60">Current plan</div>
          ) : (
            <button onClick={downgrade} className="btn-ghost text-sm">
              Downgrade to Free
            </button>
          )}
        </div>

        {/* Pro */}
        <div className="card flex flex-col gap-4 relative overflow-hidden"
          style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--surface)' }}>
          {/* Popular badge */}
          <div className="absolute top-0 right-0">
            <div className="text-xs font-medium px-3 py-1 rounded-bl-xl"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
              Popular
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Pro</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-4xl" style={{ color: 'var(--text-primary)' }}>
                {billing === 'monthly' ? '$3' : '$5'}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {billing === 'monthly' ? '/ month' : 'one-time'}
              </span>
            </div>
            {billing === 'lifetime' && (
              <p className="text-xs mt-1" style={{ color: 'var(--success)' }}>Best value · pay once, own it forever</p>
            )}
          </div>

          <ul className="space-y-2 flex-1">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-0.5" style={{ color: 'var(--accent)' }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          {tier === 'paid' ? (
            <div className="btn-primary text-center cursor-default opacity-80">✓ Active</div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="btn-primary"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--bg)', borderTopColor: 'transparent' }} />
                  Processing...
                </span>
              ) : (
                `Upgrade for ${billing === 'monthly' ? '$3/mo' : '$5'}`
              )}
            </button>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>🔒 Secure checkout</span>
        <span>↩ 30-day refund</span>
        <span>🚫 No spam ever</span>
      </div>

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>FAQ</h2>
        {[
          ['Is my data private?', 'Yes. Sessions are stored locally on your device (SQLite). Nothing leaves your machine unless you export it.'],
          ['Can I cancel anytime?', 'Yes, cancel anytime from your account. No questions asked.'],
          ['What does "lifetime" mean?', 'Pay once and keep Pro features forever, including all future updates to the core product.'],
          ['Do you track what I work on?', 'No. We only track time and distraction signals — not content, keystrokes, or what you type.'],
        ].map(([q, a]) => (
          <div key={q} className="card py-4">
            <p className="font-medium text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{q}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
