const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Save a job or toggle save/unsave
// @route   POST /api/saved-jobs or POST /api/saved-jobs/:jobId
// @access  Private (Candidate)
exports.saveJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId || req.body.jobId;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });

    if (existing) {
      // If called as toggle with param, remove it; if called as POST /saved-jobs, notify already saved
      if (req.params.jobId) {
        await existing.deleteOne();
        return res.status(200).json({
          success: true,
          saved: false,
          message: 'Job removed from saved list',
        });
      }
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Job is already in your saved list',
        savedJob: existing,
      });
    }

    const newSaved = await SavedJob.create({ user: req.user._id, job: jobId });
    const populated = await SavedJob.findById(newSaved._id).populate('job');

    return res.status(201).json({
      success: true,
      saved: true,
      message: 'Job saved successfully',
      savedJob: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Job is already saved',
      });
    }
    next(error);
  }
};

// @desc    Delete/Remove a saved job
// @route   DELETE /api/saved-jobs/:id
// @access  Private (Candidate)
exports.deleteSavedJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Could be SavedJob._id or Job._id
    const deleted = await SavedJob.findOneAndDelete({
      user: req.user._id,
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { job: id }],
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found or already removed',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for current user
// @route   GET /api/saved-jobs
// @access  Private (Candidate)
exports.getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name companyName' },
      })
      .sort({ savedAt: -1 });

    const activeSavedJobs = saved.filter((s) => s.job != null);

    res.status(200).json({
      success: true,
      count: activeSavedJobs.length,
      savedJobs: activeSavedJobs.map((s) => ({
        savedId: s._id,
        savedAt: s.savedAt,
        job: s.job,
      })),
    });
  } catch (error) {
    next(error);
  }
};
