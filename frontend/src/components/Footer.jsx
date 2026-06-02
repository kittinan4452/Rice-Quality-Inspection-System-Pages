import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full p-4 bg-primary border-t border-gray-200 md:flex md:items-center md:justify-between md:px-6 mt-auto">
      <span className="text-sm text-white">© 2024 RICE</span>
      <ul className="flex gap-6 mt-2 sm:mt-0">
        <li><Link to="/" className="text-white text-sm hover:underline">หน้าแรก</Link></li>
        <li><Link to="/inspections" className="text-white text-sm hover:underline">รายการที่ตรวจแล้ว</Link></li>
      </ul>
    </footer>
  )
}
