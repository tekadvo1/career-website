import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, Shield, LogOut, ChevronRight, Globe, Share2, CheckCircle2, Bot, AlertTriangle } from 'lucide-react';
import { getUser } from '../utils/auth';
import { apiFetch } from '../utils/apiFetch';

export default function Settings() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const user: any = (getUser() ?? {});

  // Form State
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [guidanceMode, setGuidanceMode] = useState<'step'|'quick'>('step');
  
  // Saved DB State (to compare against for isDirty)
  const [savedSettings, setSavedSettings] = useState({
    isPublic: false,
    guidanceMode: 'step'
  });

  // Save Status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isDirty = isPublicProfile !== savedSettings.isPublic || guidanceMode !== savedSettings.guidanceMode;

  useEffect(() => {
    // Fetch initial settings from backend
    apiFetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.user) {
          const publicVal = !!data.user.is_public;
          const modeVal = data.user.preferences?.guidanceMode || 'step';
          
          setIsPublicProfile(publicVal);
          setGuidanceMode(modeVal);
          
          setSavedSettings({
            isPublic: publicVal,
            guidanceMode: modeVal
          });
        }
      })
      .catch(err => console.error("Could not load profile settings:", err));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token'); 
    sessionStorage.removeItem('user');
    window.location.href = '/signin';
  };

  const shareProfile = () => {
    const slug = String(user?.username || 'user').toLowerCase().replace(/\s+/g, '-');
    const link = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveSettings = async () => {
    if (!isDirty) return;
    
    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      const res = await apiFetch('/api/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({ 
          isPublic: isPublicProfile,
          preferences: { guidanceMode }
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSaveStatus('success');
        setSavedSettings({
          isPublic: isPublicProfile,
          guidanceMode: guidanceMode
        });
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || 'An error occurred while saving.');
    }
  };

  const handleRevert = () => {
    setIsPublicProfile(savedSettings.isPublic);
    setGuidanceMode(savedSettings.guidanceMode as 'step'|'quick');
    setSaveStatus('idle');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">
      <Sidebar activePage="settings" />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm pl-16 md:pl-0">
        <div className="max-w-4xl mx-auto px-4 py-4 md:px-5">
          <h1 className="text-xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account preferences and settings</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-5">
        
        {/* User Quick Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl font-bold shrink-0">
              {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0,2) : "G"}
           </div>
           <div>
             <h2 className="text-lg font-bold text-slate-800">{user?.name || user?.username || "Guest User"}</h2>
             <p className="text-sm text-slate-500">{user?.email || "No email available"}</p>
           </div>
        </div>

        {/* Global Settings */}
        <div className="mb-8">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">General Settings</h3>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* View Profile Action */}
              <button
                onClick={() => navigate('/profile', { state: { readOnlyMode: false } })}
                className="w-full flex items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="text-left">
                       <span className="font-semibold text-slate-700 text-sm md:text-base block">Edit Profile</span>
                       <span className="text-xs text-slate-500">Edit your bio, details, and display information</span>
                    </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              {/* Privacy and Visibility Toggle */}
              <div className="w-full flex items-center justify-between p-5 border-b border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Shield className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="text-left">
                       <span className="font-semibold text-slate-700 text-sm md:text-base block">Public Profile Visibility</span>
                       <span className="text-xs text-slate-500">Allow others to view your FindStreak profile via link</span>
                    </div>
                 </div>
                 <button 
                    onClick={() => setIsPublicProfile(!isPublicProfile)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublicProfile ? 'bg-teal-500' : 'bg-slate-300'}`}
                 >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublicProfile ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>

              {/* Share Profile Link */}
              <div className={`w-full flex items-center justify-between p-5 border-b border-slate-100 transition-all ${isPublicProfile ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Globe className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="text-left">
                       <span className="font-semibold text-slate-700 text-sm md:text-base block">Share Public Link</span>
                       <span className="text-xs text-slate-500">Copy your public profile URL to share with recruiters</span>
                    </div>
                 </div>
                 <button 
                   onClick={shareProfile}
                   className="flex items-center gap-1.5 px-3 py-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors font-bold text-sm border border-teal-200"
                 >
                   {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                   {copiedLink ? 'Copied URL!' : 'Copy Link'}
                 </button>
              </div>

              {/* Learning Preferences: Guidance Mode */}
              <div className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Bot className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="text-left">
                       <span className="font-semibold text-slate-700 text-sm md:text-base block">Default AI Guidance</span>
                       <span className="text-xs text-slate-500">Set how much help you want in new learning workspaces</span>
                    </div>
                 </div>
                 <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto shrink-0">
                    <button 
                       onClick={() => setGuidanceMode('step')} 
                       className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${guidanceMode === 'step' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                       Step-by-step
                    </button>
                    <button 
                       onClick={() => setGuidanceMode('quick')} 
                       className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${guidanceMode === 'quick' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                       Quick hints
                    </button>
                 </div>
              </div>

              {/* Save Footer (Dynamic) */}
              {(isDirty || saveStatus !== 'idle') && (
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    {saveStatus === 'error' && (
                       <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {errorMessage}</span>
                    )}
                    {saveStatus === 'success' && (
                       <span className="text-teal-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Settings saved successfully.</span>
                    )}
                    {saveStatus === 'idle' && isDirty && (
                       <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> You have unsaved changes.</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {saveStatus !== 'success' && (
                      <button
                        onClick={handleRevert}
                        disabled={saveStatus === 'saving'}
                        className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSaveSettings}
                      disabled={saveStatus === 'saving'}
                      className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {saveStatus === 'saving' ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      ) : saveStatus === 'error' ? 'Retry Save' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

           </div>
        </div>

        {/* Logout Section */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
             <button
               onClick={() => setShowLogoutModal(true)}
               className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors"
             >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                     <LogOut className="w-5 h-5 text-red-500" />
                   </div>
                   <div className="text-left">
                     <span className="font-semibold text-red-600 text-sm md:text-base block">Log Out</span>
                     <span className="text-xs text-slate-500">Securely end your current session</span>
                   </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-300" />
             </button>
          </div>
        </div>
      </div>

      {/* Custom Logout Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Sign out of FindStreak?</h3>
             <p className="text-slate-500 text-sm mb-6">You will need to sign in again to access your projects and learning progress.</p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowLogoutModal(false)}
                 className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleLogout}
                 className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm shadow-red-600/20"
               >
                 Sign Out
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
