import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { inspectionAPI } from '../services/api';
import Swal from 'sweetalert2';

function InspectionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await inspectionAPI.detail(id);
      setData(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // Convert Django path to URL
    const path = imagePath.replace('myapp/static/', '/static/');
    return `http://localhost:8000${path}`;
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  if (!data) {
    return <div className="text-center py-8">ไม่พบข้อมูล</div>;
  }

  const { person, data_type, data_size } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">รายละเอียดการตรวจสอบ</h1>
        <Link
          to="/inspections"
          className="text-blue-600 hover:text-blue-800"
        >
          ← กลับไปรายการ
        </Link>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลลูกค้า</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">ชื่อลูกค้า:</span>
            <span className="ml-2 font-semibold">{person.name}</span>
          </div>
          <div>
            <span className="text-gray-600">เลขทะเบียน:</span>
            <span className="ml-2 font-semibold">{person.register}</span>
          </div>
          <div>
            <span className="text-gray-600">สมาชิก:</span>
            <span className="ml-2 font-semibold">{person.member}</span>
          </div>
          <div>
            <span className="text-gray-600">ประเภทข้าว:</span>
            <span className="ml-2 font-semibold">{person.type_rice}</span>
          </div>
          <div>
            <span className="text-gray-600">วันที่:</span>
            <span className="ml-2 font-semibold">
              {new Date(person.date).toLocaleString('th-TH')}
            </span>
          </div>
        </div>
      </div>

      {/* Type Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ผลการวิเคราะห์ประเภทข้าว</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data_type.resultall_percent_G}%
            </div>
            <div className="text-sm text-gray-600">ข้าวหลวง (G)</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data_type.resultall_percent_C}%
            </div>
            <div className="text-sm text-gray-600">ข้าวเหนียว (C)</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {data_type.resultall_percent_B}%
            </div>
            <div className="text-sm text-gray-600">ข้าวหัก (B)</div>
          </div>
          <div className="text-center p-4 bg-yellow-100 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {data_type.resultall_percent_Y}%
            </div>
            <div className="text-sm text-gray-600">ข้าวเหลือง (Y)</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {data_type.resultall_percent_D}%
            </div>
            <div className="text-sm text-gray-600">ข้าวเสีย (D)</div>
          </div>
        </div>
      </div>

      {/* Size Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ผลการวิเคราะห์ขนาดข้าว</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ข้าวขนาดดี:</span>
              <span className="font-semibold">{data_size.resultall_G}%</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ต้นข้าว:</span>
              <span className="font-semibold">{data_size.resultall_B}%</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ข้าวหักใหญ่:</span>
              <span className="font-semibold">{data_size.resultall_b1}%</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ข้าวหักเล็ก:</span>
              <span className="font-semibold">{data_size.resultall_b2}%</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ข้าวซีวัน:</span>
              <span className="font-semibold">{data_size.resultall_b3}%</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">จำนวนเมล็ดทั้งหมด:</span>
              <span className="font-semibold">{data_size.totalall}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ความสูงเฉลี่ย:</span>
              <span className="font-semibold">{data_size.average_h} mm</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ความกว้างเฉลี่ย:</span>
              <span className="font-semibold">{data_size.average_w}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ภาพประกอบ</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {[data_type.image1, data_type.image2, data_type.image3, data_type.image4, data_type.image5].map((img, idx) => (
            img && (
              <div key={idx} className="relative">
                <img
                  src={getImageUrl(img)}
                  alt={`Detection ${idx + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow"
                  onLoad={() => setImageLoading(false)}
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {['Y (เหลือง)', 'B (หัก)', 'G (หลวง)', 'C (เหนียว)', 'D (เสีย)'][idx]}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export default InspectionDetail;
