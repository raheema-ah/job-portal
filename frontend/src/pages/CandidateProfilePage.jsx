import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Download,
  Eye,
  Globe,
  Github,
  Linkedin,
  Award,
  Languages,
  Target,
  Clock,
  DollarSign,
  Building2,
  Save,
  ChevronRight,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoleLayout from '../components/RoleLayout';
import { calculateProfileCompletion } from '../utils/profileCompletion';

const tabList = [
  { key: 'basic', label: 'Basic Info', icon: User },
  { key: 'professional', label: 'Professional', icon: Briefcase },
  { key: 'skills', label: 'Skills', icon: Sparkles },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'experience', label: 'Experience', icon: Building2 },
  { key: 'projects', label: 'Projects', icon: Target },
  { key: 'resume', label: 'Resume', icon: FileText },
  { key: 'certifications', label: 'Certificates', icon: Award },
  { key: 'languages', label: 'Languages', icon: Languages },
  { key: 'preferences', label: 'Job Preferences', icon: Target },
];

const CandidateProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'basic';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabList.some((t) => t.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    profilePhoto: '',
    bio: '',
    basicInfo: {
      dob: '',
      gender: '',
      city: '',
      state: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
    },
    professionalInfo: {
      headline: '',
      aboutMe: '',
      totalExperience: '',
      currentJobTitle: '',
      currentCompany: '',
      careerLevel: 'Mid Level',
      expectedSalary: '',
      preferredJobLocation: '',
      preferredWorkMode: 'Remote',
      noticePeriod: '30 Days',
      availability: 'Immediate',
    },
    skills: [],
    categorizedSkills: {
      technical: [],
      languages: [],
      frameworks: [],
      databases: [],
      tools: [],
    },
    educationList: [],
    experienceList: [],
    projectsList: [],
    certificationsList: [],
    languagesList: [],
    jobPreferences: {
      preferredRole: '',
      preferredLocations: [],
      workMode: 'Remote',
      employmentType: 'Full-time',
      expectedSalary: '',
      experienceLevel: 'Mid Level',
    },
    resume: '',
    resumeData: {
      url: '',
      filename: '',
      uploadedAt: null,
      size: 0,
    },
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Skill input state per category
  const [skillInputs, setSkillInputs] = useState({
    technical: '',
    languages: '',
    frameworks: '',
    databases: '',
    tools: '',
  });

  // Modal / Item Form States
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEduIndex, setEditingEduIndex] = useState(null);
  const [eduForm, setEduForm] = useState({
    degree: '',
    specialization: '',
    college: '',
    startYear: '',
    endYear: '',
    cgpa: '',
  });

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [expForm, setExpForm] = useState({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    responsibilities: '',
    technologies: '',
  });

  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProjIndex, setEditingProjIndex] = useState(null);
  const [projForm, setProjForm] = useState({
    name: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
  });

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState(null);
  const [certForm, setCertForm] = useState({
    name: '',
    organization: '',
    issueDate: '',
    certificateUrl: '',
  });

  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langForm, setLangForm] = useState({
    language: '',
    proficiency: 'Fluent',
  });

  // Load User Data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        profilePhoto: user.profilePhoto || user.profileImage || '',
        bio: user.bio || '',
        basicInfo: {
          dob: user.basicInfo?.dob || '',
          gender: user.basicInfo?.gender || '',
          city: user.basicInfo?.city || '',
          state: user.basicInfo?.state || '',
          linkedinUrl: user.basicInfo?.linkedinUrl || '',
          githubUrl: user.basicInfo?.githubUrl || '',
          portfolioUrl: user.basicInfo?.portfolioUrl || '',
        },
        professionalInfo: {
          headline: user.professionalInfo?.headline || '',
          aboutMe: user.professionalInfo?.aboutMe || user.bio || '',
          totalExperience:
            user.professionalInfo?.totalExperience ||
            (user.experienceYears ? `${user.experienceYears} Years` : ''),
          currentJobTitle: user.professionalInfo?.currentJobTitle || '',
          currentCompany: user.professionalInfo?.currentCompany || '',
          careerLevel: user.professionalInfo?.careerLevel || 'Mid Level',
          expectedSalary: user.professionalInfo?.expectedSalary || '',
          preferredJobLocation: user.professionalInfo?.preferredJobLocation || '',
          preferredWorkMode: user.professionalInfo?.preferredWorkMode || 'Remote',
          noticePeriod: user.professionalInfo?.noticePeriod || '30 Days',
          availability: user.professionalInfo?.availability || 'Immediate',
        },
        skills: Array.isArray(user.skills) ? user.skills : [],
        categorizedSkills: {
          technical: user.categorizedSkills?.technical || [],
          languages: user.categorizedSkills?.languages || [],
          frameworks: user.categorizedSkills?.frameworks || [],
          databases: user.categorizedSkills?.databases || [],
          tools: user.categorizedSkills?.tools || [],
        },
        educationList: user.educationList || [],
        experienceList: user.experienceList || [],
        projectsList: user.projectsList || [],
        certificationsList: user.certificationsList || [],
        languagesList: user.languagesList || [],
        jobPreferences: {
          preferredRole: user.jobPreferences?.preferredRole || '',
          preferredLocations: user.jobPreferences?.preferredLocations || [],
          workMode: user.jobPreferences?.workMode || 'Remote',
          employmentType: user.jobPreferences?.employmentType || 'Full-time',
          expectedSalary: user.jobPreferences?.expectedSalary || '',
          experienceLevel: user.jobPreferences?.experienceLevel || 'Mid Level',
        },
        resume: user.resume || '',
        resumeData: {
          url: user.resumeData?.url || user.resume || '',
          filename: user.resumeData?.filename || 'Resume Document',
          uploadedAt: user.resumeData?.uploadedAt || null,
          size: user.resumeData?.size || 0,
        },
      });
    }
  }, [user]);

  // Compute live profile completion
  const completion = calculateProfileCompletion(profileData);

  // Save main profile changes to backend
  const handleSaveProfile = async (customPayload) => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = customPayload || {
        ...profileData,
        skills: [
          ...profileData.skills,
          ...profileData.categorizedSkills.technical,
          ...profileData.categorizedSkills.languages,
          ...profileData.categorizedSkills.frameworks,
          ...profileData.categorizedSkills.databases,
          ...profileData.categorizedSkills.tools,
        ].filter((v, i, a) => a.indexOf(v) === i),
      };

      const res = await api.put('/users/profile', payload);
      if (res.data?.success) {
        setSuccessMsg('Profile updated successfully!');
        if (updateUser && res.data.user) {
          updateUser(res.data.user);
        }
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('photo', file);

    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      const res = await api.post('/users/upload/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        const photoUrl = res.data.photoUrl;
        setProfileData((prev) => ({
          ...prev,
          profilePhoto: photoUrl,
          basicInfo: { ...prev.basicInfo, profilePhoto: photoUrl },
        }));
        if (updateUser && res.data.user) updateUser(res.data.user);
        setSuccessMsg('Profile photo uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Resume Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('resume', file);

    try {
      setUploadingResume(true);
      setErrorMsg('');
      const res = await api.post('/users/upload/resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        const rData = res.data.resumeData;
        setProfileData((prev) => ({
          ...prev,
          resume: rData.url,
          resumeData: rData,
        }));
        if (updateUser && res.data.user) updateUser(res.data.user);
        setSuccessMsg('Resume document uploaded successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Resume upload failed. Support: PDF, DOC, DOCX');
    } finally {
      setUploadingResume(false);
    }
  };

  // Resume Delete
  const handleResumeDelete = async () => {
    if (!window.confirm('Delete uploaded resume?')) return;
    try {
      setUploadingResume(true);
      const res = await api.delete('/users/resume');
      if (res.data?.success) {
        setProfileData((prev) => ({
          ...prev,
          resume: '',
          resumeData: { url: '', filename: '', uploadedAt: null, size: 0 },
        }));
        if (updateUser && res.data.user) updateUser(res.data.user);
        setSuccessMsg('Resume removed successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to remove resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Skill Management
  const addCategorizedSkill = (category) => {
    const val = skillInputs[category].trim();
    if (!val) return;
    if (!profileData.categorizedSkills[category].includes(val)) {
      const updated = {
        ...profileData.categorizedSkills,
        [category]: [...profileData.categorizedSkills[category], val],
      };
      setProfileData((prev) => ({ ...prev, categorizedSkills: updated }));
    }
    setSkillInputs((prev) => ({ ...prev, [category]: '' }));
  };

  const removeCategorizedSkill = (category, item) => {
    const updated = {
      ...profileData.categorizedSkills,
      [category]: profileData.categorizedSkills[category].filter((s) => s !== item),
    };
    setProfileData((prev) => ({ ...prev, categorizedSkills: updated }));
  };

  // Education CRUD
  const saveEducation = () => {
    if (!eduForm.degree || !eduForm.college) {
      alert('Please provide Degree and College name');
      return;
    }
    let updatedList = [...profileData.educationList];
    if (editingEduIndex !== null) {
      updatedList[editingEduIndex] = eduForm;
    } else {
      updatedList.push(eduForm);
    }
    setProfileData((prev) => ({ ...prev, educationList: updatedList }));
    setEduModalOpen(false);
    setEditingEduIndex(null);
    handleSaveProfile({ ...profileData, educationList: updatedList });
  };

  const deleteEducation = (index) => {
    const updatedList = profileData.educationList.filter((_, i) => i !== index);
    setProfileData((prev) => ({ ...prev, educationList: updatedList }));
    handleSaveProfile({ ...profileData, educationList: updatedList });
  };

  // Experience CRUD
  const saveExperience = () => {
    if (!expForm.jobTitle || !expForm.company) {
      alert('Please provide Job Title and Company name');
      return;
    }
    let updatedList = [...profileData.experienceList];
    if (editingExpIndex !== null) {
      updatedList[editingExpIndex] = expForm;
    } else {
      updatedList.push(expForm);
    }
    setProfileData((prev) => ({ ...prev, experienceList: updatedList }));
    setExpModalOpen(false);
    setEditingExpIndex(null);
    handleSaveProfile({ ...profileData, experienceList: updatedList });
  };

  const deleteExperience = (index) => {
    const updatedList = profileData.experienceList.filter((_, i) => i !== index);
    setProfileData((prev) => ({ ...prev, experienceList: updatedList }));
    handleSaveProfile({ ...profileData, experienceList: updatedList });
  };

  // Projects CRUD
  const saveProject = () => {
    if (!projForm.name) {
      alert('Please enter project name');
      return;
    }
    let updatedList = [...profileData.projectsList];
    if (editingProjIndex !== null) {
      updatedList[editingProjIndex] = projForm;
    } else {
      updatedList.push(projForm);
    }
    setProfileData((prev) => ({ ...prev, projectsList: updatedList }));
    setProjModalOpen(false);
    setEditingProjIndex(null);
    handleSaveProfile({ ...profileData, projectsList: updatedList });
  };

  const deleteProject = (index) => {
    const updatedList = profileData.projectsList.filter((_, i) => i !== index);
    setProfileData((prev) => ({ ...prev, projectsList: updatedList }));
    handleSaveProfile({ ...profileData, projectsList: updatedList });
  };

  // Certifications CRUD
  const saveCertification = () => {
    if (!certForm.name) {
      alert('Please provide Certification name');
      return;
    }
    let updatedList = [...profileData.certificationsList];
    if (editingCertIndex !== null) {
      updatedList[editingCertIndex] = certForm;
    } else {
      updatedList.push(certForm);
    }
    setProfileData((prev) => ({ ...prev, certificationsList: updatedList }));
    setCertModalOpen(false);
    setEditingCertIndex(null);
    handleSaveProfile({ ...profileData, certificationsList: updatedList });
  };

  const deleteCertification = (index) => {
    const updatedList = profileData.certificationsList.filter((_, i) => i !== index);
    setProfileData((prev) => ({ ...prev, certificationsList: updatedList }));
    handleSaveProfile({ ...profileData, certificationsList: updatedList });
  };

  // Languages CRUD
  const saveLanguage = () => {
    if (!langForm.language) return;
    const updatedList = [...profileData.languagesList, langForm];
    setProfileData((prev) => ({ ...prev, languagesList: updatedList }));
    setLangModalOpen(false);
    setLangForm({ language: '', proficiency: 'Fluent' });
    handleSaveProfile({ ...profileData, languagesList: updatedList });
  };

  const deleteLanguage = (index) => {
    const updatedList = profileData.languagesList.filter((_, i) => i !== index);
    setProfileData((prev) => ({ ...prev, languagesList: updatedList }));
    handleSaveProfile({ ...profileData, languagesList: updatedList });
  };

  return (
    <RoleLayout
      role="candidate"
      title="My Profile"
      subtitle="Complete your profile details to boost match accuracy and recruiter visibility."
      actions={
        <button
          onClick={() => handleSaveProfile()}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Profile Completion Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {profileData.profilePhoto ? (
                  <img
                    src={profileData.profilePhoto}
                    alt="Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20">
                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <label className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-blue-600 text-white rounded-xl shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {profileData.name || 'Candidate Name'}
                </h2>
                <p className="text-xs text-blue-600 font-bold mt-0.5">
                  {profileData.professionalInfo.headline || 'Add your professional headline'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {profileData.email} • {profileData.phone || 'Phone not set'}
                </p>
              </div>
            </div>

            {/* Live Progress Bar Widget */}
            <div className="sm:text-right min-w-[220px]">
              <div className="flex items-center justify-between sm:justify-end gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-600">Profile Completion:</span>
                <span className="text-sm font-black text-blue-600">{completion.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {completion.completedCount} of {completion.totalSections} sections completed
              </p>
            </div>
          </div>

          {/* Missing Section Warning Banner */}
          {completion.percentage < 100 && completion.firstIncompleteSection && (
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <p className="text-amber-800 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Complete your profile to increase your chances of getting shortlisted.
              </p>
              <button
                onClick={() => switchTab(completion.firstIncompleteSection.tabKey)}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[11px] transition-colors"
              >
                Complete {completion.firstIncompleteSection.name} →
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none text-xs">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.key;
            const secInfo = completion.sections.find((s) => s.tabKey === tab.key);

            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {secInfo?.completed && (
                  <CheckCircle2
                    className={`w-3 h-3 ${isTabActive ? 'text-blue-200' : 'text-emerald-500'}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* ================= 1. BASIC INFORMATION ================= */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Basic Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Personal details, contact numbers, and social web links.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={profileData.basicInfo.dob}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        basicInfo: { ...profileData.basicInfo, dob: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Gender (Optional)</label>
                  <select
                    value={profileData.basicInfo.gender}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        basicInfo: { ...profileData.basicInfo, gender: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco"
                    value={profileData.basicInfo.city || profileData.location}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                        basicInfo: { ...profileData.basicInfo, city: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">State / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. California"
                    value={profileData.basicInfo.state}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        basicInfo: { ...profileData.basicInfo, state: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={profileData.basicInfo.linkedinUrl}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          basicInfo: { ...profileData.basicInfo, linkedinUrl: e.target.value },
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">GitHub Profile</label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileData.basicInfo.githubUrl}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          basicInfo: { ...profileData.basicInfo, githubUrl: e.target.value },
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Portfolio / Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={profileData.basicInfo.portfolioUrl}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          basicInfo: { ...profileData.basicInfo, portfolioUrl: e.target.value },
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSaveProfile()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Basic Info
                </button>
              </div>
            </div>
          )}

          {/* ================= 2. PROFESSIONAL INFORMATION ================= */}
          {activeTab === 'professional' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Professional Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summarize your career, experience level, current role, and work expectations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer | React & TypeScript Enthusiast"
                    value={profileData.professionalInfo.headline}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          headline: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1.5">About Me / Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly introduce yourself, your passions, projects, and what drives you..."
                    value={profileData.professionalInfo.aboutMe || profileData.bio}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        bio: e.target.value,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          aboutMe: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Total Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Years 6 Months"
                    value={profileData.professionalInfo.totalExperience}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          totalExperience: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Current Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={profileData.professionalInfo.currentJobTitle}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          currentJobTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Current Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={profileData.professionalInfo.currentCompany}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          currentCompany: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Career Level</label>
                  <select
                    value={profileData.professionalInfo.careerLevel}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          careerLevel: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Manager">Lead / Manager</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Expected Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. $120,000 / year"
                    value={profileData.professionalInfo.expectedSalary}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          expectedSalary: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Preferred Work Mode
                  </label>
                  <select
                    value={profileData.professionalInfo.preferredWorkMode}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          preferredWorkMode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Notice Period</label>
                  <select
                    value={profileData.professionalInfo.noticePeriod}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          noticePeriod: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Availability</label>
                  <select
                    value={profileData.professionalInfo.availability}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        professionalInfo: {
                          ...profileData.professionalInfo,
                          availability: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Within 2 Weeks">Within 2 Weeks</option>
                    <option value="Within 1 Month">Within 1 Month</option>
                    <option value="More than 1 Month">More than 1 Month</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSaveProfile()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Professional Info
                </button>
              </div>
            </div>
          )}

          {/* ================= 3. SKILLS (CATEGORIZED & CHIPS) ================= */}
          {activeTab === 'skills' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Skills & Tech Stack</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add your proficiencies across programming languages, frameworks, and tools.
                </p>
              </div>

              {[
                { key: 'technical', label: 'Technical Skills', placeholder: 'e.g. System Design, REST APIs, CI/CD' },
                { key: 'languages', label: 'Programming Languages', placeholder: 'e.g. JavaScript, Python, Go, TypeScript' },
                { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'e.g. React, Node.js, Next.js, Express' },
                { key: 'databases', label: 'Databases', placeholder: 'e.g. MongoDB, PostgreSQL, Redis' },
                { key: 'tools', label: 'Tools & Technologies', placeholder: 'e.g. Docker, AWS, Git, Kubernetes' },
              ].map((cat) => (
                <div key={cat.key} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs">{cat.label}</label>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {profileData.categorizedSkills[cat.key]?.length || 0} skills added
                    </span>
                  </div>

                  {/* Input with Add button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={cat.placeholder}
                      value={skillInputs[cat.key]}
                      onChange={(e) =>
                        setSkillInputs({ ...skillInputs, [cat.key]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategorizedSkill(cat.key);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => addCategorizedSkill(cat.key)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(profileData.categorizedSkills[cat.key] || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeCategorizedSkill(cat.key, skill)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(profileData.categorizedSkills[cat.key] || []).length === 0 && (
                      <span className="text-slate-400 text-[11px] italic">No skills added yet</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSaveProfile()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Skills
                </button>
              </div>
            </div>
          )}

          {/* ================= 4. EDUCATION ================= */}
          {activeTab === 'education' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Education History</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Degrees, colleges, and academic performance.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingEduIndex(null);
                    setEduForm({
                      degree: '',
                      specialization: '',
                      college: '',
                      startYear: '',
                      endYear: '',
                      cgpa: '',
                    });
                    setEduModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>

              {profileData.educationList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No education records added</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Click "Add Education" above to list your college or university degree.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.educationList.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{edu.degree}</h4>
                          <p className="font-bold text-blue-600 mt-0.5">{edu.specialization}</p>
                          <p className="text-slate-600 mt-1 font-medium">{edu.college}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            {edu.startYear} - {edu.endYear || 'Present'} • GPA/Score: {edu.cgpa || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingEduIndex(idx);
                            setEduForm(edu);
                            setEduModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteEducation(idx)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 5. WORK EXPERIENCE ================= */}
          {activeTab === 'experience' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Work Experience</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Employment records, job responsibilities, and achievements.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingExpIndex(null);
                    setExpForm({
                      jobTitle: '',
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      currentlyWorking: false,
                      responsibilities: '',
                      technologies: '',
                    });
                    setExpModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>

              {profileData.experienceList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No work experience added</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Click "Add Experience" above to highlight your past roles and companies.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.experienceList.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 text-sm">{exp.jobTitle}</h4>
                          <p className="font-bold text-indigo-600">
                            {exp.company} • {exp.location || 'Remote'}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {exp.startDate} – {exp.currentlyWorking ? 'Currently Working' : exp.endDate || 'Present'}
                          </p>
                          {exp.responsibilities && (
                            <p className="text-slate-600 pt-1 leading-relaxed whitespace-pre-wrap font-normal">
                              {exp.responsibilities}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingExpIndex(idx);
                            setExpForm(exp);
                            setExpModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteExperience(idx)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 6. PROJECTS ================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Projects & Portfolio</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showcase key applications, open source work, and technical projects.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProjIndex(null);
                    setProjForm({
                      name: '',
                      description: '',
                      technologies: '',
                      projectUrl: '',
                      githubUrl: '',
                    });
                    setProjModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>

              {profileData.projectsList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No projects added</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Add projects you built with links and technologies used.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.projectsList.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-extrabold text-slate-900 text-sm">{proj.name}</h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProjIndex(idx);
                                setProjForm(proj);
                                setProjModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProject(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed font-normal">
                          {proj.description}
                        </p>

                        {proj.technologies && (
                          <p className="text-[11px] text-blue-700 font-semibold">
                            Tech: {proj.technologies}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                          >
                            Live Demo <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-slate-700 font-bold hover:underline"
                          >
                            <Github className="w-3 h-3" /> GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 7. RESUME ================= */}
          {activeTab === 'resume' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Resume & CV</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload, preview, download, or replace your resume document. Supported formats: PDF, DOC, DOCX.
                </p>
              </div>

              {profileData.resumeData?.url || profileData.resume ? (
                <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {profileData.resumeData?.filename || 'Uploaded Resume'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Uploaded on:{' '}
                        {profileData.resumeData?.uploadedAt
                          ? new Date(profileData.resumeData.uploadedAt).toLocaleDateString()
                          : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={profileData.resumeData?.url || profileData.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      View
                    </a>
                    <a
                      href={profileData.resumeData?.url || profileData.resume}
                      download
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      Download
                    </a>
                    <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingResume ? 'Replacing...' : 'Replace'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleResumeDelete}
                      className="px-3.5 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Upload Your Resume</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                      Supported formats: PDF, DOC, DOCX (Max 10MB). Recruiters evaluate resumes for shortlisting.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    {uploadingResume ? 'Uploading...' : 'Browse & Upload'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* ================= 8. CERTIFICATIONS ================= */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Certifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accreditations, professional licenses, and verified skill certificates.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCertIndex(null);
                    setCertForm({
                      name: '',
                      organization: '',
                      issueDate: '',
                      certificateUrl: '',
                    });
                    setCertModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Certificate
                </button>
              </div>

              {profileData.certificationsList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No certifications added</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Add certificates from AWS, Google, Coursera, Meta, etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.certificationsList.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{cert.name}</h4>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {cert.organization} • {cert.issueDate || 'Issued'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {cert.certificateUrl && (
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-blue-600 hover:bg-white rounded-xl transition-colors"
                            title="Open Certificate Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setEditingCertIndex(idx);
                            setCertForm(cert);
                            setCertModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCertification(idx)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-white rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 9. LANGUAGES ================= */}
          {activeTab === 'languages' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Languages</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Spoken languages and conversational fluency levels.
                  </p>
                </div>
                <button
                  onClick={() => setLangModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Language
                </button>
              </div>

              {profileData.languagesList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <Languages className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No languages listed</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    List languages you speak and your proficiency level.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profileData.languagesList.map((lang, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{lang.language}</h4>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold text-[10px]">
                          {lang.proficiency}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteLanguage(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 10. JOB PREFERENCES ================= */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Job Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set target positions, preferred locations, work mode, and compensation requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Preferred Job Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer, DevOps Engineer"
                    value={profileData.jobPreferences.preferredRole}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobPreferences: {
                          ...profileData.jobPreferences,
                          preferredRole: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Preferred Locations
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, New York, Remote"
                    value={
                      Array.isArray(profileData.jobPreferences.preferredLocations)
                        ? profileData.jobPreferences.preferredLocations.join(', ')
                        : profileData.jobPreferences.preferredLocations
                    }
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobPreferences: {
                          ...profileData.jobPreferences,
                          preferredLocations: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Work Mode</label>
                  <select
                    value={profileData.jobPreferences.workMode}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobPreferences: {
                          ...profileData.jobPreferences,
                          workMode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Employment Type</label>
                  <select
                    value={profileData.jobPreferences.employmentType}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobPreferences: {
                          ...profileData.jobPreferences,
                          employmentType: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Expected Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. $120,000 / year"
                    value={profileData.jobPreferences.expectedSalary}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobPreferences: {
                          ...profileData.jobPreferences,
                          expectedSalary: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Experience Level</label>
                  <select
                    value={profileData.jobPreferences.experienceLevel}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        jobPreferences: {
                          ...profileData.jobPreferences,
                          experienceLevel: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSaveProfile()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Job Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Education Modal */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in duration-150">
            <h3 className="font-extrabold text-sm text-slate-900">
              {editingEduIndex !== null ? 'Edit Education' : 'Add Education Record'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Degree <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Science"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialization / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={eduForm.specialization}
                  onChange={(e) => setEduForm({ ...eduForm, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  College / University <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={eduForm.college}
                  onChange={(e) => setEduForm({ ...eduForm, college: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Year</label>
                  <input
                    type="text"
                    placeholder="2020"
                    value={eduForm.startYear}
                    onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Year</label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={eduForm.endYear}
                    onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CGPA / %</label>
                  <input
                    type="text"
                    placeholder="3.8 / 4.0"
                    value={eduForm.cgpa}
                    onChange={(e) => setEduForm({ ...eduForm, cgpa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEduModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEducation}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in duration-150">
            <h3 className="font-extrabold text-sm text-slate-900">
              {editingExpIndex !== null ? 'Edit Experience' : 'Add Experience Record'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={expForm.jobTitle}
                    onChange={(e) => setExpForm({ ...expForm, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mountain View, CA or Remote"
                  value={expForm.location}
                  onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="month"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="month"
                    disabled={expForm.currentlyWorking}
                    value={expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl ${
                      expForm.currentlyWorking ? 'opacity-40 cursor-not-allowed bg-slate-100' : ''
                    }`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={expForm.currentlyWorking}
                  onChange={(e) =>
                    setExpForm({
                      ...expForm,
                      currentlyWorking: e.target.checked,
                      endDate: e.target.checked ? '' : expForm.endDate,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-bold text-slate-800">I am currently working here</span>
              </label>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsibilities</label>
                <textarea
                  rows={3}
                  placeholder="Describe your role, accomplishments, and team impact..."
                  value={expForm.responsibilities}
                  onChange={(e) => setExpForm({ ...expForm, responsibilities: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technologies Used</label>
                <input
                  type="text"
                  placeholder="e.g. React, Redux, Tailwind, Jest"
                  value={expForm.technologies}
                  onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveExperience}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {projModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in duration-150">
            <h3 className="font-extrabold text-sm text-slate-900">
              {editingProjIndex !== null ? 'Edit Project' : 'Add Project'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. E-Commerce Microservices Platform"
                  value={projForm.name}
                  onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what you built, architecture, and problem solved..."
                  value={projForm.description}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technologies Used</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, Stripe, MongoDB"
                  value={projForm.technologies}
                  onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Live URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projForm.projectUrl}
                    onChange={(e) => setProjForm({ ...projForm, projectUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub Repo</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projForm.githubUrl}
                    onChange={(e) => setProjForm({ ...projForm, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProjModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProject}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certifications Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in duration-150">
            <h3 className="font-extrabold text-sm text-slate-900">
              {editingCertIndex !== null ? 'Edit Certification' : 'Add Certification'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Certificate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services"
                  value={certForm.organization}
                  onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="month"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Certificate URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={certForm.certificateUrl}
                    onChange={(e) => setCertForm({ ...certForm, certificateUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCertification}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs"
              >
                Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Languages Modal */}
      {langModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in fade-in zoom-in duration-150">
            <h3 className="font-extrabold text-sm text-slate-900">Add Language</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Language <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Spanish, German"
                  value={langForm.language}
                  onChange={(e) => setLangForm({ ...langForm, language: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={langForm.proficiency}
                  onChange={(e) => setLangForm({ ...langForm, proficiency: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLangModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveLanguage}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs"
              >
                Add Language
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
};

export default CandidateProfilePage;
