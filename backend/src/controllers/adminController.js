const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const ScrapeLog = require('../models/ScrapeLog');

// @desc    Get complete administrative dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. User metrics
    const totalUsers = await User.countDocuments();
    const candidateCount = await User.countDocuments({ role: 'candidate' });
    const employerCount = await User.countDocuments({ role: { $in: ['employer', 'admin'] } });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // 2. Job metrics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ $or: [{ status: 'active' }, { isActive: true }] });
    const closedJobs = await Job.countDocuments({ $or: [{ status: 'closed' }, { isActive: false }] });
    const scrapedJobs = await Job.countDocuments({ isScraped: true });
    const directJobs = await Job.countDocuments({ isScraped: false });
    const jobsScrapedToday = await Job.countDocuments({
      isScraped: true,
      createdAt: { $gte: todayStart },
    });

    // 3. Companies & Applications
    const totalCompanies = await Company.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Applications status breakdown
    const applicationStatusAggregation = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const applicationStats = {
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      hired: 0,
    };
    applicationStatusAggregation.forEach((item) => {
      const key = (item._id || '').toLowerCase().replace(/\s+/g, '');
      if (key.includes('applied')) applicationStats.applied += item.count;
      else if (key.includes('review')) applicationStats.underReview += item.count;
      else if (key.includes('shortlist')) applicationStats.shortlisted += item.count;
      else if (key.includes('interview')) applicationStats.interview += item.count;
      else if (key.includes('reject')) applicationStats.rejected += item.count;
      else if (key.includes('hire')) applicationStats.hired += item.count;
    });

    // 4. Top in-demand Skills aggregation
    const topSkillsAggregation = await Job.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topSkills = topSkillsAggregation.map((item) => ({
      skill: item._id,
      count: item.count,
    }));

    // 5. Top Hiring Companies
    const topCompaniesAggregation = await Job.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$companyName', '$company'] },
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { jobCount: -1 } },
      { $limit: 8 },
    ]);
    const topCompanies = topCompaniesAggregation.map((item) => ({
      companyName: item._id || 'Unknown',
      jobCount: item.jobCount,
    }));

    // 6. Top Locations
    const topLocationsAggregation = await Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const topLocations = topLocationsAggregation.map((item) => ({
      location: item._id || 'Remote',
      count: item.count,
    }));

    // 7. Work Mode Distribution
    const workModeAggregation = await Job.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$workMode', '$workType'] },
          count: { $sum: 1 },
        },
      },
    ]);
    const workModeDistribution = workModeAggregation.map((item) => ({
      name: item._id ? item._id.toUpperCase() : 'OTHER',
      value: item.count,
    }));

    // 8. Jobs by Employment Type
    const employmentTypeAggregation = await Job.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$employmentType', '$jobType'] },
          count: { $sum: 1 },
        },
      },
    ]);
    const jobsByEmploymentType = employmentTypeAggregation.map((item) => ({
      type: item._id || 'Full-time',
      count: item.count,
    }));

    // 9. Users by Role
    const usersByRole = [
      { role: 'Candidate', count: candidateCount },
      { role: 'Employer', count: employerCount },
      { role: 'Admin', count: adminCount },
    ];

    // 10. Applications Over Time (Past 7 days/weeks)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const applicationsOverTimeAgg = await Application.aggregate([
      { $match: { appliedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build continuous 7-day timeline
    const applicationsOverTime = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const match = applicationsOverTimeAgg.find((item) => item._id === dateStr);
      applicationsOverTime.push({
        date: dateStr.slice(5), // MM-DD
        applications: match ? match.count : 0,
      });
    }

    // 11. Recent Scraping Logs
    const recentScrapeLogs = await ScrapeLog.find().sort({ runAt: -1 }).limit(5);

    // 12. Recent Jobs and Applications
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title company companyName location workMode workType isScraped status createdAt');

    const recentApplications = await Application.find()
      .populate('job', 'title company companyName')
      .populate('candidate', 'name email phone location')
      .sort({ appliedAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          candidates: candidateCount,
          employers: employerCount,
          admins: adminCount,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          scraped: scrapedJobs,
          direct: directJobs,
          scrapedToday: jobsScrapedToday,
        },
        companies: {
          total: totalCompanies,
        },
        applications: {
          total: totalApplications,
          byStatus: applicationStats,
        },
        topSkills,
        topCompanies,
        topLocations,
        workModeDistribution,
        jobsByEmploymentType,
        usersByRole,
        applicationsOverTime,
        recentScrapeLogs,
        recentJobs,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employer dashboard & report analytics
// @route   GET /api/employer/dashboard or /api/employer/reports
// @access  Private (Employer / Admin)
exports.getEmployerDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find jobs posted by this employer
    const myJobs = await Job.find({ postedBy: userId });
    const jobIds = myJobs.map((j) => j._id);

    const totalJobsPosted = myJobs.length;
    const activeJobs = myJobs.filter((j) => j.status === 'active' || j.isActive === true).length;
    const closedJobs = myJobs.filter((j) => j.status === 'closed' || j.isActive === false).length;

    // Find applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company companyName location')
      .populate('candidate', 'name email phone skills location resume')
      .sort({ appliedAt: -1 });

    const totalApplicants = applications.length;
    const newApplicants = applications.filter((a) => a.status === 'Applied').length;
    const shortlistedCandidates = applications.filter((a) => a.status === 'Shortlisted').length;
    const interviewedCandidates = applications.filter((a) => a.status === 'Interview').length;
    const hiredCandidates = applications.filter((a) => a.status === 'Hired').length;
    const rejectedCandidates = applications.filter((a) => a.status === 'Rejected').length;

    // Job Performance table
    const jobPerformance = myJobs.map((job) => {
      const jobApps = applications.filter((a) => a.job?._id?.toString() === job._id.toString());
      return {
        _id: job._id,
        title: job.title,
        location: job.location,
        status: job.status || (job.isActive ? 'active' : 'closed'),
        createdAt: job.createdAt,
        totalApplicants: jobApps.length,
        shortlisted: jobApps.filter((a) => a.status === 'Shortlisted').length,
        hired: jobApps.filter((a) => a.status === 'Hired').length,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalJobsPosted,
        activeJobs,
        closedJobs,
        totalApplicants,
        newApplicants,
        shortlistedCandidates,
        interviewedCandidates,
        hiredCandidates,
        rejectedCandidates,
        recentApplications: applications.slice(0, 8),
        jobPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};
