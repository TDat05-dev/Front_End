import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import FriendsPage from './pages/Friends/FriendsPage'
import ChatPage from "./pages/Chat/ChatPage.tsx";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/chats" element={<ChatPage />} />
        {/* Đường dẫn không tồn tại → quay về trang đăng nhập */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
