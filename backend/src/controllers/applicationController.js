const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply to a job
// @route   POST /api/applications or POST /api/jobs/:id/apply
// @access  Private (Candidate)
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId, resume, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status === 'closed' || job.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer active',
      });
    }

    // Check if candidate already applied
    const existingApp = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resume: resume || req.user.resume || '',
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'Applied',
    });

    // Increment applicant count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    const populatedApp = await Application.findById(application._id)
      .populate('job', 'title company companyName location salary jobType')
      .populate('candidate', 'name email phone skills');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate's own applications
// @route   GET /api/applications or /api/applications/my
// @access  Private (Candidate)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company companyName location salary jobType workType workMode experience isActive status')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific job (Admin / Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Admin / Employer)
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify user owns job or is admin
    if (job.postedBy && job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job',
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'name email phone skills location resume bio education experienceYears profileImage')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      jobTitle: job.title,
      company: job.company || job.companyName,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for jobs posted by current employer/admin
// @route   GET /api/applications/employer/all
// @access  Private (Admin / Employer)
exports.getEmployerAllApplications = async (req, res, next) => {
  try {
    let myJobs = await Job.find({ postedBy: req.user._id }).select('_id title company companyName location');
    if (myJobs.length === 0 && (req.user.role === 'admin' || req.user.role === 'employer' || req.user.role === 'employee')) {
      myJobs = await Job.find().select('_id title company companyName location');
    }
    const jobIds = myJobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company companyName location salary jobType workMode status')
      .populate('candidate', 'name email phone skills location resume bio education experienceYears')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications across platform (Admin) with full filters
// @route   GET /api/applications/admin/all
// @access  Private (Admin)
exports.getAdminAllApplications = async (req, res, next) => {
  try {
    const { candidate, employer, job, status, date } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (candidate) {
      const candidates = await User.find({
        $or: [
          { name: { $regex: candidate.trim(), $options: 'i' } },
          { email: { $regex: candidate.trim(), $options: 'i' } },
        ],
      }).select('_id');
      query.candidate = { $in: candidates.map((c) => c._id) };
    }

    if (job) {
      const jobs = await Job.find({
        title: { $regex: job.trim(), $options: 'i' },
      }).select('_id');
      query.job = { $in: jobs.map((j) => j._id) };
    }

    if (date) {
      const filterDate = new Date(date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.appliedAt = { $gte: filterDate, $lt: nextDay };
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company companyName location salary postedBy',
        populate: { path: 'postedBy', select: 'name email companyName' },
      })
      .populate('candidate', 'name email phone skills location resume')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Admin / Employer)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify user owns the job or is admin / employer / employee
    if (
      application.job?.postedBy &&
      application.job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'employer' &&
      req.user.role !== 'employee'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this application',
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};
