const express = require('express');
const router = express.Router();
const { saveJob, deleteSavedJob, getSavedJobs } = require('../controllers/savedJobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('candidate', 'admin'), getSavedJobs);
router.post('/', protect, authorize('candidate', 'admin'), saveJob);
router.post('/:jobId', protect, authorize('candidate', 'admin'), saveJob);
router.delete('/:id', protect, authorize('candidate', 'admin'), deleteSavedJob);

module.exports = router;
