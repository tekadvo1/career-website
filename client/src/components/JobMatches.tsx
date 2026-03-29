import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Search, Globe, ChevronRight,
  ExternalLink, X, CheckCircle, TrendingUp, AlertCircle,
  MapPin, Clock, Building2, Loader2, RotateCcw, ChevronDown,
  ArrowRight, Zap, Target, Award, ChevronLeft
} from 'lucide-react';
import { getToken } from '../utils/auth';

// ─── Types ─────────────────────────────────────────────────────────────────
interface MatchedRole {
  roleName: string;
  matchPercent: number;
  category: string;
  keySkillsMatched: string[];
  missingSkills: string[];
  avgSalaryUSD: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  experienceLevel: 'Entry' | 'Mid' | 'Senior';
  summary: string;
}

interface ResumeAnalysis {
  candidateName: string | null;
  experienceSummary: string;
  totalExperienceYears: number | null;
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
  { code: 'in', label: 'India', flag: '🇮🇳', description: 'LinkedIn, Naukri, Indeed' },
  { code: 'uk', label: 'United Kingdom', flag: '🇬🇧', description: 'LinkedIn, Reed, Totaljobs' },
  { code: 'ca', label: 'Canada', flag: '🇨🇦', description: 'LinkedIn, Job Bank, Indeed' },
];

const DEMAND_COLOR: Record<string, string> = {
  High: 'text-emerald-700 bg-emerald-100 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-100 border-amber-200',
  Low: 'text-red-700 bg-red-100 border-red-200',
};

const EXP_COLOR: Record<string, string> = {
  Entry: 'text-blue-700 bg-blue-100 border-blue-200',
  Mid: 'text-violet-700 bg-violet-100 border-violet-200',
  Senior: 'text-rose-700 bg-rose-100 border-rose-200',
};

