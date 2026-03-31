import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Linkedin, Upload, FileText, X, Loader2, Target, Briefcase, Award, UserCircle, Star, Sparkles, Zap, RefreshCw, FileWarning
} from 'lucide-react';
import { getToken } from '../utils/auth';
import Sidebar from './Sidebar';

interface AnalysisResult {
  overallScore: number;
  headline: { score: number; mistake: string; correction: string };
  summary: { score: number; mistake: string; correction: string };
  experience: { score: number; mistake: string; correction: string };
  skills: { score: number; mistake: string; correction: string; missingSkills: string[] };
  resumeComparison?: string;
}

export default function LinkedInAnalysis() {
  const [urlInput, setUrlInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);

  useEffect(() => {
    fetchSaved();
  }, []);

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
    } catch (e) { console.error('Error fetching saved analysis', e); }
  };

  const handleAnalyze = async () => {
    if (!urlInput.trim()) {
      setUploadError("Please provide a LinkedIn URL or text.");
      return;
    }
    setUploadError(null);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('profileInput', urlInput);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await fetch('/api/linkedin/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');

      setAnalysis(data.analysis);
      setOriginalUrl(data.profileUrl);
      setResumeName(data.fileName);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to analyze profile.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreBadge = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score >= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setUploadError("Only PDF and DOC/DOCX files supported.");
        return;
      }
      setResumeFile(file);
      setUploadError(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-slate-50 font-sans">
      <div className="z-50 shrink-0"><Sidebar activePage="tools" /></div>

      <div className="flex-1 w-full flex flex-col min-h-0 relative overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm shrink-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Linkedin className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-black text-slate-900 leading-tight">LinkedIn Optimizer</h1>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <FileWarning className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{uploadError}</p>
            </div>
          )}

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 relative overflow-hidden">
                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin z-10" />
                 <div className="absolute inset-0 bg-blue-200/50 animate-pulse"></div>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Analyzing Your Profile</h2>
              <p className="text-sm text-slate-500">Cross-referencing keywords, checking headlines, and grading summaries...</p>
            </div>
          ) : !analysis ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Does your LinkedIn stand out?</h2>
                <p className="text-slate-500">Provide your profile URL to get a comprehensive score and AI-generated improvements for every section.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn Profile URL or Text</label>
                  <input 
                    type="text" 
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> For best results, paste your public URL.</p>
                </div>

                <div className="hidden sm:block border-t border-slate-100 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 font-bold text-slate-400 text-xs">OPTIONAL</div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Compare with Resume (Highly Recommended)</label>
                  {resumeFile ? (
                     <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-800">{resumeFile.name}</span>
                        </div>
                        <button onClick={() => setResumeFile(null)} className="text-emerald-600 hover:text-emerald-800"><X className="w-4 h-4" /></button>
                     </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600 font-bold">Upload Resume Form</p>
                        <p className="text-xs text-slate-400 mt-1">.PDF or .DOCX</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    </label>
                  )}
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={!urlInput.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Analyze My Profile
                </button>
              </div>
            </div>
          ) : (
            
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Dashboard Header */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-1">
                     <Target className="w-6 h-6 text-blue-600" /> Profile Audit Complete
                   </h2>
                   <p className="text-slate-500 text-sm">We reviewed your {(originalUrl && originalUrl.startsWith('http')) ? <a href={originalUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LinkedIn link</a> : 'LinkedIn text'} {resumeName && `and compared it with ${resumeName}`}.</p>
                 </div>
                 <button onClick={() => setAnalysis(null)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                   <RefreshCw className="w-4 h-4" /> Start Over
                 </button>
               </div>

               {/* Score Banner */}
               <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden">
                 <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                 
                 <div className="w-32 h-32 tracking-tighter shrink-0 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-800 text-5xl font-black text-white relative">
                   {analysis.overallScore}
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-sm">
                      <Star className="w-4 h-4 text-white fill-white" />
                   </div>
                 </div>

                 <div className="flex-1 text-center md:text-left z-10">
                   <h3 className="text-2xl font-bold text-white mb-2">Overall Profile Score</h3>
                   <p className="text-slate-400 text-sm mb-4 leading-relaxed max-w-xl">
                     {analysis.overallScore >= 80 ? "Your profile is outstanding and highly optimized for recruiters." : 
                      analysis.overallScore >= 50 ? "Your profile is decent but misses several critical optimizations that recruiters look for." :
                     "Your profile needs significant work to rank well in LinkedIn searches and attract top employers."}
                   </p>
                 </div>
               </div>

               {/* Sections */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* Headline */}
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <UserCircle className="w-5 h-5 text-slate-400" />
                       <h3 className="font-bold text-slate-900">Headline</h3>
                     </div>
                     <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${scoreBadge(analysis.headline.score)}`}>
                       {analysis.headline.score} / 10
                     </span>
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 block">Mistake Identified</span>
                        <p className="text-sm text-red-900">{analysis.headline.mistake}</p>
                     </div>
                     <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Pro Correction</span>
                        <p className="text-sm text-emerald-900 font-medium">{analysis.headline.correction}</p>
                     </div>
                   </div>
                 </div>

                 {/* Summary */}
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <FileText className="w-5 h-5 text-slate-400" />
                       <h3 className="font-bold text-slate-900">About Summary</h3>
                     </div>
                     <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${scoreBadge(analysis.summary.score)}`}>
                       {analysis.summary.score} / 10
                     </span>
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 block">Mistake Identified</span>
                        <p className="text-sm text-red-900">{analysis.summary.mistake}</p>
                     </div>
                     <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Pro Correction</span>
                        <p className="text-sm text-emerald-900 font-medium whitespace-pre-wrap">{analysis.summary.correction}</p>
                     </div>
                   </div>
                 </div>

                 {/* Experience */}
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <Briefcase className="w-5 h-5 text-slate-400" />
                       <h3 className="font-bold text-slate-900">Experience</h3>
                     </div>
                     <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${scoreBadge(analysis.experience.score)}`}>
                       {analysis.experience.score} / 10
                     </span>
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 block">Mistake Identified</span>
                        <p className="text-sm text-red-900">{analysis.experience.mistake}</p>
                     </div>
                     <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Pro Correction</span>
                        <p className="text-sm text-emerald-900 font-medium whitespace-pre-wrap">{analysis.experience.correction}</p>
                     </div>
                   </div>
                 </div>

                 {/* Skills */}
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <Award className="w-5 h-5 text-slate-400" />
                       <h3 className="font-bold text-slate-900">Skills & Endorsements</h3>
                     </div>
                     <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${scoreBadge(analysis.skills.score)}`}>
                       {analysis.skills.score} / 10
                     </span>
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 block">Mistake Identified</span>
                        <p className="text-sm text-red-900">{analysis.skills.mistake}</p>
                     </div>
                     <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 block">Must-Add Keywords</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                           {analysis.skills.missingSkills?.map((skill, i) => (
                             <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">{skill}</span>
                           ))}
                        </div>
                     </div>
                   </div>
                 </div>

               </div>

               {/* Resume Cross Reference */}
               {analysis.resumeComparison && (
                 <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8">
                   <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 mb-3">
                     <FileText className="w-5 h-5" /> Resume Cross-Reference Analysis
                   </h3>
                   <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                     {analysis.resumeComparison}
                   </p>
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
