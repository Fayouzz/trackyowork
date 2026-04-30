import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApp } from '../lib/AppContext'
import { formatDate, formatTime, formatDurationHuman, scoreColor, scoreLabel } from '../lib/utils'

export default function History() {
  const { tier } = useApp()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getSessions(tier)
      .then(setSessions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tier])

  const deleteSession = async (id) => {
    if (!confirm('Delete this session?')) return
    await api.deleteSession(id)
    setSessions(s => s.filter(x => x.id !== id))
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Session History</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {tier === 'free' ? 'Last 5 sessions · ' : ''}{sessions.length} sessions
          </p>
        </div>
        {tier === 'paid' && (
          <a
            href={api.exportCSV()}
            download
            className="btn-ghost text-sm"
          >
            ↓ Export CSV
          </a>
        )}
      </div>

      {/* Paywall notice */}
      {tier === 'free' && (
        <div className="card mb-6 flex items-center justify-between gap-4 py-4"
          style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Free plan shows last 5 sessions. Upgrade for full history & analytics.
          </p>
          <Link to="/pricing" className="btn-primary text-sm shrink-0 px-4 py-2">Upgrade →</Link>
        </div>
      )}

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <SessionRow key={s.id} session={s} onDelete={deleteSession} />
          ))}
        </div>
      )}
    </div>
  )
}

function SessionRow({ session: s, onDelete }) {
  const color = scoreColor(s.focus_score)
  return (
    <div className="card flex items-center gap-4 py-4 animate-slide-up">
      {/* Score circle */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2"
        style={{ borderColor: color }}>
        <span className="font-mono font-bold text-sm" style={{ color }}>{Math.round(s.focus_score)}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {formatDate(s.start_time)}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(s.start_time)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>⏱ {formatDurationHuman(s.total_duration)}</span>
          <span style={{ color }}>◉ {scoreLabel(s.focus_score)}</span>
          {s.distraction_time > 0 && (
            <span style={{ color: 'var(--text-muted)' }}>
              {formatDurationHuman(s.distraction_time)} lost
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(s.id)}
        className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        style={{ color: 'var(--text-muted)' }}
        title="Delete session"
      >
        ✕
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card animate-pulse h-20" style={{ backgroundColor: 'var(--surface-2)' }} />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="max-w-2xl mx-auto card text-center py-12">
      <p className="text-4xl mb-3">⚡</p>
      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Could not load sessions</p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Make sure the backend is running on port 3001</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card text-center py-16">
      <p className="text-5xl mb-4">⏱</p>
      <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No sessions yet</p>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Complete your first deep work session to see it here</p>
      <Link to="/" className="btn-primary">Start a Session</Link>
    </div>
  )
}
