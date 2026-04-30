import { formatDuration } from '../lib/utils'

export default function TimerRing({ elapsed, status, isDistracted }) {
  const size = 260
  const stroke = 6
  const r = (size / 2) - stroke
  const circ = 2 * Math.PI * r

  // Visual ring: pulses when running, red when distracted
  const ringColor = isDistracted ? 'var(--danger)' : status === 'running' ? 'var(--accent)' : 'var(--border)'
  const dashOffset = status === 'running' ? circ * (1 - Math.min(elapsed / 3600, 1)) : circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG ring */}
      <svg
        width={size}
        height={size}
        className={status === 'running' && !isDistracted ? 'ring-active' : ''}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <div
          className="font-mono font-bold tracking-tight leading-none"
          style={{ fontSize: 52, color: 'var(--text-primary)' }}
        >
          {formatDuration(elapsed)}
        </div>

        <div className="text-sm font-medium" style={{ color: isDistracted ? 'var(--danger)' : 'var(--text-muted)' }}>
          {status === 'idle' && 'ready'}
          {status === 'running' && !isDistracted && 'in focus'}
          {status === 'running' && isDistracted && '⚠ distracted'}
          {status === 'ended' && 'session ended'}
        </div>
      </div>
    </div>
  )
}
