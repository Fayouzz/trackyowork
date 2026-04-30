export function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDurationHuman(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export function scoreColor(score) {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--accent)'
  if (score >= 40) return '#ea580c'
  return 'var(--danger)'
}

export function scoreLabel(score) {
  if (score >= 85) return 'Deep Flow'
  if (score >= 70) return 'Focused'
  if (score >= 50) return 'Moderate'
  if (score >= 30) return 'Scattered'
  return 'Chaotic'
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function calcMetrics({ totalSeconds, distractionSeconds, distractions }) {
  const focusedSeconds = Math.max(0, totalSeconds - distractionSeconds)
  const focusScore = totalSeconds > 0 ? Math.round((focusedSeconds / totalSeconds) * 100) : 0

  // Longest streak: gap analysis
  let longestStreak = 0
  if (distractions.length === 0) {
    longestStreak = totalSeconds
  } else {
    const sorted = [...distractions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    let prev = 0
    for (const d of sorted) {
      const t = (new Date(d.timestamp) - new Date(distractions[0]?.sessionStart || d.timestamp)) / 1000
      longestStreak = Math.max(longestStreak, t - prev)
      prev = t
    }
    longestStreak = Math.max(longestStreak, totalSeconds - prev)
  }

  return {
    total_duration: Math.round(totalSeconds),
    distraction_time: Math.round(distractionSeconds),
    focus_score: focusScore,
    longest_focus_streak: Math.round(longestStreak),
  }
}
