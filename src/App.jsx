import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ChatWidget from './components/ChatWidget'
import Dashboard from './pages/Dashboard'
import DiseaseDetection from './pages/DiseaseDetection'
import Advisory from './pages/Advisory'
import MarketLinkage from './pages/MarketLinkage'
import { LangProvider, useLang } from './i18n'

const titles = {
  '/': 'dashboard',
  '/disease': 'disease',
  '/advisory': 'advisory',
  '/market': 'market',
}

function Shell() {
  const { pathname } = useLocation()
  const { t } = useLang()
  return (
    <div className="flex h-screen overflow-hidden bg-paper-dim">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={t(titles[pathname] || 'dashboard')} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/advisory" element={<Advisory />} />
            <Route path="/market" element={<MarketLinkage />} />
          </Routes>
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </LangProvider>
  )
}
