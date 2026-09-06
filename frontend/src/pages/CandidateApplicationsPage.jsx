import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const CandidateApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/applications');
      if (res.data?.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load applications list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
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

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'All') return true;
    return (app.status || '').toLowerCase() === filterStatus.toLowerCase();
  });

  const statuses = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

  return (
    <RoleLayout
      role="candidate"
      title="My Applications"
      subtitle={`Track the live progress of all ${applications.length} submitted job applications.`}
      actions={
        <Link
          to="/candidate/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Find More Jobs</span>
        </Link>
      }
    >
      <div className="space-y-6">
        
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          {statuses.map((s) => {
            const count =
              s === 'All'
                ? applications.length
                : applications.filter((a) => (a.status || '').toLowerCase() === s.toLowerCase()).length;

            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{s}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    filterStatus === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications List / Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 h-20 animate-pulse" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              No applications found for status "{filterStatus}"
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Submit new applications or switch to another filter category above.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Job Position & Company</th>
                    <th className="py-3.5 px-6">Location & Work Mode</th>
                    <th className="py-3.5 px-6">Applied Date</th>
                    <th className="py-3.5 px-6">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 text-sm">{app.job?.title || 'Job Position'}</p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.job?.company || app.job?.companyName || 'Corporate Employer'}</span>
                        </p>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">{app.job?.location || 'Remote'}</p>
                          <span className="text-[11px] text-blue-600 font-medium">
                            {app.job?.workMode || app.job?.workType || 'Flexible'} • {app.job?.jobType || 'Full-time'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status || 'Applied'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </RoleLayout>
  );
};

export default CandidateApplicationsPage;
