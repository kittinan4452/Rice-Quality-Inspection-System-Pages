import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InspectionList from './pages/InspectionList';
import InspectionDetail from './pages/InspectionDetail';
import InspectionCreate from './pages/InspectionCreate';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

      <Route path="/" element={
        isAuthenticated ? (
          <Layout>
            <Dashboard />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />

      <Route path="/inspections" element={
        isAuthenticated ? (
          <Layout>
            <InspectionList />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />

      <Route path="/inspections/create" element={
        isAuthenticated ? (
          <Layout>
            <InspectionCreate />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />

      <Route path="/inspections/:id" element={
        isAuthenticated ? (
          <Layout>
            <InspectionDetail />
          </Layout>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  );
}

export default App;
