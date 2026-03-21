import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Briefcase, Plus, Trash2, ArrowRight, Sparkles, CheckCircle2,
  X, UploadCloud, FileText, Award, Pencil, Check
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import { useAlert } from '../contexts/AlertContext';

interface Workspace {
  id: number;
  user_id: number;
  name: string;
  role: string;
  created_at: string;
}

/** Strip qualifiers like "(beginner - usa)", "(intermediate - global)" etc. from role strings */
const cleanRole = (role: string): string => {
  if (!role) return role;
  return role
    .replace(/\s*\([^)]*\)/g, '') // remove anything in parentheses
    .replace(/\s+/g, ' ')
    .trim();
};

export default function Workspaces() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const userStr = sessionStorage.getItem('user');
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

  // Inline rename state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/workspaces?userId=${user?.id}`);
      const data = await res.json();
      let fetchedWorkspaces = data.workspaces || [];

      const last = sessionStorage.getItem('lastRoleAnalysis');
      if (last) {
        try {
          const parsed = JSON.parse(last);
          if (parsed.role) {
             // Case-insensitive check ignoring qualifiers to prevent duplicates
             const roleExists = fetchedWorkspaces.some(
                (w: Workspace) => cleanRole(w.role).toLowerCase() === cleanRole(parsed.role).toLowerCase()
             );
             if (!roleExists) {
               const createRes = await apiFetch('/api/workspaces', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ userId: user?.id, name: 'My Workspace', role: parsed.role })
               });
               const createData = await createRes.json();
               if (createData.success) {
                 fetchedWorkspaces = [createData.workspace, ...fetchedWorkspaces];
               }
             }
          }
        } catch (e) {}
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
      const last = sessionStorage.getItem('lastRoleAnalysis');
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
      const finalRole = newRole;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        formData.append('userId', user?.id?.toString() || '');
        const analyzeRes = await apiFetch('/api/resume/analyze', { method: 'POST', body: formData });
        const analyzeData = await analyzeRes.json();
        if (analyzeData.success && analyzeData.analysis?.suggestedRole) {
          // could override: finalRole = analyzeData.analysis.suggestedRole
        }
      }

      const res = await apiFetch('/api/workspaces', {
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
      console.error('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      const res = await apiFetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      if (res.ok) {
        setWorkspaces(workspaces.filter(w => w.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const startEdit = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setEditingId(ws.id);
    setEditingName(ws.name);
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (e: React.MouseEvent | React.KeyboardEvent, ws: Workspace) => {
    e.stopPropagation();
    if (!editingName.trim() || editingName === ws.name) {
      cancelEdit();
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(`/api/workspaces/${ws.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, name: editingName.trim() })
      });
      if (res.ok) {
        setWorkspaces(workspaces.map(w => w.id === ws.id ? { ...w, name: editingName.trim() } : w));
      }
    } catch (err) {
      console.error('Failed to rename', err);
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const handleSwitchContext = async (workspace: Workspace) => {
    setSwitchingTo(workspace.id);
    try {
      const response = await apiFetch('/api/role/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: workspace.role, userId: user?.id || null, forceRefresh: false })
      });
      const data = await response.json();

      // Persist active context to database
      if (user?.id) {
          await apiFetch('/api/workspaces/set-active', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, workspaceId: workspace.id })
          });
      }

      if (response.ok && data.success) {
        sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
          role: workspace.role,
          analysis: data.data,
          timestamp: new Date().getTime(),
          workspaceId: workspace.id
        }));
        
        // Remove individual workspace caching when switching
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

  const currentRoleActive = currentActiveTarget();

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
      <div className="z-50"><Sidebar activePage="workspaces" /></div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <h2 className="text-[15px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  <Plus className="w-4 h-4" />
                </div>
                New Workspace
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Workspace Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Data Science Journey"
                    className="w-full text-[13px] font-medium p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all bg-slate-50 hover:bg-white shadow-sm"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Target Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    className="w-full text-[13px] font-medium p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all bg-slate-50 hover:bg-white shadow-sm text-slate-900"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                  />
                  <div className="mt-2 text-[12px] text-slate-500 font-medium flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Sparkles className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>AI Engine will continuously optimize your roadmap.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    Context (Resume/CV)
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">Optional</span>
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
                    className={`w-full border border-dashed transition-all duration-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer group ${selectedFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-slate-800 hover:bg-slate-50 bg-[#fafafa]'}`}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-emerald-700">
                        <div className="w-10 h-10 bg-white shadow-sm border border-emerald-100 rounded flex items-center justify-center mb-3">
                          <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-bold text-[13px] text-center truncate w-48 tracking-tight">{selectedFile.name}</span>
                        <span className="text-[11px] mt-1 text-emerald-500 font-medium">Click to select different file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded flex items-center justify-center mb-3 text-slate-400 group-hover:text-slate-800 transition-all">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700 text-[13px] tracking-tight">Upload documentation</span>
                        <span className="text-[11px] text-slate-400 mt-1 font-medium">PDF, DOC, DOCX up to 10MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <button onClick={() => setShowModal(false)} disabled={isCreating} className="px-4 py-2 rounded-lg font-bold text-[12px] uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName || !newRole || isCreating}
                className="px-6 py-2 rounded-lg font-bold text-[12px] uppercase tracking-wider text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
              >
                {isCreating ? <Sparkles className="w-3.5 h-3.5 animate-pulse" /> : <Plus className="w-3.5 h-3.5" />}
                {isCreating ? 'Synchronizing...' : 'Provision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative w-full lg:ml-0 bg-[#fafafa]">
        <div className="max-w-[1600px] mx-auto px-6 py-8 md:px-10 md:py-12 relative z-10 w-full min-h-[calc(100vh-2rem)]">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 shadow-sm bg-slate-900 border border-slate-800 text-white rounded">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Workspaces Overview</h1>
              </div>
              <p className="text-slate-500 max-w-2xl text-[14px] leading-relaxed mt-2">
                Manage parallel engineering environments, track capabilities, and recalibrate AI routing.
              </p>
            </div>

            <div className="flex-shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm min-w-[220px]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Active Context Protocol</p>
              <div className="flex items-center gap-2.5 text-slate-800 font-bold bg-slate-50 px-3 py-2 rounded border border-slate-200 text-[13px]">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="truncate max-w-[160px]">{currentRoleActive ? cleanRole(currentRoleActive) : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* New Workspace Card */}
            <div
              onClick={() => setShowModal(true)}
              className="bg-[#fafafa] rounded-xl border border-dashed border-slate-300 hover:border-slate-800 hover:bg-slate-50 transition-all duration-200 p-6 flex flex-col items-center justify-center text-center min-h-[200px] group cursor-pointer"
            >
              <div className="w-10 h-10 bg-white border border-slate-200 group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white rounded shadow-sm flex items-center justify-center text-slate-500 mb-4 transition-all duration-200">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-extrabold text-slate-800 tracking-tight group-hover:text-slate-900 mb-2">Launch Workspace</h3>
              <p className="text-[12px] text-slate-500 font-medium px-4 leading-relaxed">Instantiate new isolated environment parameters.</p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[200px] col-span-1 md:col-span-2 text-slate-800 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse mb-3 text-emerald-500" />
                <span className="font-bold text-[12px] uppercase tracking-widest text-slate-500">Connecting...</span>
              </div>
            )}

            {/* Workspace Cards */}
            {!loading && workspaces.map(ws => {
              const isSwitching = switchingTo === ws.id;
              // Make active check case-insensitive and ignore qualifiers
              const isActive = !!currentRoleActive && cleanRole(currentRoleActive).toLowerCase() === cleanRole(ws.role).toLowerCase();
              const isEditing = editingId === ws.id;

              return (
                <div
                  key={ws.id}
                  className={`bg-white rounded-xl border ${isActive ? 'border-slate-800 ring-1 ring-slate-900/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]' : 'border-slate-200 hover:border-slate-300 shadow-sm'} transition-all duration-200 p-5 flex flex-col relative group overflow-hidden`}
                >
                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 text-[9px] uppercase tracking-widest font-black px-2 py-1 rounded border border-emerald-200 shadow-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </div>
                  )}

                  {/* Action buttons top-right (non-active) */}
                  {!isActive && !isEditing && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEdit(e, ws)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all rounded"
                        title="Configure properties"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, ws.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded"
                        title="Destroy workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="flex items-start gap-4 mb-6 mt-1">
                    <div className={`w-10 h-10 rounded shadow-inner flex items-center justify-center font-extrabold text-[15px] flex-shrink-0 border ${isActive ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      {/* Editable name */}
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mb-2 mt-1" onClick={e => e.stopPropagation()}>
                          <input
                            ref={editInputRef}
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(e, ws);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 text-[13px] font-bold text-slate-900 border border-slate-800 rounded bg-slate-50 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-0"
                          />
                          <button onClick={(e) => saveEdit(e, ws)} disabled={saving} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors border border-transparent">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => cancelEdit(e)} className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors border border-transparent">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h2 className="text-[15px] font-extrabold text-slate-900 leading-tight mb-2 line-clamp-2 tracking-tight mt-0.5">{ws.name}</h2>
                      )}
                      
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{cleanRole(ws.role)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Button */}
                  <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                    <button
                      onClick={() => handleSwitchContext(ws)}
                      disabled={isSwitching || isActive}
                      className={`w-full ${isSwitching ? 'p-1' : 'py-2.5 px-3'} rounded-lg font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-[#fafafa] text-slate-400 cursor-default border border-slate-200 shadow-inner'
                          : isSwitching
                          ? 'bg-slate-900 border-none'
                          : 'bg-slate-900 hover:bg-black text-white shadow-sm hover:shadow-[0_4px_14px_rgba(0,0,0,0.15)] active:scale-[0.98]'
                      }`}
                    >
                      {isActive ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                        </span>
                      ) : isSwitching ? (
                        <div className="w-full flex items-center bg-slate-900 rounded-md overflow-hidden h-8 relative">
                          <div
                            className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-[150ms] ease-linear"
                            style={{ width: `${loadingProgress}%` }}
                          />
                          <div className="relative z-10 w-full text-center text-white text-[10px] uppercase font-bold tracking-widest flex justify-center items-center gap-1.5 drop-shadow-md">
                            <Sparkles className="w-3 h-3 animate-pulse" /> Routing {loadingProgress}%
                          </div>
                        </div>
                      ) : (
                        <> Execute Mount <ArrowRight className="w-3.5 h-3.5" /> </>
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
