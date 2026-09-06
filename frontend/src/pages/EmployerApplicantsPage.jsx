import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];

const EmployerApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Selected application for modal preview
  const [modalApp, setModalApp] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [appsRes, jobsRes] = await Promise.allSettled([
        api.get('/applications/employer/all'),
        api.get('/jobs/employer/my-jobs'),
      ]);

      if (appsRes.status === 'fulfilled' && appsRes.value?.data?.success) {
        setApplications(appsRes.value.data.applications || []);
      } else {
        setErrorMsg('Failed to fetch applicants.');
      }

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.success) {
        setJobs(jobsRes.value.data.jobs || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error loading applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data?.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
        if (modalApp && modalApp._id === appId) {
          setModalApp((prev) => ({ ...prev, status: newStatus }));
        }
        setSuccessMsg(`Status updated to "${newStatus}"`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const jobMatch =
      selectedJob === 'All' ||
      (app.job && (app.job._id === selectedJob || app.job.title === selectedJob));

    const statusMatch =
      selectedStatus === 'All' ||
      (app.status && app.status.toLowerCase() === selectedStatus.toLowerCase());

    const candName = app.candidate?.name?.toLowerCase() || '';
    const candEmail = app.candidate?.email?.toLowerCase() || '';
    const jobTitle = app.job?.title?.toLowerCase() || '';
    const skills = (app.candidate?.skills || []).join(' ').toLowerCase();

    const searchMatch =
      !search ||
      candName.includes(search.toLowerCase()) ||
      candEmail.includes(search.toLowerCase()) ||
      jobTitle.includes(search.toLowerCase()) ||
      skills.includes(search.toLowerCase());

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
      role="employer"
      title="Applicants"
      subtitle="Review candidate applications, screen talent, and update hiring pipeline stages."
      actions={
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
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

        {/* Filters Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, skill, job..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              />
            </div>

            {/* Filter by Job */}
            <div>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-700"
              >
                <option value="All">All Jobs ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold text-slate-700"
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
              applicants
            </span>
            {(search || selectedJob !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedJob('All');
                  setSelectedStatus('All');
                }}
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Applicants Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading applicants data...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No applicants found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No candidate applications match the selected job or status filters at this time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-5">Candidate</th>
                    <th className="py-3.5 px-4">Job Title</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Resume / Skills</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Candidate info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {app.candidate?.name ? app.candidate.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {app.candidate?.name || 'Unnamed Candidate'}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {app.candidate?.email || 'N/A'}
                            </p>
                            {app.candidate?.phone && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                {app.candidate.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Job */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 leading-tight">
                          {app.job?.title || 'Unknown Job'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {app.job?.location || 'Remote'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Resume & Skills */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {app.candidate?.resumeUrl ? (
                            <a
                              href={app.candidate.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              View Resume
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No resume attached</span>
                          )}
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(app.candidate?.skills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={app.status || 'Applied'}
                          disabled={updatingId === app._id}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${getStatusBadge(
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

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setModalApp(app)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Application Preview Modal */}
      {modalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Applicant Profile & Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied for: <strong className="text-slate-800">{modalApp.job?.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setModalApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              {/* Candidate Bio */}
              <div className="flex items-start gap-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm">
                  {modalApp.candidate?.name ? modalApp.candidate.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {modalApp.candidate?.name || 'Unnamed Candidate'}
                  </h4>
                  <p className="text-slate-600 mt-0.5 font-medium">
                    {modalApp.candidate?.email} • {modalApp.candidate?.phone || 'No phone'}
                  </p>
                  <p className="text-slate-500 mt-1">
                    Location: {modalApp.candidate?.location || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                  Skills & Expertise
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {(modalApp.candidate?.skills || []).length > 0 ? (
                    modalApp.candidate.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold text-[11px]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Experience & Education */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Experience
                  </span>
                  <p className="font-semibold text-slate-800">
                    {modalApp.candidate?.experienceYears
                      ? `${modalApp.candidate.experienceYears} Years`
                      : modalApp.candidate?.experience || 'Not specified'}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Education
                  </span>
                  <p className="font-semibold text-slate-800">
                    {modalApp.candidate?.education || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Cover Letter / Notes */}
              {modalApp.coverLetter && (
                <div>
                  <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1.5">
                    Cover Letter / Notes
                  </h5>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {modalApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Update Status in Modal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-700">Update Hiring Stage:</span>
                <select
                  value={modalApp.status || 'Applied'}
                  onChange={(e) => handleStatusChange(modalApp._id, e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs ${getStatusBadge(
                    modalApp.status
                  )}`}
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {modalApp.candidate?.resumeUrl ? (
                <a
                  href={modalApp.candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Open Full Resume
                </a>
              ) : (
                <span className="text-slate-400 text-xs italic">Resume link not provided</span>
              )}
              <button
                onClick={() => setModalApp(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default EmployerApplicantsPage;
