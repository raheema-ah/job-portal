import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Building2,
  ArrowRight,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 relative overflow-hidden">
      {/* Background Subtle Ambient Glowing Rings */}
      <div className="absolute top-12 -left-20 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-12 -right-20 w-80 h-80 bg-indigo-100 rounded-full filter blur-3xl opacity-50 pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 text-center space-y-8 animate-fadeIn">
        
        {/* Top Logo & Heading */}
        <div className="space-y-3">

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Job<span className="text-blue-600">ora</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="text-blue-600">Jobora</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Please choose how you would like to proceed today.
          </p>
        </div>

        {/* Two Options: Job Seeker & Employer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-2 max-w-2xl mx-auto">
          
          {/* Card 1: Job Seeker */}
          <button
            type="button"
            id="welcome-jobseeker-card"
            onClick={() => navigate('/job-seeker')}
            className="group relative flex flex-col items-center text-center p-4 sm:p-6 bg-white border-2 border-slate-200/90 hover:border-blue-600 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 text-slate-800"
          >
            {/* Top Pill */}
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-3 border border-blue-100">
              For Candidates
            </span>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-300 shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>

            {/* Title & Description */}
            <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
              Job Seeker
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 mb-4 leading-relaxed">
              Find verified jobs, apply in 1-click, and manage your applications with ease.
            </p>

            {/* Action Button Indicator */}
            <div className="w-full mt-auto py-2 px-4 rounded-lg bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-1.5 transition-all">
              <span>Continue as Job Seeker</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Employer */}
          <button
            type="button"
            id="welcome-employer-card"
            onClick={() => navigate('/employer')}
            className="group relative flex flex-col items-center text-center p-4 sm:p-6 bg-white border-2 border-slate-200/90 hover:border-blue-600 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 text-slate-800"
          >
            {/* Top Pill */}
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-3 border border-indigo-100">
              For Recruiters & Companies
            </span>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-blue-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-300 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>

            {/* Title & Description */}
            <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
              Employer
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 mb-4 leading-relaxed">
              Post job vacancies, screen candidates, and manage your hiring pipeline effortlessly.
            </p>

            {/* Action Button Indicator */}
            <div className="w-full mt-auto py-2 px-4 rounded-lg bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs shadow-md inline-flex items-center justify-center gap-1.5 transition-all">
              <span>Continue as Employer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>




      </div>
    </div>
  );
};

export default WelcomePage;
