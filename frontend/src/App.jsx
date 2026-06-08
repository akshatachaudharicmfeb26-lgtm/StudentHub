import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Common Pages
import Home from './pages/common/Home';
import About from './pages/common/About';
import Contact from './pages/common/Contact';
import Login from './pages/common/Login';
import Register from './pages/common/Register';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import SuperAdminProfile from './pages/admin/SuperAdminProfile';
import AdminProfile from './pages/admin/AdminProfile';

const ProfileWrapper = () => {
  const { isSuperAdmin, isStudent, isAdmin } = useAuth();
  if (isSuperAdmin && isSuperAdmin()) {
    return <SuperAdminProfile />;
  }
  if (isAdmin && isAdmin()) {
    return <AdminProfile />;
  }
  if (isStudent && isStudent()) {
    return <StudentDashboard />;
  }
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Super Admin Routes */}
              <Route 
                path="/super-admin" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Profile Shortcut */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN']}>
                    <ProfileWrapper />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

