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
  FileText
} from "lucide-react";

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
  });

  const [editForm, setEditForm] = useState(portfolioData);
  
  // Real stats calculated
  const [stats, setStats] = useState({
    projectsCompleted: 0,
    skillsMastered: 0,
  });

  const [skillsList, setSkillsList] = useState<any[]>([]);

  const loadRealtimeStats = () => {
    const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
    const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
    const activeRole = lastRoleState?.role || "Software Engineer";

    const projectsDataRaw = localStorage.getItem(`dashboard_projects_v2_${activeRole}`);
    const projectsData = projectsDataRaw ? JSON.parse(projectsDataRaw) : [];
    const completedProj = projectsData.filter((p: any) => p.status === 'done');

    const roadmapProgressRaw = localStorage.getItem(`roadmap_progress_${activeRole}`);
    const roadmapProgress = roadmapProgressRaw ? JSON.parse(roadmapProgressRaw) : [];

    setStats({
      projectsCompleted: completedProj.length,
      skillsMastered: roadmapProgress.length,
    });

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
      setPortfolioData(parsed);
      setEditForm(parsed);
    } else {
      // Map initial basic experiences from their generated project data if no saved portfolio
      const mappedExps = completedProj.slice(0, 3).map((p: any) => ({
        title: p.title || "Project",
        role: "Developer",
        description: p.description?.substring(0, 150) + "..." || "Implemented and delivered key features.",
        date: "Recently"
      }));
      setPortfolioData(prev => ({...prev, experiences: mappedExps}));
      setEditForm(prev => ({...prev, experiences: mappedExps}));
    }
  };

  useEffect(() => {
    loadRealtimeStats();
    const handleStorageChange = () => loadRealtimeStats();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
  const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
  const activeRole = lastRoleState?.role || "Software Engineer";

  // Display user name override if public
  const displayName = isPublic ? username : (user?.username || "Guest User");

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

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation lag
    setTimeout(() => {
        const topSkills = skillsList.map(s => s.name).slice(0, 3).join(", ");
        const newAbout = `Passionate and driven ${activeRole} with hands-on experience delivering ${stats.projectsCompleted} major projects. Specialized in modern development practices including ${topSkills}. Proven track record of mastering complex technical architectures through continuous learning and dedication. Eager to bring value to forward-thinking engineering teams.`;
        
        const newDetails = { 
            ...portfolioData, 
            about: newAbout 
        };
        
        setPortfolioData(newDetails);
        setEditForm(newDetails);
        localStorage.setItem('user_portfolio_details', JSON.stringify(newDetails));
        setIsGeneratingAI(false);
    }, 2000);
  };

  const togglePrivacy = () => {
      const newState = !portfolioData.isPrivate;
      const newDetails = { ...portfolioData, isPrivate: newState };
      setPortfolioData(newDetails);
      setEditForm(newDetails);
      localStorage.setItem('user_portfolio_details', JSON.stringify(newDetails));
  };


  // If the portfolio is private and the viewer is public, show a locked screen
  if (isPublic && portfolioData.isPrivate) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 border border-slate-200 shadow-sm">
                  <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">This Portfolio is Private</h1>
              <p className="text-slate-500 max-w-md">The user has chosen to keep their AI portfolio hidden from public view at this moment. Please check back later.</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 font-sans pb-20">
      {/* Dynamic Header */}
      {!isPublic && (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
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

      <div className="max-w-4xl mx-auto px-5 pt-8 md:pt-12">
        {!isPublic && builderStep === 'landing' ? (
          <div className="text-center py-16 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-teal-200 transform rotate-3 hover:rotate-0 transition-transform">
               <Globe className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">Your AI-Powered <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Recruiter Portfolio</span></h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-12 text-[15px] md:text-[17px] leading-relaxed font-medium">
              Instantly generate a highly professional, verified portfolio website showcasing your skills, shipped projects, and career progress to top recruiters. Built in seconds.
            </p>
            <button 
              onClick={() => setBuilderStep('editor')}
              className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-[16px] transition-all shadow-xl shadow-slate-900/20 active:translate-y-0.5 flex items-center justify-center gap-3 mx-auto group"
            >
              <Sparkles className="w-6 h-6 text-teal-400 group-hover:rotate-12 transition-transform" />
              Start Building Now
            </button>
            <div className="mt-16 flex items-center justify-center gap-4 opacity-50 grayscale pt-8 border-t border-slate-200 max-w-sm mx-auto">
               <div className="h-6 w-24 bg-slate-200 rounded"></div>
               <div className="h-6 w-28 bg-slate-200 rounded"></div>
               <div className="h-6 w-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Editor Tollbar */}
        {!isPublic && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100 shadow-inner">
                         <Bot className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-slate-800">AI Resume Architect</h3>
                        <p className="text-[11px] text-slate-500">Let FindStreak AI build your recruiter-ready profile</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[12px] transition-colors">Cancel</button>
                            <button onClick={handleSavePortfolio} className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[12px] transition-colors shadow-sm">Save Portfolio</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[12px] transition-colors flex items-center justify-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Edit Mode</button>
                            <button onClick={handleGenerateAI} disabled={isGeneratingAI} className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg font-bold text-[12px] transition-all shadow-md flex items-center justify-center gap-1.5">
                                {isGeneratingAI ? <Bot className="w-3.5 h-3.5 animate-pulse" /> : <Sparkles className="w-3.5 h-3.5" />}
                                {isGeneratingAI ? 'Generating...' : 'Auto-Generate'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* Public Portfolio View Content */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="h-40 bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            </div>

            <div className="px-8 pb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-8 gap-5">
                    <div className="flex items-end gap-5">
                        <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-10">
                            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-4xl font-bold shadow-inner">
                                {displayName ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}
                            </div>
                        </div>
                        <div className="mb-2 z-10">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{displayName}</h1>
                            <p className="text-teal-600 font-bold text-sm tracking-wide uppercase mt-1 flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {activeRole}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 z-10 w-full md:w-auto">
                        <a href={portfolioData.linkedin} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold text-[12px] transition-colors shadow-sm">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                        <a href={portfolioData.website} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[12px] transition-colors shadow-sm">
                            <Globe className="w-4 h-4" /> Portfolio
                        </a>
                    </div>
                </div>

                {/* Editor Links Form */}
                {isEditing && !isPublic && (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 grid md:grid-cols-2 gap-4">
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
                            <h2 className="text-xl font-extrabold text-slate-800 mb-3 flex items-center gap-2">About Me</h2>
                            {isEditing && !isPublic ? (
                                <textarea 
                                    value={editForm.about}
                                    onChange={e => setEditForm(prev => ({...prev, about: e.target.value}))}
                                    className="w-full p-3 text-[14px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-700 leading-relaxed font-medium"
                                    rows={5}
                                />
                            ) : (
                                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{portfolioData.about}</p>
                            )}
                        </section>

                        {/* Experience / Projects */}
                        <section>
                            <h2 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">Experience & Projects</h2>
                            <div className="space-y-6">
                                {portfolioData.experiences?.length > 0 ? (
                                    portfolioData.experiences.map((exp: any, i: number) => (
                                        <div key={i} className="relative pl-6 border-l-2 border-slate-100 py-1">
                                            <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-2 border-[3px] border-white"></div>
                                            <h3 className="text-[15px] font-bold text-slate-900">{exp.title}</h3>
                                            <p className="text-[13px] font-semibold text-teal-600 mb-2">{exp.role} <span className="text-slate-400 font-medium">| {exp.date}</span></p>
                                            <p className="text-[13px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{exp.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[13px] text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" /> Start building projects in your FindStreak Workspace to populate this section.</div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Skills Overview */}
                        <section>
                            <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">Technical Core</h2>
                            <div className="flex flex-wrap gap-2">
                                {skillsList.length > 0 ? skillsList.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[12px] font-bold border border-slate-200">
                                        {skill.name}
                                    </span>
                                )) : (
                                    <span className="text-slate-400 text-[12px]">No skills mastered yet.</span>
                                )}
                            </div>
                        </section>

                        {/* Validated Stats for Recruiters */}
                        <section>
                            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 text-emerald-500 opacity-5 mb-[-20px] mr-[-20px]">
                                    <Bot className="w-32 h-32" />
                                </div>
                                <h2 className="text-[13px] font-bold text-teal-900 mb-3 flex items-center gap-1.5 z-10 relative">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    FindStreak Validated
                                </h2>
                                
                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                            <span>Projects Shipped</span>
                                            <span className="text-teal-700 text-[13px]">{stats.projectsCompleted}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1"><div className="bg-teal-500 h-1 rounded-full w-full"></div></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                            <span>Skills Mastered</span>
                                            <span className="text-emerald-700 text-[13px]">{stats.skillsMastered}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full w-full"></div></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            
            {/* Findstreak Public Footer Branding */}
            <div className="bg-slate-900 text-center py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-t border-slate-800">
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
