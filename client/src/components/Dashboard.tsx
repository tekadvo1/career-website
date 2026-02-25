import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import ProjectSetupModal  from './ProjectSetupModal';
import ProjectDetailModal from './ProjectDetailModal';
import Sidebar from './Sidebar';
import {
  Search, TrendingUp, Flame, ChevronRight,
  Target, Zap, Clock, CheckCircle,
  Layers, RotateCcw, Wifi, Sparkles, Radio,
  Activity, Users,
} from 'lucide-react';

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
  status?: 'active' | 'completed' | 'saved' | 'none';
  last_updated?: string;
  careerImpact?: string[];
  metrics?: { matchIncrease: string; xp: number; timeEstimate: string; roleRelevance: string };
  skillGainEstimates?: { skill: string; before: number; after: number }[];
  curriculumStats?: { modules: number; tasks: number; deployment: boolean; codeReview: boolean };
  recruiterAppeal?: string[];
  progress_data?: any;
  project_data?: any;
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

  const selectedRole = location.state?.role || (() => {
    try {
      const saved = localStorage.getItem('lastRoleAnalysis');
      return saved ? JSON.parse(saved).role : 'Software Engineer';
    } catch { return 'Software Engineer'; }
  })();

  /* ---------- cache helpers ------------------------------------------------- */
  const getCachedProjects = () => {
    try {
      const c = localStorage.getItem(`dashboard_projects_v2_${selectedRole}`);
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
  const [activeTab, setActiveTab] = useState<'recommended'|'active'|'completed'|'saved'>('recommended');
  const [lastSync, setLastSync] = useState(new Date());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(0);

  const sseRef  = useRef<EventSource | null>(null);
  const fromMission    = location.state?.fromMission;
  const highlightProject = location.state?.highlightProject;

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
    const mapped = snap.projects.map(mapDbProject);
    setUserProjects(mapped);
    setRtStats({
      totalXP:        snap.totalXP,
      activeCount:    snap.activeCount,
      completedCount: snap.completedCount,
      savedCount:     snap.savedCount,
    });
    setLastSync(new Date());
  }, []);

  /* ── SSE connection ───────────────────────────────────────────────────────── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    const es = new EventSource(`/api/realtime/stream?userId=${user.id}`);
    sseRef.current = es;

    es.addEventListener('snapshot', (e: MessageEvent) => {
      try { applySnapshot(JSON.parse(e.data)); setIsLive(true); } catch { /* ignore */ }
    });

    es.addEventListener('project_update', (_e: MessageEvent) => {
      try {
        // A project was started/updated elsewhere — re-fetch the full snapshot
        fetch(`/api/realtime/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        showToast('📡 Project update received — dashboard synced!');
      } catch { /* ignore */ }
    });

    es.onerror = () => setIsLive(false);
    es.onopen  = () => setIsLive(true);

    // Also fetch live connection stats periodically
    const statsPoll = setInterval(async () => {
      try {
        const r = await fetch('/api/realtime/stats');
        const d = await r.json();
        setConnectedUsers(d.connectedUsers ?? 0);
      } catch { /* ignore */ }
    }, 30000);

    return () => {
      es.close();
      clearInterval(statsPoll);
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
          resumeData = `Target Role: ${selectedRole}, Skills: ${skills}, Tools: ${tools}`;
        }
        const res  = await fetch('/api/role/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: selectedRole, resumeData }),
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setRecommendedProjects(data.data);
          localStorage.setItem(`dashboard_projects_v2_${selectedRole}`, JSON.stringify(data.data));
        }
      } catch { /* silently fail */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [selectedRole]);

  /* ── Find Trending (OpenAI) ──────────────────────────────────────────────── */
  const handleGenerateTrending = async () => {
    setIsTrendLoading(true);
    try {
      const res  = await fetch('/api/role/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, type: 'trending' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const p = { ...data.data[0], trending: true };
        const updated = [p, ...recommendedProjects];
        setRecommendedProjects(updated);
        localStorage.setItem(`dashboard_projects_v2_${selectedRole}`, JSON.stringify(updated));
        setActiveTab('recommended');
        setSelectedProject(p);
        showToast(`🔥 Trending: "${p.title}" added!`);
      } else { showToast('No trending project found right now.', false); }
    } catch { showToast('AI scan failed. Try again.', false); }
    finally   { setIsTrendLoading(false); }
  };

  /* ── Filtering ───────────────────────────────────────────────────────────── */
  const sourceList = activeTab === 'recommended' ? recommendedProjects : userProjects;
  const filteredProjects = sourceList.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
    const matchDiff = difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter;
    let matchTab = true;
    if (activeTab === 'active')    matchTab = p.status === 'active';
    if (activeTab === 'completed') matchTab = p.status === 'completed';
    if (activeTab === 'saved')     matchTab = p.status === 'saved';
    return matchSearch && matchDiff && matchTab;
  });

  /* local stats fallback when SSE not yet connected */
  const totalXP        = rtStats.totalXP || userProjects.reduce((s, p) => s + (p.metrics?.xp || 0), 0);
  const activeCount    = rtStats.activeCount    || userProjects.filter(p => p.status === 'active').length;
  const completedCount = rtStats.completedCount || userProjects.filter(p => p.status === 'completed').length;

  const diffStyle = (d?: string) => {
    if (d === 'Beginner')     return { bar: 'from-emerald-400 to-teal-500',  badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 text-white' };
    if (d === 'Intermediate') return { bar: 'from-amber-400  to-orange-500', badge: 'bg-amber-100  text-amber-700',   btn: 'bg-amber-600   text-white' };
    return                           { bar: 'from-rose-500   to-red-600',    badge: 'bg-red-100    text-red-700',     btn: 'bg-red-600     text-white' };
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar activePage="dashboard" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 duration-300 ${toast.ok ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="w-10" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Project Dashboard
                  </h1>
                  {/* Live SSE indicator */}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${isLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isLive
                      ? <><Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE</>
                      : <><Wifi className="w-2.5 h-2.5" /> Connecting…</>}
                  </span>
                </div>
                <p className="text-slate-500 text-sm">
                  AI-curated for <span className="font-semibold text-indigo-600">{selectedRole}</span>
                  <span className="text-slate-400 ml-2">· synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {connectedUsers > 1 && (
                    <span className="ml-2 inline-flex items-center gap-1 text-slate-400">
                      <Users className="w-3 h-3" />{connectedUsers} online
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Difficulty pills */}
              <div className="hidden md:flex items-center gap-1">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(d => {
                  const active = difficultyFilter === d.toLowerCase();
                  const ds = diffStyle(d === 'All' ? undefined : d);
                  return (
                    <button key={d} onClick={() => setDifficultyFilter(d.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? (d === 'All' ? 'bg-indigo-600 text-white' : ds.btn) : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {d}
                    </button>
                  );
                })}
              </div>

              {/* Refresh */}
              <button onClick={() => { localStorage.removeItem(`dashboard_projects_v2_${selectedRole}`); window.location.reload(); }}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors" title="Refresh AI projects">
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Find Trending */}
              <button onClick={handleGenerateTrending} disabled={isTrendLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70">
                {isTrendLoading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning…</>
                  : <><TrendingUp className="w-3.5 h-3.5" /> Find Trending</>}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search projects by name, skills, or tags…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors" />
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-6 py-2 border-t border-slate-100 flex items-center gap-6 overflow-x-auto">
          {[
            { icon: <Layers    className="w-3.5 h-3.5 text-indigo-600" />, bg: 'bg-indigo-50', label: 'AI Projects', val: recommendedProjects.length, cls: 'text-slate-900' },
            { icon: <Target    className="w-3.5 h-3.5 text-blue-600"   />, bg: 'bg-blue-50',   label: 'Active',      val: activeCount,               cls: 'text-slate-900' },
            { icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />, bg: 'bg-green-50', label: 'Completed',   val: completedCount,            cls: 'text-slate-900' },
            { icon: <Zap       className="w-3.5 h-3.5 text-amber-600"  />, bg: 'bg-amber-50',  label: 'Total XP',    val: totalXP.toLocaleString(),  cls: 'text-amber-600 font-bold' },
            { icon: <Activity  className="w-3.5 h-3.5 text-purple-600" />, bg: 'bg-purple-50', label: 'Live Users',  val: connectedUsers || '–',     cls: 'text-purple-600' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-6 h-6 rounded-md ${s.bg} flex items-center justify-center`}>{s.icon}</div>
              <div>
                <div className="text-[10px] text-slate-400 leading-none">{s.label}</div>
                <div className={`text-sm font-bold ${s.cls}`}>{s.val}</div>
              </div>
              {i < 4 && <div className="w-px h-6 bg-slate-100 ml-2 flex-shrink-0" />}
            </div>
          ))}
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
            <div className="px-6 pt-4 pb-2">
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 relative overflow-hidden shadow-xl border border-indigo-500/20 group">
                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-400/20 transition-all duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                        <Target className="w-3 h-3" /> Today's Mission
                      </span>
                      <span className="text-indigo-300 text-xs font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">{proj.title}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{task?.title || 'Continue Your Project'}</h2>
                    <p className="text-indigo-200/80 text-sm line-clamp-1 mb-3">{task?.description || 'Ready to make progress? Jump back in!'}</p>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-gray-200">50 XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-gray-200">{task?.duration || '30m'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => navigate('/project-workspace', { state: { project: proj, role: selectedRole } })}
                      className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-xl group-hover:scale-105 duration-200 text-sm">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-indigo-600 border-b-[4px] border-b-transparent ml-0.5" />
                      </div>
                      Start Mission
                    </button>
                    <p className="text-[10px] text-indigo-400/60">Updated {new Date(proj.last_updated || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6">
          <div className="flex gap-6">
            {[
              { id: 'recommended', label: 'For You',   count: null },
              { id: 'active',      label: 'Active',    count: activeCount },
              { id: 'completed',   label: 'Completed', count: completedCount },
              { id: 'saved',       label: 'Saved',     count: userProjects.filter(p => p.status === 'saved').length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                {tab.label}
                {tab.count !== null && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <main className="flex-1 p-6">
          {/* Mission context banner */}
          {fromMission && (
            <div className="mb-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-indigo-900">Mission in Progress</h3>
                <p className="text-xs text-indigo-600">{highlightProject ? <>Select <strong>"{highlightProject}"</strong> below or pick any matching project.</> : 'Pick a project to earn XP!'}</p>
              </div>
              <button onClick={() => navigate('/missions', { state: { role: selectedRole } })}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0">
                Back to Missions
              </button>
            </div>
          )}

          {isLoading ? (
            /* Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                  <div className="h-1.5 bg-gradient-to-r from-indigo-200 to-purple-200" />
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between"><div className="h-4 bg-slate-200 rounded w-1/4" /><div className="h-4 bg-slate-100 rounded w-16" /></div>
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="flex gap-2 pt-1"><div className="h-6 bg-slate-100 rounded-full w-16" /><div className="h-6 bg-slate-100 rounded-full w-20" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <>
              <p className="text-slate-500 text-sm mb-4">
                Found <span className="font-bold text-slate-800">{filteredProjects.length}</span> projects
                {activeTab === 'recommended' && <span className="ml-1 text-indigo-600 font-medium">· AI-personalised for you</span>}
                {isLive && <span className="ml-1 inline-flex items-center gap-0.5 text-green-600 text-xs font-semibold"><Radio className="w-3 h-3 animate-pulse" /> Real-time</span>}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col ${highlightProject && project.title === highlightProject ? 'border-indigo-400 ring-2 ring-indigo-300 shadow-lg' : 'border-slate-100 hover:border-indigo-200'}`}>

                      {/* colour top bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${ds.bar}`} />

                      <div className="p-5 flex-1">
                        {/* Title row */}
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug flex-1">
                            {project.title}
                          </h2>
                          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                            {project.trending && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                                <Flame className="w-2.5 h-2.5" /> Trending
                              </span>
                            )}
                            {isUserProj && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${project.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {project.status === 'active' ? '▶ Active' : '✓ Done'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-3 text-sm text-slate-500">
                          <span className={`font-semibold text-xs px-2 py-0.5 rounded-md ${ds.badge}`}>{project.difficulty}</span>
                          <span>·</span>
                          <span>{project.metrics?.timeEstimate || project.duration}</span>
                          <span>·</span>
                          <span className="font-bold text-green-600">{project.matchScore}% Match</span>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{project.description}</p>

                        {/* Progress bar for active */}
                        {project.status === 'active' && totalTasks > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Progress</span><span>{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />{project.metrics?.xp || 500} XP</span>
                          {project.metrics?.matchIncrease && (
                            <span className="font-semibold text-indigo-600">{project.metrics.matchIncrease} boost</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                          View Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
}
