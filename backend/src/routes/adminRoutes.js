const express = require('express');
const router = express.Router();
const { getAdminDashboardStats, getEmployerDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Admin metrics & analytics
router.get('/dashboard', protect, authorize('admin'), getAdminDashboardStats);
router.get('/analytics', protect, authorize('admin'), getAdminDashboardStats);

// Employer metrics & reports (supports both /api/employer/dashboard and /api/admin/employer/dashboard)
router.get('/employer/dashboard', protect, authorize('admin', 'employer'), getEmployerDashboardStats);
router.get('/employer/reports', protect, authorize('admin', 'employer'), getEmployerDashboardStats);
router.get('/employer-dashboard', protect, authorize('admin', 'employer'), getEmployerDashboardStats);

module.exports = router;
