import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ListPage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchList = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/api/inspections/?page=${p}`)
      setData(res)
    } catch {
      Swal.fire({ icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList(page) }, [page])

  const handleDelete = async id => {
    const confirm = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    })
    if (!confirm.isConfirmed) return
    try {
      await api.delete(`/api/inspections/${id}/`)
      Swal.fire({ icon: 'success', title: 'ลบข้อมูลสำเร็จ', timer: 1200, showConfirmButton: false })
      fetchList(page)
    } catch {
      Swal.fire({ icon: 'error', title: 'ลบข้อมูลไม่สำเร็จ' })
    }
  }

  const totalPages = Math.ceil(data.count / 5)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 pt-24 pb-10 max-w-screen-xl mx-auto w-full">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายการตรวจสอบ</h1>
            <p className="text-sm text-gray-500 mt-1">ทั้งหมด {data.count} รายการ</p>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl px-4 py-2 transition-colors"
          >
            + ตรวจสอบใหม่
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : data.results.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500 font-medium">ยังไม่มีข้อมูลการตรวจสอบ</p>
              <Link to="/" className="inline-block mt-4 text-sm text-primary hover:underline">เริ่มตรวจสอบครั้งแรก →</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary-dark text-white text-xs uppercase">
                      {['ID', 'ชื่อผู้ขาย', 'ทะเบียนรถ', 'เบอร์โทร', 'ชนิดข้าว', '', ''].map((h, i) => (
                        <th key={i} className="px-5 py-3.5 text-left font-semibold tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.results.map((row, idx) => (
                      <tr key={row.id} className={`transition-colors hover:bg-green-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{row.id}</td>
                        <td className="px-5 py-4 font-medium text-gray-900">{row.name}</td>
                        <td className="px-5 py-4 text-gray-600">{row.register}</td>
                        <td className="px-5 py-4 text-gray-600">{row.member}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-yellow-800">
                            {row.type_rice}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/inspections/${row.id}`}
                            className="text-xs font-medium text-primary hover:text-primary-dark border border-primary hover:border-primary-dark rounded-lg px-3 py-1.5 transition-colors"
                          >
                            ดูรายละเอียด
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">หน้า {page} จาก {totalPages}</span>
                  <div className="flex gap-1">
                    <button
                      disabled={!data.previous}
                      onClick={() => setPage(p => p - 1)}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      ← ก่อนหน้า
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                          page === p
                            ? 'bg-primary text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={!data.next}
                      onClick={() => setPage(p => p + 1)}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      ถัดไป →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
