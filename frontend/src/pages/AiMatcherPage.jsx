import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Loader2,
  Zap,
  Sliders,
  DollarSign,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AiMatchBadge from '../components/AiMatchBadge';
import ApplyModal from '../components/ApplyModal';

const AiMatcherPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [resumeText, setResumeText] = useState(
    user?.resumeText || (user?.skills ? `Candidate Skills: ${user.skills.join(', ')}. Professional Title: ${user.title || ''}. Experience: ${user.experienceYears || 3} years.` : '')
  );
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 3);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  const handleRunAiMatch = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() && !skills.trim()) {
      toast.error('Please paste resume text or list your skills.');
      return;
    }

    try {
      setMatching(true);
      const res = await api.post('/ai/match-all', {
        resumeText,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        experienceYears: Number(experienceYears),
        limit: 12,
      });

      if (res.data.success) {
        setMatches(res.data.matches);
        setHasSearched(true);
        toast.success(`Found ${res.data.matches.length} ranked job matches!`);
      }
    } catch (err) {
      toast.error('AI Matching failed. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const handleLoadSample = (sampleType) => {
    if (sampleType === 'fullstack') {
      setResumeText(
        'Senior Full Stack React and Node.js Developer. 5+ years building scalable microservices, REST APIs, and modern responsive frontends with React, TypeScript, Tailwind CSS, Express, MongoDB, Docker, and CI/CD pipelines. Led performance optimizations reducing API latency by 35%.'
      );
      setSkills('React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, REST API, Docker, AWS');
      setExperienceYears(5);
    } else if (sampleType === 'ai') {
      setResumeText(
        'Machine Learning & Python Systems Engineer. Specialized in PyTorch, LLM fine-tuning, RAG vector pipelines, and FastAPI microservices. Production experience deploying scalable machine learning models with Docker on AWS.'
      );
      setSkills('Python, FastAPI, PyTorch, LLM, Machine Learning, Docker, AWS, PostgreSQL');
      setExperienceYears(4);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Resume & Skill Compatibility Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display">
          Match Your Resume to <span className="gradient-text-accent">Live Positions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Paste your resume or list your technical skills below. Our algorithm performs multi-dimensional token density, skill gap analysis, and experience calibration to rank every job.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/30 max-w-4xl mx-auto space-y-6">
        
        {/* Sample Profile Loaders */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">
            Quick Load Presets:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleLoadSample('fullstack')}
              className="px-3 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-medium"
            >
              Preset 1: Senior Full-Stack
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('ai')}
              className="px-3 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 font-medium"
            >
              Preset 2: AI / ML Engineer
            </button>
          </div>
        </div>

        <form onSubmit={handleRunAiMatch} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Paste Resume Text or Professional Summary *</span>
              <span className="text-[10px] text-slate-500 font-normal">Plaintext, bullet points, or markdown</span>
            </label>
            <textarea
              rows={5}
              required
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content, project summaries, and technical experiences here..."
              className="glass-input w-full text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Key Skills (Comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, Docker, Python"
                className="glass-input w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Years of Experience ({experienceYears} yrs)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="glass-input w-full text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={matching}
            className="w-full gradient-btn-primary flex items-center justify-center gap-2 text-xs font-bold !py-3.5 shadow-xl shadow-indigo-600/25"
          >
            {matching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Token Density & Calculating Match Scores...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze & Find Top Matched Positions
              </>
            )}
          </button>

        </form>

      </div>

      {/* Match Results Section */}
      {hasSearched && (
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Analysis Results</span>
              <h2 className="text-2xl font-bold text-white">Top Ranked Job Matches ({matches.length})</h2>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="glass-card p-12 text-center text-xs text-slate-400 border-slate-800">
              No matching jobs found with the provided criteria. Try expanding your skills list.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((item, idx) => (
                <div key={idx} className="glass-card p-6 border-slate-800 flex flex-col justify-between space-y-4">
                  
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="text-xs text-slate-400">{item.job.companyName}</span>
                        <Link to={`/jobs/${item.job._id}`}>
                          <h3 className="text-lg font-bold text-white hover:text-indigo-300 transition-colors">
                            {item.job.title}
                          </h3>
                        </Link>
                      </div>

                      <AiMatchBadge score={item.matchScore} rating={item.rating} />
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300 mb-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {item.job.location}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 uppercase font-semibold text-indigo-300">
                        {item.job.workMode}
                      </span>
                    </div>

                    {/* Skills breakdown */}
                    <div className="space-y-2 text-xs">
                      {item.matchedSkills?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-emerald-400 font-semibold text-[11px]">Matched:</span>
                          {item.matchedSkills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.missingSkills?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-amber-400 font-semibold text-[11px]">Missing:</span>
                          {item.missingSkills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-amber-950/40 text-amber-300 border border-amber-800/40">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommendation note */}
                    {item.recommendations?.[0] && (
                      <p className="text-[11px] text-slate-400 italic pt-2">
                        💡 {item.recommendations[0]}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <Link
                      to={`/jobs/${item.job._id}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      View Full Details →
                    </Link>

                    <button
                      onClick={() => setSelectedJobForApply(item.job)}
                      className="gradient-btn-primary text-xs font-semibold !py-1.5 !px-4"
                    >
                      Apply Now
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onAppliedSuccess={() => toast.success('Application submitted!')}
        />
      )}

    </div>
  );
};

export default AiMatcherPage;
