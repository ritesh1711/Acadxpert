import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RefreshHandler from './RefreshHandler';
import StudentProfile from './pages/StudentProfile';
import AdmissionForm from './pages/AdmissionForm';
import DocumentUpload from './pages/DocumentUpload';
import Confirmation from './pages/Confirmation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const AdminRoute = ({ element }) => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const token = localStorage.getItem("token");
    return token && isAdmin ? element : <Navigate to="/admin/login" />;
  };

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route path="/admission" element={<AdmissionForm />} />
        <Route path="/document-upload" element={<DocumentUpload />} />
        <Route path="/confirmation" element={<Confirmation />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/settings" element={<AdminRoute element={<AdminSettings />} />} />
      </Routes>
    </div>
  );
}

export default App;
