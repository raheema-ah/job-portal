import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminEmployersPage = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/users/employers');
      if (res.data?.success) {
        setEmployers(res.data.employers || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load employers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const handleToggleStatus = async (userId, currentActive) => {
    try {
      setActionId(userId);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.put(`/users/${userId}/status`, {
        isActive: !currentActive,
      });

      if (res.data?.success) {
        setEmployers((prev) =>
          prev.map((e) => (e._id === userId ? { ...e, isActive: !currentActive } : e))
        );
        setSuccessMsg(
          `Employer account ${!currentActive ? 'activated' : 'deactivated'} successfully.`
        );
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update employer status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteEmployer = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this employer account?')) {
      return;
    }

    try {
      setActionId(userId);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.delete(`/users/${userId}`);
      if (res.data?.success) {
        setEmployers((prev) => prev.filter((e) => e._id !== userId));
        setSuccessMsg('Employer permanently deleted.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete employer.');
    } finally {
      setActionId(null);
    }
  };

  const filteredEmployers = employers.filter((e) => {
    const nameMatch = (e.name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (e.email || '').toLowerCase().includes(search.toLowerCase());
    const companyMatch = (e.company || '').toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch || companyMatch;
  });

  return (
    <RoleLayout
      role="admin"
      title="Employers"
      subtitle="Oversee recruiting accounts, company affiliations, and posting privileges."
      actions={
        <button
          onClick={fetchEmployers}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        {/* Alerts */}
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

        {/* Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employer by name, company, or email..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Total Employers: <strong className="text-slate-900">{employers.length}</strong>
          </span>
        </div>

        {/* Employers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading employer directory...</p>
            </div>
          ) : filteredEmployers.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No employers found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No employer accounts match your search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-6">Employer Contact</th>
                    <th className="py-3.5 px-4">Company Affiliation</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployers.map((e) => {
                    const isActive = e.isActive !== false;

                    return (
                      <tr key={e._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {e.name ? e.name.charAt(0).toUpperCase() : 'E'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{e.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{e.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {e.company || 'Direct Hiring'}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-500 font-medium">
                          {e.createdAt
                            ? new Date(e.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(e._id, isActive)}
                              disabled={actionId === e._id}
                              title={isActive ? 'Deactivate account' : 'Activate account'}
                              className={`p-2 rounded-xl border transition-colors ${
                                isActive
                                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteEmployer(e._id)}
                              disabled={actionId === e._id}
                              title="Delete employer"
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

export default AdminEmployersPage;
