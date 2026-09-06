const Job = require('../models/Job');
const { calculateMatchScore, extractSkillsFromText } = require('../services/aiMatchingService');
const { extractSkillsFromText: extractSkills } = require('../services/scraperService');

// @desc    Match candidate profile / resume against a specific job
// @route   POST /api/ai/match-job
// @access  Public / Private
exports.matchJob = async (req, res, next) => {
  try {
    const { jobId, resumeText, skills, experienceYears } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Combine authenticated profile data or body parameters
    const candidateData = {
      skills: skills || req.user?.skills || [],
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : (req.user?.experienceYears || 0),
      bio: req.user?.bio || '',
      title: req.user?.title || '',
      resumeText: resumeText || req.user?.resumeText || '',
    };

    const analysis = calculateMatchScore(candidateData, job);

    res.status(200).json({
      success: true,
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find top matched jobs for a resume or profile
// @route   POST /api/ai/match-all
// @access  Public / Private
exports.matchAllJobs = async (req, res, next) => {
  try {
    const { resumeText, skills, experienceYears, limit = 12 } = req.body;

    const candidateData = {
      skills: skills || req.user?.skills || [],
      experienceYears: experienceYears !== undefined ? Number(experienceYears) : (req.user?.experienceYears || 0),
      bio: req.user?.bio || '',
      title: req.user?.title || '',
      resumeText: resumeText || req.user?.resumeText || '',
    };

    // If resume text provided, auto-extract additional skills
    if (candidateData.resumeText) {
      const extracted = extractSkills(candidateData.resumeText);
      candidateData.skills = Array.from(new Set([...candidateData.skills, ...extracted]));
    }

    const activeJobs = await Job.find({ status: 'active' }).limit(100);

    const scoredJobs = activeJobs.map((job) => {
      const match = calculateMatchScore(candidateData, job);
      return {
        job,
        matchScore: match.score,
        rating: match.rating,
        badgeColor: match.badgeColor,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        recommendations: match.recommendations,
      };
    });

    // Sort by highest match score
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    const topMatches = scoredJobs.slice(0, Number(limit));

    res.status(200).json({
      success: true,
      count: topMatches.length,
      extractedSkills: candidateData.skills,
      matches: topMatches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Parse resume text to extract skills and metadata
// @route   POST /api/ai/parse-resume
// @access  Public
exports.parseResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Please provide resumeText to parse.' });
    }

    const detectedSkills = extractSkills(resumeText);

    // Simple heuristic for experience years
    let expYears = 0;
    const expMatch = resumeText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
    if (expMatch && expMatch[1]) {
      expYears = parseInt(expMatch[1], 10);
    }

    res.status(200).json({
      success: true,
      detectedSkills,
      estimatedExperienceYears: expYears,
    });
  } catch (error) {
    next(error);
  }
};
