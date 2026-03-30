import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Search, Globe, ChevronLeft, ChevronRight,
  ExternalLink, X, CheckCircle, TrendingUp, AlertCircle,
  MapPin, Clock, Building2, Loader2, RotateCcw, ChevronDown,
  Target, Award, Briefcase, Sparkles
} from 'lucide-react';
import { getToken } from '../utils/auth';

// ─── Types ─────────────────────────────────────────────────────────────────
interface WhyExplanation {
  overallReason: string;
  skillsMatched: { skill: string; evidence: string }[];
  keywordsFound: string[];
  technicalStrengths: string[];
  experienceAlignment: string;
  missingSkills: { skill: string; impact: string }[];
  steps: string[];
}

interface MatchedRole {
  roleName: string;
  matchPercent: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  experienceLevel: 'Entry' | 'Mid' | 'Senior';
  whyExplanation?: WhyExplanation;
}

interface ResumeAnalysis {
  candidateName: string | null;
  experienceSummary: string;
  totalExperienceYears: number | null;
  totalExperienceLabel: string | null;
  topSkills: string[];
  roles: MatchedRole[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  isRemote: boolean;
  salary: string | null;
  postedAt: string | null;
  applyUrl: string;
  logo: string | null;
  description: string;
}

type Country = 'us' | 'in' | 'uk' | 'ca';

const COUNTRIES: { code: Country; label: string; flag: string; description: string }[] = [
  { code: 'us', label: 'United States', flag: '🇺🇸', description: 'LinkedIn, Indeed, USAJobs' },
  { code: 'in', label: 'India',         flag: '🇮🇳', description: 'LinkedIn, Naukri, Indeed' },
  { code: 'uk', label: 'United Kingdom', flag: '🇬🇧', description: 'LinkedIn, Reed, Totaljobs' },
  { code: 'ca', label: 'Canada',        flag: '🇨🇦', description: 'LinkedIn, Job Bank, Indeed' },
];

const DEMAND_STYLE: Record<string, string> = {
  High:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50   text-amber-700   border-amber-200',
  Low:    'bg-red-50     text-red-700     border-red-200',
};

const EXP_STYLE: Record<string, string> = {
  Entry:  'bg-blue-50   text-blue-700   border-blue-200',
  Mid:    'bg-teal-50   text-teal-700   border-teal-200',
  Senior: 'bg-slate-100 text-slate-700  border-slate-200',
};

function matchBarColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-teal-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-400';
}

function matchTextColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600';
  if (pct >= 60) return 'text-teal-600';
  if (pct >= 40) return 'text-amber-600';
  return 'text-red-500';
}

// ─── API helpers ────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || '';

