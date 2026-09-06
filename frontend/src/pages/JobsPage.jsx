import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  Briefcase,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Globe,
  DollarSign,
  Building2,
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import { useToast } from '../context/ToastContext';

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'all');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || 'all');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || 'all');
  const [source, setSource] = useState(searchParams.get('source') || 'all');
  const [isScraped, setIsScraped] = useState(searchParams.get('isScraped') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.set('search', search);
      if (location) params.set('location', location);
      if (workMode !== 'all') params.set('workMode', workMode);
      if (employmentType !== 'all') params.set('employmentType', employmentType);
      if (experienceLevel !== 'all') params.set('experienceLevel', experienceLevel);
      if (source !== 'all') params.set('source', source);
      if (isScraped !== 'all') params.set('isScraped', isScraped);
      if (minSalary) params.set('minSalary', minSalary);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', '9');

      setSearchParams(params, { replace: true });

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotalPages(res.data.totalPages || 1);
        setTotalJobs(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, employmentType, experienceLevel, source, isScraped, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setWorkMode('all');
    setEmploymentType('all');
    setExperienceLevel('all');
    setSource('all');
    setIsScraped('all');
    setMinSalary('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Search & Filter Bar */}
      <div className="glass-card p-4 sm:p-6 border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Keyword Search */}
          <div className="md:col-span-5 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <Search className="w-4 h-4 text-indigo-400 shrink-0" />
            <input
              type="text"
              placeholder="Search title, tech stack (e.g. React, Node, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Location Search */}
          <div className="md:col-span-4 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Location or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="gradient-btn-primary flex-1 flex items-center justify-center gap-2 !py-2 text-xs font-semibold"
            >
              <Search className="w-3.5 h-3.5" />
              Apply Search
            </button>
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* Quick WorkMode tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'remote', label: '🌐 Remote Only' },
              { id: 'hybrid', label: '🏢 Hybrid' },
              { id: 'onsite', label: '📍 Onsite' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setWorkMode(mode.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  workMode === mode.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Most Recent</option>
              <option value="salary_high">Salary: High to Low</option>
              <option value="salary_low">Salary: Low to High</option>
              <option value="deadline">Application Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Sidebar Filters + Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <aside className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6`}>
          <div className="glass-card p-5 border-slate-800 space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Filter Positions
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Employment Type</label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'full-time', label: 'Full Time' },
                  { id: 'part-time', label: 'Part Time' },
                  { id: 'contract', label: 'Contract / Freelance' },
                  { id: 'internship', label: 'Internship' },
                ].map((type) => (
                  <label key={type.id} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="employmentType"
                      checked={employmentType === type.id}
                      onChange={() => {
                        setEmploymentType(type.id);
                        setPage(1);
                      }}
                      className="text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Experience Level</label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Levels' },
                  { id: 'entry', label: 'Entry Level (0-2 yrs)' },
                  { id: 'mid', label: 'Mid Level (2-5 yrs)' },
                  { id: 'senior', label: 'Senior (5+ yrs)' },
                  { id: 'lead', label: 'Lead / Staff (7+ yrs)' },
                ].map((lvl) => (
                  <label key={lvl.id} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      checked={experienceLevel === lvl.id}
                      onChange={() => {
                        setExperienceLevel(lvl.id);
                        setPage(1);
                      }}
                      className="text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span>{lvl.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source Origin (Scraped vs Direct) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Job Origin</label>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Sources' },
                  { id: 'false', label: 'Direct Employer Postings' },
                  { id: 'true', label: 'Aggregated Feeds (RemoteOK, Arbeitnow)' },
                ].map((src) => (
                  <label key={src.id} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="isScraped"
                      checked={isScraped === src.id}
                      onChange={() => {
                        setIsScraped(src.id);
                        setPage(1);
                      }}
                      className="text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span>{src.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Salary Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Min Annual Salary</span>
                <span className="text-emerald-400 font-bold">
                  {minSalary ? `$${Number(minSalary) / 1000}k+` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="10000"
                value={minSalary || 0}
                onChange={(e) => {
                  setMinSalary(e.target.value === '0' ? '' : e.target.value);
                  setPage(1);
                }}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

          </div>
        </aside>

        {/* Jobs Results List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Bar with Total count */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{jobs.length}</span> of{' '}
              <span className="font-bold text-white">{totalJobs}</span> open positions
            </div>
            <div>
              Page <span className="text-white font-medium">{page}</span> of{' '}
              <span className="text-white font-medium">{totalPages}</span>
            </div>
          </div>

          {/* Job Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-6 h-56 animate-pulse bg-slate-900/40 border-slate-800" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4 border-slate-800">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No Matching Jobs Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your search terms or resetting the filters to explore all available positions.
              </p>
              <button
                onClick={resetFilters}
                className="gradient-btn-primary !py-2 !px-4 text-xs font-semibold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApplyClick={(j) => setSelectedJobForApply(j)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                      page === p
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onAppliedSuccess={() => fetchJobs()}
        />
      )}

    </div>
  );
};

export default JobsPage;
