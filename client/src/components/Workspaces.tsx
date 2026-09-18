import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Briefcase, Plus, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import { useAlert } from '../contexts/AlertContext';
import CareerTrackCard from './workspaces/CareerTrackCard';
import CreateCareerTrackDialog from './workspaces/CreateCareerTrackDialog';
import RenameCareerTrackDialog from './workspaces/RenameCareerTrackDialog';

interface Workspace {
  id: number;
  user_id: number;
  name: string;
  role: string;
  created_at: string;
}

export default function Workspaces() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<number | null>(null);

  const [renamingTrack, setRenamingTrack] = useState<Workspace | null>(null);

  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | null>(
    user?.current_workspace_id || null
  );

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
      if (!currentWorkspaceId) {
         fetchMe();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
       const res = await apiFetch('/api/auth/me');
       const data = await res.json();
       if (data.status === 'success' && data.user) {
          setCurrentWorkspaceId(data.user.current_workspace_id);
          sessionStorage.setItem('user', JSON.stringify(data.user));
       }
    } catch(err) {
       console.error("Failed to fetch user me:", err);
    }
  }

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/api/workspaces`);
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      const data = await res.json();
      
      if (data.success) {
        setWorkspaces(data.workspaces || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load career tracks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string, role: string) => {
    const res = await apiFetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role })
    });
    const data = await res.json();
    if (data.success) {
      setWorkspaces(prev => [data.workspace, ...prev]);
    } else {
      throw new Error(data.error || 'Failed to create career track');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career track? This will permanently remove its associated records.')) return;
    try {
      const res = await apiFetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        setWorkspaces(prev => prev.filter(w => w.id !== id));
        if (currentWorkspaceId === id) {
           setCurrentWorkspaceId(null);
           fetchMe();
        }
      } else {
        showAlert('Failed to delete track. It may still have dependencies.', 'error');
      }
    } catch (err) {
      console.error('Failed to delete', err);
      showAlert('Failed to delete track.', 'error');
    }
  };

  const handleRename = async (id: number, newName: string) => {
    const res = await apiFetch(`/api/workspaces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    if (res.ok) {
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    } else {
       const errData = await res.json().catch(()=>({}));
       throw new Error(errData.error || 'Failed to rename track');
    }
  };

  const handleSwitchContext = async (workspace: Workspace) => {
    if (switchingTo) return;
    
    setSwitchingTo(workspace.id);
    try {
      const response = await apiFetch('/api/role/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: workspace.role, forceRefresh: false, workspaceId: workspace.id })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (user?.id) {
            const setActiveRes = await apiFetch('/api/workspaces/set-active', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: workspace.id })
            });
            if (!setActiveRes.ok) {
                showAlert('Failed to switch active track. Please try again.', 'error');
                setSwitchingTo(null);
                return;
            }
            setCurrentWorkspaceId(workspace.id);
            const updatedUser = { ...user, current_workspace_id: workspace.id };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }

        const roleData = JSON.stringify({
          role: workspace.role,
          analysis: data.data,
          timestamp: new Date().getTime(),
          workspaceId: workspace.id
        });
        sessionStorage.setItem('lastRoleAnalysis', roleData);
        localStorage.setItem('lastRoleAnalysis', roleData);
        
        const visitedStr = sessionStorage.getItem('visitedWorkspaces');
        const visited = visitedStr ? JSON.parse(visitedStr) : [];
        if (!visited.includes(workspace.id)) {
          visited.push(workspace.id);
          sessionStorage.setItem('visitedWorkspaces', JSON.stringify(visited));
          navigate('/roadmap', { state: { role: workspace.role, fromWorkspaceSwitch: true } });
        } else {
          navigate('/dashboard');
        }
      } else {
        showAlert('Failed to sync workspace. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error switching workspace', 'error');
    } finally {
      setSwitchingTo(null);
    }
  };

  const activeTrack = workspaces.find(w => w.id === currentWorkspaceId);
  const otherTracks = workspaces.filter(w => w.id !== currentWorkspaceId);

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] flex flex-col md:flex-row font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
      <div className="z-50 shrink-0"><Sidebar activePage="workspaces" /></div>

      {showCreateModal && (
        <CreateCareerTrackDialog 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {renamingTrack && (
        <RenameCareerTrackDialog
          initialName={renamingTrack.name}
          onClose={() => setRenamingTrack(null)}
          onSubmit={(newName) => handleRename(renamingTrack.id, newName)}
        />
      )}

      <div className="flex-1 overflow-y-auto relative w-full lg:ml-0 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10 w-full min-h-[calc(100vh-2rem)]">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 shadow-sm bg-emerald-600 border border-emerald-500 text-white rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Career Tracks</h1>
              </div>
              <p className="text-slate-600 text-[15px] leading-relaxed mt-2 max-w-xl">
                Keep your learning organized as you explore different careers.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-lg font-bold text-[13px] text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              New career track
            </button>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-500">
               <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
               <p className="text-[14px] font-medium">Loading your career tracks...</p>
             </div>
          ) : error ? (
             <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <button 
                  onClick={fetchWorkspaces}
                  className="px-4 py-2 bg-white rounded-lg border border-red-200 text-red-700 text-[13px] font-bold hover:bg-red-50"
                >
                  Try Again
                </button>
             </div>
          ) : (
            <div className="space-y-12">
              {/* Current Track Section */}
              {activeTrack && (
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CareerTrackCard
                      id={activeTrack.id}
                      name={activeTrack.name}
                      role={activeTrack.role}
                      isActive={true}
                      isSwitching={switchingTo === activeTrack.id}
                      onOpenTrack={() => handleSwitchContext(activeTrack)}
                      onRename={() => setRenamingTrack(activeTrack)}
                      onDelete={() => handleDelete(activeTrack.id)}
                    />
                  </div>
                </section>
              )}

              {/* Other Tracks Section */}
              {otherTracks.length > 0 && (
                <section>
                  {activeTrack && (
                    <h3 className="text-[16px] font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                      Other Tracks
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherTracks.map(ws => (
                      <CareerTrackCard
                        key={ws.id}
                        id={ws.id}
                        name={ws.name}
                        role={ws.role}
                        isActive={false}
                        isSwitching={switchingTo === ws.id}
                        onOpenTrack={() => handleSwitchContext(ws)}
                        onRename={() => setRenamingTrack(ws)}
                        onDelete={() => handleDelete(ws.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {workspaces.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-[16px] font-extrabold text-slate-900 mb-2">No career tracks yet</h3>
                  <p className="text-[14px] text-slate-500 mb-6 max-w-sm">
                    Create a career track to organize your learning and get an AI-powered roadmap.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 rounded-lg font-bold text-[13px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                  >
                    Create your first track
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
