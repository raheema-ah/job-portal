const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const ScrapeLog = require('../models/ScrapeLog');
const { generateDedupHash } = require('../services/scraperService');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing old collections...');

    await User.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await SavedJob.deleteMany();
    await ScrapeLog.deleteMany();

    console.log('[Seed] Creating demo users and companies...');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@jobportal.com',
      password: 'adminpassword123',
      role: 'admin',
      title: 'Principal Platform Administrator',
      location: 'San Francisco, CA',
    });

    // 2. Create Employers & Companies (Admin Role)
    const employer1 = await User.create({
      name: 'Alex Vance',
      email: 'alex@techcorp.com',
      password: 'employerpassword123',
      role: 'admin',
      title: 'Head of Talent Acquisition',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
    });

    const company1 = await Company.create({
      name: 'TechCorp Global Systems',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
      website: 'https://techcorp.example.com',
      industry: 'Enterprise Cloud & AI',
      description: 'TechCorp is a leading enterprise cloud architecture provider delivering scalable SaaS solutions to 5,000+ businesses worldwide.',
      location: 'New York, NY / Remote',
      size: '501-1000',
      contactEmail: 'careers@techcorp.example.com',
      createdBy: employer1._id,
    });
    employer1.company = company1._id;
    await employer1.save();

    const employer2 = await User.create({
      name: 'Marcus Brody',
      email: 'marcus@innovatelabs.io',
      password: 'employerpassword123',
      role: 'admin',
      title: 'Engineering Director',
      phone: '+1 (555) 876-5432',
      location: 'Austin, TX',
    });

    const company2 = await Company.create({
      name: 'InnovateLabs AI',
      logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
      website: 'https://innovatelabs.example.io',
      industry: 'Artificial Intelligence & Robotics',
      description: 'InnovateLabs crafts autonomous agent platforms and modern generative AI toolchains.',
      location: 'Austin, TX / Remote',
      size: '51-200',
      contactEmail: 'jobs@innovatelabs.example.io',
      createdBy: employer2._id,
    });
    employer2.company = company2._id;
    await employer2.save();

    // 3. Create Employee
    const employee1 = await User.create({
      name: 'Jordan Lee',
      email: 'employee@jobportal.com',
      password: 'employeepassword123',
      role: 'employee',
      employeeId: 'EMP-2026-001',
      department: 'Engineering',
      phone: '+1 (555) 789-0123',
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js', 'System Architecture', 'DevOps'],
    });

    // 4. Create Candidates
    const candidate1 = await User.create({
      name: 'David Miller',
      email: 'candidate@gmail.com',
      password: 'candidatepassword123',
      role: 'candidate',
      title: 'Senior Full Stack & React Specialist',
      bio: 'Full Stack engineer with 5+ years of experience building modern web applications using React, Node.js, TypeScript, and MongoDB. Passionate about AI agents and responsive UI/UX.',
      phone: '+1 (555) 987-6543',
      location: 'Seattle, WA',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Next.js', 'REST API', 'Docker', 'Git'],
      experienceYears: 5,
      education: 'B.S. in Computer Science - University of Washington',
      resumeText: 'David Miller | Full Stack Engineer. Skills: React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, Next.js, REST API, Docker, CI/CD, AWS. 5 years building scalable web architectures and frontend microservices. Led redesign of checkout flow increasing conversion by 28%.',
    });

    const candidate2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.ai@gmail.com',
      password: 'candidatepassword123',
      role: 'candidate',
      title: 'Machine Learning & Python Engineer',
      bio: 'Data scientist and ML engineer specialized in PyTorch, NLP pipelines, and Python backend microservices.',
      phone: '+1 (555) 456-7890',
      location: 'Boston, MA',
      skills: ['Python', 'FastAPI', 'PyTorch', 'TensorFlow', 'Data Science', 'Machine Learning', 'Docker', 'PostgreSQL', 'AWS'],
      experienceYears: 4,
      education: 'M.S. in Artificial Intelligence - MIT',
      resumeText: 'Elena Rostova | Machine Learning Engineer. 4 years of production ML experience. Python, FastAPI, PyTorch, Hugging Face, LLM fine-tuning, PostgreSQL, Redis, Kubernetes, Docker. Deployed enterprise RAG pipelines with 99.4% uptime.',
    });

    console.log('[Seed] Creating job postings...');

    const sampleJobs = [
      {
        title: 'Senior Full Stack React & Node Engineer',
        company: 'TechCorp Global Systems',
        location: 'New York, NY / Remote',
        workType: 'Remote',
        jobType: 'Full-time',
        salary: '$135,000 - $175,000',
        experience: 'Senior Level',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Tailwind CSS', 'REST API', 'Docker'],
        description: 'We are looking for a Senior Full Stack Engineer to lead the architecture of our core web platform. You will build highly responsive React interfaces, design robust Express/Node.js REST microservices, and optimize MongoDB data queries for high traffic.',
        requirements: [
          '5+ years of software engineering experience with JavaScript / TypeScript.',
          'Deep proficiency with React, state management, and modern component design.',
          'Solid backend fundamentals with Node.js, Express, and NoSQL/SQL databases.',
        ],
        responsibilities: [
          'Design and maintain scalable React frontends and Node.js microservices.',
          'Collaborate with product and design teams to deliver exceptional user experiences.',
        ],
        postedBy: admin._id,
      },
      {
        title: 'Generative AI & LLM Systems Architect',
        company: 'InnovateLabs AI',
        location: 'Austin, TX / Hybrid',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salary: '$160,000 - $210,000',
        experience: 'Lead / Manager',
        skills: ['Python', 'FastAPI', 'PyTorch', 'LLM', 'Machine Learning', 'Docker', 'AWS'],
        description: 'InnovateLabs is scaling our autonomous agent orchestration engine. As our Lead AI Architect, you will design RAG vector pipelines, fine-tune open-weight models, and build low-latency inference APIs.',
        requirements: [
          '6+ years of experience in production machine learning and distributed systems.',
          'Hands-on mastery of PyTorch, Transformers, and vector indexing.',
        ],
        responsibilities: [
          'Architect enterprise agent frameworks and model inference endpoints.',
        ],
        postedBy: admin._id,
      },
      {
        title: 'Lead DevOps & Cloud Platform Engineer',
        company: 'TechCorp Global Systems',
        location: 'Remote (US/Canada)',
        workType: 'Remote',
        jobType: 'Full-time',
        salary: '$145,000 - $185,000',
        experience: 'Senior Level',
        skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Go'],
        description: 'Own and elevate our multi-region AWS cloud infrastructure, automate deployment pipelines, and maintain 99.99% system availability across our global cluster.',
        requirements: ['5+ years in SRE / DevOps roles', 'Deep expertise with Kubernetes and Terraform'],
        responsibilities: ['Manage AWS production clusters and CI/CD pipelines.'],
        postedBy: admin._id,
      },
      {
        title: 'Frontend React UI/UX Developer',
        company: 'InnovateLabs AI',
        location: 'San Francisco, CA / Remote',
        workType: 'Remote',
        jobType: 'Full-time',
        salary: '$115,000 - $145,000',
        experience: 'Mid Level',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'HTML5', 'CSS3'],
        description: 'Build gorgeous, buttery-smooth interactive web interfaces for our AI tool suite. We value pixel perfection, accessible design, and fluid micro-animations.',
        requirements: ['3+ years with modern React & Tailwind CSS', 'Strong portfolio showcasing responsive web apps'],
        responsibilities: ['Build modern interactive React views with Tailwind CSS.'],
        postedBy: admin._id,
      },
      {
        title: 'Staff Backend Distributed Systems Engineer',
        company: 'Stripe Ecosystem Partner',
        location: 'San Francisco, CA / Remote',
        workType: 'Remote',
        jobType: 'Full-time',
        salary: '$170,000 - $230,000',
        experience: 'Senior Level',
        skills: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'REST API'],
        description: 'Help build high-throughput payment transaction pipelines handling millions of events daily with fault-tolerant distributed algorithms.',
        requirements: ['7+ years backend engineering', 'Expertise in Go/Golang and SQL tuning'],
        responsibilities: ['Scale transaction throughput and resilience.'],
        postedBy: admin._id,
        isExternal: true,
        source: 'Company Website',
        sourceName: 'Stripe Careers',
        externalUrl: 'https://stripe.com/jobs',
        applicationUrl: 'https://stripe.com/jobs/staff-backend-systems',
      },
      {
        title: 'Junior Full Stack Developer',
        company: 'LaunchPad Digital Ventures',
        location: 'Chicago, IL / Hybrid',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salary: '$70,000 - $90,000',
        experience: 'Entry Level',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML5', 'CSS3', 'Git'],
        description: 'Ideal starting role for an enthusiastic developer looking to ship real client software alongside senior mentors.',
        requirements: ['Computer Science degree or reputable bootcamp graduate', 'Proficiency in JavaScript and React'],
        responsibilities: ['Develop client-facing features under guidance of senior staff.'],
        postedBy: admin._id,
        isExternal: true,
        source: 'Company Website',
        sourceName: 'LaunchPad Careers',
        externalUrl: 'https://launchpad.example.com/careers',
        applicationUrl: 'https://launchpad.example.com/careers/apply/junior-fullstack',
      },
    ];

    const createdJobs = [];
    for (const job of sampleJobs) {
      const doc = await Job.create(job);
      createdJobs.push(doc);
    }

    console.log(`[Seed] Created ${createdJobs.length} sample jobs.`);

    // 4. Create sample applications
    const app1 = await Application.create({
      job: createdJobs[0]._id, // Senior Full Stack React & Node Engineer
      candidate: candidate1._id,
      resume: '/uploads/sample-david-miller-resume.pdf',
      coverLetter: 'Dear Hiring Manager, I am excited to apply for the Senior Full Stack position at TechCorp Global. With over 5 years building production React and Node.js web applications, I have delivered microservice architectures and high performance frontends.',
      status: 'Shortlisted',
    });

    const app2 = await Application.create({
      job: createdJobs[1]._id, // Generative AI & LLM Systems Architect
      candidate: candidate2._id,
      resume: '/uploads/sample-elena-resume.pdf',
      coverLetter: 'Hello InnovateLabs team, having built LLM agent pipelines and PyTorch models at MIT and industry labs, I am very enthusiastic about this systems architect role.',
      status: 'Under Review',
    });

    await Job.findByIdAndUpdate(createdJobs[0]._id, { applicantCount: 1 });
    await Job.findByIdAndUpdate(createdJobs[1]._id, { applicantCount: 1 });

    // 5. Create saved jobs
    await SavedJob.create({
      user: candidate1._id,
      job: createdJobs[0]._id,
    });
    await SavedJob.create({
      user: candidate1._id,
      job: createdJobs[3]._id,
    });

    // 6. Create sample Scrape Logs
    await ScrapeLog.create({
      source: 'Multi-Source (RemoteOK, Arbeitnow)',
      jobsFetched: 32,
      jobsAdded: 18,
      duplicatesSkipped: 14,
      errors: [],
      durationMs: 1420,
      status: 'success',
      triggeredBy: 'cron',
      runAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    });

    await ScrapeLog.create({
      source: 'Multi-Source (RemoteOK, Arbeitnow)',
      jobsFetched: 28,
      jobsAdded: 12,
      duplicatesSkipped: 16,
      errors: [],
      durationMs: 1280,
      status: 'success',
      triggeredBy: 'manual-admin',
      runAt: new Date(),
    });

    console.log('================================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
    console.log('Demo Credentials:');
    console.log('  👑 Admin:     email: admin@jobportal.com       password: adminpassword123');
    console.log('  💼 Employee:  email: employee@jobportal.com    password: employeepassword123');
    console.log('  👤 Candidate: email: candidate@gmail.com       password: candidatepassword123');
    console.log('  👤 Candidate: email: elena.ai@gmail.com        password: candidatepassword123');
    console.log('================================================================');
    return true;
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedData };
