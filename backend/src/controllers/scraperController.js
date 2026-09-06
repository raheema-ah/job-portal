const { aggregateJobs } = require('../services/scraperService');
const ScrapeLog = require('../models/ScrapeLog');
const Job = require('../models/Job');

// @desc    Trigger job scraping from public sources
// @route   POST /api/scrape/jobs or POST /scrape/jobs
// @access  Public / Admin
exports.triggerScraper = async (req, res, next) => {
  try {
    const { source = 'all', limit = 40 } = req.body;

    const result = await aggregateJobs({
      sourceFilter: source,
      triggeredBy: req.user?.role === 'admin' ? 'manual-admin' : 'api',
      limit: Number(limit) || 40,
    });

    res.status(200).json({
      success: true,
      message: `Scraper execution completed: ${result.jobsAdded} jobs added, ${result.duplicatesSkipped} duplicates skipped.`,
      data: result,
      stats: {
        jobsAdded: result.jobsAdded,
        duplicatesSkipped: result.duplicatesSkipped,
        errors: result.errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get scraping audit logs
// @route   GET /api/scrape/logs
// @access  Private (Admin)
exports.getScrapeLogs = async (req, res, next) => {
  try {
    const logs = await ScrapeLog.find().sort({ runAt: -1 }).limit(30);
    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get scraped jobs
// @route   GET /api/scrape/jobs
// @access  Private (Admin)
exports.getScrapedJobs = async (req, res, next) => {
  try {
    const scrapedJobs = await Job.find({ isScraped: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: scrapedJobs.length,
      jobs: scrapedJobs,
    });
  } catch (error) {
    next(error);
  }
};
