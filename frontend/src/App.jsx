import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, SuperAdminRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import UserMaintenance from './pages/UserMaintenance';
import SiteMaintenance from './pages/SiteMaintenance';
import EquipmentMaintenance from './pages/EquipmentMaintenance';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/sites" element={<ProtectedRoute><SiteMaintenance /></ProtectedRoute>} />
          <Route path="/admin/users" element={<SuperAdminRoute><UserMaintenance /></SuperAdminRoute>} />
          <Route path="/admin/equipment" element={<ProtectedRoute><EquipmentMaintenance /></ProtectedRoute>} /> 
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}