import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApp } from '../lib/AppContext'
import { formatDurationHuman, scoreColor } from '../lib/utils'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const { tier } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tier !== 'paid') { setLoading(false); return }
    api.getWeekly()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tier])

  if (tier !== 'paid') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-2xl mb-8" style={{ color: 'var(--text-primary)' }}>Weekly Dashboard</h1>
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Analytics are a Pro feature</p>
          <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
            Get weekly insights, focus trends, and your best performance streaks.
          </p>
          <Link to="/pricing" className="btn-primary px-8 py-3">Unlock Dashboard</Link>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data) return null

  const { stats, dailyData } = data
  const maxFocusSecs = Math.max(...dailyData.map(d => d.focus_seconds), 1)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Weekly Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 7 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total sessions" value={stats.total_sessions} />
        <StatCard label="Focus hours" value={formatDurationHuman(stats.total_focus_seconds)} />
        <StatCard
          label="Avg score"
          value={`${Math.round(stats.avg_focus_score)}`}
          valueColor={scoreColor(stats.avg_focus_score)}
        />
        <StatCard label="Longest streak" value={formatDurationHuman(stats.longest_streak)} />
      </div>

      {/* Bar chart */}
      <div className="card mb-6">
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Daily Focus Time</h2>
        {dailyData.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No data this week yet</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {getLast7Days(dailyData).map(({ label, focus_seconds, avg_score }, i) => {
              const height = focus_seconds ? Math.max(8, (focus_seconds / maxFocusSecs) * 100) : 0
              const color = focus_seconds ? scoreColor(avg_score || 0) : 'var(--border)'
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md transition-all duration-700"
                    style={{ height: `${height}%`, backgroundColor: color, minHeight: focus_seconds ? 8 : 0 }}
                    title={focus_seconds ? `${formatDurationHuman(focus_seconds)} · score ${Math.round(avg_score)}` : 'No session'}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Best session badge */}
      {stats.best_focus_score > 0 && (
        <div className="card flex items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--accent-light)' }}>
            🏆
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Best focus score this week</p>
            <p className="font-display font-bold text-2xl" style={{ color: scoreColor(stats.best_focus_score) }}>
              {Math.round(stats.best_focus_score)} / 100
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, valueColor }) {
  return (
    <div className="card py-4">
      <p className="font-mono font-bold text-2xl leading-tight mb-0.5" style={{ color: valueColor || 'var(--text-primary)' }}>
        {value || '—'}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

function getLast7Days(data) {
  const result = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    const found = data.find(x => x.day === dayStr)
    result.push({
      label: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      focus_seconds: found?.focus_seconds || 0,
      avg_score: found?.avg_score || 0,
    })
  }
  return result
}

function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="card animate-pulse h-8 w-48 mb-6" style={{ backgroundColor: 'var(--surface-2)' }} />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse h-20" style={{ backgroundColor: 'var(--surface-2)' }} />
        ))}
      </div>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="max-w-2xl mx-auto card text-center py-12">
      <p className="text-sm" style={{ color: 'var(--danger)' }}>Error: {message}</p>
    </div>
  )
}
