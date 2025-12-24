import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.me();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      setUser(response.data.user);
      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        text: response.data.message,
        timer: 2000,
        showConfirmButton: false,
      });
      return { success: true };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: error.response?.data?.error || 'เกิดข้อผิดพลาด',
      });
      return { success: false, error: error.response?.data };
    }
  };

  const register = async (firstname, lastname, username, password, email) => {
    try {
      const response = await authAPI.register(
        firstname,
        lastname,
        username,
        password,
        email
      );
      Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ',
        text: response.data.message,
        timer: 2000,
        showConfirmButton: false,
      });
      return { success: true };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'สมัครสมาชิกไม่สำเร็จ',
        text: error.response?.data?.error || 'เกิดข้อผิดพลาด',
      });
      return { success: false, error: error.response?.data };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบสำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
