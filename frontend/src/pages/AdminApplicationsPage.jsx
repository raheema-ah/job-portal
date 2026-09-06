import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];

const AdminApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const filterJobId = searchParams.get('jobId') || 'All';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(filterJobId);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.allSettled([
        api.get('/jobs?limit=100'),
        api.get('/applications/admin/all'),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.success) {
        setJobs(jobsRes.value.data.jobs || []);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value?.data?.success) {
        setApplications(appsRes.value.data.applications || []);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data?.success) {
        setStatusMessage(`Candidate status updated to "${newStatus}"`);
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
        setTimeout(() => setStatusMessage(''), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const jobMatch =
      selectedJobId === 'All' ||
      (app.job && (app.job._id === selectedJobId || app.job === selectedJobId));

    const statusMatch =
      selectedStatus === 'All' ||
      (app.status && app.status.toLowerCase() === selectedStatus.toLowerCase());

    const candName = app.candidate?.name?.toLowerCase() || '';
    const candEmail = app.candidate?.email?.toLowerCase() || '';
    const jobTitle = app.job?.title?.toLowerCase() || '';

    const searchMatch =
      !search ||
      candName.includes(search.toLowerCase()) ||
      candEmail.includes(search.toLowerCase()) ||
      jobTitle.includes(search.toLowerCase());

    return jobMatch && statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shortlisted':
      case 'interview':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <RoleLayout
      role="admin"
      title="All Applications"
      subtitle="Comprehensive overview of candidate applications submitted across all platform jobs."
      actions={
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {statusMessage}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate or job..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            <div>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All Jobs ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.company || 'Job'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
            <span>
              Showing <strong className="text-slate-900">{filteredApplications.length}</strong>{' '}
              applications
            </span>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No applications found</h3>
              <p className="text-xs text-slate-500">
                No candidate submissions match your current filter settings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-6">Candidate</th>
                    <th className="py-3.5 px-4">Job Title & Company</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Resume</th>
                    <th className="py-3.5 px-4">Status Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{app.candidate?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-500">{app.candidate?.email || 'N/A'}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{app.job?.title || 'Job Deleted'}</p>
                        <p className="text-[11px] text-slate-500">
                          {app.job?.company || app.job?.companyName || 'Company'}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      <td className="py-4 px-4">
                        {app.candidate?.resumeUrl ? (
                          <a
                            href={app.candidate.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            View Resume
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No resume</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={app.status || 'Applied'}
                          disabled={updatingId === app._id}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminApplicationsPage;
