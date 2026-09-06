const app = require('./app');
const { connectDB } = require('./config/db');
const { initCronJobs } = require('./services/cronService');
const User = require('./models/User');
const { seedData } = require('./seeds/seed');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed initial demo data if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo data...');
      await seedData();
    }

    // Initialize background cron jobs (e.g. Scraper every 6h)
    initCronJobs();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 AI Job Portal Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📑 REST API: http://localhost:${PORT}/api`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api/docs`);
      console.log(`====================================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
    });

    return server;
  } catch (error) {
    console.error(`[Server Boot Error]: ${error.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer };
