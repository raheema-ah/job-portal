import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ApplyModal = ({ job, isOpen, onClose, onAppliedSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(!!user?.resumeUrl);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useProfileResume && !resumeFile && !user?.resumeUrl) {
      toast.error('Please upload your resume file to apply.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await api.post(`/jobs/${job._id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Application submitted successfully!');
        if (onAppliedSuccess) onAppliedSuccess(res.data.application);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 relative border-slate-700 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Job Application
          </span>
          <h2 className="text-xl font-bold text-white mt-1 line-clamp-1">{job.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{job.companyName} • {job.location}</p>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Resume Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Your Resume / CV <span className="text-rose-400">*</span>
            </label>

            {user?.resumeUrl && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <input
                  type="checkbox"
                  id="useExisting"
                  checked={useProfileResume}
                  onChange={(e) => {
                    setUseProfileResume(e.target.checked);
                    if (e.target.checked) setResumeFile(null);
                  }}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="useExisting" className="text-slate-300 flex-1 cursor-pointer flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Use saved profile resume ({user.resumeOriginalName || 'Resume.pdf'})
                </label>
              </div>
            )}

            {(!useProfileResume || !user?.resumeUrl) && (
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 text-center bg-slate-950/40 transition-colors">
                <input
                  type="file"
                  id="resumeUpload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="resumeUpload" className="cursor-pointer flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-indigo-400" />
                  <span className="text-xs font-medium text-slate-200">
                    {resumeFile ? resumeFile.name : 'Click to upload resume (PDF, DOCX)'}
                  </span>
                  <span className="text-[10px] text-slate-500">Max file size 10MB</span>
                </label>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Cover Note / Introduction (Optional)
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you are a great fit for this position..."
              className="glass-input w-full text-xs"
            />
          </div>

          {/* AI Match notice */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Your skills and experience will be automatically benchmarked with AI to highlight your top qualifications to the hiring manager.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="gradient-btn-primary flex items-center gap-2 text-xs font-medium !py-2.5 !px-5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Submit
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ApplyModal;