async function analyzeResume(file: File): Promise<{ analysis: ResumeAnalysis; fileName: string }> {
  const token = getToken();
  const form = new FormData();
  form.append('resume', file);
  const res = await fetch(`${API_BASE}/api/job-match/analyze-resume`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed');
  return { analysis: data.analysis, fileName: data.fileName };
}

async function searchJobs(role: string, country: Country): Promise<Job[]> {
  const token = getToken();
  const params = new URLSearchParams({ role, country });
  const res = await fetch(`${API_BASE}/api/job-match/search-jobs?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Job search failed');
  return data.jobs || [];
}

async function fetchSavedAnalysis(): Promise<{ analysis: ResumeAnalysis; fileName: string; analyzedAt: string } | null> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/job-match/my-analysis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  // Server detected stale cache and deleted it — treat as no analysis
  if (!res.ok || !data.success || !data.analysis || data.staleCache) return null;
  return { analysis: data.analysis, fileName: data.fileName, analyzedAt: data.analyzedAt };
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function JobMatches() {
  const navigate = useNavigate();

  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analysis, setAnalysis]     = useState<ResumeAnalysis | null>(null);
  const [fileName, setFileName]     = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [selectedRole, setSelectedRole]   = useState<MatchedRole | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>('us');
  const [countryOpen, setCountryOpen]     = useState(false);

  const [jobs, setJobs]             = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError]   = useState<string | null>(null);
  const [jobsSearched, setJobsSearched] = useState(false);

  useEffect(() => {
    fetchSavedAnalysis()
      .then(saved => {
        if (saved) {
          setAnalysis(saved.analysis);
          setFileName(saved.fileName);
          setAnalyzedAt(saved.analyzedAt);
        }
        // If null: either no analysis ever, or stale cache was cleared → show upload screen
      })
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowed.includes(file.type)) {
      setUploadError('Only .doc and .docx files are supported. PDF support coming soon!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { setUploadError('File size must be under 5MB.'); return; }
    setUploadError(null);
    setUploading(true);
    setSelectedRole(null);
    setJobs([]);
    setJobsSearched(false);
    try {
      const result = await analyzeResume(file);
      setAnalysis(result.analysis);
      setFileName(result.fileName);
      setAnalyzedAt(new Date().toISOString());
    } catch (err: any) {
      setUploadError(err.message || 'Failed to analyze resume. Please try again.');
    } finally { setUploading(false); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleSearchJobs = useCallback(async () => {
    if (!selectedRole) return;
    setJobsLoading(true); setJobsError(null); setJobsSearched(true);
    try {
      const results = await searchJobs(selectedRole.roleName, selectedCountry);
      setJobs(results);
    } catch (err: any) {
      setJobsError(err.message || 'Search failed.');
    } finally { setJobsLoading(false); }
  }, [selectedRole, selectedCountry]);

  useEffect(() => {
    if (jobsSearched && selectedRole) handleSearchJobs();
    // eslint-disable-next-line
  }, [selectedCountry]);

  const resetAll = () => {
    setAnalysis(null); setFileName(null); setAnalyzedAt(null);
    setSelectedRole(null); setJobs([]); setJobsSearched(false); setUploadError(null);
  };

  const selectedCountryInfo = COUNTRIES.find(c => c.code === selectedCountry)!;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        @keyframes barGrow { from { width:0; } to {} }
        .bar-grow { animation: barGrow 0.9s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tools')}
              className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 text-xs font-semibold transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Tools
            </button>
            <span className="text-slate-300 text-sm">/</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-base font-bold text-slate-900">Job Matches</h1>
            </div>
          </div>

          {/* Step indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {['Upload Resume', 'Match Roles', 'Find Jobs'].map((step, i) => {
              const done = (i === 0 && !!analysis) || (i === 1 && !!selectedRole) || (i === 2 && jobsSearched);
              const active = (!analysis && i === 0) || (analysis && !selectedRole && i === 1) || (selectedRole && !jobsSearched && i === 2);
              return (
                <div key={step} className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    done ? 'bg-emerald-600 text-white border-emerald-600' :
                    active ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                    'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {done ? <CheckCircle className="w-3 h-3" /> : <span className="w-3.5 h-3.5 rounded-full bg-current/20 flex items-center justify-center text-[8px]">{i+1}</span>}
                    {step}
                  </div>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {loadingSaved ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Loading your analysis…</p>
          </div>

        ) : !analysis ? (
          /* ── STEP 1: Upload ─────────────────────────────────────────────── */
          <div className="fade-up">
            {/* Feature intro */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">AI Resume Analyzer</h2>
              <p className="text-sm text-slate-500">Upload your resume to discover which roles you match and find real job listings worldwide.</p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: <Target className="w-3.5 h-3.5" />, label: 'Role match accuracy scores' },
                { icon: <Globe className="w-3.5 h-3.5" />, label: 'USA · India · UK · Canada jobs' },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Salary & demand insights' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
                  <span className="text-emerald-600">{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative bg-white border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                dragging ? 'border-emerald-400 bg-emerald-50 scale-[1.005]' :
                'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileInput}
                disabled={uploading}
              />
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                {uploading ? (
                  <>
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
                    </div>
                    <p className="text-base font-bold text-slate-800 mb-1">Analyzing your resume…</p>
                    <p className="text-sm text-slate-500 mb-4">AI is scanning skills, experience &amp; matching roles</p>
                    <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${dragging ? 'bg-emerald-200' : 'bg-emerald-50'}`}>
                      <Upload className={`w-7 h-7 ${dragging ? 'text-emerald-700' : 'text-emerald-500'}`} />
                    </div>
                    <p className="text-base font-bold text-slate-800 mb-1">
                      {dragging ? 'Drop it here!' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-slate-500 mb-5">
                      Supports .doc and .docx files up to 5MB
                    </p>
                    <button
                      type="button"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="mt-3 flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 flex-1">{uploadError}</p>
                <button onClick={() => setUploadError(null)}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
              </div>
            )}

            {/* How it works */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { num: '1', title: 'Upload Resume', desc: 'We parse your .doc or .docx file securely', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
                { num: '2', title: 'AI Role Matching', desc: 'Get up to 10 roles with accuracy scores', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
                { num: '3', title: 'Find Real Jobs', desc: 'Browse live listings from top job boards', icon: <Briefcase className="w-4 h-4 text-emerald-700" /> },
              ].map(step => (
                <div key={step.num} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 mb-0.5">{step.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (
          /* ── STEP 2+3: Results ──────────────────────────────────────────── */
          <div className="space-y-5 fade-up">

            {/* File summary bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 truncate">{fileName}</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> Analyzed
                  </span>
                  {analyzedAt && (
                    <span className="text-[10px] text-slate-400">
                      {new Date(analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                {analysis.candidateName && (
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {analysis.candidateName}
                    {(analysis.totalExperienceLabel || analysis.totalExperienceYears) &&
                      ` · ${analysis.totalExperienceLabel || `${analysis.totalExperienceYears} yrs`} experience`
                    }
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{analysis.experienceSummary}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> New Resume
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 flex-1">{uploadError}</p>
                <button onClick={() => setUploadError(null)}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
              </div>
            )}

            {/* ── Matched Roles ─────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {analysis.roles.length} Eligible Job Roles
                </h2>
                <span className="text-xs text-slate-400">— click a role to expand details & find jobs</span>
              </div>

              <div className="divide-y divide-slate-100">
                {analysis.roles
                  .sort((a, b) => b.matchPercent - a.matchPercent)
                  .map((role, idx) => {
                    const isSelected = selectedRole?.roleName === role.roleName;
                    const isExpanded = expandedRole === role.roleName;
                    const why = role.whyExplanation;
                    return (
                      <div key={role.roleName + idx}>
                        {/* ── Role row ── */}
                        <div
                          className={`px-5 py-4 flex items-center gap-4 transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setSelectedRole(role);
                            setJobs([]);
                            setJobsSearched(false);
                            setExpandedRole(isExpanded ? null : role.roleName);
                          }}
                        >
                          {/* Match % circle */}
                          <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 font-black text-sm tabular-nums ${
                            isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : `border-slate-200 ${matchTextColor(role.matchPercent)}`
                          }`}>
                            {role.matchPercent}
                            <span className="text-[8px] font-bold opacity-70">%</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <p className="text-sm font-bold text-slate-900 leading-tight">{role.roleName}</p>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${DEMAND_STYLE[role.demandLevel]}`}>{role.demandLevel} Demand</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${EXP_STYLE[role.experienceLevel]}`}>{role.experienceLevel}</span>
                            </div>
                            {/* Match bar */}
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-sm">
                              <div
                                className={`bar-grow h-full rounded-full ${matchBarColor(role.matchPercent)}`}
                                style={{ width: `${role.matchPercent}%` }}
                              />
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* ── Expandable WHY explanation ── */}
                        {isExpanded && why && (
                          <div className="bg-slate-50 border-t border-slate-100 px-5 py-5 space-y-4 fade-up">

                            {/* Overall reason */}
                            <div className="flex gap-3">
                              <div className="w-1 bg-emerald-400 rounded-full shrink-0" />
                              <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{why.overallReason}</p>
                            </div>

                            {/* Skills matched */}
                            {why.skillsMatched?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">✅ Skills Matched</p>
                                <div className="space-y-1.5">
                                  {why.skillsMatched.map((sm, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded shrink-0">{sm.skill}</span>
                                      <span className="text-[11px] text-slate-600 leading-snug">{sm.evidence}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Keywords found */}
                            {why.keywordsFound?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">🔑 Keywords Found in Resume</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {why.keywordsFound.map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold rounded">{kw}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Technical strengths */}
                            {why.technicalStrengths?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">💪 Technical Strengths</p>
                                <div className="space-y-1">
                                  {why.technicalStrengths.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                      <span className="text-[11px] text-slate-700">{s}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Experience alignment */}
                            {why.experienceAlignment && (
                              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">📅 Experience Alignment</p>
                                <p className="text-[12px] text-slate-700">{why.experienceAlignment}</p>
                              </div>
                            )}

                            {/* Step by step */}
                            {why.steps?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">📋 Step-by-Step Analysis</p>
                                <div className="space-y-2">
                                  {why.steps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                      <span className="text-[12px] text-slate-700 leading-relaxed">{step.replace(/^Step \d+:\s*/i, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing skills */}
                            {why.missingSkills?.length > 0 && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-2">⚠️ Skills to Add (to improve match)</p>
                                <div className="space-y-1.5">
                                  {why.missingSkills.map((ms, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold rounded shrink-0">{ms.skill}</span>
                                      <span className="text-[11px] text-amber-700">{ms.impact}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Find jobs CTA */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedRole(role); setJobs([]); setJobsSearched(false); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                            >
                              <Search className="w-4 h-4" /> Find Jobs for {role.roleName}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ── Job Search Panel ──────────────────────────────────────── */}
            {selectedRole && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden fade-up">
                {/* Panel header */}
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white font-bold text-sm">{selectedRole.roleName} — Job Listings</p>
                    <p className="text-emerald-200 text-xs mt-0.5">Live results from top job boards worldwide</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Country dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setCountryOpen(v => !v)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-semibold transition-all backdrop-blur-sm"
                      >
                        <span>{selectedCountryInfo.flag}</span>
                        <span>{selectedCountryInfo.label}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {countryOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 w-52 overflow-hidden">
                          {COUNTRIES.map(c => (
                            <button
                              key={c.code}
                              onClick={() => { setSelectedCountry(c.code); setCountryOpen(false); }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-emerald-50 transition-colors ${selectedCountry === c.code ? 'bg-emerald-50' : ''}`}
                            >
                              <span className="text-base">{c.flag}</span>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">{c.label}</p>
                                <p className="text-[9px] text-slate-400">{c.description}</p>
                              </div>
                              {selectedCountry === c.code && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSearchJobs}
                      disabled={jobsLoading}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-50 transition-all shadow-sm disabled:opacity-60"
                    >
                      {jobsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      {jobsLoading ? 'Searching…' : 'Find Jobs'}
                    </button>
                  </div>
                </div>


                {/* Jobs list */}
                <div className="p-4">
                  {!jobsSearched && !jobsLoading && (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Select a country &amp; click Find Jobs</p>
                      <p className="text-xs text-slate-400">We'll search LinkedIn, Indeed, and official job boards</p>
                    </div>
                  )}

                  {jobsLoading && (
                    <div className="text-center py-10">
                      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Searching in {selectedCountryInfo.label}…</p>
                    </div>
                  )}

                  {jobsError && (
                    <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-700 flex-1">{jobsError}</p>
                      <button onClick={handleSearchJobs} className="text-xs text-red-600 font-bold hover:underline shrink-0">Retry</button>
                    </div>
                  )}

                  {!jobsLoading && jobsSearched && jobs.length === 0 && !jobsError && (
                    <div className="text-center py-10">
                      <p className="text-sm font-semibold text-slate-700 mb-1">No results found</p>
                      <p className="text-xs text-slate-400 mb-4">Try a different country or role</p>
                      <button onClick={handleSearchJobs} className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">Try Again</button>
                    </div>
                  )}

                  {!jobsLoading && jobs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-600">{jobs.length} listings · {selectedCountryInfo.flag} {selectedCountryInfo.label}</p>
                        <button onClick={handleSearchJobs} className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-800 font-bold">
                          <RotateCcw className="w-3 h-3" /> Refresh
                        </button>
                      </div>

                      {jobs.map(job => (
                        <a
                          key={job.id}
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 p-3.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl transition-all duration-150"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {job.logo
                              ? <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                              : <Building2 className="w-4 h-4 text-slate-400" />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{job.title}</p>
                                <p className="text-[11px] text-slate-500 font-semibold">{job.company}</p>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-0.5" />
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {job.location && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <MapPin className="w-3 h-3" />{job.location}
                                </span>
                              )}
                              {job.isRemote && <span className="px-1.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-[9px] font-bold rounded">Remote</span>}
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-semibold rounded">{job.employmentType}</span>
                              {job.salary && <span className="text-[10px] text-emerald-700 font-bold">{job.salary}</span>}
                              {job.postedAt && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  {(() => {
                                    const diff = Math.floor((Date.now() - new Date(job.postedAt!).getTime()) / 86400000);
                                    return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills gap now shown inside expanded WHY section per role */}
          </div>
        )}
      </div>
    </div>
  );
}
