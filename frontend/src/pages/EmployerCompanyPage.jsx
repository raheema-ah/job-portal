import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  Building,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const industryOptions = [
  'Software & IT',
  'Healthcare & Life Sciences',
  'Finance & FinTech',
  'E-Commerce & Retail',
  'Education & EdTech',
  'Manufacturing & Logistics',
  'Marketing & Advertising',
  'Telecommunications',
  'Other',
];

const companySizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1,000 employees',
  '1,000+ employees',
];

const EmployerCompanyPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [companyId, setCompanyId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    location: '',
    industry: 'Software & IT',
    size: '11-50 employees',
    description: '',
  });

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.get('/companies/my/profile');
      if (res.data?.success && res.data.company) {
        const c = res.data.company;
        setCompanyId(c._id);
        setFormData({
          name: c.name || '',
          logo: c.logo || '',
          website: c.website || '',
          location: c.location || '',
          industry: c.industry || 'Software & IT',
          size: c.size || '11-50 employees',
          description: c.description || '',
        });
      }
    } catch (err) {
      // If 404, employer has not created company profile yet - totally fine
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      let res;
      if (companyId) {
        res = await api.put(`/companies/${companyId}`, formData);
      } else {
        res = await api.post('/companies', formData);
      }

      if (res.data?.success) {
        setSuccessMsg('Company profile saved successfully!');
        if (res.data.company?._id) {
          setCompanyId(res.data.company._id);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout
      role="employer"
      title="Company Profile"
      subtitle="Showcase your brand, mission, and work culture to attract top talent."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Messages */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 font-medium">Loading company details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Acme Technologies Inc."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      Logo Image URL
                    </label>
                    <input
                      type="url"
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://acme.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      Headquarters Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">Industry</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                    >
                      {industryOptions.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">Company Size</label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                    >
                      {companySizeOptions.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1.5">
                    About the Company / Culture
                  </label>
                  <textarea
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell candidates about your company mission, team culture, values, and why they should join..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed font-normal"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Company Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Live Preview Card */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Candidate View Preview
            </h4>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3.5">
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-xs border border-blue-100">
                    <Building2 className="w-7 h-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-base text-slate-900 truncate">
                    {formData.name || 'Your Company Name'}
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold">{formData.industry}</p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{formData.location || 'Location Not Specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{formData.size || 'Size Not Specified'}</span>
                </div>
                {formData.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline truncate inline-flex items-center gap-1"
                    >
                      {formData.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h5 className="font-bold text-[11px] text-slate-900 mb-1">About Company</h5>
                <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed">
                  {formData.description ||
                    'Detailed company description and mission statement will appear here for applicants to review.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default EmployerCompanyPage;
