/**
 * AI Matching and Resume Scoring Engine
 * Analyzes candidate profile/resume text against job requirements and description.
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
};

/**
 * Calculates similarity match between candidate profile/resume and a job posting
 */
const calculateMatchScore = (candidateData, job) => {
  const candidateSkills = (candidateData.skills || []).map(s => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase().trim());

  const resumeText = `${candidateData.resumeText || ''} ${candidateData.bio || ''} ${candidateData.title || ''} ${(candidateData.skills || []).join(' ')}`.toLowerCase();
  const jobText = `${job.title} ${job.description} ${(job.requirements || []).join(' ')} ${(job.skills || []).join(' ')}`.toLowerCase();

  // 1. Explicit Skill Matching (Weight: 55%)
  let matchedSkills = [];
  let missingSkills = [];

  job.skills.forEach(skill => {
    const sLower = skill.toLowerCase().trim();
    const hasExact = candidateSkills.includes(sLower);
    const hasInResume = resumeText.includes(sLower);

    if (hasExact || hasInResume) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchRatio = job.skills.length > 0 ? (matchedSkills.length / job.skills.length) : 0.8;
  const skillScore = Math.min(100, Math.round(skillMatchRatio * 100));

  // 2. Keyword & Concept Overlap / TF-IDF light (Weight: 25%)
  const jobTokens = new Set(tokenize(jobText));
  const candidateTokens = new Set(tokenize(resumeText));

  let commonTokens = 0;
  jobTokens.forEach(token => {
    if (candidateTokens.has(token)) {
      commonTokens++;
    }
  });

  const textOverlapRatio = jobTokens.size > 0 ? (commonTokens / jobTokens.size) : 0.5;
  const textScore = Math.min(100, Math.round(textOverlapRatio * 200));

  // 3. Experience Compatibility (Weight: 20%)
  const expYears = candidateData.experienceYears || 0;
  let expScore = 75; // baseline

  if (job.experienceLevel === 'entry') {
    expScore = expYears >= 0 ? 100 : 80;
  } else if (job.experienceLevel === 'mid') {
    expScore = expYears >= 2 ? 100 : (expYears >= 1 ? 80 : 60);
  } else if (job.experienceLevel === 'senior') {
    expScore = expYears >= 5 ? 100 : (expYears >= 3 ? 85 : 50);
  } else if (job.experienceLevel === 'lead') {
    expScore = expYears >= 7 ? 100 : (expYears >= 5 ? 85 : 50);
  }

  // Composite Weighted Score
  const compositeScore = Math.min(
    99,
    Math.max(15, Math.round(skillScore * 0.55 + textScore * 0.25 + expScore * 0.20))
  );

  // Rating label
  let rating = 'Low Match';
  let badgeColor = 'red';
  if (compositeScore >= 80) {
    rating = 'Exceptional Match';
    badgeColor = 'emerald';
  } else if (compositeScore >= 65) {
    rating = 'Strong Match';
    badgeColor = 'indigo';
  } else if (compositeScore >= 45) {
    rating = 'Moderate Match';
    badgeColor = 'amber';
  }

  // Recommendations
  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Highlight experience with key missing skills: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  if (expYears < 3 && (job.experienceLevel === 'senior' || job.experienceLevel === 'lead')) {
    recommendations.push('Emphasize leadership projects and system architecture experience.');
  }
  if (textScore < 50) {
    recommendations.push('Align your resume wording closer to the specific keywords in the job description.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Your profile strongly aligns with this position! You are an ideal candidate.');
  }

  return {
    score: compositeScore,
    breakdown: {
      skillScore,
      textScore,
      expScore,
    },
    matchedSkills,
    missingSkills,
    rating,
    badgeColor,
    recommendations,
  };
};

module.exports = {
  calculateMatchScore,
  tokenize,
};
