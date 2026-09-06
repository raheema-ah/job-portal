import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building,
  BadgePercent,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Marketing & Growth',
  'Sales & Business Dev',
  'Human Resources',
  'Customer Success',
  'Finance & Operations',
];

const SUGGESTED_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'Tailwind CSS',
  'MongoDB',
  'Docker',
  'AWS',
  'SQL',
  'UI/UX Design',
];

const RegisterForm = ({ role = 'candidate', onSwitchToLogin }) => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
    companyName: '',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    // Common fields
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role specific validations
    if (role === 'employee') {
      if (!formData.employeeId.trim()) {
        newErrors.employeeId = 'Employee ID is required (e.g. EMP-2026-001)';
      }
      if (!formData.department.trim()) {
        newErrors.department = 'Please select your department';
      }
    }

    if (role === 'candidate') {
      if (skills.length === 0 && !skillInput.trim()) {
        newErrors.skills = 'Please add at least one skill';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  // Skill tag management
  const addSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: '' }));
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  // Resume file handling
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: 'File size must be under 10MB' }));
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
    if (errors.resume) {
      setErrors((prev) => ({ ...prev, resume: '' }));
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    // If there's an un-added skill in input, add it
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      skills.push(skillInput.trim());
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let resumeUrl = '';

      // Upload resume if selected
      if (role === 'candidate' && resumeFile) {
        setUploadingResume(true);
        try {
          const uploadRes = await authService.uploadResume(resumeFile);
          if (uploadRes.success && uploadRes.fileUrl) {
            resumeUrl = uploadRes.fileUrl;
          }
        } catch (uploadErr) {
          console.warn('Resume direct upload fallback to local name:', uploadErr.message);
          resumeUrl = `/uploads/${resumeFile.name}`;
        } finally {
          setUploadingResume(false);
        }
      }

      // Payload construction
      const payload = {
        role,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        employeeId: role === 'employee' ? formData.employeeId.trim() : undefined,
        department: role === 'employee' ? formData.department.trim() : undefined,
        companyName: role === 'admin' ? (formData.companyName || 'Corporate Admin') : undefined,
        skills: role === 'candidate' ? skills : undefined,
        resume: role === 'candidate' ? resumeUrl : undefined,
      };

      const user = await register(payload);
      setSuccessMessage('Registration successful! Redirecting to your dashboard...');

      // Redirect to correct dashboard after a brief moment
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'employee') {
          navigate('/employee/dashboard', { replace: true });
        } else {
          navigate('/candidate/dashboard', { replace: true });
        }
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please review your details.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'admin':
        return 'Admin';
      case 'employee':
        return 'Employee';
      default:
        return 'Candidate';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">

      {/* Error Alert Banner */}
      {apiError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Field: Full Name */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-name">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <input
            id="reg-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={loading}
            className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${errors.name ? 'border-rose-400 focus:border-rose-500' : ''}`}
          />
        </div>
        {errors.name && <p className="text-[10px] text-rose-500 font-medium">{errors.name}</p>}
      </div>

      {/* EMPLOYEE SPECIFIC: Employee ID */}
      {role === 'employee' && (
        <div className="space-y-1 animate-fadeIn">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-emp-id">
            Employee ID <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BadgePercent className="w-3.5 h-3.5" />
            </div>
            <input
              id="reg-emp-id"
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="EMP-2026-001"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.employeeId ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
          </div>
          {errors.employeeId && (
            <p className="text-[10px] text-rose-500 font-medium">{errors.employeeId}</p>
          )}
        </div>
      )}

      {/* Two Columns: Email and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Email */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-email">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@email.com"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.email ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
          </div>
          {errors.email && <p className="text-[10px] text-rose-500 font-medium">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-phone">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.phone ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
          </div>
          {errors.phone && <p className="text-[10px] text-rose-500 font-medium">{errors.phone}</p>}
        </div>
      </div>

      {/* EMPLOYEE SPECIFIC: Department */}
      {role === 'employee' && (
        <div className="space-y-1 animate-fadeIn">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-dept">
            Department <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building className="w-3.5 h-3.5" />
            </div>
            <select
              id="reg-dept"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs appearance-none text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.department ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            >
              <option value="">Select Department...</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          {errors.department && (
            <p className="text-[10px] text-rose-500 font-medium">{errors.department}</p>
          )}
        </div>
      )}

      {/* CANDIDATE SPECIFIC: Skills & Resume */}
      {role === 'candidate' && (
        <div className="space-y-2.5 animate-fadeIn pt-0.5">
          {/* Skills Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-700">
                Key Skills <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Press Enter or + to add</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React, Node.js, Python..."
                disabled={loading}
                className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                  errors.skills ? 'border-rose-400 focus:border-rose-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => addSkill()}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors flex-shrink-0"
              >
                + Add
              </button>
            </div>

            {/* Selected Skills Tags */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-fadeIn"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-500 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Skill Chips */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-500" /> Popular:
              </span>
              {SUGGESTED_SKILLS.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition-colors"
                >
                  +{s}
                </button>
              ))}
            </div>
            {errors.skills && <p className="text-[10px] text-rose-500 font-medium">{errors.skills}</p>}
          </div>

          {/* Resume Upload */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700">
              Resume Upload (PDF, DOCX, TXT)
            </label>

            {resumeFileName ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-xs">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-blue-900 truncate text-xs">{resumeFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={removeResume}
                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="resume-upload-input"
                className="border border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
              >
                <UploadCloud className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">
                  Click to upload resume <span className="text-[10px] text-slate-400">(PDF, DOCX up to 10MB)</span>
                </span>
                <input
                  id="resume-upload-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.resume && <p className="text-[10px] text-rose-500 font-medium">{errors.resume}</p>}
          </div>
        </div>
      )}

      {/* Two Columns: Password and Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Password */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-password">
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 chars"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.password ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-rose-500 font-medium">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="reg-confirm-password">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              disabled={loading}
              className={`w-full bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all ${
                errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] text-rose-500 font-medium">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="register-submit-btn"
        disabled={loading || uploadingResume}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all text-xs inline-flex items-center justify-center gap-1.5"
      >
        {loading || uploadingResume ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>
              {uploadingResume ? 'Uploading Resume...' : 'Creating Account...'}
            </span>
          </>
        ) : (
          <>
            <span>Create {getRoleDisplayName(role)} Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* Switch to Login footer */}
      {onSwitchToLogin && (
        <div className="text-center pt-1">
          <p className="text-[11px] text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline ml-0.5"
            >
              Sign In here
            </button>
          </p>
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
