import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">เข้าสู่ระบบ</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="block w-full px-3 py-2 border border-primary rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-primary rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">Sign Up</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
