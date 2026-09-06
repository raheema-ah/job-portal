import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminCreateJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.companyName || '');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [workType, setWorkType] = useState('On-site');
  const [experience, setExperience] = useState('Mid Level');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Title, Location, and Description are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/jobs', {
        title: title.trim(),
        company: company.trim() || 'Company',
        companyWebsite: companyWebsite.trim(),
        location: location.trim(),
        salary: salary.trim() || 'Negotiable',
        jobType,
        workType,
        workMode: workType,
        experience,
        skills,
        description,
        responsibilities,
        requirements,
      });

      if (res.data.success) {
        navigate('/admin/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout
      role="admin"
      title="Create Job Posting"
      subtitle="Publish a new job position to attract qualified candidates from our global talent pool."
      actions={
        <Link
          to="/admin/jobs"
          className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google LLC"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-900 mb-1.5">
                  Company Website / Careers Link
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://google.com/about or https://careers.google.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="City, Country or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Work Mode</label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Employment Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. $120,000 - $140,000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead / Principal">Lead / Principal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, TypeScript"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                Job Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder="Comprehensive overview of the role, team, and objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Responsibilities (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Key responsibilities and daily tasks..."
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  Requirements (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Qualifications, degrees, or certifications required..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/admin/jobs"
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminCreateJobPage;
