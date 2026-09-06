import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Building2,
  MapPin,
  Calendar,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  Briefcase,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const CandidateSavedJobsPage = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSavedData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [savedRes, appsRes] = await Promise.allSettled([
        api.get('/saved-jobs'),
        api.get('/applications'),
      ]);

      if (savedRes.status === 'fulfilled' && savedRes.value?.data?.success) {
        setSavedJobs(savedRes.value.data.savedJobs || []);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.data?.success) {
        const ids = new Set((appsRes.value.data.applications || []).map((a) => a.job?._id || a.job));
        setAppliedJobIds(ids);
      }
    } catch (err) {
      setErrorMsg('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  const handleRemoveSaved = async (idOrJobId) => {
    try {
      await api.delete(`/saved-jobs/${idOrJobId}`);
      setSavedJobs((prev) => prev.filter((item) => item.savedId !== idOrJobId && item.job?._id !== idOrJobId));
      setSuccessMsg('Job removed from saved bookmarks');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg('Failed to remove saved job');
    }
  };

  const handleApply = async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/apply`, {
        resume: user?.resume || '',
        coverLetter: 'Applied directly from my saved bookmarks.',
      });
      if (res.data?.success) {
        setAppliedJobIds((prev) => new Set(prev).add(jobId));
        setSuccessMsg('Application submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Application could not be submitted');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <RoleLayout
      role="candidate"
      title="Saved Bookmarks"
      subtitle={`You have ${savedJobs.length} bookmarked opportunities ready for review and application.`}
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 h-56 animate-pulse" />
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mx-auto">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No saved jobs yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save interesting job postings while exploring open roles to easily compare and apply to them later.
            </p>
            <Link
              to="/candidate/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Search className="w-4 h-4" /> Browse Open Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedJobs.map((item) => {
              const job = item.job;
              if (!job) return null;
              const isApplied = appliedJobIds.has(job._id);

              return (
                <div
                  key={item.savedId || job._id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company || job.companyName}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveSaved(item.savedId || job._id)}
                        title="Remove from saved"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-medium text-slate-600">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100">
                        {job.workMode || job.workType || 'On-site'}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                        {job.salary || 'Competitive'}
                      </span>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      Saved {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'recently'}
                    </span>

                    <div className="flex items-center gap-2">
                      {isApplied ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(job._id)}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </RoleLayout>
  );
};

export default CandidateSavedJobsPage;
