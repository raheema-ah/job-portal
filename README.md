# 🚀 JobNest: Full-Stack Role-Based Job Portal & Aggregator

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![OpenAPI/Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85ea2d.svg)](http://localhost:5000/api/docs)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-success.svg)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, production-grade **Role-Based Job Portal System** engineered with **React, Tailwind CSS, Node.js + Express, and MongoDB**. Features dedicated workflows for **Candidates**, **Employers**, **Employees**, and **Platform Admins**, comprehensive 10-section profile management with resume uploads, live job scraping with cryptographic deduplication, AI-assisted resume compatibility scoring, and interactive OpenAPI documentation.

---

## 🏆 Deliverables & Bonus Features Matrix

### 📦 Core Project Deliverables
1. **[GitHub Repository](#-github-repository-setup)**: Isolated local Git repo initialized with `.gitignore`, clean commits, and GitHub push workflow.
2. **[Live Deployment URL & Guide](#-live-deployment-guide)**: Ready-to-deploy multi-platform configurations for **Render**, **Vercel**, **Railway**, and **Docker**.
3. **[Database Schema](#-database-schema--erd)**: Comprehensive schema specification in [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) with Mermaid ERD, collections, indexes, and validation rules.
4. **[API Documentation](#-api-documentation--swagger)**: Interactive Swagger UI at `http://localhost:5000/api/docs` plus offline markdown reference in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).
5. **[Postman Collection](#-postman-collection)**: Exportable, production-ready [`postman_collection.json`](./postman_collection.json) with pre-configured variables, JWT tokens, and role-based test cases.
6. **[Production README](#-table-of-contents)**: Comprehensive documentation, system architecture, role credentials, and setup instructions.

### 🌟 Bonus Features Implemented (7 Completed)
| # | Bonus Feature | Implementation Details | Status |
|---|---|---|:---:|
| 1 | **Swagger / OpenAPI** | Interactive Swagger 3.0 API docs at `/api/docs` generated via `swagger-jsdoc` | ✅ Implemented |
| 2 | **Resume Upload** | Multipart file upload via `multer` for PDF/DOC/DOCX files (up to 10MB) with auto-storage | ✅ Implemented |
| 3 | **Rate Limiting** | Automated DDoS and brute-force mitigation via `express-rate-limit` (100 req/15 min) | ✅ Implemented |
| 4 | **AI Resume Matching** | Multi-factor weighted match engine (`/api/ai/match`) comparing skill overlap & experience | ✅ Implemented |
| 5 | **Docker & Compose** | Multi-stage production `Dockerfile` and `docker-compose.yml` for backend & MongoDB | ✅ Implemented |
| 6 | **Unit & Integration Tests**| 13 automated Jest & Supertest tests covering Auth, RBAC, Jobs, Applications & Scraper | ✅ Implemented |
| 7 | **CI/CD Pipeline** | Automated GitHub Actions workflow (`.github/workflows/ci.yml`) for lint, test, and build | ✅ Implemented |

---

## 📑 Table of Contents
1. [Demo Accounts & Quick Access](#-demo-accounts--quick-access)
2. [Role-Based Feature Architecture](#-role-based-feature-architecture)
3. [System Architecture](#-system-architecture)
4. [GitHub Repository Setup](#-github-repository-setup)
5. [Database Schema & ERD](#-database-schema--erd)
6. [API Documentation & Swagger](#-api-documentation--swagger)
7. [Postman Collection](#-postman-collection)
8. [Installation & Local Setup](#-installation--local-setup)
9. [Running Automated Tests](#-running-automated-tests)
10. [Docker Containerization](#-docker-containerization)
11. [Live Deployment Guide](#-live-deployment-guide)

---

## 🔑 Demo Accounts & Quick Access

Use the pre-filled credentials below to test each role's unique dashboard and features:

| Role | Email | Password | Primary Permissions & Features |
|---|---|---|---|
| **👑 Admin** | `admin@jobportal.com` | `adminpassword123` | Platform analytics, user directory, manual scraper trigger, platform settings |
| **💼 Employer** | `employee@jobportal.com` | `employeepassword123` | Job creation & management, applicant screening & status pipeline, company profile |
| **👤 Candidate** | `candidate@gmail.com` | `candidatepassword123` | 10-section profile, resume upload, job search & apply, saved jobs tracker |
| **🤖 Candidate (AI)** | `elena.ai@gmail.com` | `candidatepassword123` | Pre-populated profile for testing AI resume matching score |

---

## 🎭 Role-Based Feature Architecture

### 1. 👤 Candidate Role (`/candidate/dashboard`)
- **Dashboard Overview**: Metrics for Total Available Jobs, Jobs Applied, Saved Jobs, Applications Under Review, and Shortlisted Applications.
- **Browse Jobs**: Full-text search with location, work mode (`Remote`, `Hybrid`, `On-site`), employment type (`Full-time`, `Part-time`, `Contract`), and experience filters.
- **Job Details & Apply**: Interactive modal with automatic candidate resume snapshot and cover letter submission.
- **Saved Jobs**: Instant bookmarking and unbookmarking with quick apply.
- **My Applications**: Visual tracker showing submission dates, company, and application statuses (`Applied`, `Under Review`, `Shortlisted`, `Interview`, `Hired`, `Rejected`).
- **Complete Profile (10 Sections)**:
  1. *Basic Information* (Name, Email, Phone, DOB, Gender, City, State, LinkedIn, GitHub, Portfolio)
  2. *Professional Information* (Headline, Bio, Experience, Current Title, Expected Salary, Notice Period)
  3. *Skills* (Categorized chip tags for Technical, Languages, Frameworks, Databases, Tools)
  4. *Education* (Add, Edit, Delete degree, college, start/end years, CGPA)
  5. *Work Experience* (Add, Edit, Delete position, company, timeline, responsibilities, tech tags)
  6. *Projects* (Add, Edit, Delete project name, description, tech stack, demo & repo links)
  7. *Resume Upload* (Multer PDF/DOC/DOCX upload with file metadata and download link)
  8. *Certifications* (Add, Edit, Delete certificate name, issuer, issue date, credential URL)
  9. *Languages* (Add, Edit, Delete language & proficiency level)
  10. *Job Preferences* (Role, preferred locations, work mode, expected compensation)
- **Profile Completion Widget**: Dynamic 0–100% completion bar with section checklist and 1-click jump links.

### 2. 💼 Employer Role (`/employer/dashboard`)
- **Employer Dashboard**: Metrics for Active Jobs, Total Applicants, Shortlisted Candidates, and Hires.
- **Job Management (`/employer/jobs`)**: Create new job postings with rich metadata, edit details, or remove listings.
- **Post a Job (`/employer/jobs/new`)**: Intuitive form with salary ranges, work modes, skills chips, and requirements.
- **Applicant Screening (`/employer/applicants`)**: Filter candidates by job and update workflow statuses (`Under Review`, `Shortlisted`, `Interview`, `Rejected`, `Hired`).
- **Company Profile (`/employer/company`)**: Manage company branding, logo, size, industry, and preview the public company card.
- **Reports & Analytics (`/employer/reports`)**: Recruitment funnel metrics and hiring velocity.

### 3. 👑 Admin Role (`/admin/dashboard`)
- **Telemetry Dashboard**: 8 key performance cards tracking users, active jobs, candidates, employers, applications, and system uptime.
- **User Management (`/admin/users`)**: Searchable user table with role badges, status toggles, and direct deletion.
- **Candidate & Employer Directories**: Filtered management boards for role-specific oversight.
- **Scraped Jobs Center (`/admin/scraped-jobs`)**: Live trigger button for web scraper aggregation with deduplication stats.
- **Platform Analytics**: Interactive distribution charts for skills in demand and hiring locations.
- **Platform Settings**: Maintenance mode toggles, scraper recurrence intervals, and registration switches.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Client                        │
│            React 18 • Vite • Tailwind CSS • Lucide          │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API Requests (Axios + JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend REST Service                     │
│               Node.js 20 • Express.js Engine                │
│                                                             │
│   ┌─────────────────────┬───────────────────────────────┐   │
│   │  Auth & RBAC Guards │     Jobs & Application API    │   │
│   ├─────────────────────┼───────────────────────────────┤   │
│   │  Candidate Profile  │     AI Resume Fit Matcher     │   │
│   ├─────────────────────┼───────────────────────────────┤   │
│   │  Multer File Upload │     Web Scraper & Dedup Engine│   │
│   ├─────────────────────┼───────────────────────────────┤   │
│   │  Express Rate Limit │     Swagger OpenAPI 3.0 UI    │   │
│   └─────────────────────┴───────────────────────────────┘   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│     MongoDB / Memory DB     │ │    External Job Feeds       │
│  Mongoose Relational Schemas│ │    (RemoteOK, Arbeitnow)    │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🐙 GitHub Repository Setup

The local repository is cleanly initialized and isolated inside `Job-Portal`. Follow these steps to push to your GitHub account:

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `job-portal-platform`).
3. Leave "Initialize this repository with a README" **unchecked** (we already have everything configured).
4. Click **Create repository**.

### Step 2: Push Local Code to GitHub
Run the following commands inside your terminal in the `Job-Portal` directory:

```bash
# Verify current branch is main
git branch -M main

# Add your GitHub remote URL (replace with your actual URL)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# Push all code and branches
git push -u origin main
```

---

## 🗃 Database Schema & ERD

The complete database schema documentation is available in [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

### Collections Summary
- **`users`**: Authentication credentials, roles (`admin`, `employer`, `candidate`, `employee`), and candidate profile sections.
- **`jobs`**: Job postings, salary ranges, skills tags, company metadata, and deduplication hashes.
- **`applications`**: Relational junction connecting Candidates to Jobs with workflow statuses.
- **`companies`**: Organization profiles, logos, sizes, and industry categories.
- **`savedjobs`**: Bookmarked jobs for candidate quick access.
- **`scrapelogs`**: Background aggregator audit trail.

---

## 📖 API Documentation & Swagger

- **Interactive Swagger UI**: Start the backend and open `http://localhost:5000/api/docs` in your browser.
- **Specification Document**: View the complete request/response contracts in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

---

## 📮 Postman Collection

A complete, exportable Postman collection is included in the root directory:
- **File**: [`postman_collection.json`](./postman_collection.json)
- **Import Instructions**:
  1. Open Postman.
  2. Click **Import** in the top-left corner.
  3. Drag and drop `postman_collection.json` or choose the file.
  4. Use the pre-configured **Login** requests to automatically populate the `{{candidateToken}}`, `{{employerToken}}`, and `{{adminToken}}` environment variables!

---

## 💻 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- [Git](https://git-scm.com/)

### Step 1: Clone Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
cd Job-Portal
```

### Step 2: Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 3: Configure Environment Variables
Backend comes with default development settings. If customizing, create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=super_secret_jwt_key_job_portal_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*(Note: If MongoDB is not installed locally, the backend automatically spins up an in-memory database with pre-seeded demo accounts!)*

### Step 4: Run Applications
Open two terminals:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# API runs on: http://localhost:5000/api
# Swagger Docs on: http://localhost:5000/api/docs
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# UI runs on: http://localhost:5173
```

---

## 🧪 Running Automated Tests

Run the comprehensive unit and integration test suite:

```bash
cd backend
npm test
```

### Test Coverage Results
```
PASS tests/api.test.js
  Job Portal API Integration & Unit Tests
    Module 1 - Authentication & RBAC
      ✓ POST /api/auth/register - Should register a new candidate
      ✓ POST /api/auth/register - Should register an admin
      ✓ POST /api/auth/register - Should register an employee with Employee ID and Department
      ✓ POST /api/auth/login - Should login candidate with correct password
      ✓ POST /api/auth/login - Should reject invalid password
    Module 2 & 3 - Job Portal & REST APIs
      ✓ POST /api/jobs - Employer creates a new job posting
      ✓ GET /api/jobs - Should list jobs with search filter and pagination
      ✓ GET /api/jobs/:id - Should retrieve job details by ID
      ✓ POST /api/applications - Candidate applies to the job
      ✓ POST /api/applications - Duplicate application should be prevented
      ✓ GET /api/applications - Candidate retrieves their applications list
    Bonus - AI Resume Matching Algorithm
      ✓ calculateMatchScore should compute high score for matching skills and experience
    Module 5 - Scraper Deduplication
      ✓ generateDedupHash generates identical hashes for identical jobs regardless of case

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

---

## 🐳 Docker Containerization

Run the entire application stack (Frontend + Backend + MongoDB) using Docker Compose:

```bash
docker-compose up --build
```

- **Frontend & Backend API**: `http://localhost:5000`
- **MongoDB Container**: `localhost:27017`
- **Interactive Swagger Docs**: `http://localhost:5000/api/docs`

To stop containers:
```bash
docker-compose down
```

---

## ☁️ Live Deployment Guide

### Option A: Deploy to Render (Recommended for Full-Stack)
1. Push your code to GitHub.
2. Sign in to [Render](https://render.com).
3. **Backend Web Service**:
   - Create a new **Web Service** connected to your repo.
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `NODE_ENV=production`
     - `PORT=5000`
     - `MONGODB_URI=<your_mongodb_atlas_connection_string>`
     - `JWT_SECRET=<your_strong_jwt_secret>`
     - `CLIENT_URL=https://<your-frontend-domain>.vercel.app`
4. **Frontend Static Site**:
   - Create a **Static Site** on Render or deploy via Vercel.
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add Environment Variable:
     - `VITE_API_URL=https://<your-backend-render-service>.onrender.com/api`

### Option B: Deploy Frontend to Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Add Environment Variable:
   - `VITE_API_URL=https://<your-backend-api-url>/api`
6. Click **Deploy**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
