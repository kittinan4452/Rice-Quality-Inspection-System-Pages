import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors pb-1 ${
        pathname === to
          ? 'text-primary border-b-2 border-primary'
          : 'text-gray-600 hover:text-primary'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm fixed w-full z-20 top-0">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-6 h-16">

        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary tracking-tight">🌾 RICE</span>
          <span className="hidden sm:block text-xs text-gray-400 font-normal mt-1">ระบบตรวจสอบข้าว</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-8">
            {navLink('/', 'หน้าแรก')}
            {navLink('/inspections', 'รายการที่ตรวจแล้ว')}
            {user.is_staff && navLink('/admin', 'แดชบอร์ด')}
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                  {user.first_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm text-gray-700 font-medium">{user.first_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-4 py-1.5 transition-colors"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
