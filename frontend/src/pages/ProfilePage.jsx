import React, { useState } from 'react';
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  FileText,
  UploadCloud,
  CheckCircle2,
  Building2,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateUserProfile, isEmployer, isCandidate } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [education, setEducation] = useState(user?.education || '');
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 0);
  const [resumeText, setResumeText] = useState(user?.resumeText || '');
  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('title', title);
      formData.append('bio', bio);
      formData.append('phone', phone);
      formData.append('location', location);
      formData.append('education', education);
      formData.append('experienceYears', experienceYears);
      formData.append('skills', skills);
      formData.append('resumeText', resumeText);

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        updateUserProfile(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-2xl text-indigo-400">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider capitalize">
              {user?.role} Profile
            </span>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 border-slate-800 space-y-6 text-xs">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white">Personal & Contact Details</h2>
          <p className="text-slate-400 mt-0.5">Keep your professional credentials up to date</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Professional Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Full Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="glass-input w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Location</label>
            <input
              type="text"
              placeholder="Seattle, WA / Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-300">Professional Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief summary of your background, passions, and achievements..."
            className="glass-input w-full"
          />
        </div>

        {isCandidate && (
          <>
            <div className="border-b border-slate-800 pb-4 pt-2">
              <h2 className="text-base font-bold text-white">Skills & Resume for AI Scoring</h2>
              <p className="text-slate-400 mt-0.5">Used by our AI engine to calculate job match ratings</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-300">Key Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, Express, MongoDB, Docker, AWS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="glass-input w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Years Experience</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="glass-input w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Education Details</label>
              <input
                type="text"
                placeholder="B.S. in Computer Science - University of Washington"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            {/* Resume Upload Box */}
            <div className="space-y-2 pt-2">
              <label className="font-semibold text-slate-300 block">Resume Attachment</label>
              
              {user?.resumeUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 mb-2">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <FileText className="w-4 h-4" />
                    <span>Current: {user.resumeOriginalName || 'Resume.pdf'}</span>
                  </div>
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    View File <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 text-center bg-slate-950/30">
                <input
                  type="file"
                  id="profileResume"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="profileResume" className="cursor-pointer flex flex-col items-center gap-2">
                  <UploadCloud className="w-7 h-7 text-indigo-400" />
                  <span className="font-medium text-slate-200">
                    {resumeFile ? resumeFile.name : 'Upload updated resume (PDF, DOCX)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Resume Plaintext / Project Details</label>
              <textarea
                rows={4}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Optional plaintext resume representation for highest accuracy AI matching..."
                className="glass-input w-full font-mono"
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="gradient-btn-primary flex items-center gap-2 !py-2.5 !px-6 font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProfilePage;
