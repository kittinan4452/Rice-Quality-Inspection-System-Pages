import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ForgotPasswordDonePage from './pages/ForgotPasswordDonePage'
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage'
import PasswordResetCompletePage from './pages/PasswordResetCompletePage'
import HomePage from './pages/HomePage'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/done" element={<ForgotPasswordDonePage />} />
          <Route path="/password-reset/:uid/:token" element={<PasswordResetConfirmPage />} />
          <Route path="/password-reset/complete" element={<PasswordResetCompletePage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute><ListPage /></ProtectedRoute>} />
          <Route path="/inspections/:id" element={<ProtectedRoute><DetailPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
