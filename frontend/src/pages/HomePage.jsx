import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  TrendingUp,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  Briefcase,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate } = useAuth();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get('/jobs?limit=6&sort=newest');
        if (res.data.success) {
          setFeaturedJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Error loading featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTerm.trim()) queryParams.set('search', searchTerm.trim());
    if (locationTerm.trim()) queryParams.set('location', locationTerm.trim());
    navigate(`/jobs?${queryParams.toString()}`);
  };

  const categories = [
    { title: 'AI & Machine Learning', count: '120+ jobs', icon: Sparkles, color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30' },
    { title: 'Full Stack Engineering', count: '340+ jobs', icon: Layers, color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
    { title: 'Cloud & DevOps / SRE', count: '180+ jobs', icon: Zap, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30' },
    { title: 'Remote & Distributed', count: '450+ jobs', icon: Globe2, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section with Glowing Backdrops */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-8">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Driven Job Matching & Aggregation Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-slate-400">v1.0 Ready</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1]">
            Find Your Next Career Move <br />
            <span className="gradient-text-accent">Accelerated by AI.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed">
            Discover thousands of curated positions aggregated live from top global tech job boards. Benchmark your resume against requirements in seconds with our AI scoring engine.
          </p>

          {/* Search Bar Container */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-2xl p-2.5 sm:p-3 rounded-2xl border border-slate-800 shadow-2xl shadow-slate-950 flex flex-col md:flex-row items-center gap-2.5"
          >
            {/* Keyword Input */}
            <div className="flex items-center gap-3 px-4 py-2 w-full md:flex-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills (e.g. React, Python, Cloud)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center gap-3 px-4 py-2 w-full md:w-64 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location or 'Remote'..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="gradient-btn-primary w-full md:w-auto flex items-center justify-center gap-2 py-3 px-7 text-sm font-semibold whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Search Jobs
            </button>
          </form>

          {/* Popular Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <span className="text-slate-500">Popular Searches:</span>
            {['React', 'Node.js', 'Python', 'Machine Learning', 'Remote', 'DevOps', 'TypeScript'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchTerm(tag);
                  navigate(`/jobs?search=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-slate-800/80">
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold font-display text-white">1,500+</div>
            <div className="text-xs text-slate-400 mt-1">Live Aggregated Jobs</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold font-display text-indigo-400">98.4%</div>
            <div className="text-xs text-slate-400 mt-1">AI Match Accuracy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold font-display text-purple-400">6 Hours</div>
            <div className="text-xs text-slate-400 mt-1">Automated Feed Sync</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-extrabold font-display text-emerald-400">450+</div>
            <div className="text-xs text-slate-400 mt-1">Vetted Tech Companies</div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Explore High Demand Sectors</h2>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(cat.title.split(' ')[0])}`)}
                className={`glass-card glass-card-hover p-6 cursor-pointer border bg-gradient-to-br ${cat.color}`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-center mb-4 text-indigo-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-400">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Fresh Openings</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Latest Featured & Aggregated Jobs</h2>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Browse All Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card p-6 h-64 animate-pulse bg-slate-900/40 border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApplyClick={(j) => setSelectedJobForApply(j)}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works 3-Step Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">How NexusJobs Works</span>
          <h2 className="text-3xl font-bold text-white">Engineered for Developers & Tech Employers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 text-center space-y-4 relative border-slate-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Real-Time Aggregation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated scraper services aggregate active remote and onsite developer postings directly from verified public feeds every 6 hours.
            </p>
          </div>

          <div className="glass-card p-8 text-center space-y-4 relative border-slate-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">2. AI Resume Compatibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our intelligent keyword & skill density engine calculates your match percentage instantly and offers actionable recommendations.
            </p>
          </div>

          <div className="glass-card p-8 text-center space-y-4 relative border-slate-800">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">3. One-Click Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidates track application milestones in real-time while employers manage applicant candidate pools with automated AI scores.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 border border-indigo-500/30 shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Accelerate Your Career or Hiring?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join thousands of tech candidates discovering verified roles and employers hiring top engineering talent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/ai-matcher" className="gradient-btn-primary flex items-center gap-2 text-sm !py-3 !px-6">
              <Sparkles className="w-4 h-4" />
              Try AI Matcher
            </Link>
            <Link to="/register" className="gradient-btn-secondary flex items-center gap-2 text-sm !py-3 !px-6">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onAppliedSuccess={() => {
            // refresh or feedback
          }}
        />
      )}

    </div>
  );
};

export default HomePage;
