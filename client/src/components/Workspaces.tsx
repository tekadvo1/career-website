import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Briefcase, Plus, Trash2, ArrowRight, Sparkles, CheckCircle2, UserCircle } from 'lucide-react';

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
  
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

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
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, name: newName, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setWorkspaces([data.workspace, ...workspaces]);
        setNewName('');
        setNewRole('');
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
                {/* Create New Workspace Card */}
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors p-6 flex flex-col items-center justify-center text-center min-h-[250px]">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">New Workspace</h3>
                    <p className="text-sm text-slate-500 mb-6">Create a new split profile to track a different job title or career objective.</p>
                    
                    <div className="w-full flex flex-col gap-3">
                        <input 
                           type="text" 
                           placeholder="Workspace Name (e.g. Dream Job)" 
                           className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                           value={newName}
                           onChange={e => setNewName(e.target.value)}
                        />
                        <input 
                           type="text" 
                           placeholder="Target Role (e.g. Data Scientist)" 
                           className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                           value={newRole}
                           onChange={e => setNewRole(e.target.value)}
                        />
                        <button 
                           onClick={handleCreate}
                           disabled={!newName || !newRole || isCreating}
                           className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-1"
                        >
                           {isCreating ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Plus className="w-4 h-4" />}
                           Create Profile Object
                        </button>
                    </div>
                </div>

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
                            
                            <button 
                               onClick={(e) => handleDelete(e, ws.id)}
                               className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 rounded-md"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>

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
                                   className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' :
                                      isSwitching ? 'bg-slate-800 text-white opacity-80' : 
                                      'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-md'
                                   }`}
                                >
                                   {isActive ? (
                                       <>Currently Tracking</>
                                   ) : isSwitching ? (
                                       <> <Sparkles className="w-4 h-4 animate-spin" /> Fetching AI State...</>
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
