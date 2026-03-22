import { useEffect, useRef } from 'react';
import {
  X, Flame, TrendingUp, ChevronRight, Zap, Clock, Briefcase,
  CheckCircle, Target, Sparkles, Code2, Layout, Database, Check, Play
} from 'lucide-react';

/* ─── Types (mirror Dashboard's Project interface) ─────────────────────────── */
interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  matchScore: number;
  tags: string[];
  trending: boolean;
  whyRecommended: string[];
  skillsToDevelop: string[];
  tools: string[];
  languages: string[];
  setupGuide: { title: string; steps: string[] };
  status?: 'active' | 'completed' | 'saved' | 'none';
  careerImpact?: string[];
  metrics?: { matchIncrease: string; xp: number; timeEstimate: string; roleRelevance: string };
  skillGainEstimates?: { skill: string; before: number; after: number }[];
  recruiterAppeal?: string[];
  curriculumStats?: { modules: number; tasks: number; deployment: boolean; codeReview: boolean };
  progress_data?: { xp?: number; completedTasks?: string[] };
}

interface Props {
  project: Project;
  role: string;
  onClose: () => void;
  onStart: (project: Project) => void;
}

export default function ProjectDetailModal({ project, role: _role, onClose, onStart }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Close on Escape key */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const completedTasks = project.progress_data?.completedTasks?.length ?? 0;
  const totalTasks     = project.curriculumStats?.tasks ?? 0;
  const pct            = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
        style={{ background: 'rgba(15, 23, 42, 0.70)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div className="relative bg-white rounded-none sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-5xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-0 sm:border sm:border-slate-200/50">
        
        {/* Header - Minimalist & Bold */}
        <div className="flex items-start justify-between px-5 sm:px-8 py-5 sm:py-7 border-b border-slate-100 bg-white flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
          <div className="relative z-10 flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-3 mb-2.5">
              <h2 className="text-[22px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-[1.15] sm:leading-none break-words">{project.title}</h2>
              {project.trending && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-md text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  <Flame className="w-3 h-3" /> Trending
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[14.5px] sm:text-[15.5px] leading-relaxed max-w-3xl font-medium">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 flex-shrink-0 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Split */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-white">
          
          {/* Main Info - Left */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-12 no-scrollbar">

            {/* AI Career Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {project.whyRecommended && project.whyRecommended.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-slate-400" /> Objective
                  </h3>
                  <ul className="space-y-3.5">
                    {project.whyRecommended.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-[14px] text-slate-700 font-medium leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.careerImpact && project.careerImpact.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Professional Impact
                  </h3>
                  <ul className="space-y-3.5">
                    {project.careerImpact.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[14px] text-slate-700 font-medium leading-relaxed">
                        <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* High-Level Blueprint / Technologies */}
            {((project.tools && project.tools.length > 0) || (project.languages && project.languages.length > 0)) && (
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" /> High-Level Blueprint
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {[...(project.languages || []), ...(project.tools || [])].map((tech, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 text-slate-700 rounded-md text-[13.5px] font-semibold tracking-tight hover:bg-slate-100 transition-colors">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gain Heatmap */}
            {project.skillGainEstimates && project.skillGainEstimates.length > 0 && (
              <div className="border-t border-slate-100 pt-10">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Projected Competency Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {project.skillGainEstimates.map((sk, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-2.5">
                        <span className="text-[14px] font-bold text-slate-800">{sk.skill}</span>
                        <div className="flex items-center gap-2 text-[12px] font-bold tracking-tight">
                          <span className="text-slate-400">{sk.before}%</span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="text-emerald-600">{sk.after}% Focus</span>
                        </div>
                      </div>
                      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute h-full bg-slate-200" style={{ width: `${sk.before}%` }} />
                        <div className="absolute h-full bg-slate-800" style={{ left: `${sk.before}%`, width: `${sk.after - sk.before}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right (Specs & Actions) */}
          <div className="w-full lg:w-[360px] xl:w-[400px] bg-slate-50/80 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col flex-shrink-0">
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto no-scrollbar">
              
              <div className="space-y-8">
                {/* Meta Grid */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Project Telemetry</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-center shadow-sm">
                      <span className="text-[11px] font-semibold text-slate-500 mb-1">Schedule</span>
                      <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400"/> {project.metrics?.timeEstimate || project.duration}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-center shadow-sm">
                      <span className="text-[11px] font-semibold text-slate-500 mb-1">XP Reward</span>
                      <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-slate-400"/> {project.metrics?.xp ?? 500}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-center shadow-sm">
                      <span className="text-[11px] font-semibold text-slate-500 mb-1">Match Index</span>
                      <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-rose-500"/> {project.matchScore}%</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-center shadow-sm">
                      <span className="text-[11px] font-semibold text-slate-500 mb-1">Complexity</span>
                      <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5 capitalize"><Flame className="w-3.5 h-3.5 text-orange-400"/> {project.difficulty}</span>
                    </div>
                  </div>
                </div>

                {project.curriculumStats && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Architecture Scope</h4>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-[13px] font-medium text-slate-700 shadow-sm">
                      <div className="flex justify-between items-center p-3.5 border-b border-slate-100">
                        <span className="flex items-center gap-2.5"><Layout className="w-4 h-4 text-slate-400"/> Micro-modules</span>
                        <span className="font-bold text-slate-900">{project.curriculumStats.modules}</span>
                      </div>
                      <div className="flex justify-between items-center p-3.5 border-b border-slate-100">
                        <span className="flex items-center gap-2.5"><Database className="w-4 h-4 text-slate-400"/> Engineering Tasks</span>
                        <span className="font-bold text-slate-900">{project.curriculumStats.tasks}</span>
                      </div>
                      <div className="flex justify-between items-center p-3.5 border-b border-slate-100">
                        <span className="flex items-center gap-2.5"><Code2 className="w-4 h-4 text-slate-400"/> Final Deployment</span>
                        {project.curriculumStats.deployment ? <CheckCircle className="w-4 h-4 text-slate-900"/> : <X className="w-4 h-4 text-slate-300"/>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* CTAs */}
            <div className="p-6 sm:p-8 pt-6 border-t border-slate-200 bg-white relative z-10 w-full mt-auto shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              {project.status === 'active' && totalTasks > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Pipeline</span>
                    <span className="text-[11px] font-bold text-slate-900">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              {project.status === 'active' ? (
                <button
                  onClick={() => onStart(project)}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[14.5px] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 group tracking-wide"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Resume Engineering
                </button>
              ) : project.status === 'completed' ? (
                <button
                  onClick={() => onStart(project)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[14.5px] transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 tracking-wide"
                >
                  <CheckCircle className="w-4 h-4" /> Review Post-Mortem
                </button>
              ) : (
                <button
                  onClick={() => onStart(project)}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[14.5px] transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 group tracking-wide"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> Initialize Pipeline
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
