import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  LayoutDashboard,
  Building2,
  FileText,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  Gift,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isCandidate, isEmployee } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isEmployee) return '/employee/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-sm transition-all backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-0.5">
                Job<span className="text-blue-600">ora</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-semibold uppercase tracking-wider">
                Career Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Removed to keep clean top bar and use dedicated sidebar */}
          <div className="hidden md:flex items-center"></div>

          {/* User Auth Badges & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'employee'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button (only when authenticated) */}
          {isAuthenticated && user && (
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown (authenticated only) */}
      {mobileOpen && isAuthenticated && user && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">{user?.name}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                {user?.role} Account
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {user?.role}
            </span>
          </div>

              {isCandidate && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Candidate Dashboard
                  </Link>
                  <Link
                    to="/candidate/jobs"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Find Jobs
                  </Link>
                  <Link
                    to="/candidate/applications"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                </>
              )}

              {isEmployee && (
                <>
                  <Link
                    to="/employee/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Employee Workspace
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/jobs"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Jobs
                  </Link>
                  <Link
                    to="/admin/jobs/create"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Create Job
                  </Link>
                  <Link
                    to="/admin/applications"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Applications
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-xs"
              >
                Sign Out
              </button>
            </div>
          )}
        </header>
  );
};

export default Navbar;

