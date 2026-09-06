const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'employer', 'candidate', 'employee'],
      required: [true, 'Role is required'],
      default: 'candidate',
    },
    // Employee specific fields
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    // Employer/Admin specific fields
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    companyLocation: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    // Candidate & General profile fields
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: String,
      trim: true,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    categorizedSkills: {
      technical: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      databases: { type: [String], default: [] },
      tools: { type: [String], default: [] },
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    resumeData: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      uploadedAt: { type: Date },
      size: { type: Number, default: 0 },
    },
    profileImage: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    basicInfo: {
      dob: { type: String, default: '' },
      gender: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      portfolioUrl: { type: String, default: '' },
    },
    professionalInfo: {
      headline: { type: String, default: '' },
      aboutMe: { type: String, default: '' },
      totalExperience: { type: String, default: '' },
      currentJobTitle: { type: String, default: '' },
      currentCompany: { type: String, default: '' },
      careerLevel: { type: String, default: '' },
      expectedSalary: { type: String, default: '' },
      preferredJobLocation: { type: String, default: '' },
      preferredWorkMode: { type: String, default: 'Remote' },
      noticePeriod: { type: String, default: '' },
      availability: { type: String, default: '' },
    },
    educationList: [
      {
        degree: { type: String, default: '' },
        specialization: { type: String, default: '' },
        college: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        cgpa: { type: String, default: '' },
      },
    ],
    experienceList: [
      {
        jobTitle: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        currentlyWorking: { type: Boolean, default: false },
        responsibilities: { type: String, default: '' },
        technologies: { type: [String], default: [] },
      },
    ],
    projectsList: [
      {
        name: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: { type: [String], default: [] },
        projectUrl: { type: String, default: '' },
        githubUrl: { type: String, default: '' },
      },
    ],
    certificationsList: [
      {
        name: { type: String, default: '' },
        organization: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        certificateUrl: { type: String, default: '' },
      },
    ],
    languagesList: [
      {
        language: { type: String, default: '' },
        proficiency: {
          type: String,
          enum: ['Basic', 'Intermediate', 'Fluent', 'Native', ''],
          default: 'Intermediate',
        },
      },
    ],
    jobPreferences: {
      preferredRole: { type: String, default: '' },
      preferredLocations: { type: [String], default: [] },
      workMode: { type: String, default: 'Remote' },
      employmentType: { type: String, default: 'Full-time' },
      expectedSalary: { type: String, default: '' },
      experienceLevel: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