function getMatchColor(pct: number) {
  if (pct >= 80) return { bar: 'from-emerald-400 to-teal-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' };
  if (pct >= 60) return { bar: 'from-blue-400 to-indigo-500', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-300' };
  if (pct >= 40) return { bar: 'from-amber-400 to-orange-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' };
  return { bar: 'from-red-400 to-rose-500', text: 'text-red-700', bg: 'bg-red-50 border-red-300' };
}

// ─── API helpers ───────────────────────────────────────────────────────────
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

async function searchJobs(role: string, country: Country, page = 1): Promise<Job[]> {
  const token = getToken();
  const params = new URLSearchParams({ role, country, page: String(page) });
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
  if (!res.ok || !data.success || !data.analysis) return null;
  return { analysis: data.analysis, fileName: data.fileName, analyzedAt: data.analyzedAt };
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function JobMatches() {
  // Upload state
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis state
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Role selection
  const [selectedRole, setSelectedRole] = useState<MatchedRole | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>('us');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsSearched, setJobsSearched] = useState(false);

  // Load saved analysis on mount
  useEffect(() => {
    fetchSavedAnalysis()
      .then((saved) => {
        if (saved) {
          setAnalysis(saved.analysis);
          setFileName(saved.fileName);
          setAnalyzedAt(saved.analyzedAt);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

  // File handling
  const handleFile = useCallback(async (file: File) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowed.includes(file.type)) {
      setUploadError('Only .doc and .docx files are supported. PDF support coming soon!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size is 5MB.');
      return;
    }
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
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  // Job search
  const handleSearchJobs = useCallback(async () => {
    if (!selectedRole) return;
    setJobsLoading(true);
    setJobsError(null);
    setJobsSearched(true);
    try {
      const results = await searchJobs(selectedRole.roleName, selectedCountry);
      setJobs(results);
    } catch (err: any) {
      setJobsError(err.message || 'Job search failed. Please try again.');
    } finally {
      setJobsLoading(false);
    }
  }, [selectedRole, selectedCountry]);

  // Auto-search when role or country changes (if already searched)
  useEffect(() => {
    if (jobsSearched && selectedRole) handleSearchJobs();
    // eslint-disable-next-line
  }, [selectedCountry]);

  const resetAll = () => {
    setAnalysis(null);
    setFileName(null);
    setAnalyzedAt(null);
    setSelectedRole(null);
    setJobs([]);
    setJobsSearched(false);
    setUploadError(null);
  };

  const selectedCountryInfo = COUNTRIES.find((c) => c.code === selectedCountry)!
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .anim-slide-up { animation: slideUp 0.45s ease both; }
        .anim-fade { animation: fadeIn 0.3s ease both; }
        @keyframes matchBar { from { width: 0; } to { } }
        .match-bar { animation: matchBar 1s cubic-bezier(.4,0,.2,1) both; }
        .role-card:hover { transform: translateY(-2px); }
      `}</style>

      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Header ── */}
          <div className="mb-8 anim-slide-up">
            {/* Back button */}
            <button
              onClick={() => navigate('/tools')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-700 mb-4 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Tools
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Matches</h1>
                <p className="text-sm text-slate-500 font-medium">AI-powered resume analysis → real job opportunities</p>
              </div>
            </div>

            {/* Steps pill */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {['Upload Resume', 'See Matching Roles', 'Find Jobs'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    (!analysis && i === 0) ? 'bg-violet-600 text-white border-violet-600 shadow-md' :
                    (analysis && !selectedRole && i === 1) ? 'bg-violet-600 text-white border-violet-600 shadow-md' :
                    (selectedRole && i === 2) ? 'bg-violet-600 text-white border-violet-600 shadow-md' :
                    'bg-white text-slate-500 border-slate-200'
                  }`}>
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-black">{i + 1}</span>
                    {step}
                  </div>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                </div>
              ))}
            </div>
          </div>

          {loadingSaved ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading your saved analysis…</p>
            </div>
          ) : !analysis ? (
            /* ── STEP 1: Upload ── */
            <div className="anim-slide-up" style={{ animationDelay: '0.1s' }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragging
                    ? 'border-violet-400 bg-violet-50 scale-[1.01] shadow-lg shadow-violet-100'
                    : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 bg-white'
                } ${uploading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploading}
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800 mb-1">Analyzing your resume…</p>
                      <p className="text-sm text-slate-500">AI is scanning skills, experience, and matching roles</p>
                    </div>
                    <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-[pulse_1.5s_infinite] w-3/4" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-violet-200 scale-110' : 'bg-violet-50'}`}>
                      <Upload className={`w-9 h-9 transition-colors ${dragging ? 'text-violet-700' : 'text-violet-500'}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-800 mb-1">
                        {dragging ? 'Drop your resume here!' : 'Upload your resume'}
                      </p>
                      <p className="text-sm text-slate-500 mb-3">Drag & drop or click to browse — .doc and .docx only</p>
                      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> .docx supported</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> .doc supported</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Max 5MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 transition-all hover:-translate-y-0.5"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl anim-fade">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                  <button onClick={() => setUploadError(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[
                  { icon: <Target className="w-5 h-5 text-violet-600" />, title: 'Smart Role Matching', desc: 'AI detects which roles suit you best with accuracy scores up to 95%', color: 'bg-violet-50 border-violet-100' },
                  { icon: <Globe className="w-5 h-5 text-blue-600" />, title: 'Multi-Country Jobs', desc: 'Find opportunities in USA, India, UK & Canada from top job boards', color: 'bg-blue-50 border-blue-100' },
                  { icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, title: 'Salary Insights', desc: 'See market salary ranges and demand levels for every matched role', color: 'bg-emerald-50 border-emerald-100' },
                ].map((card) => (
                  <div key={card.title} className={`p-4 rounded-xl border ${card.color} flex gap-3`}>
                    <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{card.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── STEP 2 + 3: Analysis & Jobs ── */
            <div className="space-y-6 anim-slide-up">

              {/* Resume summary card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200 shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 truncate">{fileName}</p>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> Analyzed
                    </span>
                  </div>
                  {analysis.candidateName && (
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{analysis.candidateName}{analysis.totalExperienceYears ? ` · ${analysis.totalExperienceYears} yrs exp` : ''}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{analysis.experienceSummary}</p>
                  {analyzedAt && (
                    <p className="text-[10px] text-slate-400 mt-1">Analyzed {new Date(analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {analysis.topSkills.slice(0, 3).map((skill) => (
                    <span key={skill} className="hidden lg:inline-flex px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-lg">{skill}</span>
                  ))}
                  <button
                    onClick={resetAll}
                    title="Upload a new resume"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-violet-700 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-xl transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> New Resume
                  </button>
                </div>
              </div>

              {/* Upload error (re-upload attempt) */}
              {uploadError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl anim-fade">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                  <button onClick={() => setUploadError(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Matched Roles grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-violet-600" />
                  <h2 className="text-base font-black text-slate-900">
                    {analysis.roles.length} Matched Roles
                  </h2>
                  <span className="text-xs text-slate-500">— click a role to find jobs</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.roles
                    .sort((a, b) => b.matchPercent - a.matchPercent)
                    .map((role, idx) => {
                      const mc = getMatchColor(role.matchPercent);
                      const isSelected = selectedRole?.roleName === role.roleName;
                      return (
                        <button
                          key={role.roleName + idx}
                          onClick={() => {
                            setSelectedRole(role);
                            setJobs([]);
                            setJobsSearched(false);
                          }}
                          className={`role-card text-left p-4 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                            isSelected
                              ? 'border-violet-400 bg-violet-50 shadow-violet-100'
                              : 'border-slate-200 bg-white hover:border-violet-200'
                          }`}
                          style={{ animationDelay: `${idx * 0.07}s` }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-slate-900 leading-tight">{role.roleName}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{role.category}</p>
                            </div>
                            <div className={`text-lg font-black ${mc.text} tabular-nums shrink-0`}>
                              {role.matchPercent}%
                            </div>
                          </div>

                          {/* Match bar */}
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div
                              className={`match-bar h-full rounded-full bg-gradient-to-r ${mc.bar}`}
                              style={{ width: `${role.matchPercent}%` }}
                            />
                          </div>

                          <p className="text-[11px] text-slate-600 mb-3 line-clamp-2 leading-relaxed">{role.summary}</p>

                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {role.keySkillsMatched.slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold rounded-full">{s}</span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${DEMAND_COLOR[role.demandLevel]}`}>{role.demandLevel} Demand</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${EXP_COLOR[role.experienceLevel]}`}>{role.experienceLevel}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{role.avgSalaryUSD}</span>
                          </div>

                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-violet-200 flex items-center gap-1.5 text-violet-700 text-[11px] font-bold">
                              <CheckCircle className="w-3.5 h-3.5" /> Selected — choose a country below
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* ── Job Search Panel ── */}
              {selectedRole && (
                <div className="anim-slide-up border border-violet-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                  {/* Panel header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-black text-base">{selectedRole.roleName} Jobs</p>
                      <p className="text-violet-200 text-xs mt-0.5">Find live listings across the world</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* Country selector */}
                      <div className="relative">
                        <button
                          onClick={() => setCountryDropdownOpen((v) => !v)}
                          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-xs font-semibold transition-all"
                        >
                          <span>{selectedCountryInfo.flag}</span>
                          <span>{selectedCountryInfo.label}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {countryDropdownOpen && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 w-52 overflow-hidden">
                            {COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                onClick={() => { setSelectedCountry(c.code); setCountryDropdownOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-violet-50 ${selectedCountry === c.code ? 'bg-violet-50' : ''}`}
                              >
                                <span className="text-base">{c.flag}</span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{c.label}</p>
                                  <p className="text-[9px] text-slate-400">{c.description}</p>
                                </div>
                                {selectedCountry === c.code && <CheckCircle className="w-3.5 h-3.5 text-violet-600 ml-auto shrink-0" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleSearchJobs}
                        disabled={jobsLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-violet-700 text-xs font-black rounded-xl hover:bg-violet-50 transition-all shadow-md disabled:opacity-60"
                      >
                        {jobsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {jobsLoading ? 'Searching…' : 'Find Jobs'}
                      </button>
                    </div>
                  </div>

                  {/* Missing skills hint */}
                  {selectedRole.missingSkills.length > 0 && (
                    <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2 flex-wrap">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-xs text-amber-700 font-semibold">Bridge the gap:</span>
                      {selectedRole.missingSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-bold rounded-full">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Jobs list */}
                  <div className="p-4">
                    {!jobsSearched && !jobsLoading && (
                      <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                          <Globe className="w-7 h-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Choose a country &amp; click "Find Jobs"</p>
                        <p className="text-xs text-slate-400">We'll search LinkedIn, Indeed, and official job boards</p>
                      </div>
                    )}

                    {jobsLoading && (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Searching jobs in {selectedCountryInfo.label}…</p>
                      </div>
                    )}

                    {jobsError && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700">{jobsError}</p>
                        <button onClick={handleSearchJobs} className="ml-auto text-xs text-red-600 font-semibold hover:underline shrink-0">Retry</button>
                      </div>
                    )}

                    {!jobsLoading && jobsSearched && jobs.length === 0 && !jobsError && (
                      <div className="text-center py-10">
                        <p className="text-sm font-bold text-slate-700 mb-1">No results found</p>
                        <p className="text-xs text-slate-400 mb-4">Try a different country or role</p>
                        <button
                          onClick={handleSearchJobs}
                          className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {!jobsLoading && jobs.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-slate-700">{jobs.length} listings found · {selectedCountryInfo.flag} {selectedCountryInfo.label}</p>
                          <button
                            onClick={handleSearchJobs}
                            className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-800 font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" /> Refresh
                          </button>
                        </div>
                        {jobs.map((job) => (
                          <a
                            key={job.id}
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-3 p-4 bg-white border border-slate-200 hover:border-violet-300 rounded-xl hover:shadow-md hover:shadow-violet-50 transition-all duration-200 hover:-translate-y-0.5"
                          >
                            {/* Logo or initials */}
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {job.logo ? (
                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                              ) : (
                                <Building2 className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors truncate">{job.title}</p>
                                  <p className="text-[11px] text-slate-600 font-semibold truncate">{job.company}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0 mt-0.5" />
                              </div>

                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {job.location && (
                                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <MapPin className="w-3 h-3" /> {job.location}
                                  </span>
                                )}
                                {job.isRemote && (
                                  <span className="px-1.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-[9px] font-bold rounded-full">Remote</span>
                                )}
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-semibold rounded-full">{job.employmentType}</span>
                                {job.salary && (
                                  <span className="text-[10px] text-emerald-700 font-bold">{job.salary}</span>
                                )}
                                {job.postedAt && (
                                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {(() => {
                                      const d = new Date(job.postedAt);
                                      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
                                      return diff === 0 ? 'Today' : diff === 1 ? '1d ago' : `${diff}d ago`;
                                    })()}
                                  </span>
                                )}
                              </div>

                              {job.description && (
                                <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{job.description}</p>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills gap panel */}
              {selectedRole && selectedRole.missingSkills.length > 0 && (
                <div className="anim-slide-up p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-black text-amber-900">Improve Your Match for "{selectedRole.roleName}"</h3>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedRole.missingSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-xl shadow-sm">
                        <ArrowRight className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-800">{skill}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-3">
                    Learning these skills could push your match from <strong>{selectedRole.matchPercent}%</strong> to <strong>{Math.min(selectedRole.matchPercent + 15, 98)}%</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
