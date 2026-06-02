import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-primary fixed w-full z-20 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="text-5xl font-semibold text-white">RICE</Link>

        <div className="flex items-center gap-2 md:order-2">
          {user ? (
            <>
              <span className="text-gray-900 bg-white border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5">
                ยินดีต้อนรับ, {user.first_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="text-gray-900 bg-white border border-gray-300 hover:bg-yellow-500 hover:text-white font-medium rounded-lg text-sm px-5 py-2.5">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="text-gray-900 bg-white hover:bg-yellow-500 hover:text-white font-medium rounded-lg text-sm px-5 py-2.5">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="hidden md:flex md:w-auto md:order-1">
          <ul className="flex flex-row gap-8">
            <li>
              <Link to="/" className="text-white hover:text-yellow-200 font-medium">
                หน้าแรก
              </Link>
            </li>
            <li>
              <Link to="/inspections" className="text-white hover:text-yellow-200 font-medium">
                รายการที่ตรวจแล้ว
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
