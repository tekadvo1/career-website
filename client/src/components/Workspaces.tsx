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
         
         // 3. Navigate directly to roadmap
         navigate('/roadmap', { state: { role: workspace.role, fromWorkspaceSwitch: true } });
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
    <div className="min-h-screen bg-slate-50 flex">
      <div className="z-50"><Sidebar activePage="workspaces" /></div>
      
      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between p-5 border-b border-slate-100">
                   <h2 className="text-xl font-bold text-slate-900">Create New Workspace</h2>
                   <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                       <X className="w-5 h-5" />
                   </button>
               </div>
               
               <div className="p-5 overflow-y-auto max-h-[75vh]">
                   <div className="space-y-4">
                       <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Workspace Name *</label>
                           <input 
                              type="text" 
                              placeholder="e.g., Data Science Journey, Frontend Career Path" 
                              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                              value={newName}
                              onChange={e => setNewName(e.target.value)}
                           />
                       </div>

                       <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Role *</label>
                           <input 
                              type="text"
                              placeholder="e.g. Software Engineer, Data Scientist"
                              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow text-slate-700"
                              value={newRole}
                              onChange={e => setNewRole(e.target.value)}
                           />
                           <div className="mt-1.5 text-xs text-slate-500 font-medium flex items-center gap-1">
                               <Sparkles className="w-3 h-3 text-indigo-500" /> AI will automatically adapt the roadmap to your typed role.
                           </div>
                       </div>

                       <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resume/CV (Optional)</label>
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
                              className="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50"
                           >
                               {selectedFile ? (
                                  <div className="flex flex-col items-center text-indigo-600">
                                     <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                                         <FileText className="w-5 h-5" />
                                     </div>
                                     <span className="font-bold text-sm">{selectedFile.name}</span>
                                     <span className="text-xs mt-1 opacity-70">Click to change format</span>
                                  </div>
                               ) : (
                                  <div className="flex flex-col items-center">
                                     <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                                         <UploadCloud className="w-5 h-5 text-indigo-600" />
                                     </div>
                                     <span className="font-bold text-slate-700 text-sm">Click to upload or drag and drop</span>
                                     <span className="text-xs text-slate-500 mt-1">PDF, DOC, or DOCX (Max 10MB)</span>
                                  </div>
                               )}
                           </div>
                           <p className="text-xs text-slate-500 mt-2">Upload your resume for personalized skill gap analysis and learning recommendations</p>
                       </div>

                       <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                           <div className="flex items-center gap-2 mb-2">
                               <Sparkles className="w-4 h-4 text-indigo-600" />
                               <h3 className="font-bold text-indigo-900 text-sm">What happens next?</h3>
                           </div>
                           <ul className="text-xs font-medium text-indigo-800 space-y-2">
                               <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" /> AI will analyze your selected role and resume (if provided)</li>
                               <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" /> Get personalized career analysis and skill gap identification</li>
                               <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" /> Receive custom learning roadmap and project recommendations</li>
                               <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" /> Track your progress independently for each workspace</li>
                           </ul>
                       </div>
                   </div>
               </div>
               
               <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                   <button 
                      onClick={() => setShowModal(false)}
                      disabled={isCreating}
                      className="px-5 py-2 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
                   >
                       Cancel
                   </button>
                   <button 
                      onClick={handleCreate}
                      disabled={!newName || !newRole || isCreating}
                      className="px-5 py-2 rounded-lg font-bold text-sm text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-500/20"
                   >
                       {isCreating ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
                       Create Workspace
                   </button>
               </div>
           </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-5xl mx-auto mt-12 md:mt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
               <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                     <Briefcase className="w-8 h-8 text-emerald-600" /> Career Workspaces
                  </h1>
                  <p className="text-slate-600 max-w-xl">
                      Manage multiple career paths and target profiles simultaneously. Switch between workspaces to instantly change your learning and project tracking focus.
                  </p>
               </div>
               
               <div className="flex-shrink-0 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Career Target</p>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                         <TargetIcon className="w-4 h-4" /> {currentRoleActive || "None"}
                    </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Workspace Card Trigger */}
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors p-6 flex flex-col items-center justify-center text-center min-h-[250px] group"
                >
                    <div className="w-14 h-14 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-full flex items-center justify-center text-slate-500 mb-4 shadow-inner transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">New Workspace</h3>
                    <p className="text-sm text-slate-500 px-4">Create a new split profile to track a different job title or career objective.</p>
                </button>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center min-h-[250px] col-span-1 md:col-span-2 text-slate-500">
                        <Sparkles className="w-6 h-6 animate-pulse" /> Loading Workspaces...
                    </div>
                )}

                {/* Workspace Cards */}
                {!loading && workspaces.map(ws => {
                    const isSwitching = switchingTo === ws.id;
                    const isActive = currentRoleActive === ws.role;

                    return (
                        <div key={ws.id} className={`bg-white rounded-2xl border ${isActive ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'} transition-all p-6 flex flex-col relative group`}>
                            {isActive && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-black px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1 shadow-sm">
                                    <CheckCircle2 className="w-3 h-3" /> Active State
                                </div>
                            )}
                            
                            {!isActive && (
                                <button 
                                   onClick={(e) => handleDelete(e, ws.id)}
                                   className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 rounded-md"
                                   title="Delete Workspace"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {ws.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="pr-8">
                                    <h2 className="text-lg font-extrabold text-slate-900 line-clamp-1">{ws.name}</h2>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-slate-100 inline-flex px-2 py-0.5 rounded-full mt-1 border border-slate-200">
                                         <UserCircle className="w-3 h-3" /> {ws.role}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                                <button 
                                   onClick={() => handleSwitchContext(ws)}
                                   disabled={isSwitching || isActive}
                                   className={`w-full ${isSwitching ? 'p-1' : 'py-3 px-4'} rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' :
                                      isSwitching ? 'bg-slate-800 border border-slate-700' : 
                                      'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-md'
                                   }`}
                                >
                                   {isActive ? (
                                       <>Currently Tracking</>
                                   ) : isSwitching ? (
                                       <div className="w-full flex items-center bg-slate-800 rounded-lg overflow-hidden h-10 relative">
                                          <div 
                                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-[150ms] ease-linear"
                                            style={{ width: `${loadingProgress}%` }}
                                          />
                                          <div className="relative z-10 w-full text-center text-white text-xs flex justify-center items-center gap-2 drop-shadow-md">
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
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
