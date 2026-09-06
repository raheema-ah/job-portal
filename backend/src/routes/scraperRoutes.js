const express = require('express');
const router = express.Router();
const { triggerScraper, getScrapeLogs, getScrapedJobs } = require('../controllers/scraperController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// POST /scrape/jobs & /api/scrape/jobs - Scraper API endpoint
router.post('/jobs', optionalAuth, triggerScraper);

// GET /scrape/jobs - List scraped jobs (Admin)
router.get('/jobs', protect, authorize('admin'), getScrapedJobs);

// GET /scrape/logs - View scraping history (Admin)
router.get('/logs', protect, authorize('admin'), getScrapeLogs);

module.exports = router;
