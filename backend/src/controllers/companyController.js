const Company = require('../models/Company');
const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Get all companies (with search)
// @route   GET /api/companies
// @access  Public / Private
exports.getCompanies = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { industry: regex }, { location: regex }];
    }

    const companies = await Company.find(query).populate('createdBy', 'name email').sort({ createdAt: -1 });

    const companiesWithJobCount = await Promise.all(
      companies.map(async (c) => {
        const jobsCount = await Job.countDocuments({
          $or: [{ company: c.name }, { companyName: c.name }],
        });
        return {
          ...c.toObject(),
          jobsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: companiesWithJobCount.length,
      companies: companiesWithJobCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company by ID
// @route   GET /api/companies/:id
// @access  Public / Private
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('createdBy', 'name email');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const openJobs = await Job.find({
      $or: [{ company: company.name }, { companyName: company.name }],
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      company: {
        ...company.toObject(),
        openJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or Create Employer's own Company profile
// @route   GET /api/companies/my/profile
// @access  Private (Employer / Admin)
exports.getMyCompanyProfile = async (req, res, next) => {
  try {
    let company = null;
    if (req.user.company) {
      company = await Company.findById(req.user.company);
    }

    if (!company) {
      company = await Company.findOne({ createdBy: req.user._id });
    }

    if (!company && req.user.companyName) {
      company = await Company.findOne({ name: req.user.companyName });
    }

    // If still not found, return empty placeholder or create initial record
    if (!company) {
      company = await Company.create({
        name: req.user.companyName || `${req.user.name}'s Organization`,
        location: req.user.companyLocation || req.user.location || '',
        contactEmail: req.user.email,
        createdBy: req.user._id,
      });

      req.user.company = company._id;
      await req.user.save();
    }

    const jobsCount = await Job.countDocuments({
      $or: [{ company: company.name }, { companyName: company.name }],
    });

    res.status(200).json({
      success: true,
      company: {
        ...company.toObject(),
        jobsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (Admin / Employer)
exports.createCompany = async (req, res, next) => {
  try {
    const { name, logo, website, industry, description, location, size, contactEmail } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A company with this name already exists' });
    }

    const company = await Company.create({
      name: name.trim(),
      logo: logo || '',
      website: website ? website.trim() : '',
      industry: industry ? industry.trim() : 'Technology',
      description: description ? description.trim() : '',
      location: location ? location.trim() : '',
      size: size || '51-200',
      contactEmail: contactEmail ? contactEmail.trim() : req.user.email,
      createdBy: req.user._id,
    });

    // Link to user if employer
    if (req.user.role === 'employer' || req.user.role === 'admin') {
      req.user.company = company._id;
      req.user.companyName = company.name;
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Admin / Employer)
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Verify ownership or admin
    if (company.createdBy && company.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this company' });
    }

    const { name, logo, website, industry, description, location, size, contactEmail } = req.body;

    if (name) company.name = name.trim();
    if (logo !== undefined) company.logo = logo;
    if (website !== undefined) company.website = website.trim();
    if (industry !== undefined) company.industry = industry.trim();
    if (description !== undefined) company.description = description.trim();
    if (location !== undefined) company.location = location.trim();
    if (size !== undefined) company.size = size;
    if (contactEmail !== undefined) company.contactEmail = contactEmail.trim();

    await company.save();

    // If company name updated, update user's companyName as well
    if (name && req.user.company?.toString() === company._id.toString()) {
      req.user.companyName = name.trim();
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
