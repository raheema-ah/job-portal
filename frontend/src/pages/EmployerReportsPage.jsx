import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart,
  RefreshCw,
  Award,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const EmployerReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.allSettled([
        api.get('/jobs/employer/my-jobs'),
        api.get('/applications/employer/all'),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.success) {
        setJobs(jobsRes.value.data.jobs || []);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value?.data?.success) {
        setApplications(appsRes.value.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Funnel Metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => (j.status || '').toLowerCase() === 'active').length;
  const totalApps = applications.length;

  const statusCounts = {
    applied: applications.filter((a) => (a.status || '').toLowerCase() === 'applied').length,
    underReview: applications.filter((a) =>
      ['under review', 'reviewing'].includes((a.status || '').toLowerCase())
    ).length,
    shortlisted: applications.filter((a) =>
      ['shortlisted', 'interview'].includes((a.status || '').toLowerCase())
    ).length,
    hired: applications.filter((a) => (a.status || '').toLowerCase() === 'hired').length,
    rejected: applications.filter((a) => (a.status || '').toLowerCase() === 'rejected').length,
  };

  const hireRate = totalApps > 0 ? Math.round((statusCounts.hired / totalApps) * 100) : 0;
  const shortlistRate =
    totalApps > 0 ? Math.round((statusCounts.shortlisted / totalApps) * 100) : 0;

  return (
    <RoleLayout
      role="employer"
      title="Reports & Analytics"
      subtitle="Track your recruitment pipeline efficiency, candidate quality, and hiring speed."
      actions={
        <button
          onClick={fetchData}
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
                Total Jobs Posted
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{totalJobs}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {activeJobs} Active • {totalJobs - activeJobs} Closed
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Applications
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{totalApps}</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Across all posted positions
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Shortlist Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{shortlistRate}%</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {statusCounts.shortlisted} candidates passed screening
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Offers / Hired
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{statusCounts.hired}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {hireRate}% Successful conversion
            </p>
          </div>
        </div>

        {/* Funnel Visualizer */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Recruitment Funnel Overview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Progression of candidates from initial submission to final hire.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
              Live Pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { stage: 'Applied', count: statusCounts.applied, color: 'bg-slate-100 text-slate-800' },
              { stage: 'Under Review', count: statusCounts.underReview, color: 'bg-amber-100 text-amber-800' },
              { stage: 'Shortlisted', count: statusCounts.shortlisted, color: 'bg-blue-100 text-blue-800' },
              { stage: 'Hired', count: statusCounts.hired, color: 'bg-emerald-100 text-emerald-800' },
              { stage: 'Rejected', count: statusCounts.rejected, color: 'bg-rose-100 text-rose-800' },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {f.stage}
                </span>
                <span className={`inline-block px-3 py-1 rounded-xl text-lg font-black ${f.color}`}>
                  {f.count}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {totalApps > 0 ? `${Math.round((f.count / totalApps) * 100)}% of total` : '0%'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Job Performance Breakdown Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Jobs Performance Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Applicant counts and statuses per individual listing.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-6">Job Title</th>
                  <th className="py-3.5 px-4">Work Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applications</th>
                  <th className="py-3.5 px-4">Shortlisted</th>
                  <th className="py-3.5 px-6 text-right">Hire Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => {
                  const jobApps = applications.filter(
                    (a) => a.job && (a.job._id === j._id || a.job === j._id)
                  );
                  const shortlistedCount = jobApps.filter((a) =>
                    ['shortlisted', 'interview'].includes((a.status || '').toLowerCase())
                  ).length;
                  const hiredCount = jobApps.filter(
                    (a) => (a.status || '').toLowerCase() === 'hired'
                  ).length;

                  return (
                    <tr key={j._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{j.title}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {j.workMode || j.workType || 'On-site'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            (j.status || '').toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {j.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{jobApps.length}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{shortlistedCount}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-emerald-600">
                        {hiredCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default EmployerReportsPage;
