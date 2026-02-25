import { useEffect, useRef } from 'react';
import {
  X, Flame, TrendingUp, Wrench, Code, BookOpen,
  Lightbulb, ChevronRight, Zap, Clock, Briefcase,
  CheckCircle, Target, Sparkles,
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

/* ─── Difficulty colour map ─────────────────────────────────────────────────── */
const diffColour = (d?: string) => {
  if (d === 'Beginner')     return { badge: 'bg-emerald-100 text-emerald-700', bar: 'from-emerald-400 to-teal-500' };
  if (d === 'Intermediate') return { badge: 'bg-amber-100 text-amber-700',     bar: 'from-amber-400 to-orange-500' };
  return                           { badge: 'bg-red-100 text-red-700',         bar: 'from-rose-500 to-red-600' };
};

export default function ProjectDetailModal({ project, role: _role, onClose, onStart }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dc = diffColour(project.difficulty);

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
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ── Top colour accent bar ─────────────────────────────────────────── */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${dc.bar} flex-shrink-0`} />

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{project.title}</h2>
                {project.trending && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[11px] font-bold">
                    <Flame className="w-3 h-3" /> Trending
                  </span>
                )}
                {project.status === 'active' && (
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold animate-pulse">▶ Active</span>
                )}
                {project.status === 'completed' && (
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[11px] font-bold">✓ Completed</span>
                )}
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors mt-0.5"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Quick meta pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${dc.badge}`}>{project.difficulty}</span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
              <Clock className="w-3 h-3" />{project.metrics?.timeEstimate || project.duration}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
              <Target className="w-3 h-3" />{project.matchScore}% Match
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">
              <Zap className="w-3 h-3" />{project.metrics?.xp ?? 500} XP
            </span>
            {project.metrics?.matchIncrease && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />{project.metrics.matchIncrease} career boost
              </span>
            )}
          </div>
        </div>

        {/* ── Active progress bar ───────────────────────────────────────────── */}
        {project.status === 'active' && totalTasks > 0 && (
          <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex-shrink-0">
            <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
              <span className="text-indigo-700">Your Progress</span>
              <span className="text-indigo-900">{completedTasks}/{totalTasks} tasks · {pct}%</span>
            </div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: '60vh' }}>
          <div className="px-6 py-5 space-y-6">

            {/* Why This Project? */}
            {project.whyRecommended && project.whyRecommended.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  </span>
                  Why This Project?
                </h3>
                <ul className="space-y-2">
                  {project.whyRecommended.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Career Impact */}
            {project.careerImpact && project.careerImpact.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                  </span>
                  Career Impact
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {project.careerImpact.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-rose-50 rounded-lg px-3 py-2">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills You'll Develop */}
            {project.skillsToDevelop && project.skillsToDevelop.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  </span>
                  Skills You'll Develop
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skillsToDevelop.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Skill progression bars */}
            {project.skillGainEstimates && project.skillGainEstimates.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  </span>
                  Skill Progression
                </h3>
                <div className="space-y-3">
                  {project.skillGainEstimates.map((sk, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{sk.skill}</span>
                        <span className="text-slate-400">{sk.before}% → <span className="text-indigo-600 font-bold">{sk.after}%</span></span>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        {/* "before" ghost */}
                        <div className="absolute h-full bg-slate-300 rounded-full" style={{ width: `${sk.before}%` }} />
                        {/* "after" fill */}
                        <div className="absolute h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${sk.after}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tools Required + Languages — two columns */}
            <section className="grid sm:grid-cols-2 gap-4">
              {/* Tools */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                  Tools Required
                </h3>
                <ul className="space-y-1.5">
                  {(project.tools ?? []).map((t, i) => (
                    <li key={i} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-900 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Languages */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                  </span>
                  Languages
                </h3>
                <ul className="space-y-1.5">
                  {(project.languages ?? []).map((l, i) => (
                    <li key={i} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-900 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Recruiter Appeal */}
            {project.recruiterAppeal && project.recruiterAppeal.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  Recruiter Value
                </h3>
                <ul className="space-y-1.5">
                  {project.recruiterAppeal.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Setup Instructions */}
            {project.setupGuide && project.setupGuide.steps?.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  Setup Instructions
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <ol className="space-y-3">
                    {project.setupGuide.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-700 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            )}

            {/* Curriculum stats */}
            {project.curriculumStats && (
              <section>
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-violet-600" />
                  </span>
                  Curriculum Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Modules',   val: project.curriculumStats.modules,               cls: 'bg-violet-50 text-violet-700' },
                    { label: 'Tasks',     val: project.curriculumStats.tasks,                 cls: 'bg-indigo-50 text-indigo-700' },
                    { label: 'Deploy',    val: project.curriculumStats.deployment ? '✓' : '✗', cls: project.curriculumStats.deployment ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400' },
                    { label: 'Code Review', val: project.curriculumStats.codeReview ? '✓' : '✗', cls: project.curriculumStats.codeReview ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400' },
                  ].map(m => (
                    <div key={m.label} className={`rounded-xl p-3 text-center ${m.cls}`}>
                      <div className="text-lg font-bold">{m.val}</div>
                      <div className="text-[11px] font-semibold mt-0.5 opacity-75">{m.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>

        {/* ── Sticky footer CTA ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
          {project.status === 'active' ? (
            <button
              onClick={() => onStart(project)}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <span className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
              </span>
              Continue Project
            </button>
          ) : project.status === 'completed' ? (
            <button
              onClick={() => onStart(project)}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> View Completed Project
            </button>
          ) : (
            <button
              onClick={() => onStart(project)}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Start This Project
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
