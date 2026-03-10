import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Edit,
  Sparkles,
  Target,
  Share2,
  CheckCircle2,
  Bot,
  Linkedin,
  Globe,
  Lock,
  Unlock,
  FileText,
  X,
  Plus,
  Palette
} from "lucide-react";

const THEMES: Record<string, any> = {
  minimalist: {
    id: "minimalist",
    label: "Minimalist Clean",
    bg: "bg-[#F8FAFC]",
    card: "bg-white border-slate-200 shadow-sm",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    accentText: "text-teal-600",
    accentBg: "bg-teal-50",
    headerBg: "from-slate-900 via-teal-900 to-emerald-900",
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    skillBadge: "bg-slate-100 text-slate-700 border-slate-200",
    primaryBtn: "bg-slate-900 hover:bg-slate-800 text-white",
    socialBtn: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  dark: {
    id: "dark",
    label: "Dark Mode Obsidian",
    bg: "bg-slate-950",
    card: "bg-slate-900 border-slate-800 shadow-md",
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-900/30",
    headerBg: "from-slate-950 via-emerald-950/20 to-slate-900",
    badge: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50",
    skillBadge: "bg-slate-800 text-emerald-100 border-slate-700",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    socialBtn: "bg-slate-800 hover:bg-slate-700 text-white",
  },
  creative: {
    id: "creative",
    label: "Creative Modern",
    bg: "bg-amber-50/50",
    card: "bg-white border-rose-100 shadow-[0_8px_30px_rgb(225,29,72,0.04)]",
    textPrimary: "text-rose-950",
    textSecondary: "text-rose-800/70",
    accentText: "text-rose-600",
    accentBg: "bg-rose-50",
    headerBg: "from-amber-200 justify-center via-rose-300 to-orange-300",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    skillBadge: "bg-orange-50 text-orange-800 border-orange-200",
    primaryBtn: "bg-rose-600 hover:bg-rose-700 text-white",
    socialBtn: "bg-rose-950 hover:bg-rose-900 text-white",
  },
  executive: {
    id: "executive",
    label: "Executive Professional",
    bg: "bg-slate-100",
    card: "bg-white border-slate-300 shadow-xl",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    accentText: "text-blue-700",
    accentBg: "bg-blue-50",
    headerBg: "from-slate-800 via-slate-700 to-slate-900",
    badge: "bg-slate-100 text-blue-900 border-slate-200",
    skillBadge: "bg-slate-100 text-blue-900 border-slate-200",
    primaryBtn: "bg-blue-700 hover:bg-blue-800 text-white",
    socialBtn: "bg-slate-800 hover:bg-slate-700 text-white",
  },
  glass: {
    id: "glass",
    label: "Glassmorphism UI",
    bg: "bg-gradient-to-br from-indigo-50 via-white to-cyan-50",
    card: "bg-white/60 backdrop-blur-2xl border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    textPrimary: "text-slate-800",
    textSecondary: "text-slate-600",
    accentText: "text-indigo-600",
    accentBg: "bg-indigo-50/50",
    headerBg: "from-indigo-600/20 via-purple-600/20 to-cyan-600/20",
    badge: "bg-white/50 text-indigo-700 border-white text-indigo-900",
    skillBadge: "bg-white/50 text-indigo-900 border-white shadow-sm",
    primaryBtn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md",
    socialBtn: "bg-white/50 hover:bg-white border hover:border-indigo-100 text-slate-800",
  }
};

export default function Portfolio({ isPublic = false }: { isPublic?: boolean }) {
  const navigate = useNavigate();
  const { username } = useParams();

  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [builderStep, setBuilderStep] = useState<'landing' | 'editor'>('landing');

  // Use localStorage or database for these config options
  const [portfolioData, setPortfolioData] = useState({
    linkedin: "https://linkedin.com/in/username",
    website: "https://yourportfolio.com",
    isPrivate: false,
    about: "Driven professional focused on continuous growth.",
    experiences: [] as any[],
    theme: "minimalist"
  });

  const [editForm, setEditForm] = useState(portfolioData);
  const [showThemePicker, setShowThemePicker] = useState(false);
  
  // Real stats calculated
  const [stats, setStats] = useState({
    projectsCompleted: 0,
    skillsMastered: 0,
  });

  const [skillsList, setSkillsList] = useState<any[]>([]);

  const loadRealtimeStats = () => {
    const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
    const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;

    // We still load initial config from local storage as a fallback
    // Realtime updates will handle the actual stats
    
    // Load active skills from local storage role analysis
    let activeSkills = ["JavaScript", "React", "Node.js", "TypeScript", "TailwindCSS"];
    if (lastRoleState?.analysis?.technicalSkills?.length > 0) {
        activeSkills = lastRoleState.analysis.technicalSkills;
    } else if (lastRoleState?.analysis?.existingSkills?.length > 0) {
        activeSkills = lastRoleState.analysis.existingSkills.map((s: any) => s.name);
    }

    setSkillsList(activeSkills.slice(0, 8).map((s: string, idx: number) => ({ name: s, level: Math.max(60, 95 - (idx * 5)) })));

    // Load saved portfolio config
    const savedPortfolio = localStorage.getItem('user_portfolio_details');
    if (savedPortfolio) {
      const parsed = JSON.parse(savedPortfolio);
      if (!parsed.theme) parsed.theme = "minimalist";
      setPortfolioData(parsed);
      setEditForm(parsed);
    } else {
      // Map initial basic experiences from their generated project data if no saved portfolio
      const mappedExps = [{
        title: "Developer Project",
        role: "Developer",
        description: "Implemented and delivered key features.",
        date: "Recently"
      }];
      setPortfolioData(prev => ({...prev, experiences: mappedExps}));
      setEditForm(prev => ({...prev, experiences: mappedExps}));
    }
  };

  useEffect(() => {
    loadRealtimeStats();
    
    // SETUP REAL-TIME STREAM
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    let es: EventSource | null = null;

    if (!isPublic && user?.id) {
        es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${localStorage.getItem('token')}`);
        es.addEventListener('snapshot', (e: MessageEvent) => {
            try {
                const snap = JSON.parse(e.data);
                if (snap) {
                   const completedProjCount = snap.projects?.filter((p: any) => p.status === 'completed')?.length || 0;
                   const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
                   const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
                   const activeRole = lastRoleState?.role || "Software Engineer";
                   
                   const mr = snap.roadmapProgress?.filter((r: any) => r.role === activeRole) || [];
                   setStats({
                       projectsCompleted: completedProjCount,
                       skillsMastered: mr.length
                   });
                }
            } catch (err) {}
        });
    }

    const handleStorageChange = () => loadRealtimeStats();
    window.addEventListener('storage', handleStorageChange);
    return () => {
       window.removeEventListener('storage', handleStorageChange);
       if (es) es.close();
    };
  }, [isPublic]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
  const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
  const activeRole = lastRoleState?.role || "Software Engineer";

  const displayName = isPublic ? username : (user?.username || "Guest User");
  const t = THEMES[portfolioData.theme] || THEMES.minimalist;

  const shareProfile = () => {
    const link = `${window.location.origin}/portfolio/${user?.username || 'user'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSavePortfolio = () => {
    setPortfolioData(editForm);
    localStorage.setItem('user_portfolio_details', JSON.stringify(editForm));
    setIsEditing(false);
  };

  const changeTheme = (themeId: string) => {
      const newDetails = { ...portfolioData, theme: themeId };
      setPortfolioData(newDetails);
      setEditForm(newDetails);
      localStorage.setItem('user_portfolio_details', JSON.stringify(newDetails));
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
        const topSkills = skillsList.map(s => s.name).slice(0, 3).join(", ");
        const newAbout = `Passionate and driven ${activeRole} with hands-on experience delivering ${stats.projectsCompleted} major projects. Specialized in modern development practices including ${topSkills}. Proven track record of mastering complex technical architectures through continuous learning and dedication. Eager to bring value to forward-thinking engineering teams.`;
        
        const newDetails = { ...portfolioData, about: newAbout };
        setPortfolioData(newDetails);
        setEditForm(newDetails);
        localStorage.setItem('user_portfolio_details', JSON.stringify(newDetails));
        setIsGeneratingAI(false);
    }, 2000);
  };

  const updateExperience = (index: number, field: string, value: string) => {
      const newExps = [...editForm.experiences];
      newExps[index] = { ...newExps[index], [field]: value };
      setEditForm({ ...editForm, experiences: newExps });
  };

  const removeExperience = (index: number) => {
      const newExps = editForm.experiences.filter((_, i) => i !== index);
      setEditForm({ ...editForm, experiences: newExps });
  };

  const addExperience = () => {
      const newExps = [...editForm.experiences, { title: "", role: "", date: "", description: "" }];
      setEditForm({ ...editForm, experiences: newExps });
  };

  const handleSyncProjectsFromFindStreak = async () => {
      // Sync from backend
      if (!user?.id) return;
      try {
          await fetch(`/api/realtime/notify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id })
          });
          // After notification, SSE will give us the new snapshot, but for manual experiences,
          // let's fetch user_projects directly or use the stats we have
          // To be simple, we just update the description based on the stats count!
          const newExp = {
              title: "FindStreak Completed Projects",
              role: activeRole,
              description: `Successfully implemented and delivered ${stats.projectsCompleted} key features and projects on FindStreak.`,
              date: new Date().toLocaleDateString(undefined, {month: 'short', year:'numeric'})
          };
          setEditForm({ ...editForm, experiences: [newExp] });
      } catch (err) {}
  };

  const togglePrivacy = () => {
      const newState = !portfolioData.isPrivate;
      const newDetails = { ...portfolioData, isPrivate: newState };
      setPortfolioData(newDetails);
      setEditForm(newDetails);
      localStorage.setItem('user_portfolio_details', JSON.stringify(newDetails));
  };

  if (isPublic && portfolioData.isPrivate) {
      return (
          <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center p-6 text-center`}>
              <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center text-slate-400 mb-6 border border-slate-200/50 shadow-sm backdrop-blur">
                  <Lock className="w-8 h-8" />
              </div>
              <h1 className={`text-2xl font-bold ${t.textPrimary} mb-2`}>This Portfolio is Private</h1>
              <p className={`${t.textSecondary} max-w-md`}>The user has chosen to keep their AI portfolio hidden from public view at this moment. Please check back later.</p>
          </div>
      );
  }

  return (
    <div className={`min-h-screen ${t.bg} selection:bg-teal-100 selection:text-teal-900 font-sans pb-20 transition-colors duration-500`}>
      {/* Editor Main Header Tooltar */}
      {!isPublic && (
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" /> AI Portfolio Builder
                  </h1>
                  <p className="text-[11px] text-slate-500">Manage what recruiters see</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={togglePrivacy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-bold text-[11px] border ${portfolioData.isPrivate ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                >
                  {portfolioData.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {portfolioData.isPrivate ? 'Private' : 'Public'}
                </button>

                <button 
                  onClick={shareProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors font-bold text-[11px] shadow-sm ml-1"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied!' : 'Share Portfolio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-5 pt-8 md:pt-12 relative z-10">
        {!isPublic && builderStep === 'landing' ? (
          <div className="text-center py-16 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-teal-200 transform rotate-3 hover:rotate-0 transition-transform">
               <Globe className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">Your AI-Powered <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Recruiter Portfolio</span></h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-12 text-[15px] md:text-[17px] leading-relaxed font-medium">
              Instantly generate a highly professional, verified portfolio website showcasing your skills, shipped projects, and career progress to top recruiters. Select a theme, sync data, and publish in seconds.
            </p>
            <button 
              onClick={() => setBuilderStep('editor')}
              className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-[16px] transition-all shadow-xl shadow-slate-900/20 active:translate-y-0.5 flex items-center justify-center gap-3 mx-auto group"
            >
              <Sparkles className="w-6 h-6 text-teal-400 group-hover:rotate-12 transition-transform" />
              Open Live Builder
            </button>
            <div className="mt-16 flex items-center justify-center gap-4 opacity-50 grayscale pt-8 border-t border-slate-200 max-w-sm mx-auto">
               <div className="h-6 w-24 bg-slate-200 rounded"></div>
               <div className="h-6 w-28 bg-slate-200 rounded"></div>
               <div className="h-6 w-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            
            {/* Editor Action Bar (Template / Editor) */}
            {!isPublic && (
                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100 shadow-inner">
                                <Bot className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-bold text-slate-800">AI Resume Architect</h3>
                                <p className="text-[11px] text-slate-500">Live preview & generation</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
                        {/* Theme Picker Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowThemePicker(!showThemePicker)}
                                className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[12px] transition-colors flex items-center gap-2"
                            >
                                <Palette className="w-3.5 h-3.5" /> 
                                Theme: {t.label}
                            </button>
                            {showThemePicker && (
                                <div className="absolute top-12 right-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-2 pb-2 mb-1 border-b border-slate-100">Select Template Design</div>
                                    {Object.values(THEMES).map(themeDef => (
                                        <button 
                                            key={themeDef.id} 
                                            onClick={() => { changeTheme(themeDef.id); setShowThemePicker(false); }}
                                            className={`w-full text-left px-3 py-2 text-[12px] font-bold rounded-lg mb-1 flex items-center justify-between transition-colors ${portfolioData.theme === themeDef.id ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                        >
                                            {themeDef.label}
                                            {portfolioData.theme === themeDef.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => { changeTheme("dark"); setShowThemePicker(false); }}
                                        className="w-full text-left px-3 py-2 mt-2 text-[12px] font-bold rounded-lg flex items-center gap-1.5 transition-colors bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-teal-800 hover:border-teal-300 shadow-inner group"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-teal-600" /> Auto-Generate Custom Theme
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[12px] transition-colors">Cancel</button>
                                <button onClick={handleSavePortfolio} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[12px] transition-colors shadow-sm">Save Portfolio</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[12px] transition-colors flex items-center justify-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Edit Content</button>
                                <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[12px] transition-all shadow-md flex items-center justify-center gap-1.5 group">
                                    {isGeneratingAI ? <Bot className="w-3.5 h-3.5 animate-pulse" /> : <Bot className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />}
                                    {isGeneratingAI ? 'Generating...' : 'Auto-Write Info'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Public Portfolio View Content (DYNAMIZED THEME) */}
            <div className={`${t.card} rounded-[2rem] overflow-hidden relative transition-all duration-500`}>
                <div className={`h-40 bg-gradient-to-r ${t.headerBg} relative transition-all duration-1000`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>

                <div className="px-8 pb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-8 gap-5">
                        <div className="flex items-end gap-5">
                            <div className={`w-32 h-32 rounded-2xl ${t.card} p-1.5 shadow-xl z-10 transition-colors duration-500`}>
                                <div className={`w-full h-full bg-gradient-to-br ${t.headerBg} rounded-[10px] flex items-center justify-center text-white text-4xl font-bold shadow-inner`}>
                                    {displayName ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}
                                </div>
                            </div>
                            <div className="mb-2 z-10">
                                <h1 className={`text-3xl font-extrabold ${t.textPrimary} tracking-tight transition-colors`}>{displayName}</h1>
                                <p className={`${t.accentText} font-bold text-sm tracking-wide uppercase mt-1 flex items-center gap-1.5 transition-colors`}><Briefcase className="w-4 h-4" /> {activeRole}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
                            <a href={portfolioData.linkedin} target="_blank" rel="noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold text-[12px] transition-colors shadow-sm`}>
                                <Linkedin className="w-4 h-4" /> LinkedIn
                            </a>
                            <a href={portfolioData.website} target="_blank" rel="noreferrer" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 ${t.socialBtn} rounded-xl font-bold text-[12px] transition-colors shadow-sm`}>
                                <Globe className="w-4 h-4" /> Website
                            </a>
                        </div>
                    </div>

                    {/* Editor Links Form */}
                    {isEditing && !isPublic && (
                         <div className={`p-4 rounded-xl border ${t.border} mb-8 grid md:grid-cols-2 gap-4 border-dashed bg-slate-50`}>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                                <input value={editForm.linkedin} onChange={e => setEditForm(prev => ({...prev, linkedin: e.target.value}))} className="w-full p-2 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-700" placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1"><Globe className="w-3 h-3" /> Portfolio URL</label>
                                <input value={editForm.website} onChange={e => setEditForm(prev => ({...prev, website: e.target.value}))} className="w-full p-2 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-700" placeholder="https://..." />
                            </div>
                         </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="md:col-span-2 space-y-8">
                            {/* Summary */}
                            <section>
                                <h2 className={`text-xl font-extrabold ${t.textPrimary} mb-3 flex items-center gap-2 transition-colors`}>About Me</h2>
                                {isEditing && !isPublic ? (
                                    <textarea 
                                        value={editForm.about}
                                        onChange={e => setEditForm(prev => ({...prev, about: e.target.value}))}
                                        className="w-full p-3 text-[14px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 leading-relaxed font-medium bg-white"
                                        rows={5}
                                    />
                                ) : (
                                    <p className={`text-[14px] ${t.textSecondary} leading-relaxed font-medium transition-colors`}>{portfolioData.about}</p>
                                )}
                            </section>

                            {/* Experience / Projects */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-xl font-extrabold ${t.textPrimary} flex items-center gap-2 transition-colors`}>Experience & Projects</h2>
                                    {isEditing && !isPublic && (
                                        <button 
                                            onClick={handleSyncProjectsFromFindStreak}
                                            className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-teal-100 transition-colors border border-teal-100 shadow-sm"
                                        >
                                            <Bot className="w-3.5 h-3.5" /> Auto-Sync Data
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-6 relative">
                                    {/* Timeline line */}
                                    {!isEditing && portfolioData.experiences?.length > 0 && <div className={`absolute top-4 bottom-0 left-1.5 w-[2px] ${t.border}`}></div>}

                                    {isEditing && !isPublic ? (
                                        <div className="space-y-4">
                                            {editForm.experiences?.map((exp: any, i: number) => (
                                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed relative">
                                                    <button onClick={() => removeExperience(i)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                    <div className="grid grid-cols-2 gap-3 mb-3 pr-6">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job / Project Title</label>
                                                            <input value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} className="w-full mt-1 p-2 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 outline-none" placeholder="e.g. Frontend Engineer" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Role / Company</label>
                                                            <input value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="w-full mt-1 p-2 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 outline-none" placeholder="e.g. Tech Corp" />
                                                        </div>
                                                        <div className="col-span-2 sm:col-span-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date / Duration</label>
                                                            <input value={exp.date} onChange={e => updateExperience(i, 'date', e.target.value)} className="w-full mt-1 p-2 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 outline-none" placeholder="e.g. Jan - Present" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
                                                        <textarea value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} rows={3} className="w-full mt-1 p-2 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 outline-none" placeholder="Describe your achievements..." />
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                                <Plus className="w-4 h-4" /> Add Manual Experience
                                            </button>
                                        </div>
                                    ) : portfolioData.experiences?.length > 0 ? (
                                        portfolioData.experiences.map((exp: any, i: number) => (
                                            <div key={i} className="relative pl-6 py-1 group">
                                                <div className={`absolute w-3.5 h-3.5 ${t.accentBg} rounded-full left-0 top-1.5 border-2 ${t.card} z-10 transition-colors group-hover:scale-125 duration-300`}></div>
                                                <h3 className={`text-[15px] font-bold ${t.textPrimary} transition-colors`}>{exp.title}</h3>
                                                <p className={`text-[13px] font-semibold ${t.accentText} mb-2 transition-colors`}>{exp.role} <span className={`${t.textSecondary} font-medium tracking-wide`}>| {exp.date}</span></p>
                                                <p className={`text-[13px] ${t.textSecondary} leading-relaxed font-medium ${t.accentBg} bg-opacity-30 p-3.5 rounded-xl border ${t.border} border-opacity-40 transition-colors`}>{exp.description}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={`text-[13px] ${t.textSecondary} italic ${t.accentBg} bg-opacity-30 p-4 rounded-xl border ${t.border} border-opacity-40 flex items-center gap-2`}><Target className={`w-4 h-4 ${t.textSecondary}`} /> Start building projects in your FindStreak Workspace to populate this section.</div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            {/* Skills Overview */}
                            <section>
                                <h2 className={`text-lg font-extrabold ${t.textPrimary} mb-4 flex items-center gap-2 transition-colors`}>Technical Core</h2>
                                <div className="flex flex-wrap gap-2">
                                    {skillsList.length > 0 ? skillsList.map((skill, i) => (
                                        <span key={i} className={`px-2.5 py-1.5 ${t.skillBadge} rounded-lg text-[11px] font-bold border transition-colors`}>
                                            {skill.name}
                                        </span>
                                    )) : (
                                        <span className={`${t.textSecondary} text-[12px]`}>No skills mastered yet.</span>
                                    )}
                                </div>
                            </section>

                            {/* Validated Stats for Recruiters */}
                            <section>
                                <div className={`bg-gradient-to-br ${t.headerBg} rounded-2xl p-[1px] shadow-sm relative overflow-hidden group`}>
                                    <div className={`${t.card} rounded-[15px] p-5 h-full relative`}>
                                        <div className={`absolute right-0 bottom-0 ${t.accentText} opacity-[0.03] mb-[-20px] mr-[-20px] group-hover:scale-110 transition-transform duration-700`}>
                                            <Bot className="w-32 h-32" />
                                        </div>
                                        <h2 className={`text-[13px] font-bold ${t.textPrimary} mb-4 flex items-center gap-1.5 z-10 relative`}>
                                            <CheckCircle2 className={`w-4 h-4 ${t.accentText}`} />
                                            FindStreak Validated
                                        </h2>
                                        
                                        <div className="space-y-4 relative z-10">
                                            <div>
                                                <div className={`flex items-center justify-between text-[11px] font-bold ${t.textSecondary} uppercase tracking-wider mb-1.5`}>
                                                    <span>Projects Shipped</span>
                                                    <span className={`${t.textPrimary} font-black text-[14px]`}>{stats.projectsCompleted}</span>
                                                </div>
                                                <div className={`w-full ${t.bg} rounded-full h-1`}><div className={`${t.primaryBtn} h-1 rounded-full w-full opacity-60`}></div></div>
                                            </div>
                                            <div>
                                                <div className={`flex items-center justify-between text-[11px] font-bold ${t.textSecondary} uppercase tracking-wider mb-1.5`}>
                                                    <span>Skills Mastered</span>
                                                    <span className={`${t.textPrimary} font-black text-[14px]`}>{stats.skillsMastered}</span>
                                                </div>
                                                <div className={`w-full ${t.bg} rounded-full h-1`}><div className={`${t.primaryBtn} h-1 rounded-full w-full opacity-60`}></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
                
                {/* Findstreak Public Footer Branding */}
                <div className="bg-slate-950 text-center py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-t border-slate-900 mt-2">
                     <span className="text-slate-400 text-[11px] font-medium tracking-wide">Professional AI Portfolio verified by</span>
                     <span className="text-white text-[12px] font-bold flex items-center gap-1"><Bot className="w-3.5 h-3.5 text-teal-400" /> FINDSTREAK</span>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
