import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PLACEHOLDER_IMG = 'https://media.istockphoto.com/id/1427450890/th/%E0%B9%80%E0%B8%A7%E0%B8%84%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%A1%E0%B8%B5%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A1%E0%B8%B5%E0%B8%AD%E0%B8%A2%E0%B8%B9%E0%B9%88%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%A2%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%AD%E0%B8%9A%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%AA%E0%B9%8D%E0%B8%B2%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B9%84%E0%B8%A7%E0%B9%89%E0%B9%81%E0%B8%A2%E0%B8%81%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B8%97%E0%B8%B5%E0%B9%88.jpg?s=612x612&w=0&k=20&c=tNK-KR9Kb4dHokDiA8P3fnP5JNFNw2XzY_ioHu1deIk='

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [preview, setPreview] = useState(PLACEHOLDER_IMG)
  const [form, setForm] = useState({ name: '', register: '', member: '', type_rice: 'ข้าวหอมมะลิ' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleReset = () => {
    setForm({ name: '', register: '', member: '', type_rice: 'ข้าวหอมมะลิ' })
    setFile(null)
    setPreview(PLACEHOLDER_IMG)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) {
      Swal.fire({ icon: 'warning', title: 'กรุณาเลือกไฟล์รูปภาพ' })
      return
    }
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', form.name)
    fd.append('register', form.register)
    fd.append('member', form.member)
    fd.append('type_rice', form.type_rice)

    try {
      const { data } = await api.post('/api/inspections/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      Swal.fire({ icon: 'success', title: 'ตรวจสอบเสร็จสิ้น', timer: 1500, showConfirmButton: false })
      navigate(`/inspections/${data.id}`)
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'กรุณาลองใหม่อีกครั้ง' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 pt-28 pb-10">
        <nav className="mb-6">
          <ol className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <li className="font-medium text-gray-800">หน้าแรก</li>
          </ol>
        </nav>

        <h1 className="text-center text-3xl text-black mb-8">ระบบตรวจสอบข้าว</h1>

        <div className="flex gap-6">
          {/* Image Preview */}
          <div className="w-1/2 bg-white shadow-2xl rounded-lg flex flex-col items-center justify-center py-8 px-6">
            <h2 className="text-2xl mb-6">อัพโหลดข้อมูลภาพ</h2>
            <img
              src={preview}
              alt="preview"
              className="h-96 rounded-xl object-contain"
            />
          </div>

          {/* Form */}
          <div className="w-1/2 bg-white shadow-2xl rounded-lg px-8 py-6">
            <h2 className="text-center text-2xl mb-4">กรอกข้อมูลผู้ขาย</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-black">ชื่อผู้ขาย</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="ชื่อผู้ขาย"
                    className="py-2 px-3 block w-full rounded-lg text-sm border border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-black">ทะเบียนรถ</label>
                  <input
                    type="text" name="register" value={form.register} onChange={handleChange} required
                    placeholder="ทะเบียนรถ"
                    className="py-2 px-3 block w-full rounded-lg text-sm border border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-black">เบอร์โทรศัพท์</label>
                  <input
                    type="text" name="member" value={form.member} onChange={handleChange} required
                    placeholder="เบอร์โทรศัพท์"
                    className="py-2 px-3 block w-full rounded-lg text-sm border border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-black">ชื่อผู้ชื้อ</label>
                  <input
                    type="text" readOnly value={user?.first_name || ''}
                    className="py-2 px-3 block w-full rounded-lg text-sm border border-primary bg-slate-200 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-black">ประเภทข้าว</label>
                  <select
                    name="type_rice" value={form.type_rice} onChange={handleChange}
                    className="py-2 px-3 block w-full rounded-lg text-sm border border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option>ข้าวหอมมะลิ</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="block mb-1 text-sm font-medium text-gray-900">Upload file photo</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="block w-full border border-primary rounded-lg text-sm file:bg-primary file:border-0 file:text-white file:me-4 file:py-2 file:px-4 file:cursor-pointer"
                />
              </div>

              <div className="flex justify-center gap-4 mt-7">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-36 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {loading ? 'กำลังประมวลผล...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-36 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
