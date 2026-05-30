import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import CatalogPage from './pages/CatalogPage'
import LessonPage from './pages/LessonPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/lesson/:videoId" element={<LessonPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
