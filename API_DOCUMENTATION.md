# JobNest REST API Documentation & Specification

## 1. Overview & Base URLs

JobNest provides a high-throughput, secure RESTful API built on Node.js and Express.js. All endpoints communicate using standard JSON payloads over HTTP/HTTPS, with rate-limiting, role-based access control (RBAC), and Swagger 3.0 OpenAPI specifications.

- **Base URL**: `http://localhost:5000/api`
- **Interactive Swagger UI**: `http://localhost:5000/api/docs`
- **Production URL**: `https://jobnest-api.onrender.com/api` (Render / Railway deployment)

---

## 2. Authentication & Authorization

All protected routes require an HTTP `Authorization` header with a JSON Web Token (JWT) formatted as:

```http
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Candidate | Employer | Employee | Admin |
|---|:---:|:---:|:---:|:---:|
| `/api/auth/*` (Login/Register) |  Yes |  Yes |  Yes |  Yes |
| `/api/jobs` (Search & Browse) |  Yes |  Yes |  Yes |  Yes |
| `/api/jobs` (Create/Edit/Delete) |  No |  Yes |  No |  Yes |
| `/api/users/profile` (Candidate Profile) |  Yes |  Yes |  Yes |  Yes |
| `/api/applications` (Submit & Track) |  Yes |  No |  No |  Yes |
| `/api/applications/employer` (Screening) |  No |  Yes |  No |  Yes |
| `/api/saved-jobs` (Bookmarks) |  Yes |  No |  No |  Yes |
| `/api/ai/match` (Resume Fit Scoring) |  Yes |  Yes |  Yes |  Yes |
| `/api/admin/*` (Stats, Users, Scraper) |  No |  No |  No |  Yes |

---

## 3. Standard Response Format

### Success Response (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response (400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

---

## 4. Complete API Endpoints

### 4.1 Authentication (`/api/auth`)

#### 1. Register User
- **Method & Path**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Sarah Connor",
  "email": "sarah@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+1 (555) 019-2834",
  "role": "candidate",
  "skills": ["React", "Node.js", "MongoDB"]
}
```
*For employee role, include `"employeeId"` and `"department"`. For admin/employer, include `"companyName"`.*
- **Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67cbde39872e4...",
    "name": "Sarah Connor",
    "email": "sarah@example.com",
    "role": "candidate"
  }
}
```

#### 2. Login User
- **Method & Path**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "candidate@gmail.com",
  "password": "candidatepassword123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67cbdf1234...",
    "name": "Alex Johnson",
    "email": "candidate@gmail.com",
    "role": "candidate"
  }
}
```

#### 3. Get Current User Profile
- **Method & Path**: `GET /api/auth/me`
- **Access**: Private (Bearer Token)
- **Response (200 OK)**: Returns full profile of authenticated token bearer.

---

### 4.2 Candidate Profile & Media (`/api/users`)

#### 1. Get Profile
- **Method & Path**: `GET /api/users/profile`
- **Access**: Private (Candidate)
- **Response (200 OK)**: Returns full 10-section profile document.

#### 2. Update Profile
- **Method & Path**: `PUT /api/users/profile`
- **Access**: Private (Candidate)
- **Request Body**:
```json
{
  "name": "Elena Rostova",
  "basicInfo": {
    "dob": "1996-08-14",
    "gender": "Female",
    "city": "San Francisco",
    "state": "California",
    "linkedinUrl": "https://linkedin.com/in/elena-rostova",
    "githubUrl": "https://github.com/elena-rostova",
    "portfolioUrl": "https://elena-rostova.dev"
  },
  "professionalInfo": {
    "headline": "Senior Full-Stack Cloud Architect & React Lead",
    "aboutMe": "Passionate engineer with 6+ years shipping high-availability React/Node web services.",
    "totalExperience": "6",
    "currentJobTitle": "Lead Frontend Engineer",
    "currentCompany": "Aura Labs",
    "careerLevel": "Senior",
    "expectedSalary": "$165,000",
    "preferredJobLocation": "San Francisco, CA",
    "preferredWorkMode": "Remote",
    "noticePeriod": "2 Weeks",
    "availability": "Immediate"
  },
  "categorizedSkills": {
    "technical": ["REST APIs", "Microservices", "GraphQL"],
    "languages": ["TypeScript", "JavaScript", "Python"],
    "frameworks": ["React", "Node.js", "Tailwind CSS"],
    "databases": ["MongoDB", "PostgreSQL", "Redis"],
    "tools": ["Docker", "Kubernetes", "Git", "AWS"]
  },
  "educationList": [
    {
      "degree": "Bachelor of Science",
      "specialization": "Computer Science",
      "college": "UC Berkeley",
      "startYear": "2014",
      "endYear": "2018",
      "cgpa": "3.88 / 4.0"
    }
  ],
  "experienceList": [
    {
      "jobTitle": "Lead Frontend Engineer",
      "company": "Aura Labs",
      "location": "San Francisco, CA",
      "startDate": "2022-01",
      "endDate": "Present",
      "currentlyWorking": true,
      "responsibilities": "Architected Next.js micro-frontends.",
      "technologies": ["React", "TypeScript", "Tailwind CSS"]
    }
  ]
}
```

#### 3. Upload Resume (Multer Multipart)
- **Method & Path**: `POST /api/users/upload/resume`
- **Access**: Private (Candidate)
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: Form-data field `resume` (PDF, DOC, DOCX up to 10MB)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "/uploads/resumes/resume-1788675123.pdf",
  "filename": "Elena_Rostova_Resume.pdf",
  "size": 145230,
  "uploadedAt": "2026-09-06T06:50:00.000Z"
}
```

#### 4. Upload Profile Avatar
- **Method & Path**: `POST /api/users/upload/photo`
- **Access**: Private (Any Role)
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: Form-data field `photo` (JPG, PNG, WEBP up to 5MB)

---

### 4.3 Jobs Feed & Management (`/api/jobs`)

#### 1. Search & Filter Jobs
- **Method & Path**: `GET /api/jobs`
- **Access**: Public
- **Query Parameters**:
  - `search` (string): Keyword matching in title, company, description, or skills
  - `location` (string): Filter by city or "Remote"
  - `workMode` (string): `remote`, `on-site`, `hybrid`
  - `employmentType` (string): `full-time`, `part-time`, `contract`, `internship`
  - `experienceLevel` (string): `entry`, `mid`, `senior`, `lead`
  - `page` (number): Default `1`
  - `limit` (number): Default `10`
- **Response (200 OK)**:
```json
{
  "success": true,
  "jobs": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

#### 2. Get Single Job by ID
- **Method & Path**: `GET /api/jobs/:id`
- **Access**: Public

#### 3. Create Job Posting
- **Method & Path**: `POST /api/jobs`
- **Access**: Private (`employer`, `admin`)
- **Request Body**:
```json
{
  "title": "Senior Cloud Infrastructure Engineer",
  "companyName": "Tech Ventures Inc",
  "location": "San Francisco, CA",
  "workMode": "remote",
  "employmentType": "full-time",
  "salaryMin": 140000,
  "salaryMax": 180000,
  "experienceLevel": "senior",
  "skills": ["AWS", "Terraform", "Kubernetes", "Docker", "Node.js"],
  "description": "Lead the multi-region Kubernetes platform deployment.",
  "requirements": ["4+ years AWS infrastructure", "Strong automation skills"],
  "benefits": ["Remote work stipend", "Comprehensive health insurance"]
}
```

#### 4. Employer's Posted Jobs
- **Method & Path**: `GET /api/jobs/employer/my-jobs`
- **Access**: Private (`employer`, `admin`)

#### 5. Update Job
- **Method & Path**: `PUT /api/jobs/:id`
- **Access**: Private (Job Owner or Admin)

#### 6. Delete Job
- **Method & Path**: `DELETE /api/jobs/:id`
- **Access**: Private (Job Owner or Admin)

---

### 4.4 Applications (`/api/applications`)

#### 1. Apply to a Job
- **Method & Path**: `POST /api/applications`
- **Access**: Private (`candidate`)
- **Request Body**:
```json
{
  "jobId": "67cbdf871234abcd5678ef90",
  "coverLetter": "Excited to bring 6 years of React and Cloud architecture experience to your team!"
}
```

#### 2. Candidate's Applications
- **Method & Path**: `GET /api/applications`
- **Access**: Private (`candidate`)

#### 3. Employer's Applicants Screen
- **Method & Path**: `GET /api/applications/employer`
- **Access**: Private (`employer`, `admin`)
- **Query Parameters**: `jobId` (optional filter)

#### 4. Update Application Status
- **Method & Path**: `PUT /api/applications/:id/status`
- **Access**: Private (`employer`, `admin`)
- **Request Body**:
```json
{
  "status": "Shortlisted"
}
```
*Valid statuses: `Applied`, `Under Review`, `Shortlisted`, `Interview`, `Rejected`, `Hired`*

---

### 4.5 Saved Jobs (Bookmarks) (`/api/saved-jobs`)

- `GET /api/saved-jobs`: Retrieve list of all bookmarked jobs for logged-in candidate
- `POST /api/saved-jobs/:id`: Bookmark job ID
- `DELETE /api/saved-jobs/:id`: Remove bookmark

---

### 4.6 Bonus: AI Resume Matcher (`/api/ai`)

#### 1. Calculate Resume Match Fit
- **Method & Path**: `POST /api/ai/match`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "candidateSkills": ["React", "Node.js", "TypeScript", "Docker"],
  "jobSkills": ["React", "Node.js", "TypeScript", "Kubernetes", "AWS"],
  "experienceYears": 5,
  "jobExperienceLevel": "mid"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "score": 88,
  "rating": "Strong Match",
  "matchedSkills": ["React", "Node.js", "TypeScript"],
  "missingSkills": ["Kubernetes", "AWS"],
  "experienceMatch": true,
  "recommendation": "High candidate alignment on primary tech stack."
}
```

---

### 4.7 Admin Analytics & Web Scraper (`/api/admin`)

- `GET /api/admin/stats`: Total counts of jobs, candidates, employers, applications, and system metrics.
- `GET /api/admin/users`: Full directory of platform users with role management and status toggling.
- `POST /api/admin/scrape`: Trigger real-time aggregation from public job sources with automatic deduplication.
- `GET /api/admin/settings`: View and update platform maintenance, scraping interval, and registration controls.
