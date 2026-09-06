import React, { useState } from 'react';
import { Settings, Lock, Bell, CheckCircle2, ShieldCheck, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const CandidateSettingsPage = () => {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <RoleLayout
      role="candidate"
      title="Account Settings"
      subtitle="Manage your notifications and security preferences."
    >
      <div className="max-w-2xl space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Notification Preferences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Email & Notification Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Application Status Notifications</p>
                  <p className="text-slate-500 text-[11px]">Receive updates whenever an employer reviews or shortlists your application</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Weekly Job Recommendations</p>
                  <p className="text-slate-500 text-[11px]">Get notified when new jobs match your skills and location criteria</p>
                </div>
                <input
                  type="checkbox"
                  checked={jobRecommendations}
                  onChange={(e) => setJobRecommendations(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Account Credentials</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Registered Role</label>
                <input
                  type="text"
                  disabled
                  value="Candidate"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-500 cursor-not-allowed uppercase font-bold text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </RoleLayout>
  );
};

export default CandidateSettingsPage;
