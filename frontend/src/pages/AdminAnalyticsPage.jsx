import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  FileText,
  PieChart,
  RefreshCw,
  Globe2,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setStats(res.data.stats || res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalUsers = stats?.totalUsers || 0;
  const candidates = stats?.candidates || 0;
  const employers = stats?.employers || 0;
  const totalJobs = stats?.totalJobs || 0;
  const activeJobs = stats?.activeJobs || 0;
  const totalApplications = stats?.totalApplications || 0;
  const scrapedToday = stats?.scrapedToday || 0;

  return (
    <RoleLayout
      role="admin"
      title="Platform Reports & Analytics"
      subtitle="Comprehensive metrics on portal usage, hiring velocity, and user growth."
      actions={
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{totalUsers}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {candidates} Candidates • {employers} Employers
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Job Postings
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{totalJobs}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {activeJobs} Active listings
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Applications
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{totalApplications}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Candidate applications submitted
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Jobs Scraped Today
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Globe2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{scrapedToday}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              External feeds aggregated
            </p>
          </div>
        </div>

        {/* Visual Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">User Demographics by Role</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of platform accounts across user types.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Candidates (Job Seekers)',
                  count: candidates,
                  pct: totalUsers > 0 ? Math.round((candidates / totalUsers) * 100) : 0,
                  color: 'bg-blue-600',
                },
                {
                  label: 'Employers & Recruiters',
                  count: employers,
                  pct: totalUsers > 0 ? Math.round((employers / totalUsers) * 100) : 0,
                  color: 'bg-indigo-600',
                },
                {
                  label: 'Platform Administrators',
                  count: stats?.admins || 1,
                  pct:
                    totalUsers > 0
                      ? Math.round(((stats?.admins || 1) / totalUsers) * 100)
                      : 0,
                  color: 'bg-purple-600',
                },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{item.label}</span>
                    <span>
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs Status Breakdown */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Job Postings Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active listings versus closed positions.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Active & Open Positions',
                  count: activeJobs,
                  pct: totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0,
                  color: 'bg-emerald-500',
                },
                {
                  label: 'Closed / Filled Positions',
                  count: totalJobs - activeJobs,
                  pct:
                    totalJobs > 0
                      ? Math.round(((totalJobs - activeJobs) / totalJobs) * 100)
                      : 0,
                  color: 'bg-slate-400',
                },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{item.label}</span>
                    <span>
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 font-medium">
              💡 <strong>Hiring Insight:</strong> Active positions account for{' '}
              {totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0}% of all postings.
              Encourage employers to close filled roles to keep search results fresh.
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminAnalyticsPage;
