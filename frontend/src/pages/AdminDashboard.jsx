import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const RICE_BAR_COLORS = ['bg-primary', 'bg-emerald-400', 'bg-yellow-400', 'bg-sky-400', 'bg-rose-400', 'bg-violet-400']

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, u] = await Promise.all([
        api.get('/api/admin/stats/'),
        api.get('/api/admin/users/'),
      ])
      setStats(s.data)
      setUsers(u.data)
    } catch {
      Swal.fire({ icon: 'error', title: 'โหลดข้อมูลแดชบอร์ดไม่สำเร็จ' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const toggleUser = async (u, field, label) => {
    const turningOn = !u[field]
    const confirm = await Swal.fire({
      title: `${turningOn ? 'เปิด' : 'ปิด'}${label} ของ ${u.username}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#15803d',
    })
    if (!confirm.isConfirmed) return
    try {
      await api.patch(`/api/admin/users/${u.id}/`, { [field]: turningOn })
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, [field]: turningOn } : x)))
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'แก้ไขไม่สำเร็จ', text: err.response?.data?.detail || '' })
    }
  }

  const maxCount = Math.max(1, ...(stats?.timeseries.map(d => d.count) || [1]))
  const totalRice = (stats?.rice_types || []).reduce((a, r) => a + r.count, 0) || 1

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 px-6 pt-24 pb-10 max-w-screen-xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-sm text-gray-500 mt-1">ภาพรวมการตรวจสอบและการจัดการผู้ใช้</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : (
          <>
            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <KpiCard label="การตรวจทั้งหมด" value={stats.totals.inspections} />
              <KpiCard label="ผู้ใช้ทั้งหมด" value={stats.totals.users} />
              <KpiCard label="วันนี้" value={stats.totals.today} />
              <KpiCard label="7 วันล่าสุด" value={stats.totals.week} />
              <KpiCard label="30 วันล่าสุด" value={stats.totals.month} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Timeseries 14 วัน */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">การตรวจย้อนหลัง 14 วัน</h2>
                <div className="flex items-end gap-1.5 h-40">
                  {stats.timeseries.map(d => (
                    <div key={d.date} className="flex-1 flex flex-col items-center justify-end group">
                      <span className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100">{d.count}</span>
                      <div
                        className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all"
                        style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? '4px' : '2px' }}
                      />
                      <span className="text-[9px] text-gray-400 mt-1">{d.date.slice(8, 10)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* สัดส่วนชนิดข้าว */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">สัดส่วนชนิดข้าว</h2>
                {stats.rice_types.length === 0 ? (
                  <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
                ) : (
                  <div className="space-y-3">
                    {stats.rice_types.map((r, i) => (
                      <div key={r.type_rice || i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">{r.type_rice || '—'}</span>
                          <span className="text-gray-400">{r.count} ({Math.round((r.count / totalRice) * 100)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${RICE_BAR_COLORS[i % RICE_BAR_COLORS.length]}`}
                            style={{ width: `${(r.count / totalRice) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* รายการตรวจล่าสุด */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">รายการตรวจล่าสุด</h2>
                <Link to="/inspections" className="text-xs text-primary hover:underline">ดูทั้งหมด →</Link>
              </div>
              {stats.recent.length === 0 ? (
                <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 text-left">
                        <th className="py-2 pr-4 font-medium">ID</th>
                        <th className="py-2 pr-4 font-medium">ผู้ขาย</th>
                        <th className="py-2 pr-4 font-medium">ชนิดข้าว</th>
                        <th className="py-2 pr-4 font-medium">เจ้าของ</th>
                        <th className="py-2 pr-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.recent.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs">#{r.id}</td>
                          <td className="py-2.5 pr-4 font-medium text-gray-900">{r.name}</td>
                          <td className="py-2.5 pr-4 text-gray-600">{r.type_rice}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{r.owner_name || r.owner_username || '—'}</td>
                          <td className="py-2.5 pr-4">
                            <Link to={`/inspections/${r.id}`} className="text-xs text-primary hover:underline">รายละเอียด</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* จัดการผู้ใช้ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">จัดการผู้ใช้ ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 text-left border-b border-gray-100">
                      <th className="py-2 pr-4 font-medium">ผู้ใช้</th>
                      <th className="py-2 pr-4 font-medium">อีเมล</th>
                      <th className="py-2 pr-4 font-medium text-center">ตรวจแล้ว</th>
                      <th className="py-2 pr-4 font-medium text-center">สถานะ</th>
                      <th className="py-2 pr-4 font-medium text-center">สิทธิ์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                          <div className="text-xs text-gray-400">@{u.username}</div>
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">{u.email || '—'}</td>
                        <td className="py-3 pr-4 text-center text-gray-700">{u.inspection_count}</td>
                        <td className="py-3 pr-4 text-center">
                          <button
                            onClick={() => toggleUser(u, 'is_active', 'การใช้งาน')}
                            className={`text-xs font-medium rounded-full px-3 py-1 transition-colors ${
                              u.is_active
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {u.is_active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <button
                            onClick={() => toggleUser(u, 'is_staff', 'สิทธิ์ผู้ดูแล')}
                            className={`text-xs font-medium rounded-full px-3 py-1 transition-colors ${
                              u.is_staff
                                ? 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {u.is_staff ? 'ผู้ดูแล' : 'ผู้ใช้ทั่วไป'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
