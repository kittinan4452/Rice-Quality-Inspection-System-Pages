import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const IMAGE_LABELS = ['ข้าวเหลือง', 'ข้าวหัก', 'ข้าวเหนียว', 'ข้าวท้องไข่', 'ข้าวเสีย']
const DOT_COLORS = ['bg-yellow-400', 'bg-green-500', 'bg-sky-400', 'bg-red-500', 'bg-gray-500']

function StatCard({ label, value, unit = '', sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value ?? '—'}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function PercentBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{value ?? 0}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(value ?? 0, 100)}%` }} />
      </div>
    </div>
  )
}

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    api.get(`/api/inspections/${id}/`)
      .then(({ data: res }) => setData(res))
      .catch(() => {
        Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูล' })
        navigate('/inspections')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </main>
      <Footer />
    </div>
  )

  if (!data) return null

  const size = data.size
  const type_data = data.type_data
  const images = type_data
    ? [type_data.image1_url, type_data.image2_url, type_data.image3_url, type_data.image4_url, type_data.image5_url]
    : []
  const currentImg = images[imgIndex]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 pt-24 pb-10 max-w-screen-xl mx-auto w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link to="/inspections" className="hover:text-primary transition-colors">รายการตรวจ</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">#{data.id}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ผลการตรวจสอบข้าว</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(data.date).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent-light text-yellow-800">
            {data.type_rice}
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="ข้าวทั้งหมด" value={size?.totalall} unit="เมล็ด" />
          <StatCard label="ข้าวเต็มเมล็ด" value={size?.resultall_G} unit="%" sub="≥ 5.2 มม." />
          <StatCard label="ข้าวหัก" value={size?.resultall_B} unit="%" sub="< 5.2 มม." />
          <StatCard label="ความยาวเฉลี่ย" value={size?.average_h} unit="มม." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Image viewer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">ภาพผลการตรวจ</h2>
            <select
              value={imgIndex}
              onChange={e => setImgIndex(Number(e.target.value))}
              className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {IMAGE_LABELS.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>

            {currentImg ? (
              <img
                src={currentImg}
                alt={IMAGE_LABELS[imgIndex]}
                className="w-full rounded-xl cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={() => setModalOpen(true)}
              />
            ) : (
              <div className="w-full h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                ไม่มีภาพ
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-3">
              {IMAGE_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`flex items-center gap-2 text-xs text-left rounded-lg px-2 py-1.5 transition-colors ${imgIndex === i ? 'bg-primary-light text-primary font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLORS[i]}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">ข้อมูลการตรวจสอบ</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  { label: 'ชื่อผู้ขาย', value: data.name },
                  { label: 'ทะเบียนรถ', value: data.register },
                  { label: 'เบอร์โทรศัพท์', value: data.member },
                  { label: 'ชื่อผู้ซื้อ', value: data.user_name },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="font-medium text-gray-800">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contamination bars */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">ข้าวอื่นปลอมปน</h2>
              <div className="space-y-3">
                <PercentBar label="เมล็ดเหลือง (Y)" value={type_data?.resultall_percent_Y} color="bg-yellow-400" />
                <PercentBar label="ข้าวท้องไข่ (C)" value={type_data?.resultall_percent_C} color="bg-red-400" />
                <PercentBar label="เมล็ดเสีย (D)" value={type_data?.resultall_percent_D} color="bg-gray-400" />
                <PercentBar label="ข้าวเหนียว (G)" value={type_data?.resultall_percent_G} color="bg-sky-400" />
              </div>
            </div>

            {/* Breakdown table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-800">ส่วนผสมข้าว</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">ชนิด</th>
                    <th className="px-5 py-3 text-left">เกณฑ์</th>
                    <th className="px-5 py-3 text-right">ค่าที่ตรวจได้</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: 'ต้นข้าว', detail: '≥ 5.2 มม.', value: size?.resultall_G },
                    { name: 'ข้าวหักรวม', detail: '< 5.2 มม.', value: size?.resultall_B },
                    { name: 'ข้าวหักใหญ่', detail: '3.25 – 5.2 มม.', value: size?.resultall_b1 },
                    { name: 'ข้าวหักเล็ก', detail: '1.75 – 3.25 มม.', value: size?.resultall_b2 },
                    { name: 'ปลายข้าว', detail: '≤ 1.75 มม.', value: size?.resultall_b3 },
                  ].map(row => (
                    <tr key={row.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{row.name}</td>
                      <td className="px-5 py-3 text-gray-400">{row.detail}</td>
                      <td className="px-5 py-3 text-right font-semibold text-primary">{row.value ?? '—'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && currentImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setModalOpen(false)}
        >
          <button className="absolute top-5 right-6 text-white text-3xl leading-none hover:text-gray-300">&times;</button>
          <img
            src={currentImg}
            alt="fullscreen"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  )
}
