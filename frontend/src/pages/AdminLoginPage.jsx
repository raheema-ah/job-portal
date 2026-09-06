import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
  Mail,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AdminLoginPage = ({ initialMode = 'login' }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState(() => {
    if (location.pathname.includes('/register')) return 'register';
    return initialMode || 'login';
  });

  // If user is already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden text-slate-100">
      {/* Background Decorative Rings & Blobs */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-purple-600/15 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-blue-600/15 rounded-full filter blur-3xl pointer-events-none" />

      {/* ================= CENTERED ADMIN AUTHENTICATION CARD ================= */}
      <div className="w-full max-w-md relative z-10 space-y-3">
        
        {/* Back Link to User Portal */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Candidate & Employee Portal</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
            Admin Area
          </span>
        </div>

        {/* Centered Brand Header */}
        <div className="text-center space-y-1 mb-1">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Admin<span className="text-purple-400">Portal</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Recruiter & System Administration Gateway
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-3.5 text-slate-800 backdrop-blur-md">
          
          {/* Header: Mode Switcher (Login / Register Tabs) */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Admin Sign In' : 'Admin Registration'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'login'
                  ? 'Enter administrator credentials to proceed'
                  : 'Register a hiring manager / admin account'}
              </p>
            </div>

            {/* Login / Register Segmented Control */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                id="admin-tab-login-btn"
                onClick={() => setMode('login')}
                className={`px-3 py-1 rounded-md transition-all text-xs ${
                  mode === 'login'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                id="admin-tab-register-btn"
                onClick={() => setMode('register')}
                className={`px-3 py-1 rounded-md transition-all text-xs ${
                  mode === 'register'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form Component fixed for Admin */}
          <div className="pt-0.5">
            {mode === 'login' ? (
              <LoginForm
                role="admin"
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <RegisterForm
                role="admin"
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>

        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] pt-1">
          <Lock className="w-3 h-3 text-purple-400" />
          <span>Restricted Admin Area • 256-Bit SSL Encrypted</span>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;
