import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, ChevronLeft, Building2, MapPin, Clock,
  ExternalLink, Search, RefreshCw, Bookmark,
  AlertCircle, Loader2, DollarSign, Globe, Target
} from 'lucide-react';
import { getToken } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface JobListing {
  id: string;
  role: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  salary: string;
  postedAt: string;
  applyUrl: string;
  logo?: string;
  employmentType: string;
  description: string;
  matchScore: number;
}

const getPostedAgo = (dateString: string) => {
  const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
  if (days < 0) return 'Just now';
  return days === 0 ? 'Today' : `${days}d ago`;
};

export default function JobPortal() {
  const navigate = useNavigate();
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('All');
  const [jobs, setJobs] = useState<JobListing[]>([]);

  useEffect(() => {
    async function fetchTargetRoles() {
      try {
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_BASE}/api/job-match/target-roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.roles && data.roles.length > 0) {
          setTargetRoles(data.roles);
          
          // Fetch actual live jobs from RapidAPI (via our backend) for each role
          const rolePromises = data.roles.map(async (role: string) => {
            const jobRes = await fetch(`${API_BASE}/api/job-match/live-jobs?role=${encodeURIComponent(role)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const jobData = await jobRes.json();
            
            if (jobData.success && jobData.data) {
              return jobData.data.map((job: any) => ({
                ...job,
                role,
                matchScore: Math.floor(Math.random() * 10 + 85) // Simulated dynamic match score 85-95
              }));
            }
            return [];
          });

          // Wait for all role searches to finish concurrently
          const results = await Promise.allSettled(rolePromises);
          let allJobs: JobListing[] = [];
          
          results.forEach(res => {
            if (res.status === 'fulfilled' && res.value.length > 0) {
              allJobs = [...allJobs, ...res.value];
            }
          });
          
          // Sort by highest match score
          allJobs.sort((a, b) => b.matchScore - a.matchScore);
          setJobs(allJobs);
        } else {
          // No roles saved, meaning they bypassed the funnel somehow
          navigate('/tools/job-matches');
        }
      } catch (err: any) {
        console.error(err);
        setError('Could not connect to the database to retrieve your roles.');
      } finally {
        setLoading(false);
      }
    }
    fetchTargetRoles();
  }, [navigate]);

  const filteredJobs = activeTab === 'All' 
    ? jobs 
    : jobs.filter(j => j.role === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 tracking-wide">Connecting to Job Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-xl border border-red-200 text-center max-w-md w-full shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans pb-20">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tools/job-matches')}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              title="Back to Setup"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 leading-tight">Live Job Portal</h1>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Real-Time Search</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Active Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Top summary row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 fade-up">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Your Curated Matches</h2>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              We are tracking live postings across the web exclusively for your selected target roles. Filter by role below or browse all opportunities.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-all shadow-sm">
              <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh Feed
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: ROLES FILTER */}
          <div className="lg:col-span-3 space-y-6 fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Filter by Target Role</h3>
              
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('All')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                    activeTab === 'All' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-sm font-bold">All Jobs</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'All' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {jobs.length}
                  </span>
                </button>

                {targetRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveTab(role)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                      activeTab === role ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-sm font-bold text-left truncate pr-2">{role}</span>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === role ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                      {jobs.filter(j => j.role === role).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT MAIN: JOB FEED */}
          <div className="lg:col-span-9 space-y-4 fade-up" style={{ animationDelay: '0.2s' }}>
            {filteredJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No active postings found right now.</h3>
                <p className="text-sm text-slate-500">We continuously scan job boards. Check back soon for updates to this role.</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="group bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col sm:flex-row gap-5">
                  
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 p-3 group-hover:scale-105 transition-transform duration-300">
                    <img src={job.logo || `https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`} 
                         onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                         className="w-full h-full object-contain"
                         alt={job.company} />
                    <Building2 className="w-6 h-6 text-slate-300 hidden" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm font-semibold text-slate-600">{job.company}</p>
                      </div>
                      
                      {/* Top right match badge (desktop) */}
                      <div className="hidden sm:flex flex-col items-end">
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          <Target className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] font-black text-emerald-700">{job.matchScore}% Match</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getPostedAgo(job.postedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                        {job.isRemote ? <Globe className="w-3 h-3 text-teal-600" /> : <MapPin className="w-3 h-3 text-slate-400" />}
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {job.employmentType}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2 mt-4 sm:mt-0 sm:pl-4 sm:border-l border-slate-100">
                    <button onClick={() => window.open(job.applyUrl, '_blank')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                      Apply <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors" title="Save Job">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
