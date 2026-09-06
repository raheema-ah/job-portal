import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const EmployerSettingsPage = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    emailOnApplicant: true,
    emailOnStageChange: true,
    weeklyReport: false,
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    try {
      setSavingPassword(true);
      setErrorMsg('');
      setSuccessMsg('');

      // Update password via API
      const res = await api.put('/users/profile', {
        password: passwords.newPassword,
      });

      if (res.data?.success) {
        setSuccessMsg('Password updated successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <RoleLayout
      role="employer"
      title="Settings"
      subtitle="Manage your employer account security, communication preferences, and workspace configuration."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Change Password Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Security & Password</h3>
              <p className="text-xs text-slate-500">
                Ensure your hiring account is protected with a strong password.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-slate-900 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  placeholder="Confirm password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Email & Notification Preferences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Email Notifications</h3>
              <p className="text-xs text-slate-500">
                Choose what alerts and candidate updates are sent to your email.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs divide-y divide-slate-100">
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">New Applicant Alerts</p>
                <p className="text-[11px] text-slate-500">
                  Receive an instant email when a candidate submits an application.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailOnApplicant}
                onChange={(e) =>
                  setNotifPrefs((p) => ({ ...p, emailOnApplicant: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between pt-3 pb-2 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Status & Hiring Updates</p>
                <p className="text-[11px] text-slate-500">
                  Notify team members whenever candidate status is updated to shortlisted or hired.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailOnStageChange}
                onChange={(e) =>
                  setNotifPrefs((p) => ({ ...p, emailOnStageChange: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between pt-3 pb-2 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Weekly Recruitment Digest</p>
                <p className="text-[11px] text-slate-500">
                  A weekly summary of job views, new talent, and hiring progress.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.weeklyReport}
                onChange={(e) =>
                  setNotifPrefs((p) => ({ ...p, weeklyReport: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default EmployerSettingsPage;
