import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mail,
  MapPin,
  Briefcase,
  Code,
  Edit,
  Camera,
  Sparkles,
  TrendingUp,
  Clock,
  Trophy,
  Target,
  GraduationCap,
  LogOut,
  Phone,
  Share2,
  CheckCircle2,
  Bot,
  Users,
  CheckCircle,
  Activity
} from "lucide-react";
import Sidebar from "./Sidebar";

export default function Profile({ isPublic = false }: { isPublic?: boolean }) {
  const navigate = useNavigate();
  const { username } = useParams();

  const [liveStreak, setLiveStreak] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncingAI, setIsSyncingAI] = useState(false);

  const [profileDetails, setProfileDetails] = useState({
    phone: "",
    bio: "",
    location: "Global"
  });

  const [editForm, setEditForm] = useState({
    phone: "",
    bio: "",
    location: "Global"
  });

  const [stats, setStats] = useState({
    projectsCompleted: 0,
    totalProjects: 1,
    skillsMastered: 0,
    totalLearningHours: 0,
    achievementsUnlocked: 0,
    currentProjectName: "No Active Project"
  });

  // Calculate standard stats based on memory
  const loadRealtimeStats = () => {
    const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
    const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
    const activeRole = lastRoleState?.role || "Software Engineer";

    const projectsDataRaw = localStorage.getItem(`dashboard_projects_v2_${activeRole}`);
    const projectsData = projectsDataRaw ? JSON.parse(projectsDataRaw) : [];
    
    const totalProjects = projectsData.length > 0 ? projectsData.length : 1;
    const completedArr = projectsData.filter((p: any) => p.status === 'done');
    const projectsCompleted = completedArr.length;
    
    const inProgressProject = projectsData.find((p: any) => p.status !== 'done');
    const currentProjectName = inProgressProject ? inProgressProject.title : "No Active Project";

    const roadmapProgressRaw = localStorage.getItem(`roadmap_progress_${activeRole}`);
    const roadmapProgress = roadmapProgressRaw ? JSON.parse(roadmapProgressRaw) : [];
    const skillsMastered = roadmapProgress.length;

    setStats(prev => ({
      ...prev,
      projectsCompleted,
      totalProjects,
      skillsMastered,
      totalLearningHours: skillsMastered * 2 + liveStreak * 1.5,
      achievementsUnlocked: Math.floor(skillsMastered / 3) + (projectsCompleted > 0 ? 1 : 0),
      currentProjectName
    }));
  };

  useEffect(() => {
    // Load persisted profile options
    const savedDetails = localStorage.getItem('user_profile_details');
    if (savedDetails) {
      const parsed = JSON.parse(savedDetails);
      setProfileDetails(parsed);
      setEditForm(parsed);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) return;

    // Real-time EventSource connection
    const es = new EventSource(`/api/realtime/stream?userId=${user.id}`);
    
    const handleSnapshot = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.totalStreak !== undefined) {
          setLiveStreak(data.totalStreak);
        }
        
        const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
        const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
        const activeRole = lastRoleState?.role || "Software Engineer";

        if (data.projects && Array.isArray(data.projects)) {
             const realProjects = data.projects.map((p: any) => {
                 let pd = p.project_data;
                 if (typeof pd === 'string') { try { pd = JSON.parse(pd); } catch { pd = {}; } }
                 return { ...pd, status: p.status, role: p.role, title: p.title };
             });
             
             const roleProjects = realProjects.filter((p: any) => !p.role || p.role === activeRole);
             const completedArr = roleProjects.filter((p: any) => p.status === 'completed' || p.status === 'done');
             const inProgressProject = roleProjects.find((p: any) => p.status === 'active');
             
             const projectsCompleted = completedArr.length;
             const totalProjects = roleProjects.length > 0 ? roleProjects.length : 1;
             const currentProjectName = inProgressProject ? inProgressProject.title : "No Active Project";
             
             const roadmapProgressRaw = localStorage.getItem(`roadmap_progress_${activeRole}`);
             const roadmapProgress = roadmapProgressRaw ? JSON.parse(roadmapProgressRaw) : [];
             const skillsMastered = roadmapProgress.length;
             
             setStats(prev => ({
                 ...prev,
                 projectsCompleted,
                 totalProjects,
                 skillsMastered,
                 totalLearningHours: skillsMastered * 2 + (data.totalStreak || liveStreak) * 1.5,
                 achievementsUnlocked: Math.floor(skillsMastered / 3) + (projectsCompleted > 0 ? 1 : 0),
                 currentProjectName
             }));
        } else {
             loadRealtimeStats();
        }
      } catch(err) {}
    };

    es.addEventListener('snapshot', handleSnapshot);
    es.addEventListener('refresh', handleSnapshot);

    // Also support multi-tab sync locally
    const handleStorageChange = () => loadRealtimeStats();
    window.addEventListener('storage', handleStorageChange);
    
    loadRealtimeStats();
    
    // Fallback interval for local realtime
    const interval = setInterval(loadRealtimeStats, 2000);

    return () => {
      es.close();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [liveStreak]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
  const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
  const activeRole = lastRoleState?.role || "Software Engineer";

  let activeSkills = ["JavaScript", "React", "Node.js"];
  if (lastRoleState?.analysis?.technicalSkills?.length > 0) {
      activeSkills = lastRoleState.analysis.technicalSkills;
  } else if (lastRoleState?.analysis?.existingSkills?.length > 0) {
      activeSkills = lastRoleState.analysis.existingSkills.map((s: any) => s.name);
  }

  // Display user name override if public
  const displayName = isPublic ? username : (user?.username || "Guest User");
  
  const userData = {
    name: displayName,
    email: user?.email || "No email provided",
    role: activeRole,
    location: profileDetails.location || "Global",
    phone: profileDetails.phone || "Not set",
    joinDate: "Recently",
    bio: profileDetails.bio || `Tracking career progress and mastering skills for ${activeRole} via FindStreak.`,
    skills: activeSkills.slice(0, 5).map((s: string, idx: number) => ({ name: s, level: Math.max(50, 95 - (idx * 5)) })),
    stats: { ...stats, learningStreak: liveStreak },
    recentActivity: [
      ...(stats.projectsCompleted > 0 ? [{ action: "Completed", item: `${stats.projectsCompleted} Project(s)`, date: "Recently", icon: Trophy }] : []),
      ...(stats.currentProjectName !== "No Active Project" ? [{ action: "Working on", item: stats.currentProjectName, date: "Currently", icon: Activity }] : []),
      ...(stats.skillsMastered > 0 ? [{ action: "Mastered", item: `${stats.skillsMastered} technical topic(s)`, date: "Recently", icon: Target }] : []),
      ...(liveStreak > 0 ? [{ action: "Achieved", item: `${liveStreak}-Day Streak in Daily Tasks`, date: "Today", icon: Sparkles }] : []),
      { action: "Started", item: `Career Path context as ${activeRole}`, date: "Recently", icon: Code }
    ].slice(0, 5),
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const shareProfile = () => {
    const link = `${window.location.origin}/p/${user?.username || 'user'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = () => {
    setProfileDetails(editForm);
    localStorage.setItem('user_profile_details', JSON.stringify(editForm));
    setIsEditing(false);
  };

  const handleAISync = async () => {
    setIsSyncingAI(true);
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: `Please refine this professional bio for a ${activeRole}. Make it sound professional, engaging, and highlight skills and FindStreak achievements. Current manual details: "${editForm.bio}" or fallback info: ${stats.skillsMastered} topics mastered, ${stats.projectsCompleted} projects completed. Limit to 3 short sentences.` }],
                role: activeRole,
            }),
        });

        const data = await response.json();
        const refinedBio = data.success ? data.response.replace(/["*]/g, '').trim() : `Driven ${activeRole} focused on continuous growth. Has mastered ${stats.skillsMastered} topics and successfully delivered ${stats.projectsCompleted} projects on FindStreak. Actively improving proficiency in ${activeSkills.slice(0, 2).join(" and ")}.`;

        const newDetails = { ...profileDetails, ...editForm, bio: refinedBio };
        setProfileDetails(newDetails);
        setEditForm(newDetails);
        localStorage.setItem('user_profile_details', JSON.stringify(newDetails));
    } catch (e) {
        console.error(e);
        // Fallback
        const newBio = `Driven ${activeRole} focused on continuous growth. Has mastered ${stats.skillsMastered} topics and successfully delivered ${stats.projectsCompleted} projects on FindStreak. Actively improving proficiency in ${activeSkills.slice(0, 2).join(" and ")}.`;
        const newDetails = { ...profileDetails, ...editForm, bio: newBio };
        setProfileDetails(newDetails);
        setEditForm(newDetails);
        localStorage.setItem('user_profile_details', JSON.stringify(newDetails));
    } finally {
        setIsSyncingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-teal-100 selection:text-teal-900 font-sans">
      {!isPublic && <Sidebar activePage="profile" />}
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isPublic && <div className="w-12 md:w-14" />} {/* Spacer for Sidebar Hamburger */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold text-sm shadow-sm">
                   FS
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                      {isPublic ? `${displayName}'s FindStreak Profile` : 'FindStreak Brand Profile'}
                  </h1>
                  <p className="text-[11px] text-slate-500">{isPublic ? "Public Portfolio view" : "Manage your professional identity & daily tasks"}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isPublic && (
                <button 
                  onClick={shareProfile}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors font-semibold text-xs mr-1"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied!' : 'Share'}
                </button>
              )}
              {!isPublic && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-5">
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              {/* Profile Background Banner (LinkedIn Style) */}
              <div className="h-24 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 relative">
                  <div className="absolute inset-0 bg-white/10 pattern-dots opacity-20"></div>
              </div>
              
              <div className="px-5 pb-5 relative">
              
              {/* Profile Picture */}
              <div className="relative w-[104px] h-[104px] -mt-10 mb-3 mx-auto md:mx-0">
                <div className="w-full h-full bg-slate-900 border-4 border-white rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md cursor-pointer relative overflow-hidden">
                  {userData.name ? userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}
                </div>
                {!isPublic && (
                    <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-slate-100 hover:border-teal-200 hover:text-teal-600 rounded-lg flex items-center justify-center text-slate-500 shadow-md transition-all z-10">
                      <Camera className="w-3 h-3" />
                    </button>
                )}
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left mb-5">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h2 className="text-[22px] font-bold text-slate-800 leading-tight">{userData.name}</h2>
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-100">
                        <CheckCircle className="w-3 h-3" /> FindStreak Verified
                    </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[12px] font-semibold border border-slate-200">
                      {userData.role}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <Target className="w-3 h-3" /> Open to Work
                    </span>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 text-[12px] font-medium mb-3">
                   <Users className="w-4 h-4 text-slate-400" />
                   <span className="text-teal-600 hover:underline cursor-pointer">500+ Connections</span>
                   <span>·</span>
                   <span className="text-teal-600 hover:underline cursor-pointer">Recruiter Network Activity</span>
                </div>
                
                {isEditing && !isPublic ? (
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Write About Section</span>
                        <button 
                            onClick={handleAISync}
                            disabled={isSyncingAI}
                            className="text-[11px] flex items-center gap-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-2 py-1 rounded-md hover:from-teal-700 hover:to-emerald-700 transition"
                        >
                            {isSyncingAI ? <Bot className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            {isSyncingAI ? "Enhancing..." : "AI Enhance"}
                        </button>
                    </div>
                    <textarea 
                       value={editForm.bio}
                       onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                       className="w-full p-2.5 text-[13px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                       rows={4}
                       placeholder="Enter details manually, let AI suggest best..."
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 text-left">
                     <p className="text-[13px] text-slate-700 leading-relaxed">{userData.bio}</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2.5 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5 text-[12px] text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  <span className="font-semibold">{userData.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  {isEditing && !isPublic ? (
                      <input 
                         value={editForm.phone}
                         onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                         className="flex-1 p-1 px-2 text-[12px] border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                         placeholder="Add phone..."
                      />
                  ) : <span className="font-semibold">{userData.phone}</span>}
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  {isEditing && !isPublic ? (
                      <input 
                         value={editForm.location}
                         onChange={(e) => setEditForm(prev => ({...prev, location: e.target.value}))}
                         className="flex-1 p-1 px-2 text-[12px] border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                         placeholder="Location..."
                      />
                  ) : <span className="font-semibold">{userData.location}</span>}
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  <span className="font-semibold">{userData.role}</span>
                </div>
              </div>

              {!isPublic && (
                isEditing ? (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[13px] transition-all shadow-sm shadow-teal-600/20 active:translate-y-0.5 flex items-center justify-center gap-1.5 mt-2"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 rounded-lg font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-teal-500" />
                    Edit Profile Details
                  </button>
                )
              )}
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-teal-600" />
                FindStreak Skills
              </h3>
              <div className="space-y-3.5">
                {userData.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-bold text-slate-700">{skill.name}</span>
                      <span className="text-[10px] font-black tracking-wide text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-teal-500 h-1 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Realtime Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="text-yellow-600 mb-2 bg-yellow-50 w-8 h-8 rounded-lg flex items-center justify-center">
                   <Trophy className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.projectsCompleted}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Projects</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="text-orange-500 mb-2 bg-orange-50 w-8 h-8 rounded-lg flex items-center justify-center relative">
                   <Sparkles className="w-4 h-4 absolute" />
                   {userData.stats.learningStreak > 0 && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span></span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.learningStreak}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Day Streak</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="text-teal-600 mb-2 bg-teal-50 w-8 h-8 rounded-lg flex items-center justify-center">
                   <Target className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.skillsMastered}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Skills Done</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="text-blue-500 mb-2 bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center">
                   <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.totalLearningHours}h</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Learn Time</span>
                </div>
              </div>
            </div>

            {/* Achievement Badge Banner */}
            <div className="grid md:grid-cols-1 gap-3">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-700 border border-teal-500 rounded-2xl shadow-sm p-5 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                    <GraduationCap className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px] mb-0.5">FindStreak Target: {userData.role}</h3>
                    <p className="text-teal-100 text-[12px] font-medium">You have unlocked <span className="font-black text-white px-1">{userData.stats.achievementsUnlocked}</span> major milestones on this path.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Task Updates & Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Daily Task Updates & Activity
              </h3>
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-600">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-800 leading-snug">
                        <span className="font-extrabold">{activity.action}</span> <span className="font-medium text-slate-600">{activity.item}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5 uppercase">{activity.date}</p>
                    </div>
                  </div>
                ))}
                
                {userData.recentActivity.length === 0 && (
                  <div className="text-center p-5 text-slate-500 text-[12px]">No recent activity found. Start a project!</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isPublic && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => navigate("/roadmap")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[12px] transition-colors flex items-center gap-1.5 shadow-sm shadow-slate-900/20 active:translate-y-0.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  View Learning Roadmap
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-bold text-[12px] transition-colors flex items-center gap-1.5 active:translate-y-0.5"
                >
                  <Code className="w-3.5 h-3.5 text-teal-600" />
                  My Projects Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
