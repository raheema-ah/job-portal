import React from 'react';
import { Briefcase, Heart, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">CareerHub</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Modern AI-ready career platform connecting top tier talent with innovative employers worldwide.
            </p>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">For Candidates</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/candidate/jobs" className="hover:text-teal-600 transition-colors">Find Jobs</Link></li>
              <li><Link to="/register" className="hover:text-teal-600 transition-colors">Create Candidate Account</Link></li>
              <li><Link to="/candidate/applications" className="hover:text-teal-600 transition-colors">Track Applications</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">For Employers</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/register" className="hover:text-teal-600 transition-colors">Post Openings</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 transition-colors">Employer Login</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-teal-600 transition-colors">Hiring Dashboard</Link></li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Security & Trust</h4>
            <p className="text-sm text-slate-500 mb-3">
              JWT-secured authentication, bcrypt encrypted credentials, and privacy-first candidate workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>100% Encrypted & Authenticated</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerHub Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Engineered for modern hiring excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
