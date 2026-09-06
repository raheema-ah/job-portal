const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs with filtering, search, pagination, and sorting
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      workType,
      experience,
      skill,
      page = 1,
      limit = 12,
      sort = 'newest',
    } = req.query;

    const query = { isActive: true };

    // Keyword text search across title, company, description, skills
    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { skills: regex },
        { location: regex },
      ];
    }

    // Location filter
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Job Type filter (Full-time, Part-time, Contract, Internship)
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }

    // Work Type filter (On-site, Remote, Hybrid)
    if (workType && workType !== 'All') {
      query.workType = workType;
    }

    // Experience filter (Entry Level, Mid Level, Senior Level, Lead / Manager)
    if (experience && experience !== 'All') {
      query.experience = experience;
    }

    // Skill filter
    if (skill) {
      query.skills = { $in: [new RegExp(skill.trim(), 'i')] };
    }

    // Sorting
    let sortCriteria = { createdAt: -1 };
    if (sort === 'oldest') sortCriteria = { createdAt: 1 };
    if (sort === 'title') sortCriteria = { title: 1 };

    // Pagination
    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageLimit;

    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name companyName companyLocation email')
      .sort(sortCriteria)
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      totalPages: Math.ceil(totalJobs / pageLimit) || 1,
      currentPage: pageNumber,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'postedBy',
      'name companyName companyLocation email'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Applicant count
    const applicantsCount = await Application.countDocuments({ job: job._id });

    res.status(200).json({
      success: true,
      job: {
        ...job.toObject(),
        applicantsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Admin / Employer)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyName,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      salary,
      salaryMin,
      salaryMax,
      jobType,
      employmentType,
      workType,
      workMode,
      experience,
      experienceLevel,
      skills,
      deadline,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required fields',
      });
    }

    // Parse array fields if passed as comma/newline strings
    const parseList = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) {
        return val.split('\n').flatMap((line) => line.split(',')).map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const finalCompany = company || companyName || req.user.companyName || 'Company';
    const finalJobType = employmentType || jobType || 'Full-time';
    const finalWorkMode = workMode || workType || 'On-site';

    const isJobExternal = Boolean(req.body.isExternal || req.body.externalUrl || req.body.applicationUrl || (req.body.source && req.body.source !== 'Direct'));
    const finalSource = req.body.source || (isJobExternal ? 'Company Website' : 'Direct');
    const finalSourceName = req.body.sourceName || finalCompany.trim();
    const finalExternalUrl = req.body.externalUrl || req.body.applicationUrl || '';

    const newJob = await Job.create({
      title: title.trim(),
      company: finalCompany.trim(),
      companyName: finalCompany.trim(),
      description: description.trim(),
      requirements: parseList(requirements),
      responsibilities: parseList(responsibilities),
      benefits: parseList(benefits),
      location: location.trim(),
      salary: salary ? salary.trim() : 'Negotiable',
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      jobType: finalJobType,
      employmentType: finalJobType,
      workType: finalWorkMode,
      workMode: finalWorkMode,
      experience: experience || 'Mid Level',
      experienceLevel: experienceLevel || 'mid',
      skills: parseList(skills),
      deadline: deadline ? new Date(deadline) : null,
      postedBy: req.user._id,
      status: 'active',
      isActive: true,
      isScraped: Boolean(req.body.isScraped),
      isExternal: isJobExternal,
      source: finalSource,
      sourceName: finalSourceName,
      sourceUrl: finalExternalUrl,
      externalUrl: finalExternalUrl,
      applicationUrl: finalExternalUrl,
      companyWebsite: req.body.companyWebsite ? String(req.body.companyWebsite).trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing job
// @route   PUT /api/jobs/:id
// @access  Private (Admin / Employer)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Ensure only the job creator, employer, employee or an admin can update
    if (
      job.postedBy &&
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'employer' &&
      req.user.role !== 'employee'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    // Process lists if passed as string
    const updates = { ...req.body };
    if (updates.skills) {
      if (typeof updates.skills === 'string') {
        updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (updates.requirements) {
      if (typeof updates.requirements === 'string') {
        updates.requirements = updates.requirements.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (updates.responsibilities) {
      if (typeof updates.responsibilities === 'string') {
        updates.responsibilities = updates.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (updates.benefits) {
      if (typeof updates.benefits === 'string') {
        updates.benefits = updates.benefits.split('\n').map((s) => s.trim()).filter(Boolean);
      }
    }
    if (updates.company && !updates.companyName) {
      updates.companyName = updates.company;
    }
    if (updates.workMode && !updates.workType) {
      updates.workType = updates.workMode;
    }
    if (updates.employmentType && !updates.jobType) {
      updates.jobType = updates.employmentType;
    }
    if (updates.status) {
      updates.isActive = updates.status === 'active';
    }
    if (typeof updates.companyWebsite === 'string') {
      updates.companyWebsite = updates.companyWebsite.trim();
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle job status (active <-> closed)
// @route   PUT /api/jobs/:id/status
// @access  Private (Admin / Employer)
exports.toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (
      job.postedBy &&
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'employer' &&
      req.user.role !== 'employee'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const newStatus = req.body.status || (job.status === 'active' ? 'closed' : 'active');
    job.status = newStatus;
    job.isActive = newStatus === 'active';
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job is now ${newStatus}`,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin / Employer)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Ensure authorization
    if (
      job.postedBy &&
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'employer' &&
      req.user.role !== 'employee'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    await job.deleteOne();
    // Also remove associated applications
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job and associated applications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get jobs posted by current admin/employer
// @route   GET /api/jobs/my/posted or /api/jobs/employer/my-jobs
// @access  Private (Admin / Employer)
exports.getMyPostedJobs = async (req, res, next) => {
  try {
    let jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    if (jobs.length === 0 && (req.user.role === 'admin' || req.user.role === 'employer' || req.user.role === 'employee')) {
      jobs = await Job.find().sort({ createdAt: -1 });
    }

    // Attach applicant count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for Admin (including closed and scraped)
// @route   GET /api/jobs/admin/all
// @access  Private (Admin)
exports.getAdminAllJobs = async (req, res, next) => {
  try {
    const { search, status, workMode, employmentType, sort = 'newest' } = req.query;
    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { company: regex }, { companyName: regex }, { skills: regex }, { location: regex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (workMode && workMode !== 'all') {
      query.$or = [{ workMode }, { workType: workMode }];
    }

    if (employmentType && employmentType !== 'all') {
      query.$or = [{ employmentType }, { jobType: employmentType }];
    }

    let sortCriteria = { createdAt: -1 };
    if (sort === 'oldest') sortCriteria = { createdAt: 1 };
    if (sort === 'title') sortCriteria = { title: 1 };

    const jobs = await Job.find(query).populate('postedBy', 'name email companyName').sort(sortCriteria);
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track click on external job application link
// @route   POST /api/jobs/:id/track-click
// @access  Public / Candidate
exports.trackExternalClick = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.externalClicks = (job.externalClicks || 0) + 1;
    await job.save();

    const candidateEmail = req.user ? req.user.email : 'Guest / Visitor';
    const destinationUrl = job.applicationUrl || job.externalUrl || job.sourceUrl || '';

    console.log(`[External Apply Tracking] Candidate: ${candidateEmail} | Job: "${job.title}" | Company: "${job.company}" | Source: "${job.sourceName || job.source || 'Company Website'}" | URL: ${destinationUrl} | Total Clicks: ${job.externalClicks}`);

    res.status(200).json({
      success: true,
      message: 'External apply redirect tracked successfully',
      jobId: job._id,
      jobTitle: job.title,
      company: job.company || job.companyName,
      source: job.source,
      sourceName: job.sourceName || job.company,
      externalUrl: destinationUrl,
      externalClicks: job.externalClicks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
