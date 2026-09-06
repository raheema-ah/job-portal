/**
 * Helper utilities for detecting job application types (Internal vs External/Aggregated)
 * and safely handling external career site redirects.
 */

export const isExternalJob = (job) => {
  if (!job) return false;
  if (job.isExternal === true) return true;
  if (job.applicationUrl && String(job.applicationUrl).trim() !== '') return true;
  if (job.externalUrl && String(job.externalUrl).trim() !== '') return true;
  if (job.source && String(job.source).toLowerCase() !== 'direct') return true;
  if (job.isScraped === true && job.sourceUrl) return true;
  return false;
};

export const getExternalApplyUrl = (job) => {
  if (!job) return '';
  const raw = job.applicationUrl || job.externalUrl || job.sourceUrl || '';
  if (!raw) {
    // If company has a website, fall back to company careers or website
    if (job.companyWebsite) {
      return sanitizeHttpUrl(job.companyWebsite);
    }
    return '';
  }
  return sanitizeHttpUrl(raw);
};

export const sanitizeHttpUrl = (url) => {
  if (!url) return '';
  let trimmed = String(url).trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (e) {
    return '';
  }
  return trimmed;
};

export const getJobSourceLabel = (job) => {
  if (!job) return 'Company Website';
  return job.sourceName || job.source || (isExternalJob(job) ? 'Company Website' : 'Direct');
};
