const express = require('express');
const router = express.Router();
const { matchJob, matchAllJobs, parseResume } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/match-job', optionalAuth, matchJob);
router.post('/match-all', optionalAuth, matchAllJobs);
router.post('/parse-resume', parseResume);

module.exports = router;
