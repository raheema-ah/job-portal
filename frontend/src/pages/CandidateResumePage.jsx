import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';

const CandidateResumePage = () => {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resumeInfo, setResumeInfo] = useState({
    url: '',
    filename: '',
    uploadedAt: null,
    size: 0,
  });

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data?.success && res.data.user) {
        const u = res.data.user;
        setResumeInfo({
          url: u.resumeData?.url || u.resume || '',
          filename: u.resumeData?.filename || (u.resume ? 'Active Resume' : ''),
          uploadedAt: u.resumeData?.uploadedAt || null,
          size: u.resumeData?.size || 0,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('resume', file);

    try {
      setUploading(true);
      setErrorMsg('');
      const res = await api.post('/users/upload/resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        const rData = res.data.resumeData;
        setResumeInfo(rData);
        if (updateUser && res.data.user) updateUser(res.data.user);
        setSuccessMsg('Resume uploaded and attached to your profile successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Resume upload failed. Supported: PDF, DOC, DOCX');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume document?')) return;
    try {
      setUploading(true);
      const res = await api.delete('/users/resume');
      if (res.data?.success) {
        setResumeInfo({ url: '', filename: '', uploadedAt: null, size: 0 });
        if (updateUser && res.data.user) updateUser(res.data.user);
        setSuccessMsg('Resume deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to delete resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <RoleLayout
      role="candidate"
      title="Resume"
      subtitle="Upload, view, download, or replace your primary resume for one-click applications."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Resume Card */}
        {resumeInfo.url ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {resumeInfo.filename || 'Primary Resume'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Uploaded on:{' '}
                    <strong className="text-slate-700">
                      {resumeInfo.uploadedAt
                        ? new Date(resumeInfo.uploadedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Active Document'}
                    </strong>
                    {resumeInfo.size > 0 && (
                      <span>• {(resumeInfo.size / (1024 * 1024)).toFixed(2)} MB</span>
                    )}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold self-start sm:self-auto border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready for Applications
              </span>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
              <a
                href={resumeInfo.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Resume
              </a>
              <a
                href={resumeInfo.url}
                download
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Replacing...' : 'Replace Resume'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleDeleteResume}
                disabled={uploading}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          /* Empty Upload Card */
          <div className="bg-white p-10 sm:p-12 rounded-3xl border border-dashed border-blue-200 bg-blue-50/20 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900">Upload Your Resume Document</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Add your current CV to enable rapid one-click job applications and improve ATS keyword screening.
              </p>
              <p className="text-[11px] font-bold text-blue-600 pt-1">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <div className="pt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all">
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Browse & Upload Resume'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
};

export default CandidateResumePage;
