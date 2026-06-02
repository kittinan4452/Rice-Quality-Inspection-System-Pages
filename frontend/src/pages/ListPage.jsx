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
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
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
      <main className="flex-1 px-6 pt-28 pb-10">
        <nav className="mb-6">
          <ol className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">หน้าแรก</Link>
            <span>/</span>
            <li className="font-medium text-gray-800">รายการที่ตรวจแล้ว</li>
          </ol>
        </nav>

        <div className="bg-white shadow-2xl rounded-lg p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-10">กำลังโหลด...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-white uppercase bg-primary">
                    <tr>
                      {['ID', 'ชื่อผู้ขาย', 'ทะเบียนรถ', 'เบอร์โทรศัพท์', 'ชนิดข้าว', 'รายละเอียด', 'ลบ'].map(h => (
                        <th key={h} className="px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">ยังไม่มีข้อมูล</td>
                      </tr>
                    ) : data.results.map(row => (
                      <tr key={row.id} className="bg-white border border-primary">
                        <td className="px-6 py-3">{row.id}</td>
                        <td className="px-6 py-4 font-medium">{row.name}</td>
                        <td className="px-6 py-4">{row.register}</td>
                        <td className="px-6 py-4">{row.member}</td>
                        <td className="px-6 py-4">{row.type_rice}</td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/inspections/${row.id}`}
                            className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-4 py-2"
                          >
                            รายละเอียด
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-4 py-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex gap-1 mt-4">
                  <button
                    disabled={!data.previous}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 h-10 text-white bg-primary rounded-s-lg disabled:opacity-50 hover:bg-primary-light"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 h-10 text-white border border-gray-300 ${page === p ? 'bg-primary-light' : 'bg-primary hover:bg-primary-light'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={!data.next}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 h-10 text-white bg-primary rounded-e-lg disabled:opacity-50 hover:bg-primary-light"
                  >
                    Next
                  </button>
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
