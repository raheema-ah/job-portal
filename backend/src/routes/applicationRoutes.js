const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getEmployerAllApplications,
  getAdminAllApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Candidate routes
router.post('/', protect, authorize('candidate'), applyToJob);
router.get('/', protect, authorize('candidate'), getMyApplications);
router.get('/my', protect, authorize('candidate'), getMyApplications);

// Employer routes (employer, employee, and admin can all access)
router.get('/employer/all', protect, authorize('admin', 'employer', 'employee'), getEmployerAllApplications);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAdminAllApplications);

// Shared Job Applicant routes
router.get('/job/:jobId', protect, authorize('admin', 'employer', 'employee'), getJobApplications);
router.put('/:id/status', protect, authorize('admin', 'employer', 'employee'), updateApplicationStatus);

module.exports = router;
