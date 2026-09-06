const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');

// @desc    Get user profile
// @route   GET /api/users/profile or /api/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('company');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile or /api/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const {
      name,
      phone,
      companyName,
      companyLocation,
      bio,
      education,
      experienceYears,
      skills,
      categorizedSkills,
      location,
      resume,
      resumeData,
      profileImage,
      profilePhoto,
      basicInfo,
      professionalInfo,
      educationList,
      experienceList,
      projectsList,
      certificationsList,
      languagesList,
      jobPreferences,
    } = req.body;

    if (name) user.name = String(name).trim();
    if (phone !== undefined && phone !== null) user.phone = String(phone).trim();
    if (location !== undefined && location !== null) user.location = String(location).trim();
    if (resume !== undefined && resume !== null) user.resume = String(resume).trim();
    if (resumeData !== undefined) user.resumeData = resumeData;
    if (profileImage !== undefined && profileImage !== null) user.profileImage = String(profileImage).trim();
    if (profilePhoto !== undefined && profilePhoto !== null) user.profilePhoto = String(profilePhoto).trim();
    if (bio !== undefined && bio !== null) user.bio = String(bio).trim();
    if (education !== undefined && education !== null) user.education = String(education).trim();
    if (experienceYears !== undefined) user.experienceYears = Number(experienceYears) || 0;

    // Handle files if uploaded via multipart/form-data
    if (req.files && Array.isArray(req.files)) {
      const resumeFile = req.files.find((f) => f.fieldname === 'resume');
      if (resumeFile) {
        user.resume = `/uploads/${resumeFile.filename}`;
        user.resumeData = {
          url: `/uploads/${resumeFile.filename}`,
          filename: resumeFile.originalname,
          uploadedAt: new Date(),
          size: resumeFile.size,
        };
      }
      const photoFile = req.files.find((f) => f.fieldname === 'photo' || f.fieldname === 'profilePhoto');
      if (photoFile) {
        user.profilePhoto = `/uploads/${photoFile.filename}`;
        user.profileImage = `/uploads/${photoFile.filename}`;
      }
    }

    if (user.role === 'admin' || user.role === 'employer') {
      if (companyName) user.companyName = String(companyName).trim();
      if (companyLocation !== undefined && companyLocation !== null) user.companyLocation = String(companyLocation).trim();
    }

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (categorizedSkills !== undefined) user.categorizedSkills = categorizedSkills;
    if (basicInfo !== undefined) user.basicInfo = { ...user.basicInfo, ...basicInfo };
    if (professionalInfo !== undefined) user.professionalInfo = { ...user.professionalInfo, ...professionalInfo };
    if (educationList !== undefined) user.educationList = educationList;
    if (experienceList !== undefined) user.experienceList = experienceList;
    if (projectsList !== undefined) user.projectsList = projectsList;
    if (certificationsList !== undefined) user.certificationsList = certificationsList;
    if (languagesList !== undefined) user.languagesList = languagesList;
    if (jobPreferences !== undefined) user.jobPreferences = { ...user.jobPreferences, ...jobPreferences };

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload candidate resume
// @route   POST /api/users/upload/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a resume file (PDF, DOC, DOCX)' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    user.resume = fileUrl;
    user.resumeData = {
      url: fileUrl,
      filename: req.file.originalname,
      uploadedAt: new Date(),
      size: req.file.size,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeData: user.resumeData,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete candidate resume
// @route   DELETE /api/users/resume
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.resume = '';
    user.resumeData = {
      url: '',
      filename: '',
      uploadedAt: null,
      size: 0,
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/upload/photo
// @access  Private
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    user.profileImage = fileUrl;
    user.profilePhoto = fileUrl;
    if (user.basicInfo) {
      user.basicInfo.profilePhoto = fileUrl;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      photoUrl: fileUrl,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN USER MANAGEMENT =================

// @desc    Get all users (with search and role filter)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { companyName: regex },
        { location: regex },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .populate('company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidates
// @route   GET /api/users/candidates
// @access  Private (Admin)
exports.getCandidates = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'candidate' };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { skills: regex }, { location: regex }];
    }

    const candidates = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employers
// @route   GET /api/users/employers
// @access  Private (Admin)
exports.getEmployers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: { $in: ['employer', 'admin'] } };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { companyName: regex }, { companyLocation: regex }];
    }

    const employers = await User.find(query).select('-password').populate('company').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employers.length,
      employers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('company');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Attach statistics if candidate or employer
    let extra = {};
    if (user.role === 'candidate') {
      const applicationsCount = await Application.countDocuments({ candidate: user._id });
      const savedCount = await SavedJob.countDocuments({ user: user._id });
      extra = { applicationsCount, savedCount };
    } else if (user.role === 'employer' || user.role === 'admin') {
      const jobsCount = await Job.countDocuments({ postedBy: user._id });
      extra = { jobsCount };
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        ...extra,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate a user
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
    }

    const newStatus = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    user.isActive = newStatus;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and cascade related records
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    // Cascade deletions
    if (user.role === 'candidate') {
      await Application.deleteMany({ candidate: user._id });
      await SavedJob.deleteMany({ user: user._id });
    } else if (user.role === 'employer' || user.role === 'admin') {
      const myJobs = await Job.find({ postedBy: user._id }).select('_id');
      const jobIds = myJobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await SavedJob.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ postedBy: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
