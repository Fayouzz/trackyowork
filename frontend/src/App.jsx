import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './lib/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}
