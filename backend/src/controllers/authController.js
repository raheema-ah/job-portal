const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_job_portal_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Format user response safely with all candidate profile fields
const formatUserResponse = (user) => {
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
  return {
    ...obj,
    id: obj._id,
    _id: obj._id,
    phone: obj.phone || '',
    employeeId: obj.employeeId || '',
    department: obj.department || '',
    companyName: obj.companyName || '',
    companyLocation: obj.companyLocation || '',
    company: obj.company || null,
    bio: obj.bio || '',
    education: obj.education || '',
    experienceYears: obj.experienceYears || 0,
    skills: obj.skills || [],
    categorizedSkills: obj.categorizedSkills || { technical: [], languages: [], frameworks: [], databases: [], tools: [] },
    location: obj.location || '',
    resume: obj.resume || '',
    resumeData: obj.resumeData || { url: '', filename: '', uploadedAt: null, size: 0 },
    profileImage: obj.profileImage || obj.profilePhoto || '',
    profilePhoto: obj.profilePhoto || obj.profileImage || '',
    basicInfo: obj.basicInfo || { dob: '', gender: '', city: '', state: '', linkedinUrl: '', githubUrl: '', portfolioUrl: '' },
    professionalInfo: obj.professionalInfo || { headline: '', aboutMe: '', totalExperience: '', currentJobTitle: '', currentCompany: '', careerLevel: '', expectedSalary: '', preferredJobLocation: '', preferredWorkMode: 'Remote', noticePeriod: '', availability: '' },
    educationList: obj.educationList || [],
    experienceList: obj.experienceList || [],
    projectsList: obj.projectsList || [],
    certificationsList: obj.certificationsList || [],
    languagesList: obj.languagesList || [],
    jobPreferences: obj.jobPreferences || { preferredRole: '', preferredLocations: [], workMode: 'Remote', employmentType: 'Full-time', expectedSalary: '', experienceLevel: 'Mid Level' },
    isActive: obj.isActive !== false,
  };
};

// @desc    Register a new user (Admin, Employer, Candidate, or Employee)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role = 'candidate',
      employeeId,
      department,
      companyName,
      companyLocation,
      bio,
      education,
      experienceYears,
      skills,
      location,
      resume,
    } = req.body;

    // Validate required common fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Role validation
    const validRoles = ['admin', 'employer', 'candidate', 'employee'];
    const assignedRole = validRoles.includes(role) ? role : 'candidate';

    // Role-specific validations
    if (assignedRole === 'employee') {
      if (!employeeId || !employeeId.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required for Employee registration',
        });
      }
      if (!department || !department.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Department is required for Employee registration',
        });
      }
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.',
      });
    }

    // Parse skills if provided
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills;
    } else if (typeof skills === 'string' && skills.trim()) {
      parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Create user document
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      password,
      role: assignedRole,
      employeeId: employeeId ? employeeId.trim() : '',
      department: department ? department.trim() : '',
      companyName: companyName ? companyName.trim() : '',
      companyLocation: companyLocation ? companyLocation.trim() : '',
      bio: bio ? bio.trim() : '',
      education: education ? education.trim() : '',
      experienceYears: Number(experienceYears) || 0,
      skills: parsedSkills,
      location: location ? location.trim() : '',
      resume: resume || '',
      isActive: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${assignedRole.charAt(0).toUpperCase() + assignedRole.slice(1)} registered successfully!`,
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email, password, and role validation
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user in MongoDB (include hashed password)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check if password matches using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify role matches selected role if provided (allow employer/admin flexibility)
    if (role && user.role !== role) {
      // Only allow employer <-> admin flexibility; all other role mismatches are rejected
      const isRoleCompatible =
        (role === 'employer' && (user.role === 'admin' || user.role === 'employer')) ||
        (role === 'admin' && (user.role === 'admin' || user.role === 'employer'));

      if (!isRoleCompatible) {
        const formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        const selectedRole = role.charAt(0).toUpperCase() + role.slice(1);

        // Provide a helpful portal-specific message
        let portalHint = '';
        if (user.role === 'employee') {
          portalHint = ' This account is an Employee account — please use the Employee portal to sign in.';
        } else if (user.role === 'employer') {
          portalHint = ' Please use the Employer login portal.';
        } else if (user.role === 'candidate') {
          portalHint = ' Please use the Job Seeker login portal.';
        }

        return res.status(403).json({
          success: false,
          message: `This account is registered as ${formattedRole}, not ${selectedRole}.${portalHint}`,
        });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume file
// @route   POST /api/auth/upload-resume
// @access  Public / Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid resume file (PDF, DOC, DOCX, TXT)',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      fileUrl,
      fileName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client destroys token)
// @route   POST /api/auth/logout
// @access  Public / Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Request password reset — sends email with token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetPasswordToken +resetPasswordExpires');

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expiresHours = parseInt(process.env.RESET_TOKEN_EXPIRES_HOURS || '1', 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Send reset email (gracefully degrades to console.log in dev)
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetToken,
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using valid token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Hash the token from URL and find matching user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires +password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Update password — pre-save hook will hash it
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Issue new JWT so user is immediately logged in
    const authToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      token: authToken,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
