import { useSession } from '../hooks/useSession'
import TimerRing from '../components/TimerRing'
import SessionResult from '../components/SessionResult'
import { formatDurationHuman, scoreColor } from '../lib/utils'

export default function Home() {
  const {
    status, elapsed, distractionCount, distractionTime, currentStreak,
    isDistracted, lastDistraction, finalMetrics, start, stop, reset,
  } = useSession()

  if (status === 'ended' && finalMetrics) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
          Session Report
        </h1>
        <SessionResult metrics={finalMetrics} onReset={reset} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          {status === 'idle' ? 'Ready to focus?' : 'Deep work session'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {status === 'idle' ? 'Start a session and track your real focus' : 'Stay on this tab and keep working'}
        </p>
      </div>

      {/* Timer ring */}
      <div className="flex justify-center mb-8">
        <TimerRing elapsed={elapsed} status={status} isDistracted={isDistracted} />
      </div>

      {/* Live stats (only during session) */}
      {status === 'running' && (
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in">
          <StatCard label="Distractions" value={distractionCount} danger={distractionCount > 0} />
          <StatCard label="Lost time" value={formatDurationHuman(distractionTime)} danger={distractionTime > 60} />
          <StatCard label="Streak" value={formatDurationHuman(currentStreak)} />
        </div>
      )}

      {/* Distraction alert */}
      {isDistracted && (
        <div className="mb-6 rounded-xl p-3 border text-sm text-center animate-fade-in"
          style={{ borderColor: 'var(--danger)', backgroundColor: 'rgba(220,38,38,0.06)', color: 'var(--danger)' }}>
          ⚠ {lastDistraction === 'tab_switch' ? 'You switched tabs — stay focused!' : 'Idle detected — are you still working?'}
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-center">
        {status === 'idle' && (
          <button onClick={start} className="btn-primary px-10 py-4 text-base rounded-2xl">
            Start Session
          </button>
        )}
        {status === 'running' && (
          <button
            onClick={stop}
            className="px-10 py-4 text-base rounded-2xl font-medium transition-all duration-200 active:scale-95 border"
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)', backgroundColor: 'rgba(220,38,38,0.04)' }}
          >
            End Session
          </button>
        )}
      </div>

      {/* Tips (idle only) */}
      {status === 'idle' && (
        <div className="mt-10 grid grid-cols-1 gap-2 animate-fade-in">
          {[
            ['📵', 'Put your phone away'],
            ['🎧', 'Use noise-cancelling headphones'],
            ['🚫', 'Close unnecessary tabs first'],
          ].map(([icon, tip]) => (
            <div key={tip} className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>{icon}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, danger }) {
  return (
    <div className="card py-3 px-3 text-center">
      <p className="font-mono font-semibold text-lg leading-tight" style={{ color: danger ? 'var(--danger)' : 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
