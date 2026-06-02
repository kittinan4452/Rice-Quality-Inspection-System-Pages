import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const IMAGE_LABELS = ['ข้าวเหลือง', 'ข้าวหัก', 'ข้าวเหนียว', 'ข้าวท้องไข่', 'ข้าวเสีย']

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">กำลังโหลด...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!data) return null

  const { person, size, type_data } = {
    person: data,
    size: data.size,
    type_data: data.type_data,
  }

  const images = type_data
    ? [type_data.image1_url, type_data.image2_url, type_data.image3_url, type_data.image4_url, type_data.image5_url]
    : []

  const currentImg = images[imgIndex]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 pt-28 pb-10">
        <nav className="mb-6">
          <ol className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">หน้าแรก</Link>
            <span>/</span>
            <Link to="/inspections" className="hover:text-blue-600">รายการที่ตรวจแล้ว</Link>
            <span>/</span>
            <li className="text-gray-800 font-medium">ข้อมูลข้าว</li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold text-black mb-6">ผลการตรวจข้าว</h1>

        <div className="flex flex-wrap gap-6">
          {/* Image Viewer */}
          <div className="w-96 bg-[#EFEFE0] rounded-lg shadow-2xl p-4" style={{ minHeight: 650 }}>
            <select
              value={imgIndex}
              onChange={e => setImgIndex(Number(e.target.value))}
              className="bg-[#CFCFCF] border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 mb-4"
            >
              {IMAGE_LABELS.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>

            {currentImg && (
              <img
                src={currentImg}
                alt={IMAGE_LABELS[imgIndex]}
                className="w-full rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setModalOpen(true)}
              />
            )}

            <div className="grid grid-cols-3 mt-5 gap-y-2 text-sm">
              {[
                { label: 'ข้าวเหลือง', color: 'bg-blue-700' },
                { label: 'ข้าวหัก', color: 'bg-green-500' },
                { label: 'ข้าวเหนียว', color: 'bg-sky-500' },
                { label: 'ข้าวท้องไข่', color: 'bg-red-700' },
                { label: 'ข้าวเสีย', color: 'bg-gray-500' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1">
                  <span>{label}:</span>
                  <span className={`${color} w-3 h-3 rounded-full inline-block`} />
                </div>
              ))}
            </div>
          </div>

          {/* Data Tables */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* Info */}
            <div className="overflow-x-auto rounded-lg shadow-md">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-sm text-gray-700 uppercase bg-[#CFCFCF]">
                  <tr>
                    <th className="px-6 py-4">วันที่/เวลา: <span className="text-black font-normal">{new Date(data.date).toLocaleString('th-TH')}</span></th>
                    <th className="px-6 py-4">ID: <span className="text-black font-normal">{data.id}</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#EFEFE0] border-b">
                    <th className="px-6 py-4 font-medium">ข้าวทั้งหมด: <span className="text-black font-normal">{size?.totalall}</span></th>
                    <th className="px-6 py-4 font-medium">ประเภทข้าว: <span className="text-black font-normal">{data.type_rice}</span></th>
                  </tr>
                  <tr className="bg-[#EFEFE0] border-b">
                    <th className="px-6 py-4 font-medium">ชื่อผู้ชื้อ: <span className="text-black font-normal">{data.user_name}</span></th>
                    <th className="px-6 py-4 font-medium">ทะเบียนรถ: <span className="text-black font-normal">{data.register}</span></th>
                  </tr>
                  <tr className="bg-[#EFEFE0] border-b">
                    <th className="px-6 py-4 font-medium">ชื่อผู้ขาย: <span className="text-black font-normal">{data.name}</span></th>
                    <th className="px-6 py-4 font-medium">เบอร์โทรศัพท์: <span className="text-black font-normal">{data.member}</span></th>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Size */}
            <div className="overflow-x-auto rounded-lg shadow-md">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-sm text-gray-700 uppercase bg-[#CFCFCF]">
                  <tr>
                    <th className="px-6 py-3">ขนาดของข้าว</th>
                    <th className="px-6 py-3">ค่ามาตรฐาน</th>
                    <th className="px-6 py-3">ค่าที่ตรวจได้</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#EFEFE0] border-b">
                    <td className="px-6 py-4">ความยาวเฉลี่ยของข้าวเต็มเมล็ด</td>
                    <td className="px-6 py-4">≥ 7</td>
                    <td className="px-6 py-4 text-black">{size?.average_h}</td>
                  </tr>
                  <tr className="bg-[#EFEFE0] border-b">
                    <td className="px-6 py-4">ความยาวเฉลี่ยต่อความกว้างเฉลี่ย</td>
                    <td className="px-6 py-4">≥ 3.2 มม.</td>
                    <td className="px-6 py-4 text-black">{size?.average_w}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Composition */}
            <div className="overflow-x-auto rounded-lg shadow-md">
              <h2 className="text-black py-2 text-lg px-2">ส่วนผสม</h2>
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-sm text-gray-700 uppercase bg-[#CFCFCF]">
                  <tr>
                    <th className="px-6 py-3">ชื่อ</th>
                    <th className="px-6 py-3">รายละเอียด</th>
                    <th className="px-6 py-3">ค่าที่ตรวจได้</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'ต้นข้าว', detail: 'ตั้งแต่ 5.2 มม. ขึ้นไป', value: size?.resultall_G },
                    { name: 'ข้าวหักทั้งหมด', detail: 'น้อยกว่า 5.2 มม.', value: size?.resultall_B },
                    { name: 'ข้าวหักใหญ่', detail: 'ตั้งแต่ 3.25 และน้อยกว่า 5.2 มม.', value: size?.resultall_b1 },
                    { name: 'ข้าวหักเล็ก', detail: 'มากกว่า 1.75 และน้อยกว่า 3.25 มม.', value: size?.resultall_b2 },
                    { name: 'ปลายข้าวหักซีวัน', detail: 'ไม่เกิน 1.75 มม.', value: size?.resultall_b3 },
                  ].map(row => (
                    <tr key={row.name} className="bg-[#EFEFE0] border-b">
                      <td className="px-6 py-4">{row.name}</td>
                      <td className="px-6 py-4">{row.detail}</td>
                      <td className="px-6 py-4 text-black">{row.value} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contamination */}
            <div className="overflow-x-auto rounded-lg shadow-md">
              <h2 className="text-black py-2 text-lg px-2">ข้าวอื่นปลอมปน</h2>
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-sm text-gray-700 uppercase bg-[#CFCFCF]">
                  <tr>
                    <th className="px-6 py-3">ชื่อ</th>
                    <th className="px-6 py-3">ค่าที่ตรวจได้</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'เมล็ดเหลือง', value: type_data?.resultall_percent_Y },
                    { name: 'ข้าวท้องไข่', value: type_data?.resultall_percent_C },
                    { name: 'เมล็ดเสีย', value: type_data?.resultall_percent_D },
                    { name: 'ข้าวเหนียว', value: type_data?.resultall_percent_G },
                  ].map(row => (
                    <tr key={row.name} className="bg-[#EFEFE0] border-b">
                      <td className="px-6 py-4">{row.name}</td>
                      <td className="px-6 py-4 text-black">{row.value} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {modalOpen && currentImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pt-14"
          onClick={() => setModalOpen(false)}
        >
          <span className="absolute top-4 right-8 text-white text-5xl cursor-pointer leading-none">&times;</span>
          <img
            src={currentImg}
            alt="fullscreen"
            className="max-w-3xl w-full animate-[zoom_0.3s_ease]"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  )
}
