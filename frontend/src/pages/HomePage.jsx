import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const pollRef = useRef(null)

  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({ name: '', register: '', member: '', type_rice: 'ข้าวหอมมะลิ' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = e => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleReset = () => {
    setForm({ name: '', register: '', member: '', type_rice: 'ข้าวหอมมะลิ' })
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) {
      Swal.fire({ icon: 'warning', title: 'กรุณาเลือกรูปภาพ' })
      return
    }
    setLoading(true)
    setStatusText('กำลังอัพโหลด...')

    const fd = new FormData()
    fd.append('file', file)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    try {
      const { data } = await api.post('/api/inspections/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatusText('กำลังวิเคราะห์ภาพด้วย AI...')
      const taskId = data.task_id

      pollRef.current = setInterval(async () => {
        try {
          const { data: taskData } = await api.get(`/api/inspections/task/${taskId}/`)
          if (taskData.status === 'SUCCESS') {
            clearInterval(pollRef.current)
            setLoading(false)
            setStatusText('')
            Swal.fire({ icon: 'success', title: 'วิเคราะห์เสร็จสิ้น', timer: 1500, showConfirmButton: false })
            navigate(`/inspections/${taskData.inspection_id}`)
          } else if (taskData.status === 'FAILURE') {
            clearInterval(pollRef.current)
            setLoading(false)
            setStatusText('')
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: taskData.error || 'กรุณาลองใหม่อีกครั้ง' })
          }
        } catch {
          clearInterval(pollRef.current)
          setLoading(false)
          setStatusText('')
          Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถตรวจสอบสถานะได้' })
        }
      }, 2000)
    } catch (err) {
      setLoading(false)
      setStatusText('')
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'กรุณาลองใหม่อีกครั้ง' })
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 pt-24 pb-10 max-w-screen-xl mx-auto w-full">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบคุณภาพข้าว</h1>
          <p className="text-sm text-gray-500 mt-1">อัพโหลดภาพตัวอย่างข้าวเพื่อวิเคราะห์คุณภาพด้วย AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upload zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-base font-semibold text-gray-800 mb-4">ภาพตัวอย่าง</h2>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => !preview && fileRef.current?.click()}
              className={`flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer min-h-72
                ${preview ? 'border-transparent' : 'border-gray-200 hover:border-primary bg-gray-50 hover:bg-primary-light/20'}`}
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-contain rounded-xl max-h-80" />
              ) : (
                <div className="text-center px-6 py-10">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-sm font-medium text-gray-600">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
            {preview && (
              <button
                onClick={() => { setPreview(null); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                เปลี่ยนรูปภาพ
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">ข้อมูลผู้ขาย</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ชื่อผู้ขาย</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="ชื่อ-นามสกุล" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ทะเบียนรถ</label>
                  <input type="text" name="register" value={form.register} onChange={handleChange} required placeholder="กก 1234" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">เบอร์โทรศัพท์</label>
                  <input type="text" name="member" value={form.member} onChange={handleChange} required placeholder="08X-XXX-XXXX" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">ชื่อผู้ซื้อ</label>
                  <input type="text" readOnly value={user?.first_name || ''} className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">ประเภทข้าว</label>
                <select name="type_rice" value={form.type_rice} onChange={handleChange} className={inputCls}>
                  <option>ข้าวหอมมะลิ</option>
                  <option>ข้าวขาว</option>
                  <option>ข้าวเหนียว</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">อัพโหลดรูปภาพ</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="block w-full text-sm text-gray-500 border border-gray-200 rounded-xl
                    file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium
                    file:bg-primary file:text-white file:rounded-l-xl file:cursor-pointer
                    hover:file:bg-primary-dark transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {statusText || 'กำลังประมวลผล...'}
                    </>
                  ) : 'วิเคราะห์ข้าว'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
                >
                  รีเซ็ต
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
