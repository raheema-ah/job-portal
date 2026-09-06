import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Globe2,
  RefreshCw,
  Building,
  User,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.get('/admin/dashboard');
      if (res.data?.success && res.data.stats) {
        setStatsData(res.data.stats);
        setRecentJobs(res.data.stats.recentJobs || []);
        setRecentApplications(res.data.stats.recentApplications || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const usersCount = statsData?.users?.total || 0;
  const candidatesCount = statsData?.users?.candidates || 0;
  const employersCount = statsData?.users?.employers || 0;
  const companiesCount = statsData?.companies?.total || 0;
  const jobsCount = statsData?.jobs?.total || 0;
  const activeJobsCount = statsData?.jobs?.active || 0;
  const applicationsCount = statsData?.applications?.total || 0;
  const scrapedTodayCount = statsData?.jobs?.scrapedToday || 0;

  return (
    <RoleLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Overview of platform performance, user metrics, job listings, and hiring workflows."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
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
            Post a Job
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* 8 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Users */}
          <Link
            to="/admin/users"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{usersCount}</p>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">
              {candidatesCount} Candidates • {employersCount} Employers
            </p>
          </Link>

          {/* 2. Total Candidates */}
          <Link
            to="/admin/candidates"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Candidates
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{candidatesCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Active job seekers</p>
          </Link>

          {/* 3. Total Employers */}
          <Link
            to="/admin/employers"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Employers
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{employersCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Hiring recruiters</p>
          </Link>

          {/* 4. Total Companies */}
          <Link
            to="/admin/companies"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Companies
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{companiesCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Registered businesses</p>
          </Link>

          {/* 5. Total Jobs */}
          <Link
            to="/admin/jobs"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Jobs
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{jobsCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Direct & Aggregated</p>
          </Link>

          {/* 6. Active Jobs */}
          <Link
            to="/admin/jobs"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Jobs
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{activeJobsCount}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">Accepting applications</p>
          </Link>

          {/* 7. Total Applications */}
          <Link
            to="/admin/applications"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Applications
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{applicationsCount}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Candidate submissions</p>
          </Link>

          {/* 8. Jobs Scraped Today */}
          <Link
            to="/admin/scraped-jobs"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Scraped Today
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Globe2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{scrapedTodayCount}</p>
            <p className="text-[11px] text-sky-600 font-semibold mt-1">Automated aggregation</p>
          </Link>
        </div>

        {/* Two Columns: Recent Jobs & Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Recent Job Postings
              </h3>
              <Link
                to="/admin/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentJobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No recent jobs</div>
              ) : (
                recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job._id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{job.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {job.company || job.companyName} • {job.location || 'Remote'}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        (job.status || '').toLowerCase() === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {job.status || 'Active'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Recent Applications
              </h3>
              <Link
                to="/admin/applications"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentApplications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No recent candidate applications
                </div>
              ) : (
                recentApplications.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {app.candidate?.name || 'Candidate'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Applied for: <strong className="text-slate-700">{app.job?.title}</strong>
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      {app.status || 'Applied'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminDashboard;
