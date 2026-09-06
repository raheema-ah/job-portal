import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const AdminProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyLocation, setCompanyLocation] = useState(user?.companyLocation || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    try {
      setLoading(true);
      const res = await api.put('/users/profile', {
        name,
        companyName,
        companyLocation,
        phone,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setFeedback({
          type: 'success',
          text: 'Company profile updated successfully!',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update company profile',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Company & Recruiter Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization name, primary recruiter contact, and office location
        </p>
      </div>

      {/* Card */}
      <div className="clean-card p-6 sm:p-8 bg-white space-y-6 shadow-sm">
        
        {feedback.text && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Company Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Company Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Company Headquarters / Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Recruiter / Admin Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Recruiter / Admin Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Account Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="form-input pl-10 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Recruiter Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+1 555-0200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm px-6 py-2.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save Company Profile'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default AdminProfilePage;
