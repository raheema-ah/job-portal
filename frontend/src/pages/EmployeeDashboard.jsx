import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building,
  BadgePercent,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Sparkles,
  TrendingUp,
  FileText,
  User,
  LogOut,
  ArrowRight,
  Share2,
  Gift,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'referrals' | 'team'
  const [internalJobs, setInternalJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralSuccess, setReferralSuccess] = useState('');

  const [referralForm, setReferralForm] = useState({
    candidateName: '',
    candidateEmail: '',
    jobTitle: 'Senior Full Stack React & Node Engineer',
    note: '',
  });

  useEffect(() => {
    const fetchInternalJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/jobs');
        if (res.data.success) {
          setInternalJobs(res.data.jobs || []);
        }
      } catch (err) {
        console.warn('Could not fetch jobs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInternalJobs();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    if (!referralForm.candidateName || !referralForm.candidateEmail) return;

    setReferralSuccess(`Referral for ${referralForm.candidateName} submitted! HR will review within 48 hours.`);
    setReferralForm({
      candidateName: '',
      candidateEmail: '',
      jobTitle: 'Senior Full Stack React & Node Engineer',
      note: '',
    });
    setTimeout(() => setReferralSuccess(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ================= Header Banner ================= */}
      <div className="clean-card p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                Employee Workspace
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/15">
                ID: {user?.employeeId || 'EMP-2026-001'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Team Member'} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              Department:{' '}
              <span className="font-bold text-white">
                {user?.department || 'Engineering & Technology'}
              </span>{' '}
              • Manage your internal projects, submit candidate referrals, and explore cross-functional opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('referrals')}
              className="btn-gradient text-xs !py-2.5 !px-4 flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>Submit Referral ($2,000 Bonus)</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= Metrics Summary ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clean-card p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Employee ID</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BadgePercent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{user?.employeeId || 'EMP-2026-001'}</p>
          <p className="text-[11px] text-slate-400">Verified Internal Staff</p>
        </div>

        <div className="clean-card p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Department</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 truncate">{user?.department || 'Engineering'}</p>
          <p className="text-[11px] text-slate-400">Primary Assignment</p>
        </div>

        <div className="clean-card p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Internal Openings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{internalJobs.length || 8}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Eligible for Referral Bonus</p>
        </div>

        <div className="clean-card p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Leave / PTO Balance</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">18 Days</p>
          <p className="text-[11px] text-slate-400">Annual remaining leave</p>
        </div>
      </div>

      {/* ================= Navigation Tabs ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Internal Openings ({internalJobs.length || 8})</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'referrals'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Candidate Referral Portal</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'team'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Department Team Directory</span>
        </button>
      </div>

      {/* ================= TAB 1: Internal Openings ================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Openings List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-bold text-slate-900">Featured Open Internal Roles</h2>
              <span className="text-xs text-slate-500">Apply internally or refer peers</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="clean-card p-6 h-24 animate-pulse bg-slate-100" />
                ))}
              </div>
            ) : internalJobs.length === 0 ? (
              <div className="clean-card p-8 text-center text-slate-400 text-sm">
                No active internal jobs at the moment.
              </div>
            ) : (
              <div className="space-y-3">
                {internalJobs.slice(0, 6).map((job) => (
                  <div
                    key={job._id}
                    className="clean-card p-5 bg-white clean-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {job.workMode || 'Full-time'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">{job.location}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {job.companyName || 'Internal Tech Division'} • Salary: $
                        {job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k` : 'Competitive'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setReferralForm((prev) => ({ ...prev, jobTitle: job.title }));
                          setActiveTab('referrals');
                        }}
                        className="btn-secondary text-xs !py-2 !px-3"
                      >
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Refer Someone</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Department Bulletin & Employee Card */}
          <div className="lg:col-span-4 space-y-5">
            {/* Employee ID Profile Card */}
            <div className="clean-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg">
                  {user?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{user?.name}</h4>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Employee ID:</span>
                  <span className="font-bold text-slate-800">{user?.employeeId || 'EMP-2026-001'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-bold text-slate-800">{user?.department || 'Engineering'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-bold text-slate-800">{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active Full-Time
                  </span>
                </div>
              </div>
            </div>

            {/* Department Announcements */}
            <div className="clean-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Department Announcements</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Q3 Hackathon</span>
                  <p className="font-bold text-slate-800 text-xs">Internal AI Agent Hackathon Announced!</p>
                  <p className="text-slate-500 text-[11px]">Register teams before Friday for prize pool of $10,000.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">HR Update</span>
                  <p className="font-bold text-slate-800 text-xs">Wellness Stipend Reimbursements Active</p>
                  <p className="text-slate-500 text-[11px]">Submit fitness & home office invoices via portal.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: Candidate Referral Portal ================= */}
      {activeTab === 'referrals' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="clean-card p-6 sm:p-8 bg-white space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <Gift className="w-3.5 h-3.5" /> Earn up to $2,000 Referral Bonus per hire
              </div>
              <h2 className="text-xl font-bold text-slate-900">Refer a Qualified Candidate</h2>
              <p className="text-xs text-slate-500">
                Help your team grow by submitting top engineers and designers directly to hiring managers.
              </p>
            </div>

            {referralSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{referralSuccess}</span>
              </div>
            )}

            <form onSubmit={handleReferralSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={referralForm.candidateName}
                    onChange={(e) =>
                      setReferralForm((prev) => ({ ...prev, candidateName: e.target.value }))
                    }
                    placeholder="Candidate Name"
                    className="form-input text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Candidate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={referralForm.candidateEmail}
                    onChange={(e) =>
                      setReferralForm((prev) => ({ ...prev, candidateEmail: e.target.value }))
                    }
                    placeholder="candidate@email.com"
                    className="form-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Target Job Opening *</label>
                <select
                  value={referralForm.jobTitle}
                  onChange={(e) =>
                    setReferralForm((prev) => ({ ...prev, jobTitle: e.target.value }))
                  }
                  className="form-input text-sm"
                >
                  <option value="Senior Full Stack React & Node Engineer">
                    Senior Full Stack React & Node Engineer
                  </option>
                  <option value="Generative AI & LLM Systems Architect">
                    Generative AI & LLM Systems Architect
                  </option>
                  <option value="Lead DevOps & Cloud Platform Engineer">
                    Lead DevOps & Cloud Platform Engineer
                  </option>
                  <option value="Frontend React UI/UX Developer">
                    Frontend React UI/UX Developer
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Why are they a great fit? (Optional note for HR)
                </label>
                <textarea
                  rows={3}
                  value={referralForm.note}
                  onChange={(e) =>
                    setReferralForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="I worked with them previously at... They specialize in..."
                  className="form-input text-sm"
                />
              </div>

              <button type="submit" className="w-full btn-gradient py-3 text-sm font-bold">
                <Send className="w-4 h-4" /> Submit Employee Referral
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: Team Directory ================= */}
      {activeTab === 'team' && (
        <div className="clean-card p-6 sm:p-8 bg-white space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user?.department || 'Engineering'} Department Roster
              </h2>
              <p className="text-xs text-slate-500">Colleagues and leadership in your division</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                name: user?.name || 'You',
                role: 'Senior Software Engineer',
                email: user?.email,
                id: user?.employeeId || 'EMP-2026-001',
                badge: 'You',
              },
              {
                name: 'Marcus Brody',
                role: 'Engineering Director',
                email: 'marcus@innovatelabs.io',
                id: 'EMP-2026-004',
                badge: 'Manager',
              },
              {
                name: 'Sarah Connor',
                role: 'Platform Operations Admin',
                email: 'admin@jobportal.com',
                id: 'EMP-2026-002',
                badge: 'Admin',
              },
              {
                name: 'Alex Vance',
                role: 'Talent Acquisition Partner',
                email: 'alex@techcorp.com',
                id: 'EMP-2026-003',
                badge: 'HR Partner',
              },
            ].map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {member.badge}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{member.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1">ID: {member.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDashboard;
