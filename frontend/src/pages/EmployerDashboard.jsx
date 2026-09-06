import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  Building2,
  TrendingUp,
  ArrowRight,
  UserCheck,
  UserX,
  AlertCircle,
  Eye,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobsPosted: 0,
    activeJobs: 0,
    closedJobs: 0,
    totalApplicants: 0,
    newApplicants: 0,
    shortlistedCandidates: 0,
    recentApplications: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/employer/dashboard');
      if (res.data?.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setErrorMsg('Failed to load employer dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'interview':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'shortlisted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reviewing':
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
      title={`Employer Dashboard`}
      subtitle={`Organization: ${user?.companyName || user?.company?.name || 'Your Company'} • Manage postings & hiring pipeline.`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/employer/post-job"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Core Employer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.totalJobsPosted}</div>
              <div className="text-xs text-slate-500 font-semibold">Total Posted</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.activeJobs}</div>
              <div className="text-xs text-slate-500 font-semibold">Active Jobs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.closedJobs}</div>
              <div className="text-xs text-slate-500 font-semibold">Closed Jobs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.totalApplicants}</div>
              <div className="text-xs text-slate-500 font-semibold">Applicants</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.newApplicants}</div>
              <div className="text-xs text-slate-500 font-semibold">New Applied</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.shortlistedCandidates}</div>
              <div className="text-xs text-slate-500 font-semibold">Shortlisted</div>
            </div>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Candidate Applications</h2>
              <p className="text-xs text-slate-500">Candidates who applied for your posted positions</p>
            </div>
            <Link
              to="/employer/applicants"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Applicants <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !stats.recentApplications || stats.recentApplications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No applicants yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Post new job roles or review your active job postings to attract talent.
                </p>
                <Link
                  to="/employer/post-job"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" /> Post a Job
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-6">Candidate</th>
                      <th className="py-3.5 px-6">Applied Role</th>
                      <th className="py-3.5 px-6">Skills / Location</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 text-sm">{app.candidate?.name || 'Applicant'}</p>
                          <p className="text-xs text-slate-500">{app.candidate?.email} • {app.candidate?.phone || 'No phone'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800">{app.job?.title || 'Job'}</p>
                          <span className="text-[11px] text-slate-500">{app.job?.location}</span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-slate-600">{app.candidate?.location || 'Remote'}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {app.candidate?.skills?.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status || 'Applied'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to="/employer/applicants"
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </RoleLayout>
  );
};

export default EmployerDashboard;
