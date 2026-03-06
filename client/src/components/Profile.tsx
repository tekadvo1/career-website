import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Calendar,
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
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
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
    bio: profileDetails.bio || `Tracking career progress and mastering skills for ${activeRole}.`,
    skills: activeSkills.slice(0, 5).map((s: string, idx: number) => ({ name: s, level: Math.max(50, 95 - (idx * 5)) })),
    stats: { ...stats, learningStreak: liveStreak },
    recentActivity: [
      ...(stats.projectsCompleted > 0 ? [{ action: "Completed", item: `${stats.projectsCompleted} Project(s)`, date: "Recently", icon: Trophy }] : []),
      ...(stats.skillsMastered > 0 ? [{ action: "Mastered", item: `${stats.skillsMastered} technical topic(s)`, date: "Recently", icon: Target }] : []),
      ...(liveStreak > 0 ? [{ action: "Achieved", item: `${liveStreak}-Day Streak`, date: "Today", icon: Sparkles }] : []),
      { action: "Started", item: `Career Path context as ${activeRole}`, date: "Recently", icon: Code }
    ].slice(0, 4),
  };

  const completionRate = (userData.stats.projectsCompleted / userData.stats.totalProjects) * 100;

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
        const newBio = `Driven ${activeRole} focused on continuous growth. Has mastered ${stats.skillsMastered} technical topics and successfully delivered ${stats.projectsCompleted} major projects. Actively improving proficiency in ${activeSkills.slice(0, 2).join(" and ")}.`;
        
        const newDetails = { ...profileDetails, bio: newBio, location: profileDetails.location || "San Francisco, CA" };
        setProfileDetails(newDetails);
        setEditForm(newDetails);
        localStorage.setItem('user_profile_details', JSON.stringify(newDetails));
        setIsSyncingAI(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isPublic && (
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-800">{isPublic ? `${displayName}'s Profile` : 'My Profile'}</h1>
                <p className="text-xs text-slate-500">{isPublic ? "Public Portfolio view" : "Manage your account and real-time progress"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isPublic && (
                <button 
                  onClick={shareProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-semibold text-sm mr-2"
                >
                  {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copiedLink ? 'Link Copied!' : 'Share Public Link'}
                </button>
              )}
              {!isPublic && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
              {/* Profile Background Accents */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              {!isPublic && (
                 <button 
                    onClick={handleAISync} 
                    disabled={isSyncingAI}
                    className="absolute top-4 right-4 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 rounded-xl transition-all shadow-sm group"
                    title="AI Auto Sync Profile"
                 >
                    <Bot className={`w-4 h-4 ${isSyncingAI ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
                 </button>
              )}

              {/* Profile Picture */}
              <div className="relative w-28 h-28 mx-auto mb-5 mt-2">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                  {userData.name ? userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}
                </div>
                {!isPublic && (
                    <button className="absolute -bottom-2 -right-2 w-9 h-9 bg-white border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 rounded-xl flex items-center justify-center text-slate-500 shadow-lg transition-all z-10">
                      <Camera className="w-4 h-4" />
                    </button>
                )}
              </div>

              {/* Basic Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-1.5">{userData.name}</h2>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-xs font-bold tracking-wide mb-3">
                  {userData.role}
                </span>
                
                {isEditing && !isPublic ? (
                  <textarea 
                     value={editForm.bio}
                     onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                     className="w-full mt-2 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                     rows={3}
                     placeholder="Write your bio..."
                  />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed font-medium px-2">{userData.bio}</p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 text-[13px] text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-slate-700">
                  <Phone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {isEditing && !isPublic ? (
                      <input 
                         value={editForm.phone}
                         onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                         className="flex-1 p-1 text-[13px] border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                         placeholder="Add phone..."
                      />
                  ) : <span className="font-semibold">{userData.phone}</span>}
                </div>
                <div className="flex items-center gap-3 text-[13px] text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {isEditing && !isPublic ? (
                      <input 
                         value={editForm.location}
                         onChange={(e) => setEditForm(prev => ({...prev, location: e.target.value}))}
                         className="flex-1 p-1 text-[13px] border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                         placeholder="Location..."
                      />
                  ) : <span className="font-semibold">{userData.location}</span>}
                </div>
                <div className="flex items-center gap-3 text-[13px] text-slate-700">
                  <Briefcase className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold">{userData.role}</span>
                </div>
              </div>

              {!isPublic && (
                isEditing ? (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 active:translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-indigo-500" />
                    Edit Profile Details
                  </button>
                )
              )}
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-md font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                Specialized Skills
              </h3>
              <div className="space-y-4">
                {userData.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-slate-700">{skill.name}</span>
                      <span className="text-[11px] font-black tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Realtime Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="text-yellow-600 mb-3 bg-yellow-50 w-10 h-10 rounded-xl flex items-center justify-center">
                   <Trophy className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-slate-800 mb-1">{userData.stats.projectsCompleted}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Projects</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="text-orange-500 mb-3 bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center relative">
                   <Sparkles className="w-5 h-5 absolute" />
                   {userData.stats.learningStreak > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-slate-800 mb-1">{userData.stats.learningStreak}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Day Streak</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="text-emerald-500 mb-3 bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center">
                   <Target className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-slate-800 mb-1">{userData.stats.skillsMastered}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Skills Done</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="text-blue-500 mb-3 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center">
                   <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-slate-800 mb-1">{userData.stats.totalLearningHours}h</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Learn Time</span>
                </div>
              </div>
            </div>

            {/* Achievement Badge Banner */}
            <div className="grid md:grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 border border-indigo-500 rounded-3xl shadow-lg p-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <GraduationCap className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Career Growth Target: {userData.role}</h3>
                    <p className="text-indigo-100 text-sm font-medium">You have unlocked <span className="font-black text-white px-1">{userData.stats.achievementsUnlocked}</span> major milestones so far.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-md font-bold text-slate-800 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Live Real-Time Activity
              </h3>
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-indigo-100/70 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600">
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-slate-800 leading-snug">
                        <span className="font-extrabold">{activity.action}</span> <span className="font-medium text-slate-600">{activity.item}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold tracking-wide mt-1 uppercase">{activity.date}</p>
                    </div>
                  </div>
                ))}
                
                {userData.recentActivity.length === 0 && (
                  <div className="text-center p-6 text-slate-500 text-sm">No recent activity found. Start a project!</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isPublic && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate("/roadmap")}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-md shadow-slate-900/20 active:translate-y-0.5"
                >
                  <Target className="w-4 h-4" />
                  View Learning Roadmap
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-5 py-2.5 border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 active:translate-y-0.5"
                >
                  <Code className="w-4 h-4 text-indigo-600" />
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
