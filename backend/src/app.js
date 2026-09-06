const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS with support for frontend client
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to /api
app.use('/api', apiLimiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation Route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI-Ready Job Portal API',
  });
});

// Mount Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/profile', require('./routes/userRoutes'));
app.use('/api/candidate', require('./routes/userRoutes'));
app.use('/api/candidates', require('./routes/userRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/saved-jobs', require('./routes/savedJobRoutes'));
app.use('/api/scrape', require('./routes/scraperRoutes'));
app.use('/scrape', require('./routes/scraperRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
const { getEmployerDashboardStats } = require('./controllers/adminController');
const { protect } = require('./middleware/authMiddleware');
const { authorize } = require('./middleware/roleMiddleware');
const employerRouter = express.Router();
employerRouter.get('/dashboard', protect, authorize('admin', 'employer', 'employee'), getEmployerDashboardStats);
employerRouter.get('/reports', protect, authorize('admin', 'employer', 'employee'), getEmployerDashboardStats);
app.use('/api/employer', employerRouter);
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
