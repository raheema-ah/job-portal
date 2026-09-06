const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const { calculateMatchScore } = require('../src/services/aiMatchingService');
const { generateDedupHash } = require('../src/services/scraperService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Job Portal API Integration & Unit Tests', () => {
  let candidateToken;
  let employerToken;
  let createdJobId;

  // 1. Auth Tests
  describe('Module 1 - Authentication & RBAC', () => {
    test('POST /api/auth/register - Should register a new candidate', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Candidate',
        email: 'testcandidate@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '+1 (555) 123-4567',
        role: 'candidate',
        skills: ['React', 'Node.js', 'MongoDB'],
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('candidate');
      candidateToken = res.body.token;
    });

    test('POST /api/auth/register - Should register an admin', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Tech Recruiter Admin',
        email: 'recruiter@techventures.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '+1 (555) 987-6543',
        role: 'admin',
        companyName: 'Tech Ventures Inc',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      employerToken = res.body.token;
    });

    test('POST /api/auth/register - Should register an employee with Employee ID and Department', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Jordan Staff',
        email: 'jordan@company.com',
        password: 'password123',
        confirmPassword: 'password123',
        phone: '+1 (555) 444-5555',
        role: 'employee',
        employeeId: 'EMP-2026-999',
        department: 'Engineering',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('employee');
      expect(res.body.user.employeeId).toBe('EMP-2026-999');
      expect(res.body.user.department).toBe('Engineering');
    });

    test('POST /api/auth/login - Should login candidate with correct password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'testcandidate@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('testcandidate@example.com');
    });

    test('POST /api/auth/login - Should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'testcandidate@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/forgot-password & reset-password flow', async () => {
      // 1. Request password reset
      const forgotRes = await request(app).post('/api/auth/forgot-password').send({
        email: 'testcandidate@example.com',
      });

      expect(forgotRes.statusCode).toBe(200);
      expect(forgotRes.body.success).toBe(true);

      // 2. Fetch user directly from DB to get the generated reset token for testing
      const userInDb = await User.findOne({ email: 'testcandidate@example.com' }).select('+resetPasswordToken +resetPasswordExpires');
      expect(userInDb.resetPasswordToken).toBeDefined();
      expect(userInDb.resetPasswordExpires).toBeDefined();

      // 3. To test reset-password endpoint with the unhashed token: set a known token
      const crypto = require('crypto');
      const testRawToken = 'abc123testtoken456def789';
      userInDb.resetPasswordToken = crypto.createHash('sha256').update(testRawToken).digest('hex');
      userInDb.resetPasswordExpires = new Date(Date.now() + 3600000);
      await userInDb.save({ validateBeforeSave: false });

      // 4. Reset password
      const resetRes = await request(app).post(`/api/auth/reset-password/${testRawToken}`).send({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.token).toBeDefined();

      // 5. Verify user can now login with new password
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'testcandidate@example.com',
        password: 'newpassword123',
      });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.token).toBeDefined();
    });
  });

  // 2. Job CRUD & Search Tests
  describe('Module 2 & 3 - Job Portal & REST APIs', () => {
    test('POST /api/jobs - Employer creates a new job posting', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Full Stack React Engineer',
          companyName: 'Tech Ventures Inc',
          companyWebsite: 'https://techventures.com',
          location: 'San Francisco, CA',
          workMode: 'remote',
          employmentType: 'full-time',
          salaryMin: 120000,
          salaryMax: 160000,
          experienceLevel: 'mid',
          skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
          description: 'Join our high performance engineering team building next generation applications.',
          requirements: ['3+ years in React and Node.js', 'Good communication skills'],
          benefits: ['Remote work', 'Health insurance'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.job._id).toBeDefined();
      expect(res.body.job.companyWebsite).toBe('https://techventures.com');
      createdJobId = res.body.job._id;
    });

    test('GET /api/jobs - Should list jobs with search filter and pagination', async () => {
      const res = await request(app).get('/api/jobs?search=React&workMode=remote');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.jobs.length).toBeGreaterThan(0);
      expect(res.body.jobs[0].title).toContain('React');
    });

    test('GET /api/jobs/:id - Should retrieve job details by ID', async () => {
      const res = await request(app).get(`/api/jobs/${createdJobId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.title).toBe('Full Stack React Engineer');
    });

    test('POST /api/applications - Candidate applies to the job', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId: createdJobId,
          coverLetter: 'I am excited to apply for this React Engineer role.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.application.status).toBe('Applied');
    });

    test('POST /api/applications - Duplicate application should be prevented', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobId: createdJobId,
          coverLetter: 'Applying a second time.',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/applications - Candidate retrieves their applications list', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.applications.length).toBe(1);
    });
  });

  // 3. AI Matching Logic Unit Test
  describe('Bonus - AI Resume Matching Algorithm', () => {
    test('calculateMatchScore should compute high score for matching skills and experience', () => {
      const candidate = {
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        experienceYears: 4,
        resumeText: 'Experienced full stack engineer proficient in React and Node.js REST APIs.',
      };

      const job = {
        title: 'Senior React Developer',
        skills: ['React', 'Node.js', 'TypeScript', 'Tailwind CSS'],
        experienceLevel: 'mid',
        description: 'Looking for a skilled React developer with Node experience.',
      };

      const match = calculateMatchScore(candidate, job);

      expect(match.score).toBeGreaterThanOrEqual(75);
      expect(match.matchedSkills).toContain('React');
      expect(match.matchedSkills).toContain('Node.js');
      expect(match.rating).toBeDefined();
    });
  });

  // 4. Scraper & Deduplication Unit Test
  describe('Module 5 - Scraper Deduplication', () => {
    test('generateDedupHash generates identical hashes for identical jobs regardless of case', () => {
      const hash1 = generateDedupHash('Frontend Engineer', 'Acme Corp', 'https://example.com/job1');
      const hash2 = generateDedupHash('  frontend engineer  ', 'ACME CORP', 'https://example.com/job1');
      const hash3 = generateDedupHash('Backend Engineer', 'Acme Corp', 'https://example.com/job2');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });
  });
});
