const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
  getMyPostedJobs,
  getAdminAllJobs,
  trackExternalClick,
} = require('../controllers/jobController');
const { applyToJob } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getJobs);

// Protected routes (Admin, Employer & Employee)
router.get('/my/posted', protect, authorize('admin', 'employer', 'employee'), getMyPostedJobs);
router.get('/employer/my-jobs', protect, authorize('admin', 'employer', 'employee'), getMyPostedJobs);
router.get('/admin/all', protect, authorize('admin'), getAdminAllJobs);

// Job details
router.get('/:id', getJobById);

// External apply tracking (Candidate or Guest)
router.post('/:id/track-click', trackExternalClick);

// Candidate apply route (Internal jobs)
router.post('/:id/apply', protect, authorize('candidate'), (req, res, next) => {
  req.body.jobId = req.params.id;
  applyToJob(req, res, next);
});

// Employer, Employee & Admin Job Management
router.post('/', protect, authorize('admin', 'employer', 'employee'), createJob);
router.put('/:id/status', protect, authorize('admin', 'employer', 'employee'), toggleJobStatus);
router.put('/:id', protect, authorize('admin', 'employer', 'employee'), updateJob);
router.delete('/:id', protect, authorize('admin', 'employer', 'employee'), deleteJob);

module.exports = router;
