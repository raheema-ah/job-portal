const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getCandidates,
  getEmployers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  uploadResume,
  deleteResume,
  uploadPhoto,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Profile routes (Any authenticated user)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Resume upload / delete routes
router.post('/upload/resume', protect, upload.single('resume'), uploadResume);
router.delete('/resume', protect, deleteResume);

// Photo upload route
router.post('/upload/photo', protect, upload.single('photo'), uploadPhoto);

// Admin User Management routes
router.get('/candidates', protect, authorize('admin'), getCandidates);
router.get('/employers', protect, authorize('admin'), getEmployers);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
