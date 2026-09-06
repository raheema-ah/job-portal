import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginForm = ({ role = 'candidate', onSwitchToRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = await login(formData.email, formData.password, role);

      // Redirect based on role
      const destination =
        location.state?.from?.pathname ||
        (user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'employee'
          ? '/employee/dashboard'
          : '/candidate/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please check your credentials.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);

    if (!forgotEmail.trim() || !/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address');
      return;
    }

    try {
      setForgotLoading(true);
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Quick Demo Auto-fill Helper
  const fillDemoCredentials = (demoRole) => {
    setApiError('');
    setErrors({});
    if (demoRole === 'admin') {
      setFormData({
        email: 'admin@jobportal.com',
        password: 'adminpassword123',
      });
    } else if (demoRole === 'employee') {
      setFormData({
        email: 'employee@jobportal.com',
        password: 'employeepassword123',
      });
    } else {
      setFormData({
        email: 'candidate@gmail.com',
        password: 'candidatepassword123',
      });
    }
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'admin':
        return 'Admin';
      case 'employee':
        return 'Employee';
      default:
        return 'Candidate';
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Error Alert Banner */}
        {apiError && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="login-email">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.email ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
          </div>
          {errors.email && <p className="text-[10px] text-rose-500 font-medium">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-slate-700" htmlFor="login-password">
              Password <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(formData.email);
                setForgotSuccess(false);
                setForgotError('');
                setShowForgotModal(true);
              }}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-9 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.password ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] text-rose-500 font-medium">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="login-submit-btn"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all text-xs inline-flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to {getRoleDisplayName(role)} Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>


        {/* Switch to Register footer */}
        {onSwitchToRegister && (
          <div className="text-center pt-1">
            <p className="text-[11px] text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline ml-0.5"
              >
                Register here
              </button>
            </p>
          </div>
        )}
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5 relative">
            {/* Close button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                <p className="text-[11px] text-slate-500">Enter your email to receive a reset link</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Reset link sent!</p>
                    <p className="text-emerald-700 mt-1">
                      If an account with that email exists, we've sent a password reset link. Check your inbox and spam folder.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700" htmlFor="forgot-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      disabled={forgotLoading}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm inline-flex items-center justify-center gap-1.5 transition-all"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;

