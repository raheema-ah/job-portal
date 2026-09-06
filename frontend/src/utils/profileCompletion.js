/**
 * Calculates candidate profile completion progress and section statuses
 */
export function calculateProfileCompletion(user) {
  if (!user) {
    return {
      percentage: 0,
      completedCount: 0,
      totalSections: 9,
      sections: [],
      firstIncompleteSection: null,
    };
  }

  const basicInfo = user.basicInfo || {};
  const profInfo = user.professionalInfo || {};
  const catSkills = user.categorizedSkills || {};
  const allSkills = [
    ...(user.skills || []),
    ...(catSkills.technical || []),
    ...(catSkills.languages || []),
    ...(catSkills.frameworks || []),
    ...(catSkills.databases || []),
    ...(catSkills.tools || []),
  ];

  const sections = [
    {
      id: 'basic',
      name: 'Basic Information',
      tabKey: 'basic',
      completed: Boolean(
        user.name &&
          (user.phone || basicInfo.dob) &&
          (user.location || basicInfo.city || basicInfo.state)
      ),
      description: 'Full name, contact, location & social links',
    },
    {
      id: 'professional',
      name: 'Professional Information',
      tabKey: 'professional',
      completed: Boolean(
        profInfo.headline ||
          profInfo.aboutMe ||
          user.bio ||
          profInfo.currentJobTitle ||
          profInfo.totalExperience
      ),
      description: 'Headline, bio, current title & experience',
    },
    {
      id: 'skills',
      name: 'Skills',
      tabKey: 'skills',
      completed: Boolean(allSkills.length >= 3),
      description: 'Technical skills, frameworks & tools',
    },
    {
      id: 'education',
      name: 'Education',
      tabKey: 'education',
      completed: Boolean((user.educationList && user.educationList.length > 0) || user.education),
      description: 'Academic degrees and college qualifications',
    },
    {
      id: 'experience',
      name: 'Work Experience',
      tabKey: 'experience',
      completed: Boolean(
        (user.experienceList && user.experienceList.length > 0) || user.experienceYears > 0
      ),
      description: 'Employment history and past roles',
    },
    {
      id: 'projects',
      name: 'Projects',
      tabKey: 'projects',
      completed: Boolean(user.projectsList && user.projectsList.length > 0),
      description: 'Showcase portfolio and technical projects',
    },
    {
      id: 'resume',
      name: 'Resume',
      tabKey: 'resume',
      completed: Boolean(user.resume || (user.resumeData && user.resumeData.url)),
      description: 'Upload PDF/DOC resume document',
    },
    {
      id: 'certifications',
      name: 'Certifications',
      tabKey: 'certifications',
      completed: Boolean(user.certificationsList && user.certificationsList.length > 0),
      description: 'Accredited certificates and badges',
    },
    {
      id: 'languages',
      name: 'Languages',
      tabKey: 'languages',
      completed: Boolean(user.languagesList && user.languagesList.length > 0),
      description: 'Spoken languages & fluency levels',
    },
    {
      id: 'preferences',
      name: 'Job Preferences',
      tabKey: 'preferences',
      completed: Boolean(
        user.jobPreferences?.preferredRole ||
          user.jobPreferences?.workMode ||
          user.jobPreferences?.expectedSalary
      ),
      description: 'Target roles, work mode & salary expectation',
    },
  ];

  const totalSections = sections.length;
  const completedCount = sections.filter((s) => s.completed).length;
  const percentage = Math.round((completedCount / totalSections) * 100);
  const firstIncompleteSection = sections.find((s) => !s.completed) || null;

  return {
    percentage,
    completedCount,
    totalSections,
    sections,
    firstIncompleteSection,
  };
}
