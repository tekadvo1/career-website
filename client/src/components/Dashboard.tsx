import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import { getToken, getUser } from '../utils/auth';
import {
  Target, CheckCircle, ArrowRight, Sparkles,
  Briefcase, FolderKanban, Radio, BookOpen
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';

/* ─── Project type ─────────────────────────────────────────────────────────── */
interface Project {
  id: string;
  title: string;
  description: string;
  status?: 'active' | 'completed' | 'saved' | 'none' | 'undo';
  progress_data?: any;
  project_data?: any;
  role?: string;
}

/* ─── Real-time snapshot from SSE ─────────────────────────────────────────── */
interface JourneyData {
  onboardingComplete:  boolean;
  hasRoleAnalysis:     boolean;
  hasProjectStructure: boolean;
  hasActiveProject:    boolean;
  hasCompletedProject: boolean;
  isPublicProfile:     boolean;
}
interface DashSnapshot {
  projects: Project[];
  totalXP: number;
  totalStreak: number;
  activeCount: number;
  completedCount: number;
  savedCount: number;
  roadmapProgress: Array<{ role: string; topic_name: string }>;
  journey?: JourneyData;
  timestamp: string;
}

export default function Dashboard() {
  const navigate     = useNavigate();
  const location     = useLocation();

  const user: any = (getUser() ?? {});
  const displayName = user?.name || user?.username || 'User';

  const _rawRole = location.state?.role || (() => {
    try {
      const saved = sessionStorage.getItem('lastRoleAnalysis');
      return saved ? JSON.parse(saved).role : 'Software Engineer';
    } catch { return 'Software Engineer'; }
  })();
  const selectedRole = _rawRole.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || 'Software Engineer';

  /* ---------- state --------------------------------------------------------- */
  const [userProjects,  setUserProjects]  = useState<Project[]>([]);
  const [rtStats,       setRtStats]       = useState({ totalXP: 0, activeCount: 0, completedCount: 0, savedCount: 0, roadmapTopics: 0 });
  
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [roleSummaryData, setRoleSummaryData] = useState<any>(null);
  const [isRoleSummaryLoading, setIsRoleSummaryLoading] = useState(false);
  const sseRef  = useRef<EventSource | null>(null);

  /* ── Fetch Role Analysis Cache / Polling ─────────────────────────────────── */
  useEffect(() => {
    const fetchRoleAnalysis = async () => {
      // Check local storage
      const savedStr = sessionStorage.getItem('lastRoleAnalysis');
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          if (parsed.role === selectedRole && parsed.analysis) {
            setRoleSummaryData(parsed.analysis);
            if (location.state?.resumeSkills && !parsed.resumeSkills) {
               sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
                  ...parsed,
                  resumeSkills: location.state.resumeSkills
               }));
            }
            return;
          }
        } catch {}
      }
      
      // Fetch
      setIsRoleSummaryLoading(true);
      const doFetch = async () => {
        try {
          const response = await apiFetch('/api/role/analyze', {
            method: 'POST',
            body: JSON.stringify({ 
              role: selectedRole, 
              userId: user.id || null,
              experienceLevel: location.state?.experienceLevel || 'Beginner', 
              country: location.state?.country || 'USA',
              learningPath: location.state?.learningPath
            }) 
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'processing') {
              setTimeout(doFetch, 5000);
              return;
            }
            if (data.success && data.data) {
              setRoleSummaryData(data.data);
              const currentSavedStr = sessionStorage.getItem('lastRoleAnalysis');
              let existingCache: any = {};
              try { existingCache = currentSavedStr ? JSON.parse(currentSavedStr) : {}; } catch {}
              
              sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
                ...existingCache,
                role: selectedRole,
                analysis: data.data,
                resumeSkills: location.state?.resumeSkills || existingCache.resumeSkills || null,
                hasResume: location.state?.hasResume || false,
                resumeFileName: location.state?.resumeFileName || null,
                timestamp: new Date().getTime()
              }));
            }
          }
        } catch (err) {
          console.error("Error fetching analysis:", err);
        } finally {
          setIsRoleSummaryLoading(false);
        }
      };
      doFetch();
    };
    
    fetchRoleAnalysis();
  }, [selectedRole, location.state]);

  /* ── Apply SSE snapshot ───────────────────────────────────────────────────── */
  const applySnapshot = useCallback((snap: DashSnapshot) => {
    const workspaceProjects = snap.projects.filter(
      p => !p.role || p.role.toLowerCase() === selectedRole.toLowerCase() || p.role.toLowerCase() === _rawRole.toLowerCase()
    );
    
    const mapDbProject = (p: any): Project => {
      const pd = typeof p.project_data  === 'string' ? JSON.parse(p.project_data)  : (p.project_data  || {});
      const pr = typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : (p.progress_data || {});
      return { ...pd, id: String(p.id), title: p.title, description: p.description, status: p.status, progress_data: pr, project_data: pd };
    };

    const mapped = workspaceProjects.map(mapDbProject);
    setUserProjects(mapped);
    
    setRtStats({
      totalXP:        snap.totalXP || 0,
      activeCount:    mapped.filter(p => p.status === 'active').length,
      completedCount: mapped.filter(p => p.status === 'completed').length,
      savedCount:     mapped.filter(p => p.status === 'saved').length,
      roadmapTopics:  snap.roadmapProgress?.length || 0
    });
    if (snap.journey) setJourneyData(snap.journey);
  }, [selectedRole, _rawRole]);

  /* ── SSE connection ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user.id) return;

    const es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${getToken()}`);
    sseRef.current = es;

    es.addEventListener('snapshot', (e: MessageEvent) => {
      try { applySnapshot(JSON.parse(e.data)); } catch { /* ignore */ }
    });
    es.addEventListener('project_update', (_e: MessageEvent) => {
      try {
        apiFetch(`/api/realtime/notify`, {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, event: 'snapshot' }),
        });
      } catch { /* ignore */ }
    });
    return () => es.close();
  }, [applySnapshot, user.id]);

  /* ── User Progress State ─────────────────────────────────────────────────── */
  const activeProjects = userProjects.filter(p => p.status === 'active').slice(0, 3);
  
  const hasRoadmap = journeyData?.hasRoleAnalysis;
  const isNewUser = rtStats.activeCount === 0 && rtStats.completedCount === 0 && rtStats.roadmapTopics === 0;

  const getPrimaryAction = () => {
    if (isRoleSummaryLoading) {
      return { title: 'Analysis processing...', desc: 'We are generating your career blueprint.', label: "Generating...", action: () => {}, style: "bg-emerald-200 text-emerald-700 cursor-not-allowed" };
    }
    if (activeProjects.length > 0) {
      return { title: `Continue: ${activeProjects[0].title}`, desc: 'Jump back into your active work.', label: "Continue Project", action: () => navigate(`/project-workspace?projectId=${encodeURIComponent(activeProjects[0].id)}`), style: "bg-emerald-600 hover:bg-emerald-700 text-white" };
    }
    if (rtStats.roadmapTopics > 0 || hasRoadmap) {
      return { title: 'Review your roadmap', desc: 'See what to learn next.', label: "View My Roadmap", action: () => navigate('/roadmap', { state: location.state }), style: "bg-emerald-600 hover:bg-emerald-700 text-white" };
    }
    if (roleSummaryData) {
      return { title: 'Pick a starting project', desc: 'Apply your skills to a real-world scenario.', label: "Explore Projects", action: () => navigate('/projects'), style: "bg-emerald-600 hover:bg-emerald-700 text-white" };
    }
    return { title: 'Complete your onboarding', desc: 'Generate your personalized career analysis.', label: "Start Onboarding", action: () => navigate('/onboarding'), style: "bg-emerald-600 hover:bg-emerald-700 text-white" };
  };

  const nextStep = getPrimaryAction();

  const resumeSkills = location.state?.resumeSkills || (() => {
    try {
      const saved = sessionStorage.getItem('lastRoleAnalysis');
      return saved ? JSON.parse(saved).resumeSkills : null;
    } catch { return null; }
  })();

  const normalizeSkillName = (rawText: string) => {
    if (!rawText) return '';
    const match = rawText.match(/^([^:-]+)[:\-]/);
    return match ? match[1].trim() : rawText.trim();
  };

  const strengths = resumeSkills?.strengths?.slice(0, 3).map(normalizeSkillName) || [];
  const skillGaps = resumeSkills?.missingSkills?.slice(0, 3).map((s: string) => ({ name: normalizeSkillName(s), reason: '' })) || 
                    (roleSummaryData?.skills ? roleSummaryData.skills.slice(0, 3).map((s:any) => ({ name: normalizeSkillName(s.name), reason: s.reason })) : []);

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-white font-sans text-slate-900">
      <div className="z-50 shrink-0"><Sidebar activePage="dashboard" /></div>

      <div className="flex-1 w-full flex flex-col min-h-0 bg-white md:bg-slate-50 md:rounded-tl-3xl border-l border-slate-200 overflow-y-auto">
        
        {/* Header */}
        <div className="px-6 md:px-10 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold tracking-tight">Your career overview</h1>
          </div>
          <p className="text-slate-500 text-base">
            Welcome back, {displayName}. Career goal: <span className="font-semibold text-slate-700 capitalize">{selectedRole?.replace(/-/g, ' ')}</span>
          </p>
        </div>

        <div className="px-6 md:px-10 pb-12 flex flex-col gap-6 max-w-6xl">
          
          {/* Your next step */}
          {isNewUser ? (
             <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                 <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-4">Getting Started</h2>
                 <div className="flex flex-col gap-3">
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                         <div>
                             <h3 className="font-bold text-slate-900">1. {hasRoadmap ? 'Review your roadmap' : 'Complete onboarding'}</h3>
                             <p className="text-sm text-slate-500">{hasRoadmap ? 'Discover what skills you need to reach your career goal.' : 'Generate your personalized career analysis.'}</p>
                         </div>
                         <button onClick={() => navigate(hasRoadmap ? '/roadmap' : '/onboarding')} className="mt-3 md:mt-0 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-sm transition-colors">{hasRoadmap ? 'View roadmap' : 'Start onboarding'}</button>
                     </div>
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-60">
                         <div>
                             <h3 className="font-bold text-slate-900">2. Begin your first topic</h3>
                             <p className="text-sm text-slate-500">Start learning from your recommended path.</p>
                         </div>
                     </div>
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm opacity-60">
                         <div>
                             <h3 className="font-bold text-slate-900">3. Start a project</h3>
                             <p className="text-sm text-slate-500">Apply your learning with a hands-on project.</p>
                         </div>
                     </div>
                 </div>
             </section>
          ) : (
             <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                   <h2 className="text-sm font-bold text-emerald-800 tracking-wide uppercase mb-1">Your next step</h2>
                   <h3 className="text-xl font-bold text-slate-900 mb-1">{nextStep.title}</h3>
                   <p className="text-emerald-700/80">{nextStep.desc}</p>
                </div>
                <button onClick={nextStep.action} className={`px-6 py-3 rounded-xl font-semibold shadow-sm transition-all whitespace-nowrap ${nextStep.style}`}>
                   {nextStep.label}
                </button>
             </section>
          )}

          {/* Career Progress */}
          <section>
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Career Progress</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><BookOpen className="w-5 h-5"/></div>
                  <div>
                    <p className="text-2xl font-bold">{rtStats.roadmapTopics}</p>
                    <p className="text-sm text-slate-500 font-medium">Topics completed</p>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FolderKanban className="w-5 h-5"/></div>
                  <div>
                    <p className="text-2xl font-bold">{rtStats.activeCount}</p>
                    <p className="text-sm text-slate-500 font-medium">Active projects</p>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle className="w-5 h-5"/></div>
                  <div>
                    <p className="text-2xl font-bold">{rtStats.completedCount}</p>
                    <p className="text-sm text-slate-500 font-medium">Projects completed</p>
                  </div>
               </div>
             </div>
          </section>

          {/* Continue your projects */}
          <section>
             <div className="flex justify-between items-end mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Continue your projects</h2>
                {activeProjects.length > 0 && (
                  <button onClick={() => navigate('/projects', { state: { activeTab: 'active' }})} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View all projects</button>
                )}
             </div>
             
             {activeProjects.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {activeProjects.map((p) => (
                    <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => navigate(`/project-workspace?projectId=${p.id}`, { state: { project: p }})}>
                       <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{p.title}</h3>
                       <div className="flex-1" />
                       <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${p.progress_data?.progress || 0}%` }} />
                       </div>
                       <button className="text-sm font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1 group">
                          Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 ))}
               </div>
             ) : (
               <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><FolderKanban className="w-6 h-6"/></div>
                      <div>
                          <h3 className="font-bold text-slate-900">Start your first project.</h3>
                          <p className="text-sm text-slate-500">Put your learning into practice with a project.</p>
                      </div>
                  </div>
                  <button onClick={() => navigate('/projects')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 shrink-0">Explore projects</button>
               </div>
             )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Career Starting Point */}
             <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><Target className="w-4 h-4"/></div>
                   <h2 className="font-bold text-slate-900">Your career starting point</h2>
                </div>
                {isRoleSummaryLoading ? (
                   <div className="animate-pulse space-y-4">
                     <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col">
                      {strengths.length > 0 && (
                         <div className="mb-4">
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500"/> Strengths</h3>
                           <ul className="space-y-1">
                             {strengths.map((s: string, i: number) => (
                               <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                 <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                 <span className="line-clamp-1">{s}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                      )}
                      {skillGaps.length > 0 && (
                         <div className="mb-4">
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Target className="w-3 h-3 text-amber-500"/> Skill Gaps</h3>
                           <ul className="space-y-1">
                             {skillGaps.map((g: any, i: number) => (
                               <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                 <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                 <span className="line-clamp-2"><span className="font-semibold">{g.name}</span>{g.reason ? `: ${g.reason}` : ''}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                      )}
                      <div className="flex-1" />
                      <button onClick={() => navigate('/role-analysis', { state: location.state })} className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group w-max">
                         View Full Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                )}
             </section>

             {/* Practice & Portfolio */}
             <section className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start justify-between gap-4">
                   <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-600">
                         <Radio className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 mb-1">Interview Practice</h3>
                          <p className="text-sm text-slate-500 mb-4">Practice live technical interviews against an AI hiring manager tailored to your target role.</p>
                          <button onClick={() => navigate('/interview-guide')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                             Practice interview <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                       </div>
                   </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start justify-between gap-4">
                   <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-fuchsia-50 flex flex-shrink-0 items-center justify-center text-fuchsia-600">
                         <Briefcase className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 mb-1">Public Portfolio</h3>
                          <p className="text-sm text-slate-500 mb-4">Showcase your completed projects, skills, and roadmap progress to recruiters.</p>
                          <button onClick={() => navigate('/portfolio')} className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1 group">
                             Open portfolio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                       </div>
                   </div>
                </div>
             </section>
          </div>

        </div>
      </div>
    </div>
  );
}
