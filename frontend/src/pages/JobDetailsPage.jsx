import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Bookmark,
  Share2,
  Globe,
  Layers,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import AiMatchBadge from '../components/AiMatchBadge';
import ApplyModal from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate } = useAuth();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) {
        setJob(res.data.job);
      }
    } catch (err) {
      toast.error('Job not found or unavailable');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to bookmark jobs');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/saved-jobs/${job._id}`);
      if (res.data.success) {
        setIsSaved(res.data.saved);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Job link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/20 border border-indigo-500/40 animate-pulse" />
        <p className="text-xs text-slate-400">Loading job details and running AI compatibility checks...</p>
      </div>
    );
  }

  if (!job) return null;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Competitive Compensation';
    const currency = job.salaryCurrency === 'USD' ? '$' : '€';
    return `${currency}${(job.salaryMin || 0).toLocaleString()} - ${currency}${(job.salaryMax || 0).toLocaleString()} / ${job.salaryPeriod || 'year'}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      {/* Main Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4 sm:gap-5">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-16 h-16 rounded-2xl object-contain bg-slate-800/90 p-2 border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-900 to-purple-900 border border-indigo-500/30 flex items-center justify-center font-bold text-2xl text-indigo-300 shrink-0">
                {job.companyName?.charAt(0) || 'J'}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">{job.companyName}</span>
                {job.isScraped && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    <Globe className="w-2.5 h-2.5" />
                    Source: {job.source || 'Aggregated'}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold tracking-wider bg-indigo-950/40 text-indigo-300 border border-indigo-800/50">
                  {job.workMode}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{job.title}</h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  {formatSalary()}
                </span>
                <span className="flex items-center gap-1.5 capitalize text-slate-400">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.employmentType}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-center">
            {isCandidate && (
              <button
                onClick={handleSaveToggle}
                className={`p-3 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Save Job"
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-indigo-400' : ''}`} />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Share Job"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {job.hasApplied ? (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Status: {job.applicationStatus?.toUpperCase() || 'APPLIED'}
              </div>
            ) : job.isScraped && job.sourceUrl ? (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-btn-primary flex items-center gap-2 text-xs font-semibold !py-3 !px-6"
              >
                Apply on {job.source || 'Original Site'}
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.info('Please sign in to apply');
                    navigate('/login');
                    return;
                  }
                  setIsApplyModalOpen(true);
                }}
                className="gradient-btn-primary flex items-center gap-2 text-xs font-semibold !py-3 !px-6"
              >
                Apply for Position
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Grid: Job Content + AI Match Box + Company Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Details, Requirements, Benefits */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Compatibility Analysis Box */}
          {job.aiMatchAnalysis && (
            <div className="glass-card p-6 border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Candidate Compatibility Rating
                </span>
                <AiMatchBadge
                  score={job.aiMatchAnalysis.score}
                  rating={job.aiMatchAnalysis.rating}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <div>
                  <div className="font-bold text-white">{job.aiMatchAnalysis.breakdown.skillScore}%</div>
                  <div className="text-[10px] text-slate-400">Skill Fit</div>
                </div>
                <div>
                  <div className="font-bold text-white">{job.aiMatchAnalysis.breakdown.textScore}%</div>
                  <div className="text-[10px] text-slate-400">Keyword Density</div>
                </div>
                <div>
                  <div className="font-bold text-white">{job.aiMatchAnalysis.breakdown.expScore}%</div>
                  <div className="text-[10px] text-slate-400">Experience</div>
                </div>
              </div>

              {job.aiMatchAnalysis.matchedSkills?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matching Skills Detected:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.aiMatchAnalysis.matchedSkills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/30 text-emerald-300 border border-emerald-800/40">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.aiMatchAnalysis.missingSkills?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Skills to Highlight in Application:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.aiMatchAnalysis.missingSkills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-amber-950/30 text-amber-300 border border-amber-800/40">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-300 italic pt-1">
                💡 {job.aiMatchAnalysis.recommendations[0]}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="glass-card p-6 sm:p-8 border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">About the Role</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          <div className="glass-card p-6 sm:p-8 border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Key Skills & Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {(job.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-900 text-indigo-300 border border-slate-700/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements List */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="glass-card p-6 sm:p-8 border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Requirements & Qualifications</h2>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits List */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="glass-card p-6 sm:p-8 border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Perks & Benefits</h2>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {job.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right Column: Company & Summary Box */}
        <div className="space-y-6">
          
          {/* Position Overview Card */}
          <div className="glass-card p-6 border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Position Overview</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Experience</span>
                <span className="text-white font-medium capitalize">{job.experienceLevel} Level</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Work Mode</span>
                <span className="text-white font-medium capitalize">{job.workMode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Employment</span>
                <span className="text-white font-medium capitalize">{job.employmentType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total Applicants</span>
                <span className="text-indigo-400 font-bold">{job.applicantCount || 0} candidates</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Application Deadline</span>
                <span className="text-white font-medium">
                  {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling Admission'}
                </span>
              </div>
            </div>

            {/* Bottom Apply CTA in Sidebar */}
            <div className="pt-2">
              {job.isScraped && job.sourceUrl ? (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full gradient-btn-primary flex items-center justify-center gap-2 text-xs font-semibold !py-2.5"
                >
                  Apply on {job.source || 'Aggregated Feed'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.info('Please sign in to apply');
                      navigate('/login');
                      return;
                    }
                    setIsApplyModalOpen(true);
                  }}
                  className="w-full gradient-btn-primary text-xs font-semibold !py-2.5"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Company Card */}
          <div className="glass-card p-6 border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Company</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{job.companyName}</h4>
                <p className="text-[11px] text-slate-400">{job.company?.industry || 'Technology'}</p>
              </div>
            </div>

            {job.company?.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {job.company.description}
              </p>
            )}

            {job.company?.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Visit Company Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>

      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onAppliedSuccess={() => fetchJob()}
        />
      )}

    </div>
  );
};

export default JobDetailsPage;
