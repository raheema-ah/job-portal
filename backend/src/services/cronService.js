const cron = require('node-cron');
const { aggregateJobs } = require('./scraperService');

const initCronJobs = () => {
  // Default: Every 6 hours '0 */6 * * *'
  const schedule = process.env.SCRAPER_SCHEDULE || '0 */6 * * *';

  if (cron.validate(schedule)) {
    cron.schedule(schedule, async () => {
      console.log(`[Cron] [${new Date().toISOString()}] Running automated job aggregation scraper...`);
      try {
        const result = await aggregateJobs({ sourceFilter: 'all', triggeredBy: 'cron', limit: 40 });
        console.log(`[Cron] Job aggregation completed: +${result.jobsAdded} added, ${result.duplicatesSkipped} skipped.`);
      } catch (err) {
        console.error('[Cron Error] Job aggregation failed:', err.message);
      }
    });
    console.log(`[Cron] Scheduled scraper registered with expression: "${schedule}" (Every 6 Hours)`);
  } else {
    console.error(`[Cron] Invalid cron expression: "${schedule}"`);
  }
};

module.exports = { initCronJobs };
