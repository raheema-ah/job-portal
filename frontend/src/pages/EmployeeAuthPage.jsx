import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowLeft } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const EmployeeAuthPage = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50 relative overflow-hidden">
      {/* Background Glowing Rings */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-emerald-100 rounded-full filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-teal-100 rounded-full filter blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-4 animate-fadeIn">

        {/* Back navigation */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Welcome</span>
          </Link>
        </div>

        {/* Header Badge */}
        <div className="text-center space-y-1 pb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
            <BadgeCheck className="w-3.5 h-3.5" />
            Employee Portal
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-emerald-500/5 p-5 sm:p-6 space-y-4 backdrop-blur-md">

          {/* Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              id="employee-tab-login"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-xs font-bold ${
                mode === 'login'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              id="employee-tab-register"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-xs font-bold ${
                mode === 'register'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          <div className="pt-1">
            {mode === 'login' ? (
              <LoginForm
                role="employee"
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <RegisterForm
                role="employee"
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default EmployeeAuthPage;
