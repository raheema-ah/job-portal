const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_job_portal_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Format user response safely
const formatUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  employeeId: user.employeeId || '',
  department: user.department || '',
  companyName: user.companyName || '',
  companyLocation: user.companyLocation || '',
  company: user.company || null,
  bio: user.bio || '',
  education: user.education || '',
  experienceYears: user.experienceYears || 0,
  skills: user.skills || [],
  location: user.location || '',
  resume: user.resume || '',
  profileImage: user.profileImage || '',
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
});

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
      const isRoleCompatible =
        (role === 'employer' && (user.role === 'admin' || user.role === 'employer')) ||
        (role === 'admin' && (user.role === 'admin' || user.role === 'employer'));

      if (!isRoleCompatible) {
        const formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        const selectedRole = role.charAt(0).toUpperCase() + role.slice(1);
        return res.status(403).json({
          success: false,
          message: `Account is registered as ${formattedRole}, not ${selectedRole}. Please select ${formattedRole} role to sign in.`,
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

