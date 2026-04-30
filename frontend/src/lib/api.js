const BASE = import.meta.env.VITE_API_URL || '/api'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  startSession: () => req('POST', '/sessions/start'),
  endSession: (id, metrics) => req('PUT', `/sessions/${id}/end`, metrics),
  getSessions: (tier = 'free') => req('GET', `/sessions?tier=${tier}`),
  getSession: (id) => req('GET', `/sessions/${id}`),
  deleteSession: (id) => req('DELETE', `/sessions/${id}`),
  logDistraction: (session_id, type) => req('POST', '/distractions', { session_id, type }),
  getWeekly: () => req('GET', '/dashboard/weekly'),
  exportCSV: () => `${BASE}/export/csv`,
  health: () => req('GET', '/health'),
}
