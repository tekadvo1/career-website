import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import ProjectSetupModal from './ProjectSetupModal';
import Sidebar from './Sidebar';
import {
  Search, TrendingUp, Flame, ChevronRight, X,
  Target, Zap, Clock, Briefcase, CheckCircle,
  Layers, RotateCcw, Wifi, Sparkles, Wrench,
  Code, BookOpen, Lightbulb
} from 'lucide-react';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedRole = location.state?.role || (() => {
    try {
      const saved = localStorage.getItem('lastRoleAnalysis');
      return saved ? JSON.parse(saved).role : 'Software Engineer';
    } catch { return 'Software Engineer'; }
  })();

  const getCachedProjects = () => {
    try {
      const cached = localStorage.getItem(`dashboard_projects_v2_${selectedRole}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  };

  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>(getCachedProjects);
  const [userProjects, setUserProjects]               = useState<Project[]>([]);
  const [isLoading, setIsLoading]                     = useState(() => getCachedProjects().length === 0);
  const [isGeneratingTrending, setIsGeneratingTrending] = useState(false);
  const [searchTerm, setSearchTerm]                   = useState('');
  const [selectedProject, setSelectedProject]         = useState<Project | null>(null);
  const [difficultyFilter, setDifficultyFilter]       = useState('all');
  const [activeTab, setActiveTab]                     = useState<'recommended'|'active'|'completed'|'saved'>('recommended');
  const [showSetupModal, setShowSetupModal]           = useState(false);
  const [lastRefreshed, setLastRefreshed]             = useState(new Date());
  const [toast, setToast]                             = useState<{msg: string; ok: boolean}|null>(null);
  const pollRef                                       = useRef<ReturnType<typeof setInterval>|null>(null);
  const fromMission    = location.state?.fromMission;
  const highlightProject = location.state?.highlightProject;

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch recommended projects (AI/cache) ─────────────────────────────────
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

  // ── Fetch user projects from DB ────────────────────────────────────────────
  const fetchUserProjects = useCallback(async (silent = false) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;
    try {
      const res  = await fetch(`/api/role/my-projects?userId=${user.id}&role=${selectedRole}`);
      const data = await res.json();
      if (data.success) {
        const mapped = data.projects.map((p: any) => {
          const pd = typeof p.project_data  === 'string' ? JSON.parse(p.project_data)  : p.project_data;
          const pr = typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : p.progress_data;
          return { ...pd, id: p.id, title: p.title, description: p.description, status: p.status,
            last_updated: p.last_updated, progress_data: pr, project_data: pd,
            metrics: { ...pd?.metrics, xp: pr?.xp || 0 } };
        });
        setUserProjects(mapped);
        if (!silent) setLastRefreshed(new Date());
      }
    } catch { /* ignore */ }
  }, [selectedRole]);

  useEffect(() => { fetchUserProjects(); }, [fetchUserProjects, activeTab]);

  useEffect(() => {
    pollRef.current = setInterval(() => { fetchUserProjects(true); setLastRefreshed(new Date()); }, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchUserProjects]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') { fetchUserProjects(true); setLastRefreshed(new Date()); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchUserProjects]);

  // ── Find Trending ──────────────────────────────────────────────────────────
  const handleGenerateTrending = async () => {
    setIsGeneratingTrending(true);
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
    finally   { setIsGeneratingTrending(false); }
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const sourceList = activeTab === 'recommended' ? recommendedProjects : userProjects;
  const filteredProjects = sourceList.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
    const matchDiff = difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter;
    let matchTab = true;
    if (activeTab === 'active')     matchTab = p.status === 'active';
    if (activeTab === 'completed')  matchTab = p.status === 'completed';
    if (activeTab === 'saved')      matchTab = p.status === 'saved';
    return matchSearch && matchDiff && matchTab;
  });

  const totalXP       = userProjects.reduce((s, p) => s + (p.metrics?.xp || 0), 0);
  const activeCount   = userProjects.filter(p => p.status === 'active').length;
  const completedCount= userProjects.filter(p => p.status === 'completed').length;

  const diffStyle = (d?: string) => {
    if (d === 'Beginner')     return { bar: 'from-emerald-400 to-teal-500',  badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 text-white' };
    if (d === 'Intermediate') return { bar: 'from-amber-400  to-orange-500', badge: 'bg-amber-100  text-amber-700',   btn: 'bg-amber-600   text-white' };
    return                           { bar: 'from-rose-500   to-red-600',    badge: 'bg-red-100    text-red-700',     btn: 'bg-red-600     text-white' };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
            {/* Left: title + live badge */}
            <div className="flex items-center gap-4">
              <div className="w-10" /> {/* hamburger space */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Project Dashboard
                  </h1>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                    <Wifi className="w-2.5 h-2.5" /> LIVE
                  </span>
                </div>
                <p className="text-slate-500 text-sm">
                  AI-curated for <span className="font-semibold text-indigo-600">{selectedRole}</span>
                  <span className="text-slate-400 ml-2">· synced {lastRefreshed.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {/* Difficulty pills */}
              <div className="hidden md:flex items-center gap-1">
                {['All','Beginner','Intermediate','Advanced'].map(d => {
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
              <button onClick={handleGenerateTrending} disabled={isGeneratingTrending}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70">
                {isGeneratingTrending
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</>
                  : <><TrendingUp className="w-3.5 h-3.5" /> Find Trending</>}
              </button>
            </div>
          </div>

          {/* Full-width Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search projects by name, skills, or tags..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors" />
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-6 py-2 border-t border-slate-100 flex items-center gap-6 overflow-x-auto">
          {[
            { icon: <Layers className="w-3.5 h-3.5 text-indigo-600" />, bg: 'bg-indigo-50', label: 'AI Projects', val: recommendedProjects.length, cls: 'text-slate-900' },
            { icon: <Target className="w-3.5 h-3.5 text-blue-600" />,   bg: 'bg-blue-50',   label: 'Active',       val: activeCount,            cls: 'text-slate-900' },
            { icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />, bg: 'bg-green-50', label: 'Completed', val: completedCount,         cls: 'text-slate-900' },
            { icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,    bg: 'bg-amber-50',   label: 'Total XP',     val: totalXP.toLocaleString(), cls: 'text-amber-600 font-bold' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-6 h-6 rounded-md ${s.bg} flex items-center justify-center`}>{s.icon}</div>
              <div>
                <div className="text-[10px] text-slate-400 leading-none">{s.label}</div>
                <div className={`text-sm font-bold ${s.cls}`}>{s.val}</div>
              </div>
              {i < 3 && <div className="w-px h-6 bg-slate-100 ml-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex flex-col min-h-[calc(100vh-140px)]">

        {/* Today's Mission Banner */}
        {userProjects.length > 0 && userProjects[0].status === 'active' && (() => {
          const proj = userProjects[0];
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
                    <p className="text-[10px] text-indigo-400/60">Updated {new Date(proj.last_updated || Date.now()).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
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
              { id: 'recommended', label: 'For You', count: null },
              { id: 'active',      label: 'Active',     count: activeCount },
              { id: 'completed',   label: 'Completed',  count: completedCount },
              { id: 'saved',       label: 'Saved',      count: userProjects.filter(p=>p.status==='saved').length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                {tab.label}
                {tab.count !== null && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>}
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
              {[1,2,3,4].map(i => (
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
                {activeTab === 'recommended' && <span className="ml-1 text-indigo-600 font-medium">· AI‑personalised for you</span>}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProjects.map(project => {
                  const ds = diffStyle(project.difficulty);
                  const isUserProj = ['active','completed'].includes(project.status || '');
                  return (
                    <div key={project.id} onClick={() => isUserProj ? navigate('/project-workspace',{state:{project,role:selectedRole}}) : setSelectedProject(project)}
                      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col ${highlightProject && project.title === highlightProject ? 'border-indigo-400 ring-2 ring-indigo-300 shadow-lg' : 'border-slate-100 hover:border-indigo-200'}`}>
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
                          <span className={`font-semibold ${ds.badge.split(' ')[1]}`}>{project.difficulty}</span>
                          <span>·</span>
                          <span>{project.metrics?.timeEstimate || project.duration}</span>
                          <span>·</span>
                          <span className="font-bold text-green-600">{project.matchScore}% Match</span>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">{project.description}</p>

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.slice(0,4).map(tag => (
                              <span key={tag} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />{project.metrics?.xp || 500} XP</span>
                          <span className="font-semibold text-indigo-600">{project.metrics?.matchIncrease || '+10%'} boost</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
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

      {/* ── PROJECT MODAL ── */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-8">
            {/* Hero */}
            <div className="relative bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-6 rounded-t-2xl overflow-hidden">
              <div className="absolute top-3 right-3">
                <button onClick={() => setSelectedProject(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-[10px] font-bold uppercase">{selectedProject.matchScore}% Match</span>
                <span className="px-2.5 py-0.5 bg-white/10 text-white border border-white/20 rounded-full text-[10px] font-medium">{selectedRole}</span>
                {selectedProject.trending && <span className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-[10px] font-bold"><Flame className="w-2.5 h-2.5" /> Trending</span>}
              </div>
              <h2 className="text-xl font-bold mb-2">{selectedProject.title}</h2>
              <p className="text-indigo-100/80 text-sm mb-4">{selectedProject.description}</p>
              {selectedProject.careerImpact && (
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-300 font-bold text-[10px] uppercase tracking-wider"><Flame className="w-3 h-3" /> Career Impact</div>
                  <div className="grid md:grid-cols-2 gap-1.5">
                    {selectedProject.careerImpact.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-100">{item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Left */}
              <div className="flex-1 p-5 space-y-5">
                {/* Metrics row */}
                {selectedProject.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Career Match', val: selectedProject.metrics.matchIncrease, cls: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
                      { label: 'XP Reward',    val: `${selectedProject.metrics.xp} XP`,   cls: 'bg-amber-50  border-amber-100  text-amber-600'  },
                      { label: 'Est. Time',    val: selectedProject.metrics.timeEstimate,  cls: 'bg-blue-50   border-blue-100   text-blue-600'   },
                      { label: 'Relevance',    val: selectedProject.metrics.roleRelevance, cls: 'bg-green-50  border-green-100  text-green-600'  },
                    ].map(m => (
                      <div key={m.label} className={`rounded-xl p-3 border ${m.cls}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">{m.label}</div>
                        <div className="text-sm font-bold text-gray-900">{m.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Why recommended */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Lightbulb className="w-4 h-4 text-indigo-600" /> Why This Project?
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedProject.whyRecommended?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills to develop */}
                {selectedProject.skillsToDevelop && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <TrendingUp className="w-4 h-4 text-indigo-600" /> Skills You'll Develop
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.skillsToDevelop.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools & Languages */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-wide"><Wrench className="w-3.5 h-3.5 text-indigo-600" /> Tools</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.tools?.map((t, i) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs border border-blue-100">{t}</span>)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-wide"><Code className="w-3.5 h-3.5 text-indigo-600" /> Languages</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.languages?.map((l, i) => <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-800 rounded text-xs border border-indigo-100">{l}</span>)}
                    </div>
                  </div>
                </div>

                {/* Setup Guide */}
                {selectedProject.setupGuide && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <BookOpen className="w-4 h-4 text-amber-600" /> {selectedProject.setupGuide.title || 'Setup Guide'}
                    </h3>
                    <ol className="space-y-2">
                      {selectedProject.setupGuide.steps?.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                          <span className="text-sm text-slate-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Skill Gain */}
                {selectedProject.skillGainEstimates && selectedProject.skillGainEstimates.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <TrendingUp className="w-4 h-4 text-indigo-600" /> Skill Progression
                    </h3>
                    <div className="space-y-2.5">
                      {selectedProject.skillGainEstimates.map((sk, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{sk.skill}</span>
                            <span className="text-slate-400">{sk.before}% → <span className="text-indigo-600 font-bold">{sk.after}%</span></span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{width:`${sk.after}%`}} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="lg:w-64 bg-slate-50/70 p-4 space-y-3 border-l border-slate-100 rounded-br-2xl">
                {/* Start panel */}
                <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-4">
                  <h3 className="text-indigo-600 font-bold text-sm mb-1 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Unlock Senior Readiness</h3>
                  <p className="text-slate-500 text-xs mb-3">Boost your hiring probability by {selectedProject.metrics?.matchIncrease}.</p>
                  <button onClick={() => setShowSetupModal(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 mb-2">
                    Start Project <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-xs transition-all">
                    Save for Later
                  </button>
                </div>

                {/* Recruiter appeal */}
                {selectedProject.recruiterAppeal && (
                  <div className="bg-white rounded-xl border border-slate-100 p-3">
                    <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wide"><Briefcase className="w-3 h-3" /> Recruiter Value</h4>
                    <ul className="space-y-1.5">
                      {selectedProject.recruiterAppeal.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech stack */}
                <div className="bg-white rounded-xl border border-slate-100 p-3">
                  <h4 className="font-bold text-slate-900 text-xs mb-2 uppercase tracking-wide">Tech Stack</h4>
                  <div className="flex flex-wrap gap-1">
                    {[...(selectedProject.languages||[]), ...(selectedProject.tools||[])].map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded border border-slate-200">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {selectedProject && (
        <ProjectSetupModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} project={selectedProject} role={selectedRole} />
      )}
    </div>
  );
}
