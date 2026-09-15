import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from '../utils/apiFetch';
import { getToken, getUser } from '../utils/auth';
import Sidebar from "./Sidebar";
import {
  MapPin, Edit, Camera, Sparkles, Clock, Trophy,
  Target, Phone, CheckCircle2, AlertTriangle, Shield, User
} from "lucide-react";

export default function Profile({ isPublic = false }: { isPublic?: boolean }) {
  const navigate = useNavigate();
  const { username } = useParams();
  const user: any = (getUser() ?? {});

  // Profile Form States
  const [dbDetails, setDbDetails] = useState({
    bio: "",
    phone: "",
    location: "Global",
    countryCode: "+1",
    avatar: "",
    customSkills: [] as string[]
  });
  const [editForm, setEditForm] = useState({ ...dbDetails });
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Public vs Private mode data
  const [publicProfileData, setPublicProfileData] = useState<any>(null);
  const [publicProfileError, setPublicProfileError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Stats (Simplified)
  const [stats, setStats] = useState({
    projectsCompleted: 0,
    skillsMastered: 0,
    learningStreak: 0,
    totalLearningHours: 0
  });

  const isDirty = JSON.stringify(editForm) !== JSON.stringify(dbDetails);

  const COUNTRY_CODES = [
    { code: "+1",   flag: "🇺🇸", name: "USA" },
    { code: "+1c",  flag: "🇨🇦", name: "Canada" },
    { code: "+61",  flag: "🇦🇺", name: "Australia" },
    { code: "+91",  flag: "🇮🇳", name: "India" },
    { code: "+44",  flag: "🇬🇧", name: "UK" },
  ];
  const getDialCode = (code: string) => code.replace('c', '');

  // Load Data
  useEffect(() => {
    if (isPublic && username) {
      setIsLoading(true);
      fetch(`/api/auth/public-profile/${encodeURIComponent(username)}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setPublicProfileData(data);
          } else {
            setPublicProfileError(data.message || 'Profile not found');
          }
        })
        .catch(() => setPublicProfileError('Could not load profile'))
        .finally(() => setIsLoading(false));
    } else {
      const token = getToken();
      if (!token) return;
      setIsLoading(true);
      apiFetch('/api/auth/me')
        .then(r => r.json())
        .then(data => {
          if (data?.user) {
            const u = data.user;
            const parsedCustomSkills = typeof u.custom_skills === 'string' ? JSON.parse(u.custom_skills) : (u.custom_skills || []);
            const details = {
              bio: u.bio || '',
              phone: u.phone || '',
              location: u.location || 'Global',
              countryCode: u.country_code || '+1',
              avatar: u.avatar || '',
              customSkills: parsedCustomSkills
            };
            setDbDetails(details);
            setEditForm(details);
            
            // Re-sync session storage user for Sidebar avatar/name updates
            const updatedUser = { ...user, avatar: u.avatar };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isPublic, username]);

  // Load simplified stats for non-public
  useEffect(() => {
    if (isPublic) return;
    try {
      const token = getToken();
      if (!user?.id || !token) return;
      const es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${token}`);
      es.addEventListener('snapshot', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          let projectsCompleted = 0;
          let skillsMastered = data.roadmapProgress?.length || 0;
          let totalStreak = data.totalStreak || 0;
          
          if (Array.isArray(data.projects)) {
             projectsCompleted = data.projects.filter((p: any) => p.status === 'completed' || p.status === 'done').length;
          }
          
          setStats({
            projectsCompleted,
            skillsMastered,
            learningStreak: totalStreak,
            totalLearningHours: skillsMastered * 2 + totalStreak * 1.5
          });
        } catch(err) {}
      });
      return () => es.close();
    } catch {}
  }, [isPublic]);


  const handleSaveProfile = async () => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    
    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      const data = await res.json();
      if (data.success) {
        setSaveStatus('success');
        setDbDetails(editForm);
        
        // Update local user cache for Sidebar
        const updatedUser = { ...user, avatar: editForm.avatar };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage')); // Trigger sidebar update
        
        setTimeout(() => {
          setSaveStatus('idle');
          setIsEditing(false);
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || 'An error occurred while saving.');
    }
  };

  const handleRevert = () => {
    setEditForm(dbDetails);
    setIsEditing(false);
    setSaveStatus('idle');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading profile...</div>;
  }

  if (isPublic && publicProfileError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Profile Unavailable</h2>
        <p className="text-slate-500 mt-2">{publicProfileError === '__PRIVATE__' ? "This user's profile is currently private." : publicProfileError}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700">Go Home</button>
      </div>
    );
  }

  const displayData = isPublic ? publicProfileData : {
    name: user?.name || user?.username || "User",
    username: user?.username || "",
    email: user?.email || "",
    role: "Software Engineer", // Real role logic can be added if needed
    ...dbDetails,
    ...stats
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-12">
      {!isPublic && <Sidebar activePage="profile" />}
      
      <div className={`max-w-3xl mx-auto px-4 py-8 md:px-6 ${!isPublic ? 'lg:pl-20' : ''}`}>
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-full h-full bg-slate-800 border-4 border-white rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden">
              {isEditing && !isPublic && editForm.avatar ? (
                <img src={editForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : displayData.avatar ? (
                <img src={displayData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <>{displayData.name ? displayData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "U"}</>
              )}
            </div>
            {isEditing && !isPublic && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-600 rounded-full flex items-center justify-center text-slate-500 shadow-sm transition-all z-10 cursor-pointer">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
              </label>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{displayData.name}</h1>
          <p className="text-sm font-semibold text-teal-600 mt-1">{displayData.role}</p>
        </div>

        {/* Form Container */}
        <div className="space-y-6">
          
          {/* Public Identity (Read-only) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Public Identity</h2>
              <span className="ml-auto text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Read-only</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 font-medium">@{displayData.username}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 font-medium">{displayData.email}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              These details are tied to your authentication and public portfolio link.
            </p>
          </div>

          {/* Private Details (Editable) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Profile Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bio / About</label>
                {isEditing ? (
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    rows={4}
                    placeholder="Write a short bio about your career goals..."
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 min-h-[80px]">
                    {dbDetails.bio || <span className="text-slate-400 italic">No bio provided.</span>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                  {isEditing ? (
                    <input 
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {dbDetails.location}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <select
                        value={editForm.countryCode}
                        onChange={(e) => setEditForm({ ...editForm, countryCode: e.target.value })}
                        className="p-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 font-semibold focus:outline-none"
                      >
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {getDialCode(c.code)}</option>)}
                      </select>
                      <input 
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="flex-1 p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        placeholder="Phone number"
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> {dbDetails.phone ? `${getDialCode(dbDetails.countryCode)} ${dbDetails.phone}` : 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Editing Controls & Save Status */}
            {!isPublic && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-teal-600" /> Edit Details
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm font-medium w-full sm:w-auto">
                      {saveStatus === 'error' && <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {errorMessage}</span>}
                      {saveStatus === 'success' && <span className="text-teal-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Profile saved!</span>}
                      {saveStatus === 'idle' && isDirty && <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Unsaved changes</span>}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleRevert}
                        disabled={saveStatus === 'saving'}
                        className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveStatus === 'saving' || (!isDirty && saveStatus === 'idle')}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {saveStatus === 'saving' ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                        ) : saveStatus === 'error' ? 'Retry Save' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Simple Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
               <span className="text-xl font-black text-slate-800">{displayData.projectsCompleted || 0}</span>
               <span className="text-[10px] uppercase font-bold text-slate-500">Projects</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <Sparkles className="w-5 h-5 text-orange-500 mb-1" />
               <span className="text-xl font-black text-slate-800">{displayData.learningStreak || 0}</span>
               <span className="text-[10px] uppercase font-bold text-slate-500">Day Streak</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <Target className="w-5 h-5 text-teal-500 mb-1" />
               <span className="text-xl font-black text-slate-800">{displayData.skillsMastered || 0}</span>
               <span className="text-[10px] uppercase font-bold text-slate-500">Skills Done</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
               <Clock className="w-5 h-5 text-blue-500 mb-1" />
               <span className="text-xl font-black text-slate-800">{displayData.totalLearningHours || 0}h</span>
               <span className="text-[10px] uppercase font-bold text-slate-500">Learn Time</span>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
