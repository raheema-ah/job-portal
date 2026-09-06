import React from 'react';
import { ExternalLink, Building2, Globe, ArrowRight, ShieldCheck, X } from 'lucide-react';
import api from '../services/api';
import { getExternalApplyUrl, getJobSourceLabel } from '../utils/applyHelper';

const ExternalApplyModal = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  const targetUrl = getExternalApplyUrl(job);
  const sourceName = getJobSourceLabel(job);
  const companyName = job.company || job.companyName || 'the Hiring Company';

  const handleProceed = async () => {
    try {
      // Track external click analytics
      await api.post(`/jobs/${job._id}/track-click`);
    } catch {
      // Silently continue to redirect even if analytics ping fails
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              External Application
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-1">
              Apply on Company Website
            </h3>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950 text-xs font-semibold space-y-1">
          <p className="flex items-center gap-1.5 font-extrabold text-indigo-900">
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            Redirect Notification
          </p>
          <p className="text-slate-600 leading-relaxed font-normal">
            You are being redirected to the company's website to complete your application.
          </p>
        </div>

        {/* Job Details Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Position</span>
            <span className="font-bold text-slate-900">{job.title}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
            <span className="text-slate-500 font-medium">Company</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {companyName}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
            <span className="text-slate-500 font-medium">Careers Site</span>
            <span className="font-bold text-indigo-600">{sourceName}</span>
          </div>
        </div>

        {/* Security / Privacy notice */}
        <div className="flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-200/50">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            You will complete your application directly on <strong>{companyName}</strong>'s official career portal. No application record is stored locally without external callback.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleProceed}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all"
          >
            <span>Apply on {sourceName}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExternalApplyModal;
