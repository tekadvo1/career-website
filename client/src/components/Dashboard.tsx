import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import ProjectSetupModal  from './ProjectSetupModal';
import ProjectDetailModal from './ProjectDetailModal';
import Sidebar from './Sidebar';
import { getToken, getUser } from '../utils/auth';
import {
  Search, Flame, ChevronRight,
  Target, Clock, CheckCircle,
  Layers, RotateCcw, Wifi, Sparkles, Radio, MoreVertical, Save, Trash2
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';

/* ─── Project type ─────────────────────────────────────────────────────────── */
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
  status?: 'active' | 'completed' | 'saved' | 'none' | 'undo';
  last_updated?: string;
  careerImpact?: string[];
  metrics?: { matchIncrease: string; xp: number; timeEstimate: string; roleRelevance: string };
  skillGainEstimates?: { skill: string; before: number; after: number }[];
  curriculumStats?: { modules: number; tasks: number; deployment: boolean; codeReview: boolean };
  recruiterAppeal?: string[];
  progress_data?: any;
  project_data?: any;
  role?: string;
}

/* ─── Real-time snapshot from SSE ─────────────────────────────────────────── */
interface DashSnapshot {
  projects: Project[];
  totalXP: number;
  activeCount: number;
  completedCount: number;
  savedCount: number;
  timestamp: string;
}

