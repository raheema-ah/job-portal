import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });

      if (res.data?.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');

        // If backend returned token & user, log them in automatically
        if (res.data.token && res.data.user) {
          login(res.data.token, res.data.user);
          setTimeout(() => {
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'employer') navigate('/employer/dashboard');
            else if (role === 'employee') navigate('/employee/dashboard');
            else navigate('/candidate/dashboard');
          }, 1800);
        } else {
          setTimeout(() => {
            navigate('/job-seeker/login');
          }, 2000);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Password reset link is invalid or has expired. Please request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/10">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Set New Password</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Choose a strong, secure password for your Jobora account.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-emerald-900">Password Updated!</h3>
            <p className="text-xs text-emerald-700">
              Your password has been changed successfully. Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="new-password">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            to="/job-seeker/login"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
