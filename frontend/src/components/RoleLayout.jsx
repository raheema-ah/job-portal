import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  User,
  FileCode,
  Bell,
  Settings,
  LogOut,
  PlusCircle,
  Users,
  Building2,
  BarChart3,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  CheckCircle2,
  ShieldCheck,
  Building,
} from 'lucide-react';

const RoleLayout = ({ role, title, subtitle, children, actions }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Define sidebar navigation items based on role
  let navItems = [];

  if (role === 'candidate') {
    navItems = [
      { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
      { name: 'Browse Jobs', path: '/candidate/jobs', icon: Search },
      { name: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
      { name: 'My Applications', path: '/candidate/applications', icon: Briefcase },
      { name: 'My Profile', path: '/candidate/profile', icon: User },
      { name: 'Resume', path: '/candidate/resume', icon: FileText },
      { name: 'Notifications', path: '/candidate/notifications', icon: Bell },
      { name: 'Settings', path: '/candidate/settings', icon: Settings },
    ];
  } else if (role === 'employer') {
    navItems = [
      { name: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
      { name: 'My Jobs', path: '/employer/jobs', icon: Briefcase },
      { name: 'Post a Job', path: '/employer/post-job', icon: PlusCircle },
      { name: 'Applicants', path: '/employer/applicants', icon: Users },
      { name: 'Company Profile', path: '/employer/company', icon: Building2 },
      { name: 'Reports', path: '/employer/reports', icon: BarChart3 },
      { name: 'Notifications', path: '/employer/notifications', icon: Bell },
      { name: 'Settings', path: '/employer/settings', icon: Settings },
    ];
  } else if (role === 'admin') {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Candidates', path: '/admin/candidates', icon: User },
      { name: 'Employers', path: '/admin/employers', icon: Building2 },
      { name: 'Companies', path: '/admin/companies', icon: Building },
      { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
      { name: 'Applications', path: '/admin/applications', icon: FileText },
      { name: 'Scraped Jobs', path: '/admin/scraped-jobs', icon: Globe2 },
      { name: 'Reports & Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];
  }

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'Admin Portal', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'employer':
        return { label: 'Employer Portal', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Candidate Portal', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
  };

  const badge = getRoleBadge();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base">
            Job<span className="text-blue-600">ora</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 shadow-sm ${
          collapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                  Job<span className="text-blue-600">ora</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {badge.label}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = location.pathname === item.path || (item.path !== `/${role}/dashboard` && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isItemActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isItemActive ? 'text-white' : 'text-slate-500'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer: User Card & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          {!collapsed && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-snug">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize font-medium">{user?.role || role}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign Out"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div>
            {title && (
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          </div>

          {/* Action Area (Buttons / Quick Filters) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default RoleLayout;
