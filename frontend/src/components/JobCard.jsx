import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Globe,
  Clock,
} from 'lucide-react';
import AiMatchBadge from './AiMatchBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const JobCard = ({ job, isSavedInitial = false, onSaveToggle, onApplyClick }) => {
  const { isAuthenticated, isCandidate } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  // Format salary
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Competitive Salary';
    const currencySymbol = job.salaryCurrency === 'USD' ? '$' : job.salaryCurrency === 'EUR' ? '€' : '£';
    const minK = job.salaryMin ? `${Math.round(job.salaryMin / 1000)}k` : '';
    const maxK = job.salaryMax ? `${Math.round(job.salaryMax / 1000)}k` : '';

    if (minK && maxK) return `${currencySymbol}${minK} - ${currencySymbol}${maxK}/yr`;
    if (minK) return `From ${currencySymbol}${minK}/yr`;
    if (maxK) return `Up to ${currencySymbol}${maxK}/yr`;
    return 'Competitive Salary';
  };

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please sign in to save jobs');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post(`/saved-jobs/${job._id}`);
      if (res.data.success) {
        setIsSaved(res.data.saved);
        toast.success(res.data.message);
        if (onSaveToggle) onSaveToggle(job._id, res.data.saved);
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card glass-card-hover p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header row: Company logo/initials + Badges + Bookmark button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-12 h-12 rounded-xl object-contain bg-slate-800/80 p-1.5 border border-slate-700/60 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-300 shrink-0">
                {job.companyName?.charAt(0) || 'J'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">{job.companyName}</span>
                {job.isScraped && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    <Globe className="w-2.5 h-2.5" />
                    {job.source || 'Aggregated'}
                  </span>
                )}
              </div>
              <Link to={`/jobs/${job._id}`}>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Bookmark Action */}
          {isCandidate && (
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`p-2 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={isSaved ? 'Saved to bookmarks' : 'Save job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-400' : ''}`} />
            </button>
          )}
        </div>

        {/* Info Tags: Location, Salary, WorkMode */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-300 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {job.location}
          </span>

          <span className="inline-flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80 font-medium text-emerald-300">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            {formatSalary()}
          </span>

          <span className="inline-flex items-center gap-1.5 bg-indigo-950/30 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-800/40 uppercase text-[10px] font-semibold tracking-wider">
            {job.workMode}
          </span>

          <span className="inline-flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80 capitalize text-slate-400">
            {job.employmentType}
          </span>
        </div>

        {/* Description brief */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {(job.skills || []).slice(0, 5).map((skill, index) => (
            <span key={index} className="badge-skill">
              {skill}
            </span>
          ))}
          {(job.skills || []).length > 5 && (
            <span className="text-[10px] text-slate-500 font-medium self-center">
              +{(job.skills || []).length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Area: AI Match Badge + Action Buttons */}
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
        <div>
          {job.aiMatchScore ? (
            <AiMatchBadge score={job.aiMatchScore} rating={job.aiMatchRating} size="sm" />
          ) : (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/jobs/${job._id}`}
            className="text-xs font-medium px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors"
          >
            Details
          </Link>

          {job.isScraped && job.sourceUrl ? (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3.5 py-2 rounded-xl gradient-btn-primary flex items-center gap-1"
            >
              Apply Source
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <button
              onClick={() => (onApplyClick ? onApplyClick(job) : navigate(`/jobs/${job._id}`))}
              className="text-xs font-medium px-3.5 py-2 rounded-xl gradient-btn-primary"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default JobCard;
