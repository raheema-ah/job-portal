import React from 'react';
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

/**
 * RoleSelector Component
 * Allows users to choose between Admin, Candidate, and Employee roles.
 */
const ROLES = [
  {
    id: 'candidate',
    title: 'Candidate',
    subtitle: 'Find Jobs & Apply',
    icon: UserCheck,
    badge: 'Job Seeker',
  },
  {
    id: 'employee',
    title: 'Employee',
    subtitle: 'Internal Workplace',
    icon: Briefcase,
    badge: 'Staff',
  },
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Manage & Post Jobs',
    icon: ShieldCheck,
    badge: 'Recruiter',
  },
];

const RoleSelector = ({ selectedRole, onSelectRole, roles = ['candidate', 'employee'] }) => {
  const filteredRoles = ROLES.filter((r) => roles.includes(r.id));
  const gridColsClass = filteredRoles.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Select Account Role
      </label>
      
      <div className={`grid ${gridColsClass} gap-2`}>
        {filteredRoles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              id={`role-select-${role.id}`}
              onClick={() => onSelectRole(role.id)}
              className={`relative flex flex-col items-center text-center p-2 rounded-xl border-2 transition-all duration-200 group ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-600 shadow-sm shadow-blue-500/10 text-blue-900'
                  : 'bg-white border-slate-200/80 hover:border-blue-300 text-slate-600 hover:bg-slate-50/60'
              }`}
            >
              {/* Selected Check Indicator Ring */}
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
                </span>
              )}

              {/* Icon Container */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-105 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Title & Subtitle */}
              <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                {role.title}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                {role.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
