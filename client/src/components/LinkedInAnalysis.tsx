import React, { useState, useEffect, useRef } from 'react';
import {
  Linkedin, Upload, FileText, X, Loader2, Target, Briefcase, Award,
  UserCircle, Star, Sparkles, Zap, RefreshCw, FileWarning, Copy,
  CheckCheck, Link2, AlertCircle, TrendingUp, Shield, ChevronRight
} from 'lucide-react';
import { getToken } from '../utils/auth';
import Sidebar from './Sidebar';

interface AnalysisResult {
  overallScore: number;
  headline: { score: number; mistake: string; correction: string };
  summary:   { score: number; mistake: string; correction: string };
  experience:{ score: number; mistake: string; correction: string };
  skills:    { score: number; mistake: string; correction: string; missingSkills: string[] };
  resumeComparison?: string;
}

type Mode = 'url' | 'url-resume';

const LOADING_STEPS = [
  { icon: Link2,      label: 'Scanning LinkedIn profile…',      sub: 'Extracting public profile data' },
  { icon: Sparkles,   label: 'AI is analyzing your profile…',   sub: 'Cross-referencing recruiter keywords' },
  { icon: TrendingUp, label: 'Generating recommendations…',     sub: 'Building your personalized improvement plan' },
];

export default function LinkedInAnalysis() {
  const [mode, setMode]               = useState<Mode>('url');
  const [urlInput, setUrlInput]       = useState('');
  const [resumeFile, setResumeFile]   = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis]       = useState<AnalysisResult | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resumeName, setResumeName]   = useState<string | null>(null);
  const [copiedKey, setCopiedKey]     = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fetchSaved(); }, []);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const fetchSaved = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch('/api/linkedin/saved', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis_data);
        setOriginalUrl(data.profile_url);
        setResumeName(data.resume_filename);
      }
    } catch (e) { console.error(e); }
  };

  const startLoader = () => {
    setLoadingStep(0);
    let s = 0;
    timerRef.current = setInterval(() => {
      s++;
      if (s < LOADING_STEPS.length) setLoadingStep(s);
      else if (timerRef.current) clearInterval(timerRef.current);
    }, 3500);
  };

  const handleAnalyze = async () => {
    if (!urlInput.trim()) { setUploadError('Please enter a LinkedIn profile URL.'); return; }
    setUploadError(null);
    setIsAnalyzing(true);
    startLoader();
    try {
      const form = new FormData();
      form.append('profileInput', urlInput);
      if (resumeFile) form.append('resume', resumeFile);
      const res  = await fetch('/api/linkedin/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setAnalysis(data.analysis);
      setOriginalUrl(data.profileUrl);
      setResumeName(data.fileName);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to analyze profile.');
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { setUploadError('Only PDF and DOC/DOCX files supported.'); return; }
    setResumeFile(file);
    setUploadError(null);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scoreColors = (score: number, outOf = 10) => {
    const pct = (score / outOf) * 100;
    if (pct >= 75) return { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' };
    if (pct >= 50) return { badge: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-400'  };
    return              { badge: 'bg-red-100 text-red-700 border-red-200',               bar: 'bg-red-500'    };
  };

  const overallLabel = (s: number) =>
    s >= 80 ? { text: 'Excellent', color: 'text-emerald-400' } :
    s >= 60 ? { text: 'Good',      color: 'text-amber-400'   } :
    s >= 40 ? { text: 'Needs Work',color: 'text-orange-400'  } :
              { text: 'Critical',  color: 'text-red-400'     };

  const ringColor = (s: number) => s >= 75 ? '#34d399' : s >= 50 ? '#fbbf24' : '#f87171';

  const sections = analysis ? [
    { key: 'headline',   label: 'Headline',            Icon: UserCircle, data: analysis.headline   },
    { key: 'summary',    label: 'About / Summary',     Icon: FileText,   data: analysis.summary    },
    { key: 'experience', label: 'Experience',          Icon: Briefcase,  data: analysis.experience },
    { key: 'skills',     label: 'Skills & Endorsements',Icon: Award,     data: analysis.skills     },
  ] : [];

  /* ─── RENDER ─── */
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-slate-50 font-sans">
      <div className="z-50 shrink-0"><Sidebar activePage="tools" /></div>

      <div className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto">

        {/* ── Header ── */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm shrink-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-200">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 leading-tight">LinkedIn Profile Optimizer</h1>
                <p className="text-[11px] text-slate-500">AI-powered recruiter attraction analysis</p>
              </div>
            </div>
            {analysis && (
              <button onClick={() => { setAnalysis(null); setUrlInput(''); setResumeFile(null); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> New Analysis
              </button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">

          {/* Error */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <FileWarning className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold flex-1">{uploadError}</p>
              <button onClick={() => setUploadError(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* ── LOADING ── */}
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-full max-w-md">
                <div className="flex justify-center mb-10">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-200">
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-3xl opacity-20 animate-ping" />
                  </div>
                </div>

                <div className="space-y-3">
                  {LOADING_STEPS.map(({ icon: StepIcon, label, sub }, i) => {
                    const done   = i < loadingStep;
                    const active = i === loadingStep;
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                        active ? 'bg-teal-50 border-teal-200 shadow-sm' :
                        done   ? 'bg-emerald-50 border-emerald-200 opacity-80' :
                                 'bg-white border-slate-200 opacity-40'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? 'bg-teal-600' : done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          {done
                            ? <CheckCheck className="w-5 h-5 text-white" />
                            : <StepIcon className={`w-5 h-5 ${active ? 'text-white animate-spin' : 'text-slate-400'}`} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${active ? 'text-teal-900' : done ? 'text-emerald-800' : 'text-slate-400'}`}>{label}</p>
                          <p className={`text-xs ${active ? 'text-teal-500' : done ? 'text-emerald-600' : 'text-slate-300'}`}>{sub}</p>
                        </div>
                        {active && <Loader2 className="w-4 h-4 text-teal-500 animate-spin shrink-0" />}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-slate-400 mt-6">This may take 15–25 seconds · Please don't close this page</p>
              </div>
            </div>

          ) : !analysis ? (
            /* ── INPUT ── */
            <div className="max-w-2xl mx-auto">
              {/* Hero */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> AI-Powered Profile Audit
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                  Make recruiters{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">stop scrolling</span>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  Our AI audits your LinkedIn profile against real recruiter patterns and generates exact copy-paste improvements for every section.
                </p>
              </div>

              {/* Feature pills */}
              <div className="grid grid-cols-3 gap-3 mb-7">
                {[
                  { Icon: Target,  label: '4 Sections Scored',  sub: 'Headline · Summary · XP · Skills', bg: 'bg-teal-50',  ic: 'text-teal-600'  },
                  { Icon: Zap,     label: 'Copy-Paste Rewrites', sub: 'AI writes the correction for you', bg: 'bg-emerald-50',  ic: 'text-emerald-600'  },
                  { Icon: Shield,  label: '100% Private',        sub: 'Data is never stored publicly',    bg: 'bg-emerald-50', ic: 'text-emerald-600' },
                ].map(({ Icon, label, sub, bg, ic }) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-4 h-4 ${ic}`} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">{label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Mode tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
                <button onClick={() => setMode('url')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'url' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  🔗 URL Only
                </button>
                <button onClick={() => setMode('url-resume')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'url-resume' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  📄 URL + Resume
                  <span className="text-[10px] px-1.5 py-0.5 bg-teal-600 text-white rounded-full font-black">PRO</span>
                </button>
              </div>

              {/* Form card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                {/* URL */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <Linkedin className="w-4 h-4 text-teal-600" /> LinkedIn Profile URL
                  </label>
                  <input type="text"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-sm outline-none" />
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Open your LinkedIn profile → copy the URL from the browser address bar
                  </p>
                </div>

                {/* Resume upload */}
                {mode === 'url-resume' && (
                  <div className="border-t border-dashed border-slate-200 pt-5">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                      <FileText className="w-4 h-4 text-emerald-600" /> Upload Resume
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Highly Recommended</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mb-3">We'll detect what's on your resume that you forgot to add to LinkedIn.</p>
                    {resumeFile ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-800">{resumeFile.name}</span>
                        </div>
                        <button onClick={() => setResumeFile(null)} className="text-emerald-400 hover:text-emerald-700 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-400 transition-all group">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-teal-500 mb-2 transition-colors" />
                        <p className="text-sm font-bold text-slate-600 group-hover:text-teal-700 transition-colors">Click to upload resume</p>
                        <p className="text-xs text-slate-400 mt-1">.PDF or .DOCX · Max 5 MB</p>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                )}

                {mode === 'url-resume' && (
                  <div className="flex items-start gap-2 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                    <Sparkles className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-700">
                      <strong>Pro Mode:</strong> AI cross-references your resume with LinkedIn and pinpoints exact missing skills, achievements, and certifications.
                    </p>
                  </div>
                )}

                <button onClick={handleAnalyze} disabled={!urlInput.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-teal-200 flex items-center justify-center gap-2 active:scale-[0.99]">
                  <Sparkles className="w-4 h-4" />
                  {mode === 'url-resume' ? 'Analyze Profile + Resume' : 'Analyze My LinkedIn Profile'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          ) : (
            /* ── RESULTS ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Score banner */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-20 -right-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-8">
                  {/* Ring */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                        <circle cx="60" cy="60" r="54" fill="none"
                          stroke={ringColor(analysis.overallScore)}
                          strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${(analysis.overallScore / 100) * 339.3} 339.3`}
                          style={{ transition: 'stroke-dasharray 1s ease' }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{analysis.overallScore}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <span className={`text-sm font-black ${overallLabel(analysis.overallScore).color}`}>
                      {overallLabel(analysis.overallScore).text}
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left z-10">
                    <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                      <Target className="w-5 h-5 text-teal-400" />
                      <h2 className="text-xl font-black text-white">Profile Audit Complete</h2>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed max-w-lg">
                      {analysis.overallScore >= 80
                        ? '🏆 Outstanding! Your profile is highly optimized and will attract top recruiters.'
                        : analysis.overallScore >= 60
                        ? '👍 Good foundation, but you are missing key optimizations that could 3× your recruiter views.'
                        : analysis.overallScore >= 40
                        ? '⚠️ Your profile needs significant improvements to rank well in LinkedIn searches.'
                        : '🚨 Critical issues found. Recruiters are likely skipping your profile right now.'}
                    </p>
                    {originalUrl?.startsWith('http') && (
                      <a href={originalUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-teal-300 hover:text-teal-100 transition-colors font-semibold">
                        <Linkedin className="w-3.5 h-3.5" /> View LinkedIn Profile →
                      </a>
                    )}
                    {resumeName && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Compared with: {resumeName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mini score bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sections.map(({ key, label, data }) => {
                  const c = scoreColors(data.score);
                  return (
                    <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-600">{label}</p>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${c.badge}`}>{data.score}/10</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${(data.score / 10) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sections.map(({ key, label, Icon, data }) => {
                  const c = scoreColors(data.score);
                  const isSkills = key === 'skills';
                  const skillsData = data as typeof analysis.skills;
                  return (
                    <div key={key} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col overflow-hidden">
                      {/* Card header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-teal-600" />
                          </div>
                          <h3 className="font-black text-slate-900 text-sm">{label}</h3>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${c.badge}`}>{data.score} / 10</span>
                      </div>

                      <div className="p-5 space-y-4 flex-1 flex flex-col">
                        {/* Mistake */}
                        <div className="p-3.5 bg-red-50 rounded-xl border border-red-100">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5 block">❌ Issue Found</span>
                          <p className="text-sm text-red-900 leading-relaxed">{data.mistake}</p>
                        </div>

                        {/* Correction */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">✅ Pro Correction</span>
                            <button onClick={() => handleCopy(data.correction, key)}
                              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors">
                              {copiedKey === key
                                ? <><CheckCheck className="w-3 h-3 text-emerald-500" /> Copied!</>
                                : <><Copy className="w-3 h-3" /> Copy</>}
                            </button>
                          </div>
                          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-sm text-emerald-900 font-medium leading-relaxed whitespace-pre-wrap">{data.correction}</p>
                          </div>
                        </div>

                        {/* Missing skills chips */}
                        {isSkills && skillsData.missingSkills?.length > 0 && (
                          <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-100">
                            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2.5 block">🚀 Add These Keywords</span>
                            <div className="flex flex-wrap gap-1.5">
                              {skillsData.missingSkills.map((sk, i) => (
                                <span key={i} className="px-2.5 py-1 bg-teal-600 text-white text-[11px] font-bold rounded-lg shadow-sm">{sk}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resume gap analysis */}
              {analysis.resumeComparison && analysis.resumeComparison !== 'No resume uploaded.' && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                  <h3 className="text-base font-black text-emerald-900 flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Resume vs LinkedIn Gap Analysis
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed font-medium">{analysis.resumeComparison}</p>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-center shadow-xl shadow-teal-100">
                <Star className="w-8 h-8 text-teal-200 mx-auto mb-3 fill-teal-300" />
                <h3 className="text-lg font-black text-white mb-2">Apply These Changes Now</h3>
                <p className="text-teal-200 text-sm mb-5">
                  Use the <strong>Copy</strong> buttons above to grab each correction, then paste directly into your LinkedIn profile sections.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {originalUrl?.startsWith('http') && (
                    <a href={originalUrl} target="_blank" rel="noreferrer"
                      className="px-5 py-2.5 bg-white text-teal-700 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 justify-center">
                      <Linkedin className="w-4 h-4" /> Open My LinkedIn
                    </a>
                  )}
                  <button onClick={() => { setAnalysis(null); setUrlInput(''); setResumeFile(null); }}
                    className="px-5 py-2.5 border border-teal-400 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
                    <RefreshCw className="w-4 h-4" /> Analyze Another Profile
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
