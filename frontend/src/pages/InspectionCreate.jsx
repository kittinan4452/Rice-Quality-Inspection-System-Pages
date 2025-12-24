import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inspectionAPI } from '../services/api';
import Swal from 'sweetalert2';

function InspectionCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    register: '',
    member: '',
    type_rice: '',
    user_name: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาอัพโหลดรูปภาพ',
        text: 'กรุณาเลือกรูปภาพข้าวที่ต้องการตรวจสอบ',
      });
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('register', formData.register);
    formDataToSend.append('member', formData.member);
    formDataToSend.append('type_rice', formData.type_rice);
    formDataToSend.append('user_name', formData.user_name);
    formDataToSend.append('image', image);

    try {
      const response = await inspectionAPI.create(formDataToSend);

      Swal.fire({
        icon: 'success',
        title: 'ตรวจสอบสำเร็จ!',
        text: response.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(`/inspections/${response.data.id}`);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.error || 'ไม่สามารถตรวจสอบได้',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate('/inspections')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← กลับไปรายการ
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          สร้างรายการตรวจสอบใหม่
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">ชื่อลูกค้า *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">เลขทะเบียน *</label>
              <input
                type="text"
                name="register"
                value={formData.register}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">สมาชิก *</label>
              <input
                type="text"
                name="member"
                value={formData.member}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">ประเภทข้าว *</label>
              <select
                name="type_rice"
                value={formData.type_rice}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">เลือกประเภทข้าว</option>
                <option value="ข้าวหลวง">ข้าวหลวง</option>
                <option value="ข้าวเหนียว">ข้าวเหนียว</option>
                <option value="ข้าวหอมมะลิ">ข้าวหอมมะลิ</option>
                <option value="ข้าวแดง">ข้าวแดง</option>
                <option value="ข้าวกล้อง">ข้าวกล้อง</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">ชื่อผู้ตรวจ *</label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">รูปภาพข้าว *</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition">
              <div className="space-y-2 text-center">
                {preview ? (
                  <div>
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setPreview(null);
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      ลบรูปภาพ
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                      >
                        <span>อัพโหลดไฟล์</span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">หรือลากไฟล์มาวางที่นี่</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF สูงสุด 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/inspections')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InspectionCreate;
