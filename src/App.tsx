import { BrowserRouter, Routes, Route } from 'react-router-dom'
// 备案结束后取消注释下面这行和路由
// import LoginPage from './pages/LoginPage'
import CatalogPage from './pages/CatalogPage'
import LessonPage from './pages/LessonPage'
import ExpressionsPage from './pages/ExpressionsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 备案期间：首页直接显示课程目录，审核人员可见内容 */}
        <Route path="/" element={<CatalogPage />} />
        {/* 备案结束后改回：<Route path="/" element={<LoginPage />} /> */}
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/lesson/:videoId" element={<LessonPage />} />
        <Route path="/lesson/:videoId/expressions" element={<ExpressionsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
