import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-green-200 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">🌾 RICE — ระบบตรวจสอบคุณภาพข้าว</span>
        <span className="text-xs text-green-400">© {new Date().getFullYear()} Rice Quality Inspection System</span>
        <div className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-white transition-colors">หน้าแรก</Link>
          <Link to="/inspections" className="hover:text-white transition-colors">รายการตรวจ</Link>
        </div>
      </div>
    </footer>
  )
}
