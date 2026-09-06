const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, uploadResume, forgotPassword, resetPassword } = require('../controllers/authController');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const handleUploadOrJson = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.any()(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  }
  next();
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, handleUploadOrJson, updateUserProfile);

module.exports = router;

