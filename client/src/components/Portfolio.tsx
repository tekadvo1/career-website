import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from '../utils/auth';
import {
  ArrowLeft, Briefcase, Eye, Edit2, Shield, Settings, Link as LinkIcon,
  User as UserIcon, Code, X, Plus, Save, Globe, Linkedin, LayoutTemplate
} from "lucide-react";

// Themes definition
const THEMES: Record<string, any> = {
  minimalist: {
    id: "minimalist", label: "Minimalist Clean",
    bg: "bg-[#F8FAFC]", card: "bg-white border-slate-200 shadow-sm",
    textPrimary: "text-slate-900", textSecondary: "text-slate-600",
    accentText: "text-teal-600", accentBg: "bg-teal-50",
    headerBg: "from-slate-900 via-teal-900 to-emerald-900",
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    skillBadge: "bg-slate-100 text-slate-700 border-slate-200",
    primaryBtn: "bg-slate-900 hover:bg-slate-800 text-white",
    socialBtn: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  dark: {
    id: "dark", label: "Dark Mode Obsidian",
    bg: "bg-slate-950", card: "bg-slate-900 border-slate-800 shadow-md",
    textPrimary: "text-white", textSecondary: "text-slate-400",
    accentText: "text-emerald-400", accentBg: "bg-emerald-900/30",
    headerBg: "from-slate-950 via-emerald-950/20 to-slate-900",
    badge: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50",
    skillBadge: "bg-slate-800 text-emerald-100 border-slate-700",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    socialBtn: "bg-slate-800 hover:bg-slate-700 text-white",
  },
  executive: {
    id: "executive", label: "Executive Professional",
    bg: "bg-slate-100", card: "bg-white border-slate-300 shadow-xl",
    textPrimary: "text-slate-900", textSecondary: "text-slate-600",
    accentText: "text-blue-700", accentBg: "bg-blue-50",
    headerBg: "from-slate-800 via-slate-700 to-slate-900",
    badge: "bg-slate-100 text-blue-900 border-slate-200",
    skillBadge: "bg-slate-100 text-blue-900 border-slate-200",
    primaryBtn: "bg-blue-700 hover:bg-blue-800 text-white",
    socialBtn: "bg-slate-800 hover:bg-slate-700 text-white",
  }
};

type PortfolioSection = 'about' | 'projects' | 'skills' | 'links' | 'settings';

export default function Portfolio({ isPublic = false }: { isPublic?: boolean }) {
  const navigate = useNavigate();
  const { username } = useParams();
  const user: any = (getUser() ?? {});
  const displayName = isPublic ? (username || "Guest User") : (user?.username || "Guest User");

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [activeSection, setActiveSection] = useState<PortfolioSection>('about');
  
  const defaultData = {
    linkedin: "",
    website: "",
    isPrivate: false,
    about: "",
    experiences: [] as any[],
    skills: [] as string[],
    theme: "minimalist"
  };

  const [savedData, setSavedData] = useState(defaultData);
  const [editForm, setEditForm] = useState(defaultData);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  const isDirty = JSON.stringify(editForm) !== JSON.stringify(savedData);
  const t = THEMES[editForm.theme] || THEMES.minimalist;

  useEffect(() => {
    // Load from sessionStorage (since it's a browser-only save for now)
    const stored = sessionStorage.getItem('user_portfolio_details');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedData(parsed);
      setEditForm(parsed);
    }
    
    // Load skills from active role if empty
    const lastStateRaw = sessionStorage.getItem('lastRoleAnalysis');
    const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
    
    if (!stored || !JSON.parse(stored).skills?.length) {
       let activeSkills = ["JavaScript", "React", "Node.js", "TypeScript", "TailwindCSS"];
       if (lastRoleState?.analysis?.technicalSkills?.length > 0) {
           activeSkills = lastRoleState.analysis.technicalSkills.filter((s:any)=>typeof s==='string');
       } else if (lastRoleState?.analysis?.existingSkills?.length > 0) {
           activeSkills = lastRoleState.analysis.existingSkills.map((s: any) => s.name);
       }
       setEditForm(prev => ({...prev, skills: activeSkills.slice(0, 8)}));
       setSavedData(prev => ({...prev, skills: activeSkills.slice(0, 8)}));
    }

    if (!isPublic) {
        fetchPortfolioDrafts();
    }
  }, [isPublic]);

  const fetchPortfolioDrafts = async () => {
    try {
        const { apiFetch } = await import('../utils/apiFetch');
        const res = await apiFetch('/api/role/portfolio-drafts');
        const data = await res.json();
        if (data.success && data.drafts) {
            const mappedExps = data.drafts.map((d: any) => {
                const p = typeof d.portfolio_draft === 'string' ? JSON.parse(d.portfolio_draft) : d.portfolio_draft;
                return {
                    id: d.project_id,
                    title: p.title || d.title,
                    role: p.role || d.role || "Developer",
                    date: p.date || "Recently",
                    description: `${p.problem || ''} ${p.built || ''} ${p.technologies ? 'Technologies: ' + p.technologies : ''}`.trim() || d.description,
                    isProject: true,
                    liveUrl: p.liveUrl || undefined,
                    repoUrl: p.repoUrl || undefined
                };
            });
            
            // Only merge if we don't already have experiences saved
            setSavedData(prev => {
                if (prev.experiences?.length > 0) return prev;
                return { ...prev, experiences: mappedExps };
            });
            setEditForm(prev => {
                if (prev.experiences?.length > 0) return prev;
                return { ...prev, experiences: mappedExps };
            });
        }
    } catch (e) {
        console.error("Failed to fetch portfolio drafts", e);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSavedData(editForm);
      sessionStorage.setItem('user_portfolio_details', JSON.stringify(editForm));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500); // Simulate brief network delay
  };

  const handleDiscard = () => {
    if (confirm("Discard all unsaved changes in this session?")) {
      setEditForm(savedData);
    }
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExps = [...editForm.experiences];
    newExps[index] = { ...newExps[index], [field]: value };
    setEditForm({ ...editForm, experiences: newExps });
  };

  const addExperience = () => {
    setEditForm({ ...editForm, experiences: [...editForm.experiences, { title: "", role: "", date: "", description: "" }] });
  };

  const removeExperience = (index: number) => {
    setEditForm({ ...editForm, experiences: editForm.experiences.filter((_, i) => i !== index) });
  };

  // --- RENDERING PUBLIC PORTFOLIO PREVIEW ---
  const renderPreview = () => {
    const dataToRender = isPublic ? savedData : editForm;
    const isActuallyEmpty = !dataToRender.about && dataToRender.experiences.length === 0 && dataToRender.skills.length === 0 && !dataToRender.linkedin && !dataToRender.website;

    if (isPublic && savedData.isPrivate) {
      return (
          <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center p-6 text-center`}>
              <Shield className="w-12 h-12 text-slate-400 mb-4" />
              <h1 className={`text-2xl font-bold ${t.textPrimary} mb-2`}>Portfolio is Private</h1>
              <p className={`${t.textSecondary}`}>This portfolio is currently hidden from public view.</p>
          </div>
      );
    }

    if (isActuallyEmpty) {
       return (
          <div className={`min-h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50`}>
              <LayoutTemplate className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Introduce yourself and choose the work you want to showcase.</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">Switch to the editor to add your introduction, skills, and projects to start building your portfolio.</p>
          </div>
       );
    }

    return (
      <div className={`w-full ${t.card} rounded-2xl overflow-hidden shadow-sm border`}>
        {/* Banner */}
        <div className={`h-32 sm:h-48 bg-gradient-to-r ${t.headerBg}`}></div>
        
        <div className="px-6 pb-10">
            {/* Header / Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-16 mb-8 gap-4">
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl ${t.card} p-1 shadow-md z-10`}>
                    <div className={`w-full h-full bg-gradient-to-br ${t.headerBg} rounded-lg flex items-center justify-center text-white text-3xl font-bold`}>
                        {displayName ? displayName.substring(0,2).toUpperCase() : "G"}
                    </div>
                </div>
                <div className="z-10 mb-2">
                    <h1 className={`text-2xl sm:text-3xl font-extrabold ${t.textPrimary}`}>{displayName}</h1>
                </div>
                
                <div className="sm:ml-auto flex items-center gap-3 z-10 mt-4 sm:mt-0">
                    {dataToRender.linkedin && (
                      <a href={dataToRender.linkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg font-bold text-[12px]`}>
                          <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {dataToRender.website && (
                      <a href={dataToRender.website} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 ${t.primaryBtn} rounded-lg font-bold text-[12px]`}>
                          <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {dataToRender.about && (
                      <section>
                          <h2 className={`text-lg font-bold ${t.textPrimary} mb-3`}>About Me</h2>
                          <p className={`text-[14px] ${t.textSecondary} leading-relaxed whitespace-pre-wrap`}>{dataToRender.about}</p>
                      </section>
                    )}

                    {dataToRender.experiences.length > 0 && (
                      <section>
                          <h2 className={`text-lg font-bold ${t.textPrimary} mb-4`}>Experience & Projects</h2>
                          <div className="space-y-6">
                              {dataToRender.experiences.map((exp: any, i: number) => (
                                  <div key={i} className={`p-4 rounded-xl border ${t.card}`}>
                                      <h3 className={`text-[15px] font-bold ${t.textPrimary}`}>{exp.title}</h3>
                                      <p className={`text-[13px] font-semibold ${t.accentText} mb-2`}>{exp.role} <span className={`${t.textSecondary} font-medium`}>| {exp.date}</span></p>
                                      <p className={`text-[13px] ${t.textSecondary} leading-relaxed`}>{exp.description}</p>
                                  </div>
                              ))}
                          </div>
                      </section>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {dataToRender.skills.length > 0 && (
                      <section>
                          <h2 className={`text-lg font-bold ${t.textPrimary} mb-3`}>Skills</h2>
                          <div className="flex flex-wrap gap-2">
                              {dataToRender.skills.map((skill, i) => (
                                  <span key={i} className={`px-2.5 py-1.5 ${t.skillBadge} rounded-lg text-[12px] font-bold border`}>
                                      {skill}
                                  </span>
                              ))}
                          </div>
                      </section>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  };

  // --- RENDERING EDITOR ---
  if (isPublic) {
    return (
       <div className={`min-h-screen ${t.bg} pt-12 pb-20 px-4`}>
          <div className="max-w-4xl mx-auto">
             {renderPreview()}
          </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Editor Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <h1 className="text-[15px] font-bold text-slate-800">My Portfolio</h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">Edit how you introduce yourself and showcase your work.</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setMode('edit')}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-md flex items-center gap-1.5 transition-colors ${mode === 'edit' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => setMode('preview')}
                  className={`px-3 py-1.5 text-[12px] font-bold rounded-md flex items-center gap-1.5 transition-colors ${mode === 'preview' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Eye className="w-3.5 h-3.5" /> Preview
                </button>
            </div>
            
            {/* Save Controls */}
            {isDirty && (
                <button onClick={handleDiscard} className="text-[12px] font-bold text-slate-500 hover:text-slate-700 hidden sm:block">
                    Discard
                </button>
            )}
            <button 
                onClick={handleSave}
                disabled={!isDirty || saveStatus === 'saving'}
                className={`px-4 py-2 rounded-lg font-bold text-[12px] flex items-center gap-1.5 transition-colors ${isDirty ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}
            >
                <Save className="w-3.5 h-3.5" />
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved in browser' : isDirty ? 'Save in browser' : 'Saved'}
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col md:flex-row mt-6 px-4 gap-6 pb-20">
         
         {mode === 'edit' && (
             <aside className="w-full md:w-56 shrink-0 md:sticky md:top-24 h-fit">
                <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {[
                      { id: 'about', label: 'About', icon: UserIcon },
                      { id: 'projects', label: 'Projects & Experience', icon: Briefcase },
                      { id: 'skills', label: 'Skills', icon: Code },
                      { id: 'links', label: 'Links', icon: LinkIcon },
                      { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(nav => (
                       <button
                          key={nav.id}
                          onClick={() => setActiveSection(nav.id as PortfolioSection)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors whitespace-nowrap md:whitespace-normal ${activeSection === nav.id ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
                       >
                           <nav.icon className="w-4 h-4" /> {nav.label}
                       </button>
                    ))}
                </nav>
             </aside>
         )}

         <main className="flex-1 w-full">
            {mode === 'preview' ? (
                <div>
                   <div className="bg-blue-50 text-blue-700 text-[12px] font-bold px-4 py-2 rounded-lg mb-4 flex items-center gap-2 border border-blue-100">
                      <Eye className="w-4 h-4" /> Preview — includes unsaved changes. 
                      <button onClick={() => setMode('edit')} className="ml-auto underline">Back to Editor</button>
                   </div>
                   {renderPreview()}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 min-h-[500px]">
                    
                    {activeSection === 'about' && (
                        <div className="animate-in fade-in">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Introduction</h2>
                            <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Bio / About Me</label>
                            <p className="text-[12px] text-slate-500 mb-3">Introduce yourself, your background, and your goals. This appears at the top of your portfolio.</p>
                            <textarea 
                                value={editForm.about}
                                onChange={e => setEditForm({...editForm, about: e.target.value})}
                                rows={8}
                                className="w-full p-3 border border-slate-300 rounded-lg text-[14px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                placeholder="E.g., I'm a software engineer passionate about..."
                            />
                        </div>
                    )}

                    {activeSection === 'projects' && (
                        <div className="animate-in fade-in">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Projects & Experience</h2>
                            <p className="text-[12px] text-slate-500 mb-4">Showcase your work history and major projects.</p>
                            
                            <div className="space-y-4">
                                {editForm.experiences.map((exp, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group">
                                        <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition-colors">
                                           <X className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-6">
                                            <div>
                                                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Title</label>
                                                <input value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-[13px] focus:ring-2 focus:ring-teal-500" placeholder="e.g. Frontend Engineer / E-commerce App" />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Company / Context</label>
                                                <input value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-[13px] focus:ring-2 focus:ring-teal-500" placeholder="e.g. Tech Corp / Personal Project" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Date</label>
                                                <input value={exp.date} onChange={e => updateExperience(i, 'date', e.target.value)} className="w-full sm:w-1/2 p-2 border border-slate-300 rounded-md text-[13px] focus:ring-2 focus:ring-teal-500" placeholder="e.g. 2021 - Present" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-slate-600 mb-1">Description</label>
                                            <textarea value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} rows={3} className="w-full p-2 border border-slate-300 rounded-md text-[13px] focus:ring-2 focus:ring-teal-500" placeholder="Describe your achievements and technologies used..." />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button onClick={addExperience} className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Add Experience / Project
                            </button>
                        </div>
                    )}

                    {activeSection === 'skills' && (
                        <div className="animate-in fade-in">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Skills</h2>
                            <p className="text-[12px] text-slate-500 mb-4">List your top technical and professional skills as a comma-separated list.</p>
                            <textarea 
                                value={editForm.skills.join(", ")}
                                onChange={e => setEditForm({...editForm, skills: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}
                                rows={4}
                                className="w-full p-3 border border-slate-300 rounded-lg text-[14px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                placeholder="E.g., React, TypeScript, Node.js..."
                            />
                        </div>
                    )}

                    {activeSection === 'links' && (
                        <div className="animate-in fade-in">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">External Links</h2>
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><Linkedin className="w-4 h-4 text-slate-400"/> LinkedIn URL</label>
                                    <input 
                                        value={editForm.linkedin}
                                        onChange={e => setEditForm({...editForm, linkedin: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-[14px] focus:ring-2 focus:ring-teal-500"
                                        placeholder="https://linkedin.com/in/yourname"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><Globe className="w-4 h-4 text-slate-400"/> Personal Website / Blog</label>
                                    <input 
                                        value={editForm.website}
                                        onChange={e => setEditForm({...editForm, website: e.target.value})}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg text-[14px] focus:ring-2 focus:ring-teal-500"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="animate-in fade-in">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Portfolio Settings</h2>
                            
                            <div className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-2">Visibility</label>
                                    <div className="flex gap-2">
                                        <button 
                                          onClick={() => setEditForm({...editForm, isPrivate: false})}
                                          className={`flex-1 py-2 border rounded-lg text-[13px] font-bold transition-colors ${!editForm.isPrivate ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            Public
                                        </button>
                                        <button 
                                          onClick={() => setEditForm({...editForm, isPrivate: true})}
                                          className={`flex-1 py-2 border rounded-lg text-[13px] font-bold transition-colors ${editForm.isPrivate ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            Private
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-2">When private, only you can view your portfolio link.</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-[13px] font-semibold text-slate-600 mb-2">Theme</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {Object.values(THEMES).map(themeDef => (
                                            <button 
                                                key={themeDef.id} 
                                                onClick={() => setEditForm({...editForm, theme: themeDef.id})}
                                                className={`text-left px-3 py-2 text-[13px] font-bold rounded-lg border transition-colors ${editForm.theme === themeDef.id ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {themeDef.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
         </main>
      </div>
      
      {/* Mobile Bottom Nav Bar (if in edit mode) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex items-center justify-around z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button onClick={() => setMode('edit')} className={`flex flex-col items-center p-2 rounded-lg ${mode === 'edit' ? 'text-teal-600' : 'text-slate-500'}`}>
              <Edit2 className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Edit</span>
          </button>
          <button onClick={() => setMode('preview')} className={`flex flex-col items-center p-2 rounded-lg ${mode === 'preview' ? 'text-teal-600' : 'text-slate-500'}`}>
              <Eye className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Preview</span>
          </button>
      </div>
    </div>
  );
}
