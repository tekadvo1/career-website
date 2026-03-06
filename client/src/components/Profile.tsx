import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
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
  Bot
} from "lucide-react";

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
    achievementsUnlocked: 0
  });

  // Calculate standard stats based on memory
  const loadRealtimeStats = () => {
    const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
    const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
    const activeRole = lastRoleState?.role || "Software Engineer";

    const projectsDataRaw = localStorage.getItem(`dashboard_projects_v2_${activeRole}`);
    const projectsData = projectsDataRaw ? JSON.parse(projectsDataRaw) : [];
    
    const totalProjects = projectsData.length > 0 ? projectsData.length : 1;
    const projectsCompleted = projectsData.filter((p: any) => p.status === 'done').length;

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
        loadRealtimeStats();
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
      ...(stats.skillsMastered > 0 ? [{ action: "Mastered", item: `${stats.skillsMastered} technical topic(s)`, date: "Recently", icon: Target }] : []),
      ...(liveStreak > 0 ? [{ action: "Achieved", item: `${liveStreak}-Day Streak`, date: "Today", icon: Sparkles }] : []),
      { action: "Started", item: `Career Path context as ${activeRole}`, date: "Recently", icon: Code }
    ].slice(0, 4),
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

  const handleAISync = () => {
    setIsSyncingAI(true);
    setTimeout(() => {
        const newBio = `Driven ${activeRole} focused on continuous growth. Has mastered ${stats.skillsMastered} topics and successfully delivered ${stats.projectsCompleted} projects on FindStreak. Actively improving proficiency in ${activeSkills.slice(0, 2).join(" and ")}.`;
        
        const newDetails = { ...profileDetails, bio: newBio, location: profileDetails.location || "San Francisco, CA" };
        setProfileDetails(newDetails);
        setEditForm(newDetails);
        localStorage.setItem('user_profile_details', JSON.stringify(newDetails));
        setIsSyncingAI(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-teal-100 selection:text-teal-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isPublic && (
                <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-bold text-sm shadow-sm">
                   FS
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                      {isPublic ? `${displayName}'s FindStreak Profile` : 'FindStreak Profile'}
                  </h1>
                  <p className="text-[11px] text-slate-500">{isPublic ? "Public Portfolio view" : "Manage your account and real-time progress"}</p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
              {/* Profile Background Accents */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
              
              {!isPublic && (
                 <button 
                    onClick={handleAISync} 
                    disabled={isSyncingAI}
                    className="absolute top-3 right-3 flex items-center justify-center bg-teal-50 text-teal-600 hover:bg-teal-100 p-1.5 rounded-lg transition-all shadow-sm group"
                    title="AI Auto Sync Profile"
                 >
                    <Bot className={`w-3.5 h-3.5 ${isSyncingAI ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
                 </button>
              )}

              {/* Profile Picture */}
              <div className="relative w-24 h-24 mx-auto mb-4 mt-2">
                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                  {userData.name ? userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}
                </div>
                {!isPublic && (
                    <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-slate-100 hover:border-teal-200 hover:text-teal-600 rounded-lg flex items-center justify-center text-slate-500 shadow-md transition-all z-10">
                      <Camera className="w-3 h-3" />
                    </button>
                )}
              </div>

              {/* Basic Info */}
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-slate-800 mb-1">{userData.name}</h2>
                <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-md text-[11px] font-bold tracking-wide mb-2.5">
                  {userData.role}
                </span>
                
                {isEditing && !isPublic ? (
                  <textarea 
                     value={editForm.bio}
                     onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                     className="w-full mt-2 p-2 text-[12px] border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                     rows={3}
                     placeholder="Write your bio..."
                  />
                ) : (
                  <p className="text-[12px] text-slate-600 leading-relaxed font-medium px-1">{userData.bio}</p>
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
                    className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[12px] transition-all shadow-sm shadow-teal-600/20 active:translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 rounded-lg font-bold text-[12px] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-teal-500" />
                    Edit Profile Details
                  </button>
                )
              )}
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

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Live Real-Time Activity
              </h3>
              <div className="space-y-2.5">
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
