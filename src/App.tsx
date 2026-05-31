import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import CatalogPage from './pages/CatalogPage'
import LessonPage from './pages/LessonPage'
import ExpressionsPage from './pages/ExpressionsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/lesson/:videoId" element={<LessonPage />} />
        <Route path="/lesson/:videoId/expressions" element={<ExpressionsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
