import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
    { name: 'firstname', label: 'ชื่อ', type: 'text', placeholder: 'Firstname' },
    { name: 'lastname', label: 'นามสกุล', type: 'text', placeholder: 'Lastname' },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'Username' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'name@gmail.com' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">สมัครสมาชิก</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block mb-1 text-sm font-medium text-gray-900">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  required
                  value={form[f.name]}
                  onChange={handleChange}
                  className="bg-gray-50 border border-primary text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-5 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-full text-sm text-center disabled:opacity-50 transition-colors"
            >
              {loading ? 'กำลังสมัคร...' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
