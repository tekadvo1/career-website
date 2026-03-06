import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Briefcase, Plus, Trash2, ArrowRight, Sparkles, CheckCircle2, UserCircle, X, UploadCloud, FileText } from 'lucide-react';
import { useRef } from 'react';

interface Workspace {
  id: number;
  user_id: number;
  name: string;
  role: string;
  created_at: string;
}

export default function Workspaces() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [switchingTo, setSwitchingTo] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (switchingTo) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((p) => (p >= 98 ? 98 : p + 2));
      }, 150);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [switchingTo]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/workspaces?userId=${user?.id}`);
      const data = await res.json();
      let fetchedWorkspaces = data.workspaces || [];
      
      // Auto-migrate the original onboarding goal if it's not saved
      const last = localStorage.getItem('lastRoleAnalysis');
      if (last) {
        try {
          const parsed = JSON.parse(last);
          if (parsed.role && !fetchedWorkspaces.some((w: Workspace) => w.role === parsed.role)) {
             const createRes = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id, name: "Original Profile", role: parsed.role })
             });
             const createData = await createRes.json();
             if (createData.success) {
                fetchedWorkspaces = [createData.workspace, ...fetchedWorkspaces];
             }
          }
        } catch(e) {}
      }
      
      if (data.success) {
        setWorkspaces(fetchedWorkspaces);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentActiveTarget = () => {
     try {
        const last = localStorage.getItem('lastRoleAnalysis');
        if (last) {
            const parsed = JSON.parse(last);
            return parsed.role;
        }
     } catch (e) {}
     return null;
  };

  const handleCreate = async () => {
    if (!newName || !newRole) return;
    
    try {
      setIsCreating(true);

      let finalRole = newRole;
      
      // If a resume is uploaded, we could optionally hit /api/resume/analyze here first
      // to auto-detect the best role or build a roadmap context. For now, we will
      // pass the user's manually typed/selected role to the workspace creator.
      if (selectedFile) {
         const formData = new FormData();
         formData.append('resume', selectedFile);
         formData.append('userId', user?.id?.toString() || "");
         
         const analyzeRes = await fetch('/api/resume/analyze', {
            method: 'POST',
            body: formData
         });
         const analyzeData = await analyzeRes.json();
         if (analyzeData.success && analyzeData.analysis?.suggestedRole) {
            // we could override role here if we wanted dynamically: finalRole = analyzeData.analysis.suggestedRole
         }
      }

      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, name: newName, role: finalRole })
      });
      const data = await res.json();
      if (data.success) {
        setWorkspaces([data.workspace, ...workspaces]);
        setNewName('');
        setNewRole('');
        setSelectedFile(null);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (!confirm('Are you sure you want to delete this workspace? Your roadmap metadata will reset for this role.')) return;
      
      try {
          const res = await fetch(`/api/workspaces/${id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.id })
          });
          if (res.ok) {
              setWorkspaces(workspaces.filter(w => w.id !== id));
          }
      } catch(err) {
          console.error("Failed to delete", err);
      }
  };

  const handleSwitchContext = async (workspace: Workspace) => {
    setSwitchingTo(workspace.id);
    try {
      // 1. We must load/analyze the role data so the rest of the app (Dashboard, Roadmap) operates under this role!
      const response = await fetch('/api/role/analyze', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ role: workspace.role, userId: user?.id || null, forceRefresh: false })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
         // 2. Set memory state
         localStorage.setItem('lastRoleAnalysis', JSON.stringify({
           role: workspace.role,
           analysis: data.data,
           timestamp: new Date().getTime(),
           workspaceId: workspace.id
         }));
         // 3. Check if this is the first time switching to this workspace
         const visitedStr = localStorage.getItem('visitedWorkspaces');
         let visited = visitedStr ? JSON.parse(visitedStr) : [];

         if (!visited.includes(workspace.id)) {
             visited.push(workspace.id);
             localStorage.setItem('visitedWorkspaces', JSON.stringify(visited));
             // First time: Navigate directly to roadmap (onboarding view)
             navigate('/roadmap', { state: { role: workspace.role, fromWorkspaceSwitch: true } });
         } else {
             // Returning: Go directly to project dashboard
             navigate('/dashboard');
         }
      } else {
         alert("Failed to sync workspace roadmap tracking. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing workspace data");
    } finally {
      setSwitchingTo(null);
    }
  };

  const currentRoleActive = currentActiveTarget();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="z-50"><Sidebar activePage="workspaces" /></div>
      
      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
           <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
               <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                         <Plus className="w-5 h-5" />
                      </div>
                      New Workspace
                   </h2>
                   <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all">
                       <X className="w-5 h-5" />
                   </button>
               </div>
               
               <div className="p-6 overflow-y-auto max-h-[70vh]">
                   <div className="space-y-6">
                       <div className="space-y-1.5">
                           <label className="block text-sm font-bold text-slate-700">Workspace Name</label>
                           <input 
                               type="text" 
                               placeholder="e.g., Data Science Journey" 
                               className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-slate-50 hover:bg-white focus:bg-white shadow-sm"
                               value={newName}
                               onChange={e => setNewName(e.target.value)}
                           />
                       </div>

                       <div className="space-y-1.5">
                           <label className="block text-sm font-bold text-slate-700">Target Role</label>
                           <input 
                               type="text"
                               placeholder="e.g. Software Engineer"
                               className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-slate-50 hover:bg-white focus:bg-white shadow-sm text-slate-700"
                               value={newRole}
                               onChange={e => setNewRole(e.target.value)}
                           />
                           <div className="mt-2 text-[13px] text-slate-500 font-medium flex items-center gap-1.5 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                               <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" /> 
                               <span>AI will automatically adapt the roadmap to this role.</span>
                           </div>
                       </div>

                       <div className="space-y-1.5">
                           <label className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                              Resume / CV 
                              <span className="text-xs font-medium text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded-md">Optional</span>
                           </label>
                           
                           <input 
                             type="file" 
                             accept=".pdf,.doc,.docx" 
                             ref={fileInputRef} 
                             className="hidden" 
                             onChange={(e) => {
                                 if (e.target.files && e.target.files.length > 0) {
                                     setSelectedFile(e.target.files[0]);
                                 }
                             }} 
                           />
                           
                           <div 
                               onClick={() => fileInputRef.current?.click()}
                               className={`w-full border-2 border-dashed transition-all duration-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer group ${
                                  selectedFile ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 bg-slate-50'
                               }`}
                           >
                               {selectedFile ? (
                                  <div className="flex flex-col items-center text-indigo-700">
                                     <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                         <FileText className="w-6 h-6 text-indigo-500" />
                                     </div>
                                     <span className="font-bold text-sm text-center line-clamp-1 truncate w-48">{selectedFile.name}</span>
                                     <span className="text-xs mt-1 text-indigo-400 font-medium">Click to select a different file</span>
                                  </div>
                               ) : (
                                  <div className="flex flex-col items-center">
                                     <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-3 text-slate-400 group-hover:text-indigo-500 group-hover:scale-105 transition-all">
                                         <UploadCloud className="w-6 h-6" />
                                     </div>
                                     <span className="font-bold text-slate-700 text-sm">Upload your resume</span>
                                     <span className="text-xs text-slate-400 mt-1 font-medium">PDF, DOC, or DOCX (Max 10MB)</span>
                                  </div>
                               )}
                           </div>
                       </div>
                   </div>
               </div>
               
               <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                   <button 
                      onClick={() => setShowModal(false)}
                      disabled={isCreating}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors bg-slate-100"
                   >
                       Cancel
                   </button>
                   <button 
                      onClick={handleCreate}
                      disabled={!newName || !newRole || isCreating}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 active:translate-y-0"
                   >
                       {isCreating ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
                       {isCreating ? 'Creating...' : 'Create Workspace'}
                   </button>
               </div>
           </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative w-full lg:ml-0">
        <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-50 via-slate-50/50 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-16 relative z-10 w-full min-h-[calc(100vh-2rem)]">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="p-3 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl">
                        <Briefcase className="w-7 h-7" />
                     </div>
                     <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Career Workspaces
                     </h1>
                  </div>
                  <p className="text-slate-500 max-w-2xl text-[15px] leading-relaxed">
                      Manage distinct career paths and tailor your active portfolio. Switch contexts seamlessly to realign AI mentoring, projects, and roadmap focus.
                  </p>
               </div>
               
               <div className="flex-shrink-0 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 shadow-inner min-w-[200px]">
                    <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">Currently Targeting</p>
                    <div className="flex items-center gap-2.5 text-indigo-700 font-bold bg-white px-4 py-2.5 rounded-xl shadow-sm border border-indigo-100">
                         <TargetIcon className="w-5 h-5 text-indigo-500" /> 
                         <span className="truncate max-w-[150px]">{currentRoleActive || "None"}</span>
                    </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Create New Workspace Card Trigger */}
                <div 
                    onClick={() => setShowModal(true)}
                    className="bg-white rounded-3xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 p-8 flex flex-col items-center justify-center text-center min-h-[280px] group cursor-pointer shadow-sm hover:shadow-md"
                >
                    <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center text-slate-400 mb-5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-900 transition-colors">New Workspace</h3>
                    <p className="text-[14px] text-slate-500 font-medium px-2 leading-relaxed">Focus on a new job title, project theme, or learning objective.</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center min-h-[280px] col-span-1 md:col-span-2 text-slate-400 bg-white/50 rounded-3xl border border-slate-100 backdrop-blur-sm">
                        <Sparkles className="w-8 h-8 animate-spin-slow mb-3 text-indigo-300" /> 
                        <span className="font-bold text-sm tracking-wide text-slate-500">Retrieving workspaces...</span>
                    </div>
                )}

                {/* Workspace Cards */}
                {!loading && workspaces.map(ws => {
                    const isSwitching = switchingTo === ws.id;
                    const isActive = currentRoleActive === ws.role;

                    return (
                        <div key={ws.id} className={`bg-white rounded-3xl border ${isActive ? 'border-indigo-500 ring-4 ring-indigo-50/50 shadow-lg shadow-indigo-100/50' : 'border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'} transition-all duration-300 p-7 flex flex-col relative group overflow-hidden`}>
                            
                            {/* Card Header Background Accents */}
                            {isActive && (
                                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                            )}
                            
                            {isActive && (
                                <div className="absolute top-5 right-5 bg-indigo-50 text-indigo-700 text-[10px] uppercase font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-indigo-100 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                                    Active
                                </div>
                            )}
                            
                            {!isActive && (
                                <button 
                                   onClick={(e) => handleDelete(e, ws.id)}
                                   className="absolute top-5 right-5 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all p-2 rounded-xl opacity-0 group-hover:opacity-100"
                                   title="Delete Workspace"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex items-start gap-4 mb-6 mt-2">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors'}`}>
                                    {ws.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="pr-12 flex-1 pt-1">
                                    <h2 className="text-[19px] font-extrabold text-slate-800 leading-tight mb-1.5 line-clamp-2">{ws.name}</h2>
                                    <p className="text-[13px] text-slate-600 flex items-center gap-1.5 font-medium bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                                         <UserCircle className="w-4 h-4 text-slate-400" /> {ws.role}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-5 border-t border-slate-100 w-full relative z-10">
                                <button 
                                   onClick={() => handleSwitchContext(ws)}
                                   disabled={isSwitching || isActive}
                                   className={`w-full ${isSwitching ? 'p-1.5' : 'py-3.5 px-4'} rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 ${
                                      isActive ? 'bg-indigo-50 text-indigo-700 cursor-default ring-1 ring-inset ring-indigo-200/50' :
                                      isSwitching ? 'bg-slate-900 border-none' : 
                                      'bg-slate-900 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'
                                   }`}
                                >
                                   {isActive ? (
                                       <span className="flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4" /> Selected Profile
                                       </span>
                                   ) : isSwitching ? (
                                       <div className="w-full flex items-center bg-slate-900 rounded-lg overflow-hidden h-10 relative">
                                          <div 
                                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-[150ms] ease-linear"
                                            style={{ width: `${loadingProgress}%` }}
                                          />
                                          <div className="relative z-10 w-full text-center text-white text-[13px] flex justify-center items-center gap-2 drop-shadow-md tracking-wide">
                                             <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Loading Context {loadingProgress}%
                                          </div>
                                       </div>
                                   ) : (
                                       <> Switch Context <ArrowRight className="w-4 h-4" /> </>
                                   )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}

function TargetIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
