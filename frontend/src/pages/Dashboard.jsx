import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ยินดีต้อนรับ {user?.first_name || user?.username}
        </h1>
        <p className="text-gray-600">ระบบตรวจสอบคุณภาพข้าวด้วยเทคโนโลยี AI</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/inspections/create"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📤</div>
            <div>
              <h2 className="text-xl font-bold">สร้างรายการตรวจสอบใหม่</h2>
              <p className="text-green-100">อัพโหลดรูปภาพข้าวเพื่อตรวจสอบคุณภาพ</p>
            </div>
          </div>
        </Link>

        <Link
          to="/inspections"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📋</div>
            <div>
              <h2 className="text-xl font-bold">รายการตรวจสอบทั้งหมด</h2>
              <p className="text-blue-100">ดูประวัติการตรวจสอบทั้งหมดของคุณ</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลส่วนตัว</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">ชื่อ:</span>
            <span className="ml-2 font-semibold">{user?.first_name} {user?.last_name}</span>
          </div>
          <div>
            <span className="text-gray-600">ชื่อผู้ใช้:</span>
            <span className="ml-2 font-semibold">{user?.username}</span>
          </div>
          <div>
            <span className="text-gray-600">อีเมล:</span>
            <span className="ml-2 font-semibold">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">เกี่ยวกับระบบ</h2>
        <p className="text-gray-600 mb-2">
          ระบบตรวจสอบคุณภาพข้าวด้วย Machine Learning และ Image Processing
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>ตรวจจับประเภทข้าว (ข้าวหลวง, ข้าวเหนียว, ข้าวหัก, ข้าวเหลือง, ข้าวเสีย)</li>
          <li>วัดขนาดของเมล็ดข้าว</li>
          <li>คำนวณเปอร์เซ็นต์คุณภาพข้าว</li>
          <li>แยกประเภทข้าวหัก (ข้าวหักใหญ่, ข้าวหักเล็ก, ข้าวซีวัน)</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
