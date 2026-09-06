const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    salary: {
      type: String,
      default: 'Negotiable',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    jobType: {
      type: String,
      default: 'Full-time',
    },
    employmentType: {
      type: String,
      default: 'Full-time',
    },
    workType: {
      type: String,
      default: 'On-site',
    },
    workMode: {
      type: String,
      default: 'On-site',
    },
    experience: {
      type: String,
      default: 'Mid Level',
    },
    experienceLevel: {
      type: String,
      default: 'mid',
    },
    skills: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isScraped: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      default: 'Direct',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    dedupHash: {
      type: String,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