export default function Dashboard() {
  const navigate     = useNavigate();
  const location     = useLocation();

  const _rawRole = location.state?.role || (() => {
    try {
      const saved = sessionStorage.getItem('lastRoleAnalysis');
      return saved ? JSON.parse(saved).role : 'Software Engineer';
    } catch { return 'Software Engineer'; }
  })();
  // Strip qualifiers like "(beginner - usa)" from the role string
  const selectedRole = _rawRole.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || 'Software Engineer';


  /* ---------- cache helpers ------------------------------------------------- */
  const getCachedProjects = () => {
    try {
      const c = sessionStorage.getItem(`dashboard_projects_v2_${_rawRole}`);
      if (c) { const p = JSON.parse(c); if (Array.isArray(p) && p.length > 0) return p; }
    } catch { /* ignore */ }
    return [];
  };

  /* ---------- state --------------------------------------------------------- */
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>(getCachedProjects);
  const [userProjects,  setUserProjects]  = useState<Project[]>([]);
  const [rtStats,       setRtStats]       = useState({ totalXP: 0, activeCount: 0, completedCount: 0, savedCount: 0 });
  const [isLive,        setIsLive]        = useState(false);
  const [isLoading,     setIsLoading]     = useState(() => getCachedProjects().length === 0);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [setupProject,    setSetupProject]    = useState<Project | null>(null); // independent state for setup modal
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'recommended'|'active'|'completed'|'saved'|'trending'|'undo'>('recommended');
  const [lastSync, setLastSync] = useState(new Date());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletePromptProject, setDeletePromptProject] = useState<Project | null>(null);

  const handleSaveProject = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const user = (getUser() ?? {});
    if (!user.id) return;
    try {
      const isRecommended = activeTab === 'recommended' || activeTab === 'trending';
      if (isRecommended) {
        const res = await apiFetch('/api/role/start-project', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, project, role: selectedRole, status: 'saved' })
        });
        if (res.ok) {
           showToast('Project moved to saved');
           setOpenMenuId(null);
           setRecommendedProjects(prev => {
              const updated = prev.filter(p => String(p.id) !== String(project.id));
              sessionStorage.setItem(`dashboard_projects_v2_${_rawRole}`, JSON.stringify(updated));
              return updated;
           });
        }
      } else {
        const res = await apiFetch(`/api/role/project/${project.id}`, {
          method: 'PUT',
          body: JSON.stringify({ userId: user.id, status: 'saved' })
        });
        if (res.ok) {
          showToast('Project moved to saved');
          setOpenMenuId(null);
        }
      }
    } catch(err) {}
  };

  const handleDeletePrompt = (e: React.MouseEvent, project: Project) => {
     e.stopPropagation();
     setOpenMenuId(null);
     
     const isRecommended = activeTab === 'recommended' || activeTab === 'trending';
     if (isRecommended) {
        setRecommendedProjects(prev => {
           const updated = prev.filter(p => String(p.id) !== String(project.id));
           sessionStorage.setItem(`dashboard_projects_v2_${_rawRole}`, JSON.stringify(updated));
           return updated;
        });
        showToast('Recommendation dismissed');
     } else {
        setDeletePromptProject(project);
     }
  };

  const handleUndoProject = async (projectId: string) => {
    const user = (getUser() ?? {});
    if (!user.id) return;
    try {
      const res = await apiFetch(`/api/role/project/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ userId: user.id, status: 'undo' })
      });
      if (res.ok) {
        showToast('Moved to Undo - Progress Saved!');
        setDeletePromptProject(null);
      }
    } catch(err) {}
  };

  const handleRestoreProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const user = (getUser() ?? {});
    if (!user.id) return;
    try {
      const res = await apiFetch(`/api/role/project/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ userId: user.id, status: 'active' })
      });
      if (res.ok) {
        showToast('Project Restored to Active!');
        setOpenMenuId(null);
      }
    } catch(err) {}
  };

  const handleDeleteProject = async (projectId: string) => {
    const user = (getUser() ?? {});
    if (!user.id) return;
    try {
      const res = await apiFetch(`/api/role/project/${projectId}?userId=${user.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        showToast('Project removed');
        setOpenMenuId(null);
        setDeletePromptProject(null);
      }
    } catch(err) {}
  };

  const sseRef  = useRef<EventSource | null>(null);
  const fromMission    = location.state?.fromMission;
  const highlightProject = location.state?.highlightProject;

  useEffect(() => {
    if (location.state?.setupAiProject) {
        setSetupProject(location.state.setupAiProject as Project);
        navigate(location.pathname, { replace: true, state: { ...location.state, setupAiProject: undefined } });
    }
  }, [location.state?.setupAiProject, navigate, location.pathname]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── map raw DB rows → Project shape ─────────────────────────────────────── */
  const mapDbProject = (p: any): Project => {
    const pd = typeof p.project_data  === 'string' ? JSON.parse(p.project_data)  : (p.project_data  || {});
    const pr = typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : (p.progress_data || {});
    return {
      ...pd,
      id: String(p.id),
      title: p.title,
      description: p.description,
      status: p.status,
      last_updated: p.last_updated,
      progress_data: pr,
      project_data: pd,
      metrics: { ...pd?.metrics, xp: pr?.xp || 0 },
    };
  };

  /* ── Apply SSE snapshot ───────────────────────────────────────────────────── */
  const applySnapshot = useCallback((snap: DashSnapshot) => {
    const workspaceProjects = snap.projects.filter(
      p => !p.role || p.role.toLowerCase() === selectedRole.toLowerCase() || p.role.toLowerCase() === _rawRole.toLowerCase()
    );
    const mapped = workspaceProjects.map(mapDbProject);
    setUserProjects(mapped);
    
    // Compute stats for current workspace since backend sends global snapshot
    setRtStats({
      totalXP:        snap.totalXP, // keep global totalXP or adapt to workspace
      activeCount:    mapped.filter(p => p.status === 'active').length,
      completedCount: mapped.filter(p => p.status === 'completed').length,
      savedCount:     mapped.filter(p => p.status === 'saved').length,
    });
    setLastSync(new Date());
  }, [selectedRole, _rawRole]);

  /* ── SSE connection ───────────────────────────────────────────────────────── */
  useEffect(() => {
    const user = (getUser() ?? {});
    if (!user.id) return;

    const es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${getToken()}`);
    sseRef.current = es;

    es.addEventListener('snapshot', (e: MessageEvent) => {
      try { applySnapshot(JSON.parse(e.data)); setIsLive(true); } catch { /* ignore */ }
    });

    es.addEventListener('project_update', (_e: MessageEvent) => {
      try {
        // A project was started/updated elsewhere — re-fetch the full snapshot
        apiFetch(`/api/realtime/notify`, {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, event: 'snapshot' }),
        });
        // showToast('📡 Project update received — dashboard synced!'); // Removed to not double-toast on Save/Delete
      } catch { /* ignore */ }
    });

    es.onerror = () => setIsLive(false);
    es.onopen  = () => setIsLive(true);

    return () => {
      es.close();
    };
  }, [applySnapshot]);

  /* ── Fetch AI-recommended projects (OpenAI / cache) ─────────────────────── */
  useEffect(() => {
    if (recommendedProjects.length > 0) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const analysis = location.state?.analysis;
        let resumeData = '';
        if (analysis) {
          const skills = analysis.skills?.map((s: any) => s.name).join(', ') || '';
          const tools  = analysis.tools?.map((t: any) => t.name).join(', ') || '';
          resumeData = `Target Role: ${_rawRole}, Skills: ${skills}, Tools: ${tools}`;
        }
        const res  = await apiFetch('/api/role/projects', {
          method: 'POST',
          body: JSON.stringify({ role: _rawRole, resumeData }),
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setRecommendedProjects(data.data);
          sessionStorage.setItem(`dashboard_projects_v2_${_rawRole}`, JSON.stringify(data.data));
        }
      } catch { /* silently fail */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [_rawRole]);

  /* ── Find Trending (OpenAI) ──────────────────────────────────────────────── */
  const handleGenerateTrending = async () => {
    setIsTrendLoading(true);
    try {
      const res  = await apiFetch('/api/role/projects', {
        method: 'POST',
        body: JSON.stringify({ role: _rawRole, type: 'trending' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const p = { ...data.data[0], trending: true };
        const updated = [p, ...recommendedProjects];
        setRecommendedProjects(updated);
        sessionStorage.setItem(`dashboard_projects_v2_${_rawRole}`, JSON.stringify(updated));
        setActiveTab('trending');
        setSelectedProject(null); // Just switch tab, don't open modal yet
        showToast(`🔥 Trending: "${p.title}" added!`);
      } else { showToast('No trending project found right now.', false); }
    } catch { showToast('AI scan failed. Try again.', false); }
    finally   { setIsTrendLoading(false); }
  };

  /* ── Filtering ───────────────────────────────────────────────────────────── */
  const sourceList = activeTab === 'recommended' || activeTab === 'trending' ? recommendedProjects : userProjects;
  const filteredProjects = sourceList.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
    const matchDiff = difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter;
    let matchTab = true;
    if (activeTab === 'active')    matchTab = p.status === 'active';
    if (activeTab === 'completed') matchTab = p.status === 'completed';
    if (activeTab === 'saved')     matchTab = p.status === 'saved';
    if (activeTab === 'undo')      matchTab = p.status === 'undo';
    if (activeTab === 'trending')  matchTab = Boolean(p.trending);
    return matchSearch && matchDiff && matchTab;
  });

  /* local stats fallback when SSE not yet connected */
  const activeCount    = rtStats.activeCount    || userProjects.filter(p => p.status === 'active').length;
  const completedCount = rtStats.completedCount || userProjects.filter(p => p.status === 'completed').length;

  const diffStyle = (d?: string) => {
    if (d === 'Beginner')     return { bar: 'bg-emerald-500',  badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', btn: 'bg-emerald-600 text-white' };
    if (d === 'Intermediate') return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border border-amber-200',   btn: 'bg-amber-600   text-white' };
    return                           { bar: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border border-rose-200',     btn: 'bg-rose-600     text-white' };
  };

  /* ── handle clicking a card ──────────────────────────────────────────────── */
  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  /* ── handle "Start This Project" CTA in ProjectDetailModal ──────────────── */
  const handleStartProject = (project: Project) => {
    // Always show the schedule setup first — user configures hours, days, OS
    // then the AI plan generates, then they click Start to go to workspace
    setSelectedProject(null);
    setSetupProject(project);
  };

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {openMenuId && <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} />}
      <div className="z-50 shrink-0"><Sidebar activePage="dashboard" /></div>

      <div className="flex-1 w-full flex flex-col min-h-0 relative overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 duration-300 ${toast.ok ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2 md:mb-3">
            {/* Left */}
            <div className="flex items-center gap-2 md:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    Project Dashboard
                  </h1>
                  {/* Live SSE indicator */}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isLive
                      ? <><Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE</>
                      : <><Wifi className="w-2.5 h-2.5" /> Connecting…</>}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">
                  Generated for <span className="font-semibold text-emerald-600">{selectedRole}</span>
                  <span className="text-slate-400 ml-2">· synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
              {/* Difficulty pills */}
              <div className="hidden md:flex items-center gap-1">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(d => {
                  const active = difficultyFilter === d.toLowerCase();
                  const ds = diffStyle(d === 'All' ? undefined : d);
                  return (
                    <button key={d} onClick={() => setDifficultyFilter(d.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border max-h-8 flex items-center ${active ? (d === 'All' ? 'bg-slate-800 text-white border-slate-800' : ds.badge) : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      {d}
                    </button>
                  );
                })}
              </div>

              {/* Refresh */}
              <button onClick={() => { sessionStorage.removeItem(`dashboard_projects_v2_${_rawRole}`); window.location.reload(); }}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors" title="Refresh AI projects">
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Find Trending */}
              <button onClick={handleGenerateTrending} disabled={isTrendLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-70 h-8 flex-1 md:flex-none">
                {isTrendLoading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning…</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Find Trending</>}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-2 md:mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search projects by name, skills, or tags…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 md:py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-colors" />
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex flex-col min-h-[calc(100vh-145px)]">

        {/* Today's Mission Banner */}
        {userProjects.length > 0 && userProjects[0].status === 'active' && (() => {
          const proj   = userProjects[0];
          const modIdx  = proj.progress_data?.currentModuleIndex || 0;
          const taskIdx = proj.progress_data?.currentTaskIndex   || 0;
          const task    = proj.project_data?.curriculum?.[modIdx]?.tasks?.[taskIdx];
          return (
            <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-xl p-4 md:p-5 relative overflow-hidden shadow-sm group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-md uppercase tracking-wide border border-white/20">
                        <Target className="w-3 h-3 text-emerald-100" /> Daily Task
                      </span>
                      <span className="text-emerald-100 text-xs font-medium px-2 py-0.5 rounded border border-white/10">{proj.title}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{task?.title || 'Continue Your Project'}</h2>
                    <p className="text-emerald-50 text-sm max-w-xl">Complete your daily task to accelerate your career growth!</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button onClick={() => {
                        if (['active', 'completed'].includes(proj.status || '')) {
                           navigate('/project-workspace', { state: { project: proj, role: selectedRole } });
                        } else {
                           handleStartProject(proj);
                        }
                    }}
                      className="px-6 py-2.5 bg-white text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all text-sm shadow-sm w-full md:w-auto">
                      Start Mission
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-[10px] font-medium text-emerald-100 backdrop-blur-sm border border-white/5"><Clock className="w-3 h-3" /> {task?.duration || '30 min'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 overflow-x-auto no-scrollbar">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-4 md:gap-6 border-b border-slate-200 min-w-max md:min-w-0">
            {[
              { id: 'recommended', label: 'For You',   count: null },
              { id: 'trending',    label: 'Trending',  count: null },
              { id: 'active',      label: 'Active',    count: activeCount },
              { id: 'completed',   label: 'Completed', count: completedCount },
              { id: 'saved',       label: 'Saved',     count: userProjects.filter(p => p.status === 'saved').length },
              { id: 'undo',        label: 'Undo',      count: userProjects.filter(p => p.status === 'undo').length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 md:py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* Mission context banner */}
          {fromMission && (
            <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-900">Mission in Progress</h3>
                <p className="text-xs text-emerald-600">{highlightProject ? <>Select <strong>"{highlightProject}"</strong> below or pick any matching project.</> : 'Pick a project to continue!'}</p>
              </div>
              <button onClick={() => navigate('/missions', { state: { role: selectedRole } })}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0">
                Back to Missions
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
               <div className="relative mb-8 mt-4">
                 <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-60" style={{ transform: 'scale(1.5)' }}></div>
                 <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.2s', transform: 'scale(2)' }}></div>
                 <div className="relative w-16 h-16 bg-white rounded-2xl shadow-xl border border-emerald-100 flex items-center justify-center animate-bounce">
                    <Sparkles className="w-8 h-8 text-emerald-500" />
                 </div>
               </div>
               
               <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Analyzing Profile & Workspaces...</h3>
               <p className="text-slate-500 text-sm max-w-md text-center mb-10 leading-relaxed">
                  Our AI is curating the most relevant real-world projects based on your <span className="font-semibold text-emerald-600">{selectedRole}</span> background and latest market trends.
               </p>

               {/* Hint skeleton grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full opacity-40 pointer-events-none">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="bg-white rounded-xl overflow-hidden border border-slate-200 animate-pulse hidden md:block">
                     <div className="h-1.5 bg-gradient-to-r from-slate-200 to-slate-200" />
                     <div className="p-4 space-y-4">
                       <div className="flex justify-between"><div className="h-4 bg-slate-200 rounded w-1/3" /><div className="h-4 bg-slate-100 rounded w-12" /></div>
                       <div className="h-5 bg-slate-200 rounded w-3/4 mt-2" />
                       <div className="space-y-2 mt-4">
                          <div className="h-3 bg-slate-100 rounded w-full" />
                          <div className="h-3 bg-slate-100 rounded w-5/6" />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <>
              <p className="text-slate-500 text-xs md:text-sm mb-3">
                Found <span className="font-bold text-slate-800">{filteredProjects.length}</span> projects
                {activeTab === 'recommended' && <span className="ml-1 text-emerald-600 font-medium">· AI-personalised for you</span>}
                {isLive && <span className="ml-1 inline-flex items-center gap-0.5 text-emerald-600 text-xs font-semibold"><Radio className="w-3 h-3 animate-pulse" /> Real-time</span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 items-stretch">
                {filteredProjects.map(project => {
                  const ds = diffStyle(project.difficulty);
                  const isUserProj = ['active', 'completed'].includes(project.status || '');
                  const completedTasks = project.progress_data?.completedTasks?.length ?? 0;
                  const totalTasks = project.curriculumStats?.tasks ?? 0;
                  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  return (
                    <div
                      key={project.id}
                      onClick={() => handleCardClick(project)}
                      className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer flex flex-col h-full">

                      {/* colour top bar */}
                      <div className={`h-1 flex-shrink-0 ${ds.bar}`} />

                      <div className="p-3 md:p-4 flex-1 flex flex-col min-h-0">
                        {/* Title row */}
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h2 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug flex-1 line-clamp-2">
                            {project.title}
                          </h2>
                          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5 relative">
                            {project.trending && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[9px] font-bold">
                                <Flame className="w-2.5 h-2.5" /> Trending
                              </span>
                            )}
                            {isUserProj && project.status === 'completed' && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                                ✓ Done
                              </span>
                            )}
                            {(project.status !== 'completed') && (
                              <div className="relative">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                                  className={`p-1 rounded-md transition-colors ${openMenuId === project.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuId === project.id && (
                                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
                                    {(project.status === 'active' || project.status === 'none' || !project.status) && (
                                      <button
                                        onClick={(e) => handleSaveProject(e, project)}
                                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
                                      >
                                        <Save className="w-3.5 h-3.5" /> Save
                                      </button>
                                    )}
                                    {project.status === 'undo' && (
                                      <button
                                        onClick={(e) => handleRestoreProject(e, project.id)}
                                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => handleDeletePrompt(e, project)}
                                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 text-[10px] md:text-xs text-slate-500">
                          <span className={`font-semibold px-1.5 py-0.5 rounded ${ds.badge}`}>{project.difficulty}</span>
                          <span>·</span>
                          <span>{project.metrics?.timeEstimate || project.duration}</span>
                          <span>·</span>
                          <span className="font-bold text-green-600">{project.matchScore}% Match</span>
                        </div>

                        <p className="text-slate-500 text-xs line-clamp-2 md:line-clamp-3 mb-3 flex-1">{project.description}</p>

                        {/* Progress bar for active */}
                        {project.status === 'active' && totalTasks > 0 && (
                          <div className="mb-2 mt-auto">
                            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                              <span>Progress</span><span>{pct}%</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto pt-2">
                            {project.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded text-[9.5px] font-medium whitespace-nowrap">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-3 py-2 md:px-4 md:py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          {project.metrics?.matchIncrease && (
                            <span className="font-semibold text-emerald-600">{project.metrics.matchIncrease} boost</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-emerald-600 font-medium transition-colors">
                          Details <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <Layers className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No projects match your filter.</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting the difficulty or search term.</p>
            </div>
          )}
        </main>
      </div>

      {/* ── Project Detail Modal ── */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          role={selectedRole}
          onClose={() => setSelectedProject(null)}
          onStart={handleStartProject}
        />
      )}

      {/* ── Setup Modal — completely independent state ── */}
      {setupProject && (
        <ProjectSetupModal
          isOpen={true}
          onClose={() => setSetupProject(null)}
          project={setupProject}
          role={selectedRole}
        />
      )}

      {/* ── Undo/Delete Prompt Modal ── */}
      {deletePromptProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Manage Project</h3>
            <p className="text-sm text-slate-500 mb-6">
              Do you want to permanently delete this project, or move it to your <strong>Undo</strong> list to save its progress forever?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleUndoProject(deletePromptProject.id)}
                className="w-full py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-sm transition-all"
              >
                Move to Undo (Save Progress)
              </button>
              <button
                onClick={() => handleDeleteProject(deletePromptProject.id)}
                className="w-full py-2.5 rounded-lg font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setDeletePromptProject(null)}
                className="w-full py-2 rounded-lg font-semibold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
