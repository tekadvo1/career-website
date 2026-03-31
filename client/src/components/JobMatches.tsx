import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, ChevronLeft, ChevronRight,
  X, CheckCircle, TrendingUp, AlertCircle, Check,
  Loader2, RotateCcw, ChevronDown, ArrowRight,
  Target, Award, Briefcase, Sparkles
} from 'lucide-react';
import { getToken } from '../utils/auth';
import Sidebar from './Sidebar';

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
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
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

  const handleContinue = async () => {
    if (targetRoles.length === 0) return;
    setSavingRoles(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/job-match/save-target-roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roles: targetRoles })
      });
      if (res.ok) {
        navigate('/job-search-portal');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save roles. Please check connection.');
    } finally {
      setSavingRoles(false);
    }
  };

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



  const resetAll = () => {
    setAnalysis(null); setFileName(null); setAnalyzedAt(null);
    setUploadError(null);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <div className="z-50 shrink-0"><Sidebar activePage="tools" /></div>

      <div className="flex-1 w-full flex flex-col min-h-0 relative overflow-y-auto pb-20">
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-base font-bold text-slate-900">Job Matches</h1>
            </div>
          </div>

          {/* Step indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {['Upload Resume', 'Match Roles'].map((step, i) => {
              const done = (i === 0 && !!analysis);
              const active = (!analysis && i === 0) || (analysis && i === 1);
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
                  {i < 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">

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
              <p className="text-sm text-slate-500">Upload your resume to discover which roles you match and get detailed insights.</p>
            </div>

          {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: <Target className="w-3.5 h-3.5" />, label: 'Role match accuracy scores' },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Skills & experience insights' },
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
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {[
                { num: '1', title: 'Upload Resume', desc: 'We parse your .doc or .docx file securely', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
                { num: '2', title: 'AI Role Matching', desc: 'Get up to 10 roles with accuracy scores', icon: <Sparkles className="w-4 h-4 text-teal-600" /> },
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
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{analysis.experienceSummary}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto mt-2 sm:mt-0">
                {(analysis.totalExperienceLabel || analysis.totalExperienceYears) && (
                  <div className="px-3.5 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg flex flex-col justify-center sm:items-end w-full sm:w-auto shadow-sm">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Total Experience</span>
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      {analysis.totalExperienceLabel || `${analysis.totalExperienceYears} yrs`}
                    </span>
                  </div>
                )}
                <button
                  onClick={resetAll}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 rounded-lg transition-all w-full sm:w-auto"
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
                <span className="text-xs text-slate-400">— click a role to expand details</span>
              </div>

              <div className="divide-y divide-slate-100">
                {analysis.roles
                  .sort((a, b) => b.matchPercent - a.matchPercent)
                  .map((role, idx) => {
                    const isExpanded = expandedRole === role.roleName;
                    const why = role.whyExplanation;
                    return (
                      <div key={role.roleName + idx}>
                        {/* ── Role row ── */}
                        <div
                          className={`px-5 py-4 flex items-center gap-3 transition-colors cursor-pointer select-none ${
                            isExpanded ? 'bg-emerald-50' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => {
                            setExpandedRole(isExpanded ? null : role.roleName);
                          }}
                        >
                          {/* Checkbox */}
                          <div 
                            className="shrink-0 flex items-center justify-center py-2 pr-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetRoles(prev => 
                                prev.includes(role.roleName) 
                                  ? prev.filter(r => r !== role.roleName)
                                  : [...prev, role.roleName]
                              );
                            }}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
                              targetRoles.includes(role.roleName) 
                                ? 'bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-200' 
                                : 'border-slate-300 hover:border-emerald-400 bg-white'
                            }`}>
                              {targetRoles.includes(role.roleName) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Match % circle */}
                          <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 font-black text-sm tabular-nums ${
                            isExpanded ? 'border-emerald-500 bg-emerald-500 text-white' : `border-slate-200 ${matchTextColor(role.matchPercent)}`
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
                            {isExpanded && <CheckCircle className="w-4 h-4 text-emerald-600" />}
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

                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Target Selected Floating Bar */}
            {targetRoles.length > 0 && (
              <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 fade-up">
                <div className="bg-slate-900 shadow-2xl shadow-slate-900/40 rounded-full pl-6 pr-2 py-2 flex items-center gap-6 border border-slate-700/50">
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black tabular-nums">{targetRoles.length}</span>
                    Roles Selected
                  </span>
                  
                  <button
                    onClick={handleContinue}
                    disabled={savingRoles}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:hover:bg-emerald-500 text-white text-sm font-bold rounded-full transition-colors"
                  >
                    {savingRoles ? 'Saving...' : 'Continue to Job Portal'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Skills gap now shown inside expanded WHY section per role */}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
