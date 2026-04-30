import { scoreColor, scoreLabel, formatDuration, formatDurationHuman } from '../lib/utils'

export default function SessionResult({ metrics, onReset }) {
  if (!metrics) return null

  const { total_duration, distraction_time, focus_score, longest_focus_streak, distractionCount } = metrics
  const focusedTime = Math.max(0, total_duration - distraction_time)
  const color = scoreColor(focus_score)
  const label = scoreLabel(focus_score)

  const insights = []
  if (distractionCount > 0) {
    insights.push(`You were distracted ${Math.round((distraction_time / total_duration) * 100)}% of your session`)
  }
  if (longest_focus_streak > 0) {
    insights.push(`Longest focus streak: ${formatDurationHuman(longest_focus_streak)}`)
  }
  if (focus_score >= 80) {
    insights.push('Excellent deep work. Keep it up.')
  } else if (focus_score < 40) {
    insights.push('Try closing distracting tabs before your next session.')
  }

  return (
    <div className="card animate-slide-up space-y-6">
      {/* Score */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>session complete</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-5xl leading-none" style={{ color }}>
              {focus_score}
            </span>
            <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>/100</span>
          </div>
          <p className="text-sm font-medium mt-1" style={{ color }}>{label}</p>
        </div>
        <div className="w-20 h-20 rounded-full flex items-center justify-center border-4" style={{ borderColor: color }}>
          <span className="text-2xl">
            {focus_score >= 80 ? '🔥' : focus_score >= 60 ? '✓' : focus_score >= 40 ? '~' : '💀'}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
          <div
            className="h-full rounded-full score-bar-fill"
            style={{ '--target-width': `${focus_score}%`, backgroundColor: color, width: `${focus_score}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total time', value: formatDurationHuman(total_duration) },
          { label: 'Focused time', value: formatDurationHuman(focusedTime) },
          { label: 'Distraction time', value: formatDurationHuman(distraction_time) },
          { label: 'Distractions', value: distractionCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="font-mono font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-1.5">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="mt-0.5 text-xs">→</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <button onClick={onReset} className="btn-primary w-full">
        Start New Session
      </button>
    </div>
  )
}
