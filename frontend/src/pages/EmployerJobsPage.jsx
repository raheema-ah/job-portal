import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const EmployerJobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/jobs/employer/my-jobs');
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load employer job postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
      const res = await api.put(`/jobs/${jobId}/status`, { status: nextStatus });
      if (res.data?.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus, isActive: nextStatus === 'active' } : j))
        );
        setSuccessMsg(`Job marked as ${nextStatus}`);
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      setErrorMsg('Could not update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting and its associated applications?')) {
      return;
    }

    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data?.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        setSuccessMsg('Job posting deleted successfully');
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      setErrorMsg('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.company || j.companyName || '').toLowerCase().includes(search.toLowerCase());

    const isJobActive = j.status === 'active' || j.isActive === true;
    if (statusFilter === 'active') return matchesSearch && isJobActive;
    if (statusFilter === 'closed') return matchesSearch && !isJobActive;
    return matchesSearch;
  });

  return (
    <RoleLayout
      role="employer"
      title="Manage My Jobs"
      subtitle={`Review, edit, open/close, or post new job vacancies.`}
      actions={
        <Link
          to="/employer/post-job"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      }
    >
      <div className="space-y-6">
        
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

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your jobs by title, location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'active' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Active ({jobs.filter((j) => j.status === 'active' || j.isActive === true).length})
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'closed' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Closed ({jobs.filter((j) => j.status === 'closed' || j.isActive === false).length})
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 h-24 animate-pulse" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No jobs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post your open vacancies to attract candidates and track applications.
            </p>
            <Link
              to="/employer/post-job"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Post a Job
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Job Position</th>
                    <th className="py-3.5 px-6">Location & Mode</th>
                    <th className="py-3.5 px-6">Applicants</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => {
                    const isJobActive = job.status === 'active' || job.isActive === true;

                    return (
                      <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {job.salary || 'Competitive'} • Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'recently'}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <p className="font-semibold text-slate-800">{job.location}</p>
                          <span className="text-[11px] text-blue-600 font-medium">
                            {job.workMode || job.workType || 'On-site'} • {job.jobType || job.employmentType || 'Full-time'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            to="/employer/applicants"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{job.applicantCount || 0} Candidates</span>
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              isJobActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isJobActive ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Active / Close */}
                            <button
                              onClick={() => handleToggleStatus(job._id, job.status || (job.isActive ? 'active' : 'closed'))}
                              title={isJobActive ? 'Close Job' : 'Reopen Job'}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                isJobActive
                                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {isJobActive ? 'Close' : 'Reopen'}
                            </button>

                            {/* Edit Job */}
                            <button
                              onClick={() => navigate(`/employer/post-job?edit=${job._id}`)}
                              title="Edit Job"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Job */}
                            <button
                              onClick={() => handleDeleteJob(job._id)}
                              title="Delete Job"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </RoleLayout>
  );
};

export default EmployerJobsPage;
