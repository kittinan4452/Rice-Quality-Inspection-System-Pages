import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(username, password)
      Swal.fire({ icon: 'success', title: `ยินดีต้อนรับ ${data.first_name}`, timer: 1500, showConfirmButton: false })
      navigate('/')
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', text: err.response?.data?.detail || 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-dark via-primary to-green-400 flex-col items-center justify-center p-12 text-white">
        <div className="text-7xl mb-6">🌾</div>
        <h1 className="text-4xl font-bold mb-3">RICE</h1>
        <p className="text-green-200 text-center text-lg">ระบบตรวจสอบคุณภาพข้าว<br/>ด้วยปัญญาประดิษฐ์</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-4xl lg:hidden mb-2">🌾</div>
            <h2 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
            <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับกลับมา</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ใช้</label>
              <input
                type="text"
                required
                placeholder="กรอก Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">ลืมรหัสผ่าน?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
