import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import FriendsPage from './pages/Friends/FriendsPage'
import ChatPage from "./pages/Chat/ChatPage.tsx";
import SettingsPage from './pages/Settings/SettingsPage'
import Protected from './components/Protected'
import ConnectionBanner from './components/ConnectionBanner'
import './App.css'

function App() {
  return (
      <BrowserRouter>
        <ConnectionBanner />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/friends" element={<Protected><FriendsPage /></Protected>} />
          <Route path="/chats" element={<Protected><ChatPage /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
          {/* Đường dẫn không tồn tại → quay về trang đăng nhập */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
