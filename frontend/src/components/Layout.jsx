import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">
                <Link to="/" className="hover:text-green-200">
                  ระบบตรวจสอบคุณภาพข้าว
                </Link>
              </h1>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="px-3 py-2 rounded hover:bg-green-700 transition"
                >
                  หน้าแรก
                </Link>
                <Link
                  to="/inspections"
                  className="px-3 py-2 rounded hover:bg-green-700 transition"
                >
                  รายการตรวจ
                </Link>
                <Link
                  to="/inspections/create"
                  className="px-3 py-2 rounded hover:bg-green-700 transition"
                >
                  สร้างรายการใหม่
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                สวัสดี, {user?.first_name || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Rice Quality Inspection System</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
