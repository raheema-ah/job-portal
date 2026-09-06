import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Bookmark,
  Building2,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const CandidateJobsPage = () => {
  const { user } = useAuth();

  // State
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [experience, setExperience] = useState('All');
  const [skill, setSkill] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Selected Job for Details Modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Apply Modal state
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');

  // Fetch candidate's saved and applied jobs
  const fetchUserData = async () => {
    try {
      const [savedRes, appsRes] = await Promise.allSettled([
        api.get('/saved-jobs'),
        api.get('/applications'),
      ]);

      if (savedRes.status === 'fulfilled' && savedRes.value?.data?.success) {
        const ids = new Set((savedRes.value.data.savedJobs || []).map((s) => s.job?._id || s.job));
        setSavedJobIds(ids);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.data?.success) {
        const ids = new Set((appsRes.value.data.applications || []).map((a) => a.job?._id || a.job));
        setAppliedJobIds(ids);
      }
    } catch (err) {
      console.warn('Error fetching user data in jobs page:', err);
    }
  };

  // Fetch Jobs with filters
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (location.trim()) params.append('location', location.trim());
      if (workMode !== 'All') params.append('workType', workMode);
      if (employmentType !== 'All') params.append('jobType', employmentType);
      if (experience !== 'All') params.append('experience', experience);
      if (skill.trim()) params.append('skill', skill.trim());
      params.append('sort', sort);
      params.append('page', page);
      params.append('limit', '9');

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
        setTotalJobs(res.data.total || res.data.count || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [search, location, workMode, employmentType, experience, skill, sort, page]);

  // Handle Save / Unsave
  const handleToggleSave = async (jobId) => {
    try {
      const isSaved = savedJobIds.has(jobId);
      if (isSaved) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.post('/saved-jobs', { jobId });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  // Open Apply Modal
  const handleOpenApplyModal = (job) => {
    setApplyModalJob(job);
    setCoverLetter('');
    setApplyMessage('');
    setApplyError('');
  };

  // Submit Application
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyModalJob) return;

    try {
      setApplying(true);
      setApplyError('');
      const res = await api.post(`/jobs/${applyModalJob._id}/apply`, {
        coverLetter,
        resume: user?.resume || '',
      });

      if (res.data?.success) {
        setApplyMessage('Application submitted successfully!');
        setAppliedJobIds((prev) => new Set(prev).add(applyModalJob._id));
        setTimeout(() => {
          setApplyModalJob(null);
          setApplyMessage('');
        }, 1800);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setWorkMode('All');
    setEmploymentType('All');
    setExperience('All');
    setSkill('');
    setSort('newest');
    setPage(1);
  };

  return (
    <RoleLayout
      role="candidate"
      title="Browse Open Jobs"
      subtitle={`Explore ${totalJobs} curated positions available for immediate application.`}
    >
      <div className="space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search job title, company, or keywords..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            {/* Location Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                placeholder="Location (e.g. Remote, New York, Austin)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            {/* Specific Skill Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={skill}
                onChange={(e) => {
                  setSkill(e.target.value);
                  setPage(1);
                }}
                placeholder="Required Skill (e.g. React, Python, AWS)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
              />
            </div>
          </div>

          {/* Secondary Dropdown Filters & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Work Mode */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">Work Mode:</span>
                <select
                  value={workMode}
                  onChange={(e) => {
                    setWorkMode(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="All">All Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Employment Type */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">Type:</span>
                <select
                  value={employmentType}
                  onChange={(e) => {
                    setEmploymentType(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="flex items-center gap-1">
                <span className="text-slate-500 font-medium">Experience:</span>
                <select
                  value={experience}
                  onChange={(e) => {
                    setExperience(e.target.value);
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="All">All Experience</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Lead / Manager">Lead / Manager</option>
                </select>
              </div>

              {(search || location || workMode !== 'All' || employmentType !== 'All' || experience !== 'All' || skill) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-2"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 h-64 animate-pulse space-y-4" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Search className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No jobs match your filter criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try modifying your search keywords or clearing some filters to explore more available roles.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const isSaved = savedJobIds.has(job._id);
              const isApplied = appliedJobIds.has(job._id);

              return (
                <div
                  key={job._id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
                >
                  {/* Top: Title, Company, Bookmark */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => setSelectedJob(job)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                        >
                          {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company || job.companyName}</span>
                        </p>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleToggleSave(job._id)}
                        title={isSaved ? 'Remove from Saved' : 'Save Job'}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-sky-50 border-sky-200 text-blue-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-medium text-slate-600">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location}</span>
                      </span>
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100">
                        {job.workMode || job.workType || 'On-site'}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                        {job.jobType || job.employmentType || 'Full-time'}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                        {job.salary || 'Competitive'}
                      </span>
                    </div>

                    {/* Skills Chips */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-medium self-center">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Posted Date & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Details
                      </button>

                      {isApplied ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(job)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-medium text-slate-600">
            <span>
              Showing Page <strong className="text-slate-900">{page}</strong> of{' '}
              <strong className="text-slate-900">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 enabled:hover:bg-slate-50 disabled:opacity-40 font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 enabled:hover:bg-slate-50 disabled:opacity-40 font-bold flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ================= DETAILS MODAL ================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl border border-slate-200 shadow-2xl overflow-y-auto flex flex-col justify-between p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {selectedJob.title}
                  </h2>
                  <p className="text-sm font-semibold text-blue-600 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>{selectedJob.company || selectedJob.companyName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 mt-4 text-xs font-semibold text-slate-600">
                <span className="bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedJob.location}
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                  {selectedJob.workMode || selectedJob.workType || 'On-site'}
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                  {selectedJob.jobType || selectedJob.employmentType || 'Full-time'}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">
                  {selectedJob.salary || 'Competitive'}
                </span>
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-100">
                  {selectedJob.experience || 'Mid Level'}
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">Job Description</h4>
                <p className="whitespace-pre-line text-slate-600">{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">Key Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    {selectedJob.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">Requirements & Qualifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    {selectedJob.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">Perks & Benefits</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    {selectedJob.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleSave(selectedJob._id)}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  savedJobIds.has(selectedJob._id)
                    ? 'bg-sky-50 text-blue-600 border-sky-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${savedJobIds.has(selectedJob._id) ? 'fill-current' : ''}`}
                />
                {savedJobIds.has(selectedJob._id) ? 'Saved' : 'Save Job'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Close
                </button>

                {appliedJobIds.has(selectedJob._id) ? (
                  <span className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Application Submitted
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const j = selectedJob;
                      setSelectedJob(null);
                      handleOpenApplyModal(j);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= APPLY MODAL ================= */}
      {applyModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Quick Job Application
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Apply for {applyModalJob.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {applyModalJob.company || applyModalJob.companyName} • {applyModalJob.location}
                </p>
              </div>
              <button
                onClick={() => setApplyModalJob(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{applyMessage}</span>
              </div>
            )}

            {applyError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Applicant Profile
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">{user?.name}</p>
                  <p className="text-slate-500">{user?.email} • {user?.phone || 'No phone'}</p>
                  <p className="text-[11px] text-blue-600 font-medium">
                    {user?.resume ? '✓ Resume attached from profile' : 'ℹ You can attach notes below'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cover Letter / Note to Hiring Team (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself, highlight your top skills, or share why you're a great fit for this position..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApplyModalJob(null)}
                  disabled={applying}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </RoleLayout>
  );
};

export default CandidateJobsPage;
