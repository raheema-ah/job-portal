import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  ArrowRight,
  TrendingUp,
  Search,
  Eye,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  RefreshCw,
  Target,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';
import { calculateProfileCompletion } from '../utils/profileCompletion';

const CandidateDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalAvailableJobs: 0,
    jobsApplied: 0,
    savedJobs: 0,
    underReview: 0,
    shortlisted: 0,
  });
  const [profileData, setProfileData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [jobsRes, appsRes, savedRes, profileRes] = await Promise.allSettled([
        api.get('/jobs?limit=5'),
        api.get('/applications'),
        api.get('/saved-jobs'),
        api.get('/users/profile'),
      ]);

      let availableCount = 0;
      let fetchedRecentJobs = [];
      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.success) {
        availableCount = jobsRes.value.data.total || jobsRes.value.data.count || 0;
        fetchedRecentJobs = jobsRes.value.data.jobs || [];
      }

      let fetchedApps = [];
      if (appsRes.status === 'fulfilled' && appsRes.value?.data?.success) {
        fetchedApps = appsRes.value.data.applications || [];
      }

      let savedCount = 0;
      if (savedRes.status === 'fulfilled' && savedRes.value?.data?.success) {
        savedCount = savedRes.value.data.count || (savedRes.value.data.savedJobs || []).length;
      }

      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.success) {
        setProfileData(profileRes.value.data.user);
      }

      const underReviewCount = fetchedApps.filter((a) =>
        ['under review', 'reviewing'].includes((a.status || '').toLowerCase())
      ).length;

      const shortlistedCount = fetchedApps.filter((a) =>
        ['shortlisted', 'interview', 'hired'].includes((a.status || '').toLowerCase())
      ).length;

      setStats({
        totalAvailableJobs: availableCount,
        jobsApplied: fetchedApps.length,
        savedJobs: savedCount,
        underReview: underReviewCount,
        shortlisted: shortlistedCount,
      });

      setRecentJobs(fetchedRecentJobs);
      setRecentApplications(fetchedApps.slice(0, 5));
    } catch (err) {
      setErrorMsg('Unable to load full candidate dashboard metrics at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const completion = calculateProfileCompletion(profileData || user);

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
      role="candidate"
      title={`Welcome back, ${user?.name || 'Candidate'}`}
      subtitle="Track your applications, saved jobs, and latest matching career opportunities."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/candidate/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Browse Jobs</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Completion Progress Bar & Checklist Widget */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Profile Completion: <span className="text-blue-600">{completion.percentage}%</span>
                </h3>
              </div>
              {completion.percentage < 100 ? (
                <p className="text-xs text-slate-500 font-medium">
                  Complete your profile to increase your chances of getting shortlisted.
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your profile is 100% complete and fully optimized for employers!
                </p>
              )}
            </div>

            {completion.firstIncompleteSection && (
              <Link
                to={`/candidate/profile?tab=${completion.firstIncompleteSection.tabKey}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex-shrink-0"
              >
                <span>Complete Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>0%</span>
              <span>{completion.percentage}% Completed</span>
              <span>100%</span>
            </div>
          </div>

          {/* Checklist of sections */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            {completion.sections.map((sec) => (
              <Link
                key={sec.id}
                to={`/candidate/profile?tab=${sec.tabKey}`}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 group ${
                  sec.completed
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900 hover:bg-emerald-50'
                    : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                {sec.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex-shrink-0" />
                )}
                <span className="font-bold text-[11px] truncate">{sec.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.totalAvailableJobs}</div>
              <div className="text-xs text-slate-500 font-semibold">Available Jobs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.jobsApplied}</div>
              <div className="text-xs text-slate-500 font-semibold">Jobs Applied</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold flex-shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.savedJobs}</div>
              <div className="text-xs text-slate-500 font-semibold">Saved Jobs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.underReview}</div>
              <div className="text-xs text-slate-500 font-semibold">Under Review</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.shortlisted}</div>
              <div className="text-xs text-slate-500 font-semibold">Shortlisted</div>
            </div>
          </div>
        </div>

        {/* Split Section: Recent Jobs & Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs Feed (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Recent Matching Jobs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest openings tailored to current tech market demand.
                </p>
              </div>
              <Link
                to="/candidate/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500 font-medium">
                  Loading jobs...
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No recent job listings found.
                </div>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                          <Link to={`/candidate/jobs`}>{job.title}</Link>
                        </h4>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md">
                          {job.workMode || job.workType || 'Remote'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="font-semibold text-slate-700">
                          {job.company || job.companyName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location || 'Remote'}
                        </span>
                        {job.salary && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-900">{job.salary}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to="/candidate/jobs"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications Tracker (1 col) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Recent Applications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Status of your active submissions.</p>
                </div>
                <Link
                  to="/candidate/applications"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  See All
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-500 font-medium">
                    Loading applications...
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No active applications yet.
                  </div>
                ) : (
                  recentApplications.map((app) => (
                    <div key={app._id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs leading-tight">
                            {app.job?.title || 'Applied Position'}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {app.job?.company || app.job?.companyName || 'Company'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status || 'Applied'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Applied:{' '}
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-center">
              <Link
                to="/candidate/applications"
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
              >
                <span>Track All Applications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default CandidateDashboard;
