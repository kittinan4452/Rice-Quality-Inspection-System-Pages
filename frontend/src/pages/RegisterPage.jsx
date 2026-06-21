import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstname: '', lastname: '', username: '', password: '', email: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/register/', form)
      Swal.fire({ icon: 'success', title: 'สมัครสมาชิกสำเร็จ', timer: 1500, showConfirmButton: false })
      navigate('/login')
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'กรุณาลองใหม่อีกครั้ง' })
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'firstname', label: 'ชื่อ', type: 'text', placeholder: 'ชื่อจริง', half: true },
    { name: 'lastname', label: 'นามสกุล', type: 'text', placeholder: 'นามสกุล', half: true },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Username' },
    { name: 'password', label: 'รหัสผ่าน', type: 'password', placeholder: 'อย่างน้อย 8 ตัวอักษร' },
    { name: 'email', label: 'อีเมล', type: 'email', placeholder: 'name@gmail.com' },
  ]

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-dark via-primary to-green-400 flex-col items-center justify-center p-12 text-white">
        <div className="text-7xl mb-6">🌾</div>
        <h1 className="text-4xl font-bold mb-3">RICE</h1>
        <p className="text-green-200 text-center text-lg">สร้างบัญชีเพื่อเริ่มใช้งาน<br/>ระบบตรวจสอบคุณภาพข้าว</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-4xl lg:hidden mb-2">🌾</div>
            <h2 className="text-2xl font-bold text-gray-900">สมัครสมาชิก</h2>
            <p className="text-gray-500 text-sm mt-1">กรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {fields.filter(f => f.half).map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    required
                    value={form[f.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
            {fields.filter(f => !f.half).map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  required
                  value={form[f.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
