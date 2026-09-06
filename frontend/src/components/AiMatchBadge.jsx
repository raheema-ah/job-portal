import React from 'react';
import { Sparkles } from 'lucide-react';

const AiMatchBadge = ({ score, rating, size = 'md' }) => {
  if (score === undefined || score === null) return null;

  let colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  let dotColor = 'bg-rose-400';

  if (score >= 80) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-900/30';
    dotColor = 'bg-emerald-400';
  } else if (score >= 65) {
    colorClasses = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-900/30';
    dotColor = 'bg-indigo-400';
  } else if (score >= 45) {
    colorClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  }

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${colorClasses} ${
        isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
      title={`AI Match Rating: ${score}% match with your profile`}
    >
      <Sparkles className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{score}% Match</span>
      {rating && !isSmall && (
        <span className="opacity-75 font-normal text-[11px] hidden sm:inline">({rating})</span>
      )}
    </div>
  );
};

export default AiMatchBadge;
