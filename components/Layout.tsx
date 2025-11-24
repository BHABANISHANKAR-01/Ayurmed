
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  User, 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Stethoscope,
  Users
} from 'lucide-react';
import { UserRole } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col fixed h-full z-10 transition-all duration-300">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-400 h-8 w-8 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">AyurMed India</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Hospital Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {user.role === UserRole.PATIENT && (
            <>
              <NavItem to="/" icon={<LayoutDashboard />} label="My Overview" active={isActive('/')} />
              <NavItem to="/history" icon={<FileText />} label="Medical History" active={isActive('/history')} />
            </>
          )}

          {user.role === UserRole.DOCTOR && (
            <>
              <NavItem to="/" icon={<LayoutDashboard />} label="Doctor Workspace" active={isActive('/')} />
              <NavItem to="/validate" icon={<FileText />} label="OCR Validations" active={isActive('/validate')} />
            </>
          )}

          {user.role === UserRole.ADMIN && (
             <NavItem to="/" icon={<LayoutDashboard />} label="Admin Dashboard" active={isActive('/')} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                {user.role.toLowerCase()}
                {user.healthId && <span className="bg-emerald-900 px-1 rounded text-[10px]">{user.healthId}</span>}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-900/20 rounded-md transition-colors duration-200"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col transition-all duration-300">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
           <div className="flex items-center gap-2">
            <Activity className="text-emerald-400 h-6 w-6" />
            <h1 className="font-bold">AyurMed</h1>
          </div>
          <button onClick={logout} className="text-slate-300">
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Layout;
