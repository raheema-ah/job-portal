import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  PlusCircle,
  FileText,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const EmployerPostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const editJobId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: '',
    company: user?.companyName || user?.company?.name || '',
    companyWebsite: user?.company?.website || '',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-time',
    salary: '$120,000 - $160,000',
    experience: 'Mid Level',
    skills: 'React, Node.js, TypeScript',
    description: '',
    responsibilities: 'Lead architecture of frontend views\nCollaborate with cross-functional teams\nOptimize performance and user responsiveness',
    benefits: '100% Remote Flexibility\nComprehensive Health & Wellness Insurance\nAnnual Learning & Growth Stipend',
    deadline: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If edit mode, fetch job details
  useEffect(() => {
    if (editJobId) {
      const loadJobToEdit = async () => {
        try {
          setFetchingJob(true);
          const res = await api.get(`/jobs/${editJobId}`);
          if (res.data?.success && res.data.job) {
            const j = res.data.job;
            setFormData({
              title: j.title || '',
              company: j.company || j.companyName || '',
              companyWebsite: j.companyWebsite || '',
              location: j.location || '',
              workMode: j.workMode || j.workType || 'Remote',
              employmentType: j.employmentType || j.jobType || 'Full-time',
              salary: j.salary || '',
              experience: j.experience || 'Mid Level',
              skills: Array.isArray(j.skills) ? j.skills.join(', ') : j.skills || '',
              description: j.description || '',
              responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join('\n') : j.responsibilities || '',
              benefits: Array.isArray(j.benefits) ? j.benefits.join('\n') : j.benefits || '',
              deadline: j.deadline ? j.deadline.split('T')[0] : '',
            });
          }
        } catch (err) {
          setErrorMsg('Failed to load job for editing');
        } finally {
          setFetchingJob(false);
        }
      };
      loadJobToEdit();
    }
  }, [editJobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setErrorMsg('Please provide Title, Location, and Description.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        requirements: formData.responsibilities ? formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      };

      let res;
      if (editJobId) {
        res = await api.put(`/jobs/${editJobId}`, payload);
      } else {
        res = await api.post('/jobs', payload);
      }

      if (res.data?.success) {
        setSuccessMsg(editJobId ? 'Job updated successfully!' : 'Job vacancy posted successfully!');
        setTimeout(() => {
          navigate('/employer/jobs');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout
      role="employer"
      title={editJobId ? 'Edit Job Posting' : 'Post a New Vacancy'}
      subtitle={editJobId ? 'Update position details and requirements.' : 'Publish a high-visibility job opening to attract top candidates.'}
      actions={
        <button
          onClick={() => navigate('/employer/jobs')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>
      }
    >
      <div className="max-w-4xl space-y-6">
        
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {fetchingJob ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading job details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* 1. Basic Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Job Role & Company</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Full Stack React & Node Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. TechCorp Global"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">
                    Company Website / Careers Link
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="e.g. https://techcorp.com or https://techcorp.com/careers"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. Employment Specs & Compensation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Job Attributes & Compensation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Work Mode</label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Manager">Lead / Manager</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Salary Range / Compensation</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $130,000 - $170,000 / year"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. Detailed Descriptions & Responsibilities */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Job Description & Scope</span>
              </h3>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Required Skills (comma separated) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, TypeScript, MongoDB, Docker"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide an overview of the role, team, and day-to-day impact..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Key Responsibilities (one per line)</label>
                  <textarea
                    rows={4}
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="Enter responsibilities line by line..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Benefits & Perks (one per line)</label>
                  <textarea
                    rows={4}
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder="Enter company benefits line by line..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/employer/jobs')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editJobId ? 'Save Changes' : 'Publish Job Post'}</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </RoleLayout>
  );
};

export default EmployerPostJobPage;
