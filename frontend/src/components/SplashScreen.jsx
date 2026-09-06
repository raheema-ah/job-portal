import React, { useEffect, useState } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';

/**
 * SplashScreen Component
 * Displays the Job Portal logo with smooth animations for exactly 3 seconds,
 * then triggers onFinish() to transition to the Authentication page.
 */
const SplashScreen = ({ onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade-out effect slightly before 3s for a super-smooth transition
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2600);

    // Transition to auth page at exactly 3 seconds (3000ms)
    const completionTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completionTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Soft Background Blue Ambient Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-60 pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-100 rounded-full filter blur-3xl opacity-60 pointer-events-none animate-pulse" />

      {/* Center Branding Content */}
      <div className="relative flex flex-col items-center justify-center z-10 px-4 text-center">
        {/* Animated Glowing Logo Wrapper */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow Ring */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-xl animate-pulseGlow" />
          
          {/* Main Logo Emblem */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 animate-scaleIn transform">
            <Briefcase className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </span>
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Job<span className="text-blue-600">ora</span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-500 max-w-xs sm:max-w-sm">
            Empowering Careers & Connecting Top Talent
          </p>
        </div>

        {/* 3-Second Loading Bar Indicator */}
        <div className="mt-8 w-48 sm:w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-progressTimer"
            style={{ animationDuration: '3000ms' }}
          />
        </div>

        <p className="mt-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Welcome to Jobora...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
