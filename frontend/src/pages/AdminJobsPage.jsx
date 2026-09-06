import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Power,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs?limit=100');
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await api.put(`/jobs/${jobId}`, {
        status: newStatus,
        isActive: newStatus === 'active',
      });
      if (res.data?.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
        setActionMessage(`Job marked as ${newStatus}.`);
        setTimeout(() => setActionMessage(''), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this job posting? Associated applications will also be removed.'
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data?.success) {
        setActionMessage('Job deleted successfully');
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        setTimeout(() => setActionMessage(''), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const statusMatch =
      statusFilter === 'All' || (j.status || 'active').toLowerCase() === statusFilter.toLowerCase();
    const titleMatch = (j.title || '').toLowerCase().includes(search.toLowerCase());
    const compMatch = (j.company || '').toLowerCase().includes(search.toLowerCase());
    return statusMatch && (titleMatch || compMatch);
  });

  return (
    <RoleLayout
      role="admin"
      title="Manage All Jobs"
      subtitle="View, edit, close, or remove any job posting listed across the platform."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/jobs/create"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Create Job
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {actionMessage}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="closed">Closed Only</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading platform jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No jobs match criteria</h3>
              <p className="text-xs text-slate-500">
                Try searching for another term or create a new job posting.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-6">Job Title</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Work Mode</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Posted Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((j) => {
                    const isActive = (j.status || 'active').toLowerCase() === 'active';

                    return (
                      <tr key={j._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 leading-tight">{j.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{j.location || 'Remote'}</p>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-800">{j.company}</td>

                        <td className="py-4 px-4 text-slate-600">
                          {j.workMode || j.workType || 'On-site'}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {j.status || 'active'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 font-medium">
                          {j.createdAt
                            ? new Date(j.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Recent'}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(j._id, j.status || 'active')}
                              title={isActive ? 'Close job' : 'Reopen job'}
                              className={`p-2 rounded-xl border transition-colors ${
                                isActive
                                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteJob(j._id)}
                              title="Delete job posting"
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminJobsPage;
