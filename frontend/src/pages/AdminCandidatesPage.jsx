import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  FileText,
  ExternalLink,
  Power,
  RefreshCw,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionId, setActionId] = useState(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/users/candidates');
      if (res.data?.success) {
        setCandidates(res.data.candidates || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
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
        setCandidates((prev) =>
          prev.map((c) => (c._id === userId ? { ...c, isActive: !currentActive } : c))
        );
        setSuccessMsg(
          `Candidate account ${!currentActive ? 'activated' : 'deactivated'} successfully.`
        );
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteCandidate = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate?')) {
      return;
    }

    try {
      setActionId(userId);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await api.delete(`/users/${userId}`);
      if (res.data?.success) {
        setCandidates((prev) => prev.filter((c) => c._id !== userId));
        setSuccessMsg('Candidate permanently deleted.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete candidate.');
    } finally {
      setActionId(null);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const nameMatch = (c.name || '').toLowerCase().includes(search.toLowerCase());
    const emailMatch = (c.email || '').toLowerCase().includes(search.toLowerCase());
    const skillsMatch = (c.skills || []).join(' ').toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch || skillsMatch;
  });

  return (
    <RoleLayout
      role="admin"
      title="Candidates"
      subtitle="View, screen, and manage all registered candidates and job seeker profiles."
      actions={
        <button
          onClick={fetchCandidates}
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
              placeholder="Search candidate by name, email, or skill..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Total Candidates: <strong className="text-slate-900">{candidates.length}</strong>
          </span>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading candidate profiles...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto px-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No candidates found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No candidate accounts match your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-6">Candidate</th>
                    <th className="py-3.5 px-4">Location / Phone</th>
                    <th className="py-3.5 px-4">Skills</th>
                    <th className="py-3.5 px-4">Resume</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((c) => {
                    const isActive = c.isActive !== false;

                    return (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{c.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600">
                          <p className="font-medium">{c.location || 'Not set'}</p>
                          <p className="text-[10px] text-slate-400">{c.phone || 'No phone'}</p>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(c.skills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                            {(c.skills || []).length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold self-center">
                                +{c.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {c.resumeUrl ? (
                            <a
                              href={c.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              <FileText className="w-3 h-3" />
                              View
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No resume</span>
                          )}
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

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCandidate(c)}
                              className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              title="View Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(c._id, isActive)}
                              disabled={actionId === c._id}
                              title={isActive ? 'Deactivate candidate' : 'Activate candidate'}
                              className={`p-2 rounded-xl border transition-colors ${
                                isActive
                                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCandidate(c._id)}
                              disabled={actionId === c._id}
                              title="Delete candidate"
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

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-sm text-slate-900">Candidate Profile Details</h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-lg">
                  {selectedCandidate.name ? selectedCandidate.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedCandidate.name}</h4>
                  <p className="text-slate-500">{selectedCandidate.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Phone
                  </span>
                  <p className="font-semibold text-slate-800">
                    {selectedCandidate.phone || 'Not provided'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Location
                  </span>
                  <p className="font-semibold text-slate-800">
                    {selectedCandidate.location || 'Not provided'}
                  </p>
                </div>
              </div>

              {selectedCandidate.bio && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bio / Summary
                  </span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                    {selectedCandidate.bio}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Skills & Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedCandidate.skills || []).map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {selectedCandidate.resumeUrl ? (
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Resume
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">No resume URL</span>
              )}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100"
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

export default AdminCandidatesPage;
