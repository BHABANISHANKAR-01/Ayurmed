
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrescriptionValidator from './pages/PrescriptionValidator';
import { UserRole } from './types';

const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading App...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect to their dashboard if unauthorized
  }

  return <>{children}</>;
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === UserRole.PATIENT) return <PatientDashboard />;
  if (user?.role === UserRole.DOCTOR) return <DoctorDashboard />;
  if (user?.role === UserRole.ADMIN) return <AdminDashboard />;
  return <div>Unknown Role</div>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <RoleBasedDashboard />
              </PrivateRoute>
            } />

            {/* Admin Routes */}
            {/* Admin functionality is contained in the dashboard for now */}

            {/* Doctor Routes */}
            <Route path="/validate/:id" element={
              <PrivateRoute allowedRoles={[UserRole.DOCTOR]}>
                <PrescriptionValidator />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
