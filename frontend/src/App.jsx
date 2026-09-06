import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Authentication Pages
import WelcomePage from './pages/WelcomePage';
import JobSeekerAuthPage from './pages/JobSeekerAuthPage';
import EmployerAuthPage from './pages/EmployerAuthPage';

// Shared Job Details
import JobDetailsPage from './pages/JobDetailsPage';

// Candidate Pages
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateJobsPage from './pages/CandidateJobsPage';
import CandidateSavedJobsPage from './pages/CandidateSavedJobsPage';
import CandidateApplicationsPage from './pages/CandidateApplicationsPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import CandidateResumePage from './pages/CandidateResumePage';
import CandidateNotificationsPage from './pages/CandidateNotificationsPage';
import CandidateSettingsPage from './pages/CandidateSettingsPage';

// Employer Pages
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerJobsPage from './pages/EmployerJobsPage';
import EmployerPostJobPage from './pages/EmployerPostJobPage';
import EmployerApplicantsPage from './pages/EmployerApplicantsPage';
import EmployerCompanyPage from './pages/EmployerCompanyPage';
import EmployerReportsPage from './pages/EmployerReportsPage';
import EmployerNotificationsPage from './pages/EmployerNotificationsPage';
import EmployerSettingsPage from './pages/EmployerSettingsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCandidatesPage from './pages/AdminCandidatesPage';
import AdminEmployersPage from './pages/AdminEmployersPage';
import AdminCompaniesPage from './pages/AdminCompaniesPage';
import AdminJobsPage from './pages/AdminJobsPage';
import AdminCreateJobPage from './pages/AdminCreateJobPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminScrapedJobsPage from './pages/AdminScrapedJobsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {/* Splash Screen displayed for exactly 3 seconds on initial website load */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* ================= WELCOME & PUBLIC ================= */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />

              {/* ================= JOB SEEKER AUTH ================= */}
              <Route path="/job-seeker" element={<JobSeekerAuthPage initialMode="login" />} />
              <Route path="/job-seeker/login" element={<JobSeekerAuthPage initialMode="login" />} />
              <Route path="/job-seeker/register" element={<JobSeekerAuthPage initialMode="register" />} />
              <Route path="/jobseeker" element={<Navigate to="/job-seeker" replace />} />
              <Route path="/login" element={<JobSeekerAuthPage initialMode="login" />} />

              {/* ================= EMPLOYER AUTH ================= */}
              <Route path="/employer" element={<EmployerAuthPage initialMode="login" />} />
              <Route path="/employer/login" element={<EmployerAuthPage initialMode="login" />} />
              <Route path="/employer/register" element={<EmployerAuthPage initialMode="register" />} />

              {/* ================= CANDIDATE ROUTES ================= */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/jobs/:id"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <JobDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/saved-jobs"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateSavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/applications"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/resume"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateResumePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/notifications"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/settings"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* ================= EMPLOYER ROUTES ================= */}
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/post-job"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerPostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/edit/:id"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerPostJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/applicants"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerApplicantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/company"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerCompanyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/reports"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/notifications"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/settings"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EmployerSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* ================= ADMIN ROUTES ================= */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/candidates"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCandidatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employers"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminEmployersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/companies"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCompaniesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs/create"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCreateJobPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/scraped-jobs"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminScrapedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* ================= EMPLOYEE ROUTES ================= */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute requiredRole="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to Welcome Page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
