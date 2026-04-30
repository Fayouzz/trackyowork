import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'

const IDLE_THRESHOLD = 30_000 // 30 seconds idle = distraction

export function useSession() {
  const [status, setStatus] = useState('idle') // idle | running | ended
  const [sessionId, setSessionId] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [distractions, setDistractions] = useState([])
  const [distractionTime, setDistractionTime] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [lastDistraction, setLastDistraction] = useState(null)
  const [finalMetrics, setFinalMetrics] = useState(null)

  const startRef = useRef(null)
  const tickRef = useRef(null)
  const idleRef = useRef(null)
  const isDistractedRef = useRef(false)
  const distractionStartRef = useRef(null)
  const streakStartRef = useRef(null)
  const longestStreakRef = useRef(0)

  // ── Timer tick ───────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const now = Date.now()
    const totalElapsed = Math.floor((now - startRef.current) / 1000)
    setElapsed(totalElapsed)

    if (!isDistractedRef.current && streakStartRef.current) {
      const streak = Math.floor((now - streakStartRef.current) / 1000)
      setCurrentStreak(streak)
      if (streak > longestStreakRef.current) longestStreakRef.current = streak
    }
  }, [])

  // ── Distraction: begin ───────────────────────────────────────────────────
  const beginDistraction = useCallback((type) => {
    if (status !== 'running' || isDistractedRef.current) return
    isDistractedRef.current = true
    distractionStartRef.current = Date.now()
    setLastDistraction(type)

    const entry = { type, timestamp: new Date().toISOString() }
    setDistractions(d => [...d, entry])

    if (sessionId) {
      api.logDistraction(sessionId, type).catch(() => {})
    }
  }, [status, sessionId])

  // ── Distraction: end ─────────────────────────────────────────────────────
  const endDistraction = useCallback(() => {
    if (!isDistractedRef.current) return
    isDistractedRef.current = false
    const now = Date.now()
    const dur = Math.floor((now - distractionStartRef.current) / 1000)
    setDistractionTime(d => d + dur)
    distractionStartRef.current = null
    streakStartRef.current = now
    setCurrentStreak(0)
  }, [])

  // ── Visibility change ────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'running') return
    const onVis = () => {
      if (document.hidden) beginDistraction('tab_switch')
      else endDistraction()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [status, beginDistraction, endDistraction])

  // ── Idle detection ───────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'running') return

    const resetIdle = () => {
      if (isDistractedRef.current && lastDistraction === 'idle') endDistraction()
      clearTimeout(idleRef.current)
      idleRef.current = setTimeout(() => beginDistraction('idle'), IDLE_THRESHOLD)
    }

    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('click', resetIdle)
    window.addEventListener('scroll', resetIdle)
    resetIdle()

    return () => {
      clearTimeout(idleRef.current)
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('click', resetIdle)
      window.removeEventListener('scroll', resetIdle)
    }
  }, [status, beginDistraction, endDistraction, lastDistraction])

  // ── Start ────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    const session = await api.startSession()
    setSessionId(session.id)
    setStatus('running')
    setElapsed(0)
    setDistractions([])
    setDistractionTime(0)
    setCurrentStreak(0)
    setFinalMetrics(null)
    setLastDistraction(null)
    startRef.current = Date.now()
    streakStartRef.current = Date.now()
    longestStreakRef.current = 0
    isDistractedRef.current = false

    tickRef.current = setInterval(tick, 1000)
  }, [tick])

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stop = useCallback(async () => {
    clearInterval(tickRef.current)
    clearTimeout(idleRef.current)

    const totalSecs = Math.floor((Date.now() - startRef.current) / 1000)
    let finalDistractionTime = distractionTime
    if (isDistractedRef.current && distractionStartRef.current) {
      finalDistractionTime += Math.floor((Date.now() - distractionStartRef.current) / 1000)
    }

    const focusedSecs = Math.max(0, totalSecs - finalDistractionTime)
    const focusScore = totalSecs > 0 ? Math.round((focusedSecs / totalSecs) * 100) : 0
    const longestStreak = Math.max(longestStreakRef.current, currentStreak)

    const metrics = {
      total_duration: totalSecs,
      distraction_time: finalDistractionTime,
      focus_score: focusScore,
      longest_focus_streak: longestStreak,
    }

    if (sessionId) {
      await api.endSession(sessionId, metrics)
    }

    // play end sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}

    setFinalMetrics({ ...metrics, distractionCount: distractions.length })
    setStatus('ended')
  }, [sessionId, distractionTime, distractions, currentStreak])

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearInterval(tickRef.current)
    setStatus('idle')
    setSessionId(null)
    setElapsed(0)
    setDistractions([])
    setDistractionTime(0)
    setCurrentStreak(0)
    setFinalMetrics(null)
    setLastDistraction(null)
    isDistractedRef.current = false
  }, [])

  // cleanup
  useEffect(() => () => { clearInterval(tickRef.current); clearTimeout(idleRef.current) }, [])

  return {
    status,
    elapsed,
    distractions,
    distractionCount: distractions.length,
    distractionTime,
    currentStreak,
    isDistracted: isDistractedRef.current,
    lastDistraction,
    finalMetrics,
    sessionId,
    start,
    stop,
    reset,
  }
}
