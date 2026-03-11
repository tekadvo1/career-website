import { apiFetch } from '../utils/apiFetch';
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
  Activity
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useAlert } from '../contexts/AlertContext';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Profile({ isPublic = false }: { isPublic?: boolean }) {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { username } = useParams();

  const [liveStreak, setLiveStreak] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(true);

  // Public profile data fetched from backend (used when isPublic=true)
  const [publicProfileData, setPublicProfileData] = useState<any>(null);
  const [publicProfileLoading, setPublicProfileLoading] = useState(isPublic);
  const [publicProfileError, setPublicProfileError] = useState('');

  useEffect(() => {
    if (!isPublic || !username) return;
    setPublicProfileLoading(true);
    fetch(`/api/auth/public-profile/${encodeURIComponent(username)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPublicProfileData(data);
        } else if (data.isPrivate) {
          setPublicProfileError('__PRIVATE__');
        } else {
          setPublicProfileError(data.message || 'Profile not found');
        }
      })
      .catch(() => setPublicProfileError('Could not load profile'))
      .finally(() => setPublicProfileLoading(false));
  }, [isPublic, username]);

  const [dynamicSkills, setDynamicSkills] = useState<{name: string, level: number}[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  const [profileDetails, setProfileDetails] = useState({
    phone: "",
    countryCode: "+1",
    bio: "",
    location: "Global",
    role: ""
  });

  const [editForm, setEditForm] = useState({
    phone: "",
    countryCode: "+1",
    bio: "",
    location: "Global",
    role: ""
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const COUNTRY_CODES = [
    { code: "+1",   flag: "🇺🇸", name: "USA" },
    { code: "+1c",  flag: "🇨🇦", name: "Canada" },
    { code: "+61",  flag: "🇦🇺", name: "Australia" },
    { code: "+91",  flag: "🇮🇳", name: "India" },
    { code: "+44",  flag: "🇬🇧", name: "UK" },
  ];

  // Returns the dialling code (stripping the 'c' we use to distinguish CA from US)
  const getDialCode = (code: string) => code.replace('c', '');

  const handleDetectLocation = (formSetter: React.Dispatch<React.SetStateAction<any>>) => {
    if (!navigator.geolocation) {
      showAlert('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
                try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (!res.ok) throw new Error('Geocoding HTTP error ' + res.status);
          const data = await res.json();
          const city = data.city || data.locality || '';
          const country = data.countryName || '';
          const locationStr = city && country ? `${city}, ${country}` : country || 'Unknown';
          formSetter((prev: any) => ({ ...prev, location: locationStr }));
        } catch (err: any) {
          console.error("Geocoding failed:", err);
          showAlert('Could not reverse-geocode your location. Please type it manually.', 'error');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        showAlert('Location permission denied. Please type your location manually.', 'warning');
        setIsDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const [avatarStr, setAvatarStr] = useState("");
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);

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
    if (isPublic) {
      setShowSetupModal(false);
    }
    // Load persisted profile options
    const savedDetails = localStorage.getItem('user_profile_details');
    if (savedDetails) {
      const parsed = JSON.parse(savedDetails);
      setProfileDetails(parsed);
      setEditForm(parsed);
      if (parsed.avatar) setAvatarStr(parsed.avatar);
      if (parsed.customSkills) setCustomSkills(parsed.customSkills);

      if (parsed.bio && parsed.phone && parsed.location) {
        setShowSetupModal(false);
      }
    }
  }, [isPublic]);

  // Load public visibility state from backend (so it persists across devices)
  useEffect(() => {
    if (isPublic) return; // Only for the owner's private profile page
    const token = localStorage.getItem('token');
    if (!token) return;
    apiFetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.user?.is_public !== undefined) {
          setIsPublicProfile(!!data.user.is_public);
        }
      })
      .catch(() => {});
  }, [isPublic]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!user?.id || !token) return;

    // Real-time EventSource connection
    const es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${token}`);
    
    const handleSnapshot = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.totalStreak !== undefined) {
          setLiveStreak(data.totalStreak);
        }
        
        const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
        const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
        const activeRole = lastRoleState?.role || "Software Engineer";

        let newActivity: any[] = [];
        let completedArr: any[] = [];
        let inProgressProject: any = null;
        let roleProjects: any[] = [];

        if (Array.isArray(data.missions)) {
            const completedMissions = data.missions.filter((m: any) => m.status === 'completed');
            completedMissions.forEach((m:any) => newActivity.push({ action: "Finished Mission", item: m.title || `Mission from ${m.category}`, date: new Date(m.last_updated_at || m.updated_at || m.created_at).toLocaleDateString(), icon: Trophy, ts: new Date(m.last_updated_at || m.updated_at || m.created_at).getTime() }));
            
            const activeMissions = data.missions.filter((m: any) => m.status === 'in_progress');
            activeMissions.forEach((m:any) => newActivity.push({ action: "Started Mission", item: m.title || `Mission from ${m.category}`, date: "Recently", icon: Activity, ts: new Date().getTime() - 10000 }));
        }

        if (Array.isArray(data.roadmapProgress)) {
            const rp = data.roadmapProgress;
            rp.forEach((p:any) => newActivity.push({ action: "Mastered", item: `Topic: ${p.topic_id}`, date: new Date(p.completed_at || Date.now()).toLocaleDateString(), icon: Target, ts: new Date(p.completed_at || Date.now()).getTime() }));
        }

        if (data.projects && Array.isArray(data.projects)) {
             const realProjects = data.projects.map((p: any) => {
                 let pd = p.project_data;
                 if (typeof pd === 'string') { try { pd = JSON.parse(pd); } catch { pd = {}; } }
                 return { ...pd, status: p.status, role: p.role, title: p.title };
             });
             
             roleProjects = realProjects.filter((p: any) => !p.role || p.role === activeRole);
             completedArr = roleProjects.filter((p: any) => p.status === 'completed' || p.status === 'done');
             inProgressProject = roleProjects.find((p: any) => p.status === 'active');
             
             const projectsCompleted = completedArr.length;
             const totalProjects = roleProjects.length > 0 ? roleProjects.length : 1;
             const currentProjectName = inProgressProject ? inProgressProject.title : "No Active Project";
             
             const roadmapProgressRaw = localStorage.getItem(`roadmap_progress_${activeRole}`);
             const roadmapProgress = data.roadmapProgress || (roadmapProgressRaw ? JSON.parse(roadmapProgressRaw) : []);
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

             // Activities from Projects
             completedArr.forEach((p:any) => {
               newActivity.push({ action: 'Completed Project', item: p.title, date: new Date(p.last_updated || p.created_at || Date.now()).toLocaleDateString(), icon: Trophy, ts: new Date(p.last_updated || p.created_at || Date.now()).getTime() })
             });

             if (inProgressProject) {
               newActivity.push({ action: 'Working on', item: inProgressProject.title, date: 'Currently', icon: Activity, ts: new Date().getTime() })
             }
        } else {
             loadRealtimeStats();
        }

        if (liveStreak > 0 || data.totalStreak > 0) {
            newActivity.push({ action: "Achieved", item: `${data.totalStreak || liveStreak}-Day Daily Tasks Streak`, date: "Today", icon: Sparkles, ts: new Date().getTime() - 20000 });
        }
        newActivity.push({ action: "Started", item: `Career Path setup as ${activeRole}`, date: "Recently", icon: Code, ts: 0 });
        
        // Sort and Set Timeline
        newActivity.sort((a,b) => b.ts - a.ts);
        setTimeline(newActivity.slice(0, 5));

        // Dynamic Skills Calculation
        const baseSkills = lastRoleState?.analysis?.technicalSkills || ["JavaScript", "React", "Node.js"];
        const calculatedSkills = baseSkills.slice(0, 5).map((skillName: string) => {
           const mentions = completedArr.filter((p:any) => JSON.stringify(p).includes(skillName)).length;
           const roadmapMentions = Array.isArray(data.roadmapProgress) ? data.roadmapProgress.filter((r:any) => JSON.stringify(r).includes(skillName)).length : 0;
           
           const totalBoost = (mentions + roadmapMentions) * 20;
           return { name: skillName, level: Math.min(95, 30 + totalBoost) };
        });
        setDynamicSkills(calculatedSkills);
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
  const activeRole = lastRoleState?.role || profileDetails.role || "Software Engineer";
  // Strip qualifiers like "(beginner - usa)" from role display
  const cleanRole = (role: string) => role ? role.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() : role;
  const displayRole = cleanRole(activeRole);

  let activeSkills = ["JavaScript", "React", "Node.js"];
  if (lastRoleState?.analysis?.technicalSkills?.length > 0) {
      activeSkills = lastRoleState.analysis.technicalSkills;
  } else if (lastRoleState?.analysis?.existingSkills?.length > 0) {
      activeSkills = lastRoleState.analysis.existingSkills.map((s: any) => s.name);
  }

  // Display user name override if public - use real data from API when available
  const displayName = isPublic
    ? (publicProfileData?.username || username || 'User')
    : (user?.username || "Guest User");
  
  // For public profiles, use real data from backend API
  const publicRole = publicProfileData?.role || displayRole;
  const publicSkills = publicProfileData?.skills?.length > 0
    ? publicProfileData.skills
    : activeSkills;
  const publicStats = isPublic && publicProfileData ? {
    projectsCompleted: publicProfileData.projectsCompleted || 0,
    totalProjects: Math.max(publicProfileData.projectsCompleted || 1, 1),
    skillsMastered: publicProfileData.skillsMastered || 0,
    totalLearningHours: (publicProfileData.skillsMastered || 0) * 2,
    achievementsUnlocked: Math.floor((publicProfileData.skillsMastered || 0) / 3),
    currentProjectName: 'FindStreak Project',
    learningStreak: publicProfileData.streak || 0,
  } : { ...stats, learningStreak: liveStreak };

  const userData = {
    name: displayName,
    email: isPublic ? '' : (user?.email || "No email provided"),
    role: isPublic ? publicRole : displayRole,
    location: isPublic ? 'Global' : (profileDetails.location || "Global"),
    phone: isPublic ? '' : (profileDetails.phone || "Not set"),
    joinDate: publicProfileData?.memberSince ? new Date(publicProfileData.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently",
    bio: isPublic
      ? `${displayName} is a ${publicRole} tracking career growth on FindStreak.`
      : (profileDetails.bio || `Tracking career progress and mastering skills for ${displayRole} via FindStreak.`),
    skills: (isPublic ? publicSkills : activeSkills).slice(0, 5).map((s: string, idx: number) => ({ name: s, level: Math.max(50, 95 - (idx * 5)) })),
    stats: publicStats,
  };

  const handleCompleteSetup = () => {
    if (!editForm.phone || !editForm.location || !editForm.bio) {
        showAlert("Please fill in all details to proceed.", "warning");
        return;
    }
    setProfileDetails(editForm);
    const updated = { ...editForm, avatar: avatarStr, isPublic: isPublicProfile, customSkills };
    localStorage.setItem('user_profile_details', JSON.stringify(updated));
    setShowSetupModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const shareProfile = () => {
    const link = `${window.location.origin}/p/${encodeURIComponent(user?.username || 'user')}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = () => {
    const finalRole = editForm.role || activeRole;
    const newDetails = { ...editForm, role: finalRole };
    setProfileDetails(newDetails);
    const updated = { ...newDetails, avatar: avatarStr, isPublic: isPublicProfile, customSkills };
    localStorage.setItem('user_profile_details', JSON.stringify(updated));
    setIsEditing(false);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAvatarStr(reader.result as string);
              const savedDetails = localStorage.getItem('user_profile_details');
              if (savedDetails) {
                 const parsed = JSON.parse(savedDetails);
                 localStorage.setItem('user_profile_details', JSON.stringify({ ...parsed, avatar: reader.result as string }));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const togglePublicProfile = () => {
      const newValue = !isPublicProfile;
      setIsPublicProfile(newValue);
      // Save to backend so it persists and controls public URL access
      apiFetch('/api/auth/visibility', {
        method: 'PUT',
        body: JSON.stringify({ isPublic: newValue }),
      }).catch(() => {});
      const savedDetails = localStorage.getItem('user_profile_details');
      if (savedDetails) {
          const parsed = JSON.parse(savedDetails);
          localStorage.setItem('user_profile_details', JSON.stringify({ ...parsed, isPublic: !isPublicProfile }));
      }
  };

  const handleAddCustomSkill = () => {
      if (newSkillInput.trim() && !customSkills.includes(newSkillInput.trim())) {
          const updatedSkills = [...customSkills, newSkillInput.trim()];
          setCustomSkills(updatedSkills);
          
          const savedDetails = localStorage.getItem('user_profile_details');
          if (savedDetails) {
             const parsed = JSON.parse(savedDetails);
             localStorage.setItem('user_profile_details', JSON.stringify({ ...parsed, customSkills: updatedSkills }));
          }
      }
      setNewSkillInput("");
      setShowAddSkill(false);
  };

  const removeCustomSkill = (skillToRemove: string) => {
      const updatedSkills = customSkills.filter(s => s !== skillToRemove);
      setCustomSkills(updatedSkills);
      const savedDetails = localStorage.getItem('user_profile_details');
      if (savedDetails) {
          const parsed = JSON.parse(savedDetails);
          localStorage.setItem('user_profile_details', JSON.stringify({ ...parsed, customSkills: updatedSkills }));
      }
  };

  const handleAISync = async () => {
    setIsSyncingAI(true);
    
    try {
        const response = await apiFetch('/api/ai/chat', {
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

  // Public profile loading/error states
  if (isPublic && publicProfileLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isPublic && publicProfileError) {
    const isPrivate = publicProfileError === '__PRIVATE__';
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow border border-slate-200 max-w-md">
          <div className="text-5xl mb-4">{isPrivate ? '🔒' : '🔍'}</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isPrivate ? 'This Profile is Private' : 'Profile Not Found'}
          </h2>
          <p className="text-slate-500 text-sm">
            {isPrivate
              ? 'The owner has set this profile to private. Only they can view it when logged in.'
              : publicProfileError}
          </p>
          <a href="/signin" className="mt-6 inline-block px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition">
            {isPrivate ? 'Sign In' : 'Go to FindStreak'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-teal-100 selection:text-teal-900 font-sans">
      {!isPublic && showSetupModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-100 bg-teal-600">
                  <h2 className="text-xl font-bold text-white mb-1">Complete Your Profile</h2>
                  <p className="text-teal-100 text-sm">Update your information to unlock personal career insights and daily tasks tracking.</p>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1"><Bot className="w-3.5 h-3.5 text-teal-600" /> Bio & Career Goals</label>
                    <textarea 
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                        className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        rows={3}
                        placeholder="E.g., Driven Software Engineer focused on..."
                    />
                    <button onClick={handleAISync} disabled={isSyncingAI} className="mt-2 text-[11px] flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 transition font-bold">
                        {isSyncingAI ? <Bot className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {isSyncingAI ? "Writing with AI..." : "Let AI Write Bio for Me"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-teal-600" /> Phone</label>
                        <div className="flex gap-1">
                          <select
                            value={editForm.countryCode}
                            onChange={e => setEditForm(prev => ({ ...prev, countryCode: e.target.value }))}
                            className="p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-semibold max-w-[100px]"
                          >
                            {COUNTRY_CODES.map(c => (
                              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                            ))}
                          </select>
                          <input
                            value={editForm.phone}
                            onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="flex-1 w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="Number"
                            type="tel"
                          />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-teal-600" /> Location</label>
                        <div className="flex gap-1 items-center">
                          <input
                            value={editForm.location}
                            onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            className="flex-1 w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            placeholder="City, Country"
                          />
                          <button
                            type="button"
                            onClick={() => handleDetectLocation(setEditForm)}
                            disabled={isDetectingLocation}
                            title="Auto-detect my location"
                            className="p-2.5 bg-teal-50 text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-100 transition disabled:opacity-60 flex-shrink-0"
                          >
                            {isDetectingLocation
                              ? <span className="w-4 h-4 border-2 border-teal-400/40 border-t-teal-600 rounded-full animate-spin inline-block" />
                              : <MapPin className="w-4 h-4" />}
                          </button>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button onClick={handleCompleteSetup} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2">
                     Save & View Profile <CheckCircle2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      )}

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
                <div className="flex items-center gap-2 mr-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">Public visibility:</span>
                    <button 
                       onClick={togglePublicProfile}
                       className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${isPublicProfile ? 'bg-teal-500' : 'bg-slate-300'}`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isPublicProfile ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
              )}
              {!isPublic && isPublicProfile && (
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
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-xs border border-transparent hover:border-red-100"
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
                  {avatarStr ? (
                      <img src={avatarStr} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                      <>{userData.name ? userData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}</>
                  )}
                </div>
                {!isPublic && (
                    <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-slate-100 hover:border-teal-200 hover:text-teal-600 rounded-lg flex items-center justify-center text-slate-500 shadow-md transition-all z-10 cursor-pointer">
                      <Camera className="w-3 h-3" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                    </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left mb-5">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h2 className="text-[22px] font-bold text-slate-800 leading-tight">{userData.name}</h2>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[12px] font-semibold border border-slate-200">
                      {userData.role}
                    </span>
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
                    <div className="flex flex-1 gap-1">
                      <select
                        value={editForm.countryCode}
                        onChange={e => setEditForm(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="p-1 text-[11px] border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-semibold"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.name} ({getDialCode(c.code)})</option>
                        ))}
                      </select>
                      <input
                        value={editForm.phone}
                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 p-1 px-2 text-[12px] border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        placeholder="Phone number"
                        type="tel"
                      />
                    </div>
                  ) : (
                    <span className="font-semibold">
                      {profileDetails.phone
                        ? `${getDialCode(profileDetails.countryCode || '+1')} ${profileDetails.phone}`
                        : 'Not set'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  {isEditing && !isPublic ? (
                    <div className="flex flex-1 gap-1">
                      <input
                        value={editForm.location}
                        onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="flex-1 p-1 px-2 text-[12px] border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        placeholder="City, Country"
                      />
                      <button
                        type="button"
                        onClick={() => handleDetectLocation(setEditForm)}
                        disabled={isDetectingLocation}
                        className="p-1 px-2 text-[11px] bg-teal-50 text-teal-600 border border-teal-200 rounded hover:bg-teal-100 transition font-bold whitespace-nowrap flex items-center gap-1 disabled:opacity-60"
                        title="Auto-detect location"
                      >
                        {isDetectingLocation
                          ? <span className="w-3 h-3 border-2 border-teal-400/40 border-t-teal-600 rounded-full animate-spin" />
                          : <MapPin className="w-3 h-3" />}
                        {isDetectingLocation ? '' : 'Detect'}
                      </button>
                    </div>
                  ) : <span className="font-semibold">{userData.location}</span>}
                </div>
                <div className="flex items-start gap-2.5 text-[12px] text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                      <span className="font-semibold">{userData.role}</span>
                      {isEditing && !isPublic && (
                          <div className="mt-1.5 flex items-start gap-1 p-1.5 bg-slate-100 rounded text-[10px] text-slate-500 border border-slate-200">
                              <Sparkles className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <p>Designation & learning tasks are auto-synced from your active Career Workspace.</p>
                          </div>
                      )}
                  </div>
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
                    onClick={() => {
                        setEditForm(prev => ({ ...prev }));
                        setIsEditing(true);
                    }}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-teal-600" />
                    FindStreak Skills
                </h3>
              </div>
              <div className="space-y-3.5 mb-5">
                {dynamicSkills.length > 0 ? dynamicSkills.map((skill, index) => (
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
                )) : userData.skills.map((skill: {name: string, level: number}, index: number) => (
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

              {/* Skills Radar Chart */}
              <div className="mt-8 border-t border-slate-100 pt-5">
                  <h4 className="text-[12px] font-bold text-slate-700 mb-4 text-center">Skill Balance Analysis</h4>
                  <div className="relative w-full aspect-square max-w-[280px] mx-auto">
                    {dynamicSkills.length > 2 || userData.skills.length > 2 ? (
                        <Radar 
                            data={{
                                labels: dynamicSkills.length > 0 ? dynamicSkills.map((s: {name: string, level: number}) => s.name) : userData.skills.map((s: {name: string, level: number}) => s.name),
                                datasets: [{
                                    label: 'Current Level',
                                    data: dynamicSkills.length > 0 ? dynamicSkills.map((s: {name: string, level: number}) => s.level) : userData.skills.map((s: {name: string, level: number}) => s.level),
                                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
                                    borderColor: 'rgba(20, 184, 166, 0.8)',
                                    pointBackgroundColor: 'rgba(20, 184, 166, 1)',
                                    pointBorderColor: '#fff',
                                    pointHoverBackgroundColor: '#fff',
                                    pointHoverBorderColor: 'rgba(20, 184, 166, 1)',
                                    borderWidth: 2,
                                }]
                            }} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false } } },
                              plugins: { legend: { display: false } }
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-full">
                            <p className="text-[11px] text-slate-400 font-medium text-center px-4">Complete more projects/modules to map your skills!</p>
                        </div>
                    )}
                  </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6">
                 <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[12px] font-bold text-slate-700">Custom Skills</h4>
                    {!isPublic && (
                        <button onClick={() => setShowAddSkill(!showAddSkill)} className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded">
                            + Add Skill
                        </button>
                    )}
                 </div>
                 
                 {showAddSkill && !isPublic && (
                     <div className="flex items-center gap-2 mb-3">
                         <input 
                            value={newSkillInput} 
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                            placeholder="Type a skill..."
                            className="flex-1 text-[12px] p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:outline-none"
                         />
                         <button onClick={handleAddCustomSkill} className="text-[11px] font-bold bg-slate-800 text-white px-2.5 py-1.5 rounded hover:bg-slate-700">Add</button>
                     </div>
                 )}

                 <div className="flex flex-wrap gap-1.5">
                     {customSkills.length > 0 ? customSkills.map(skill => (
                         <span key={skill} className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[11px] font-semibold">
                             {skill}
                             {!isPublic && <span onClick={() => removeCustomSkill(skill)} className="cursor-pointer text-slate-400 hover:text-red-500 ml-1">×</span>}
                         </span>
                     )) : (
                         <span className="text-[11px] text-slate-400">No custom skills added yet.</span>
                     )}
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Realtime Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 cursor-pointer">
              <div 
                onClick={() => navigate('/my-projects')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="text-yellow-600 mb-2 bg-yellow-50 w-8 h-8 rounded-lg flex items-center justify-center">
                   <Trophy className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.projectsCompleted}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Projects</span>
                </div>
              </div>

              <div 
                onClick={() => navigate('/achievements')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="text-orange-500 mb-2 bg-orange-50 w-8 h-8 rounded-lg flex items-center justify-center relative">
                   <Sparkles className="w-4 h-4 absolute" />
                   {userData.stats.learningStreak > 0 && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span></span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.learningStreak}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Day Streak</span>
                </div>
              </div>

              <div 
                onClick={() => navigate('/roadmap')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="text-teal-600 mb-2 bg-teal-50 w-8 h-8 rounded-lg flex items-center justify-center">
                   <Target className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 mb-0.5">{userData.stats.skillsMastered}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Skills Done</span>
                </div>
              </div>

              <div 
                onClick={() => navigate('/ai-assistant')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:-translate-y-1 transition-all"
              >
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
              <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-teal-600 to-emerald-700 border border-teal-500 rounded-2xl shadow-sm p-5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                        <GraduationCap className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-[15px] mb-0.5">FindStreak Target: {userData.role}</h3>
                        <p className="text-teal-100 text-[12px] font-medium">You have unlocked <span className="font-black text-white px-1">{userData.stats.achievementsUnlocked}</span> major milestones.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border text-center border-slate-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex flex-col justify-center items-center">
                      <div className="flex -space-x-3 mb-2">
                        {userData.stats.learningStreak >= 3 && <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-orange-200 z-10" title="Consistency King (3+ Day Streak)"><Sparkles className="w-4 h-4 text-orange-500" /></div>}
                        {userData.stats.skillsMastered > 0 && <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-teal-200 z-20" title="Skill Master (First Skill Done)"><Target className="w-4 h-4 text-teal-600" /></div>}
                        {userData.stats.projectsCompleted > 0 && <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-indigo-200 z-30" title="Project Builder"><Code className="w-4 h-4 text-indigo-500" /></div>}
                        {userData.stats.totalLearningHours > 10 && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-blue-200 z-40" title="10 Hours Logged"><Clock className="w-4 h-4 text-blue-500" /></div>}
                      </div>
                      <p className="text-[12px] font-bold text-slate-700">Recent Badges Earned</p>
                      {userData.stats.learningStreak < 3 && userData.stats.projectsCompleted === 0 ? <p className="text-[10px] text-slate-400 mt-0.5">Keep learning to unlock more!</p> : null}
                  </div>
              </div>

            {/* Daily Task Updates & Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                Daily Task Updates & Activity
              </h3>
              <div className="space-y-3">
                {timeline.map((activity, index) => (
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
                
                {timeline.length === 0 && (
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
