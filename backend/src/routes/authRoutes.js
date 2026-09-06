const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, uploadResume } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/upload-resume', upload.single('resume'), uploadResume);

module.exports = router;

