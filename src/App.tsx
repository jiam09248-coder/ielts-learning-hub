import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CatalogPage from './pages/CatalogPage'
import LessonPage from './pages/LessonPage'
import LoginPage from './pages/LoginPage'
import ExpressionsPage from './pages/ExpressionsPage'
import ErrorBoundary from './components/ErrorBoundary'
import { preloadLessonDictionary } from './services/dictionaryService'

function App() {
  useEffect(() => {
    const timer = window.setTimeout(() => preloadLessonDictionary(), 250)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lesson/:videoId" element={<LessonPage />} />
          <Route path="/lesson/:videoId/expressions" element={<ExpressionsPage />} />
          <Route path="*" element={<CatalogPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
