const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  getMyCompanyProfile,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public/Authenticated routes
router.get('/', getCompanies);
router.get('/my/profile', protect, authorize('admin', 'employer', 'employee'), getMyCompanyProfile);
router.get('/:id', getCompanyById);

// Create / Edit Company (employer, employee, admin)
router.post('/', protect, authorize('admin', 'employer', 'employee'), createCompany);
router.put('/:id', protect, authorize('admin', 'employer', 'employee'), updateCompany);

// Delete Company (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
