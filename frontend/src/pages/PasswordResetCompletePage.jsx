import { Link } from 'react-router-dom'

export default function PasswordResetCompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">รีเซ็ตรหัสผ่านสำเร็จ</h2>
          <p className="text-sm text-gray-500 mb-6">
            รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว<br/>กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}
