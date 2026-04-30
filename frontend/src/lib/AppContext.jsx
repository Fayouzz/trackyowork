import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [tier, setTier] = useState(() => localStorage.getItem('tier') || 'free')
  const [dark, setDark] = useState(() => localStorage.getItem('dark') === 'true')

  useEffect(() => {
    localStorage.setItem('tier', tier)
  }, [tier])

  useEffect(() => {
    localStorage.setItem('dark', dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const upgrade = () => setTier('paid')
  const downgrade = () => setTier('free')
  const toggleDark = () => setDark(d => !d)

  return (
    <AppContext.Provider value={{ tier, dark, upgrade, downgrade, toggleDark }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
