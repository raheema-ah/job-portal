import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ShieldCheck,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import RoleSelector from '../components/RoleSelector';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

const AuthPage = ({ initialMode = 'login' }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState(() => {
    if (location.pathname.includes('/register')) return 'register';
    return initialMode || 'login';
  });

  // Selected Role: 'candidate' | 'employee' | 'admin'
  const [selectedRole, setSelectedRole] = useState('candidate');

  // If already authenticated, redirect to appropriate role dashboard
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
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 relative overflow-hidden">
      {/* Background Decorative Rings & Blobs */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-indigo-100 rounded-full filter blur-3xl opacity-40 pointer-events-none" />

      {/* ================= CENTERED AUTHENTICATION CARD ================= */}
      <div className="w-full max-w-lg relative z-10 space-y-3">
        
        {/* Centered Brand Header */}
        <div className="text-center space-y-1 mb-1">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Job<span className="text-blue-600">Portal</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Unified Career & Hiring Authentication Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-blue-500/5 p-5 sm:p-6 space-y-3.5 backdrop-blur-md">
          
          {/* Header: Mode Switcher (Login / Register Tabs) */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'Sign In to Your Account' : 'Create a New Account'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'login'
                  ? 'Enter your credentials to continue'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {/* Login / Register Segmented Control */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                id="tab-login-btn"
                onClick={() => setMode('login')}
                className={`px-3 py-1 rounded-md transition-all text-xs ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                id="tab-register-btn"
                onClick={() => setMode('register')}
                className={`px-3 py-1 rounded-md transition-all text-xs ${
                  mode === 'register'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Role Selection Component (Candidate & Employee) */}
          <RoleSelector
            selectedRole={selectedRole}
            onSelectRole={(role) => setSelectedRole(role)}
            roles={['candidate', 'employee']}
          />

          {/* Form Component (Login or Register) */}
          <div className="pt-0.5">
            {mode === 'login' ? (
              <LoginForm
                role={selectedRole}
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <RegisterForm
                role={selectedRole}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>

        </div>

        {/* Dedicated Admin Portal Direct Gateway Link */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/70 border border-slate-200/80 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Are you a Recruiter or System Admin?</span>
          </div>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
          >
            <span>Admin Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] pt-0.5">
          <Lock className="w-3 h-3 text-blue-600" />
          <span>256-Bit Encrypted JWT Authentication</span>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
