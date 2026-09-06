import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Play,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Search,
  Layers,
  Database,
} from 'lucide-react';
import api from '../services/api';
import RoleLayout from '../components/RoleLayout';

const AdminScrapedJobsPage = () => {
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [jobsRes, logsRes] = await Promise.allSettled([
        api.get('/scrape/jobs'),
        api.get('/scrape/logs'),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data?.success) {
        setScrapedJobs(jobsRes.value.data.jobs || []);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.data?.success) {
        setLogs(logsRes.value.data.logs || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load scraped jobs data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerScraper = async () => {
    try {
      setScraping(true);
      setScrapeResult(null);
      setErrorMsg('');

      const res = await api.post('/scrape/jobs', {
        sources: ['RemoteOK', 'GitHub Jobs Archive', 'Arbeitnow'],
      });

      if (res.data?.success) {
        setScrapeResult(res.data);
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Scraper execution encountered an error.');
    } finally {
      setScraping(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this scraped job posting?')) return;
    try {
      const res = await api.delete(`/jobs/${id}`);
      if (res.data?.success) {
        setScrapedJobs((prev) => prev.filter((j) => j._id !== id));
      }
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  const filteredJobs = scrapedJobs.filter((j) => {
    const titleMatch = (j.title || '').toLowerCase().includes(search.toLowerCase());
    const compMatch = (j.company || '').toLowerCase().includes(search.toLowerCase());
    const sourceMatch = (j.source || '').toLowerCase().includes(search.toLowerCase());
    return titleMatch || compMatch || sourceMatch;
  });

  return (
    <RoleLayout
      role="admin"
      title="Scraped Jobs"
      subtitle="Automated job aggregation engine, external feeds inspection, and duplicate management."
      actions={
        <button
          onClick={handleTriggerScraper}
          disabled={scraping}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {scraping ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          {scraping ? 'Scraping Active...' : 'Trigger Scraper Now'}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Scrape Execution Result Banner */}
        {scrapeResult && (
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Scraper Run Completed Successfully!
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 pt-1">
              <span className="px-2.5 py-1 bg-white rounded-lg border border-blue-100">
                Jobs Added:{' '}
                <strong className="text-emerald-600 font-black">
                  +{scrapeResult.added || 0}
                </strong>
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg border border-blue-100">
                Duplicates Skipped:{' '}
                <strong className="text-slate-600 font-black">
                  {scrapeResult.duplicatesSkipped || 0}
                </strong>
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg border border-blue-100">
                Errors Encountered:{' '}
                <strong className="text-rose-600 font-black">{scrapeResult.errors || 0}</strong>
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Scraped Jobs
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">{scrapedJobs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Cron
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1.5">Every 6 Hours</p>
              <span className="text-[10px] text-emerald-600 font-bold">● Active Background Job</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Aggregation Feeds
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1.5">Arbeitnow / RemoteOK</p>
              <span className="text-[10px] text-slate-400 font-medium">Auto-deduplicated</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or source..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{filteredJobs.length}</strong> scraped jobs
          </span>
        </div>

        {/* Scraped Jobs Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading aggregated jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No scraped jobs yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Click "Trigger Scraper Now" above to aggregate real-time jobs from active external feeds.
              </p>
              <button
                onClick={handleTriggerScraper}
                disabled={scraping}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
              >
                Start Scraper
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3.5 px-6">Job Title</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Source Feed</th>
                    <th className="py-3.5 px-4">Scraped Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((j) => (
                    <tr key={j._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 leading-tight">{j.title}</p>
                        <span className="inline-block mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          {j.workMode || j.jobType || 'Full-time'}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-800">{j.company}</td>

                      <td className="py-4 px-4 text-slate-600">{j.location || 'Remote'}</td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                          {j.source || 'Aggregator'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {j.createdAt
                          ? new Date(j.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {j.sourceUrl && (
                            <a
                              href={j.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Open original listing URL"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handleDeleteJob(j._id)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete scraped job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default AdminScrapedJobsPage;
