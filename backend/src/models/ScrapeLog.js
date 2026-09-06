const mongoose = require('mongoose');

const scrapeLogSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      default: 'Public Aggregator',
    },
    jobsFetched: {
      type: Number,
      default: 0,
    },
    jobsAdded: {
      type: Number,
      default: 0,
    },
    duplicatesSkipped: {
      type: Number,
      default: 0,
    },
    errors: {
      type: [String],
      default: [],
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
    triggeredBy: {
      type: String,
      enum: ['cron', 'manual-admin', 'api'],
      default: 'cron',
    },
    runAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

scrapeLogSchema.index({ runAt: -1 });

module.exports = mongoose.model('ScrapeLog', scrapeLogSchema);
