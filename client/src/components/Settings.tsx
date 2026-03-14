import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, Shield, LogOut, ChevronRight, AlertTriangle, Globe, Share2, CheckCircle2 } from 'lucide-react';
import { getUser } from '../utils/auth';
import { apiFetch } from '../utils/apiFetch';

export default function Settings() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const user: any = (getUser() ?? {});

  useEffect(() => {
    // Fetch initial privacy state from backend
    apiFetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.user?.is_public !== undefined) {
          setIsPublicProfile(!!data.user.is_public);
        }
      })
      .catch(err => console.error("Could not load profile settings:", err));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token'); 
    sessionStorage.removeItem('user');
    window.location.href = '/signin';
  };

  const togglePublicProfile = () => {
    const newValue = !isPublicProfile;
    setIsPublicProfile(newValue);
    apiFetch('/api/auth/visibility', {
      method: 'PUT',
      body: JSON.stringify({ isPublic: newValue }),
    }).catch(() => {});
  };

  const shareProfile = () => {
    const slug = String(user?.username || 'user').toLowerCase().replace(/\s+/g, '-');
    // Using a default fallback workspace if needed, though often default profile works
    const link = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
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

        {/* Settings Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
           
           {/* View Profile Action */}
           <button
             onClick={() => navigate('/profile')}
             className="w-full flex items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors"
           >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                   <User className="w-5 h-5 text-slate-500" />
                 </div>
                 <div className="text-left">
                    <span className="font-semibold text-slate-700 text-sm md:text-base block">View Profile</span>
                    <span className="text-xs text-slate-500">Edit your bio, resume, and display information</span>
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
                    <span className="text-xs text-slate-500">Allow others to view your FindStreak profile</span>
                 </div>
              </div>
              <button 
                 onClick={togglePublicProfile}
                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublicProfile ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublicProfile ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
           </div>

           {/* Share Profile Link */}
           <div className={`w-full flex items-center justify-between p-5 transition-all ${isPublicProfile ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
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

        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Danger Zone</h3>
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
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8 text-red-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to leave?</h3>
               <p className="text-sm text-slate-500 px-4">
                 Are you sure you want to log out of your FindStreak account? You will need to sign in again to access your learning workspaces.
               </p>
             </div>
             <div className="flex border-t border-slate-100">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 p-4 font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 p-4 font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Yes, Log Out
                </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
