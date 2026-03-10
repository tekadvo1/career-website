import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Briefcase, Plus, Trash2, ArrowRight, Sparkles, CheckCircle2,
  X, UploadCloud, FileText, Award, Pencil, Check
} from 'lucide-react';

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
      const res = await fetch(`/api/workspaces?userId=${user?.id}`);
      const data = await res.json();
      let fetchedWorkspaces = data.workspaces || [];

      const last = localStorage.getItem('lastRoleAnalysis');
      if (last) {
        try {
          const parsed = JSON.parse(last);
          if (parsed.role && !fetchedWorkspaces.some((w: Workspace) => w.role === parsed.role)) {
            const createRes = await fetch('/api/workspaces', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.id, name: 'My Workspace', role: parsed.role })
            });
            const createData = await createRes.json();
            if (createData.success) {
              fetchedWorkspaces = [createData.workspace, ...fetchedWorkspaces];
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

      if (selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        formData.append('userId', user?.id?.toString() || '');
        const analyzeRes = await fetch('/api/resume/analyze', { method: 'POST', body: formData });
        const analyzeData = await analyzeRes.json();
        if (analyzeData.success && analyzeData.analysis?.suggestedRole) {
          // could override: finalRole = analyzeData.analysis.suggestedRole
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
      console.error('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      const res = await fetch(`/api/workspaces/${id}`, {
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
      const res = await fetch(`/api/workspaces/${ws.id}`, {
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
      const response = await fetch('/api/role/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: workspace.role, userId: user?.id || null, forceRefresh: false })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('lastRoleAnalysis', JSON.stringify({
          role: workspace.role,
          analysis: data.data,
          timestamp: new Date().getTime(),
          workspaceId: workspace.id
        }));
        const visitedStr = localStorage.getItem('visitedWorkspaces');
        let visited = visitedStr ? JSON.parse(visitedStr) : [];
        if (!visited.includes(workspace.id)) {
          visited.push(workspace.id);
          localStorage.setItem('visitedWorkspaces', JSON.stringify(visited));
          navigate('/roadmap', { state: { role: workspace.role, fromWorkspaceSwitch: true } });
        } else {
          navigate('/dashboard');
        }
      } else {
        alert('Failed to sync workspace. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error switching workspace');
    } finally {
      setSwitchingTo(null);
    }
  };

  const currentRoleActive = currentActiveTarget();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <div className="z-50"><Sidebar activePage="workspaces" /></div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-teal-100 text-teal-600 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                New Workspace
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[13px] font-bold text-slate-700">Workspace Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Data Science Journey"
                    className="w-full text-[13px] p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all bg-slate-50 hover:bg-white focus:bg-white shadow-sm"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[13px] font-bold text-slate-700">Target Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    className="w-full text-[13px] p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all bg-slate-50 hover:bg-white focus:bg-white shadow-sm text-slate-700"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                  />
                  <div className="mt-2 text-[12px] text-slate-500 font-medium flex items-center gap-1.5 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/50">
                    <Sparkles className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <span>AI will automatically adapt the roadmap to this role.</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[13px] font-bold text-slate-700 flex items-center justify-between">
                    Resume / CV
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Optional</span>
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
                    className={`w-full border-2 border-dashed transition-all duration-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer group ${selectedFile ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 bg-slate-50'}`}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center text-teal-700">
                        <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center mb-2">
                          <FileText className="w-5 h-5 text-teal-500" />
                        </div>
                        <span className="font-bold text-[13px] text-center truncate w-48">{selectedFile.name}</span>
                        <span className="text-[11px] mt-1 text-teal-500 font-medium">Click to select a different file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center mb-2 text-slate-400 group-hover:text-teal-500 transition-all">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700 text-[13px]">Upload your resume</span>
                        <span className="text-[11px] text-slate-400 mt-1 font-medium">PDF, DOC, or DOCX (Max 10MB)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setShowModal(false)} disabled={isCreating} className="px-4 py-2 rounded-lg font-bold text-[13px] text-slate-600 hover:bg-slate-200 transition-colors bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName || !newRole || isCreating}
                className="px-5 py-2 rounded-lg font-bold text-[13px] text-white bg-teal-600 hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-teal-600/30"
              >
                {isCreating ? <Sparkles className="w-3.5 h-3.5 animate-pulse" /> : <Plus className="w-3.5 h-3.5" />}
                {isCreating ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative w-full lg:ml-0">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-50 via-slate-50/50 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-10 relative z-10 w-full min-h-[calc(100vh-2rem)]">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5 bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2.5 shadow-sm bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Career Workspaces</h1>
              </div>
              <p className="text-slate-500 max-w-2xl text-[14px] leading-relaxed">
                Manage distinct career paths and switch contexts to realign your roadmap, projects and AI mentoring.
              </p>
            </div>

            <div className="flex-shrink-0 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 shadow-inner min-w-[180px]">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-1.5">Currently Targeting</p>
              <div className="flex items-center gap-2.5 text-teal-700 font-bold bg-white px-3.5 py-2 rounded-lg shadow-sm border border-teal-100 text-[14px]">
                <Award className="w-4 h-4 text-teal-500" />
                <span className="truncate max-w-[150px]">{currentRoleActive ? cleanRole(currentRoleActive) : 'None'}</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* New Workspace Card */}
            <div
              onClick={() => setShowModal(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center min-h-[220px] group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 bg-slate-50 group-hover:bg-teal-100 group-hover:text-teal-600 rounded-xl flex items-center justify-center text-slate-400 mb-4 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1.5 group-hover:text-teal-900 transition-colors">New Workspace</h3>
              <p className="text-[13px] text-slate-500 font-medium px-2 leading-relaxed">Focus on a new job title, project theme, or learning objective.</p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[220px] col-span-1 md:col-span-2 text-slate-400 bg-white/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 animate-spin-slow mb-3 text-teal-300" />
                <span className="font-bold text-sm tracking-wide text-slate-500">Retrieving workspaces...</span>
              </div>
            )}

            {/* Workspace Cards */}
            {!loading && workspaces.map(ws => {
              const isSwitching = switchingTo === ws.id;
              const isActive = currentRoleActive === ws.role;
              const isEditing = editingId === ws.id;

              return (
                <div
                  key={ws.id}
                  className={`bg-white rounded-2xl border ${isActive ? 'border-teal-500 ring-4 ring-teal-50/50 shadow-lg shadow-teal-100/50' : 'border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md'} transition-all duration-300 p-5 flex flex-col relative group overflow-hidden`}
                >
                  {/* Active bar */}
                  {isActive && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />}

                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-teal-50 text-teal-700 text-[10px] uppercase font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-teal-100 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      Active
                    </div>
                  )}

                  {/* Action buttons top-right (non-active) */}
                  {!isActive && !isEditing && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEdit(e, ws)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all rounded-lg"
                        title="Rename workspace"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, ws.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                        title="Delete workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="flex items-start gap-4 mb-5 mt-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl shadow-sm flex-shrink-0 ${isActive ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors'}`}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      {/* Editable name */}
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mb-1" onClick={e => e.stopPropagation()}>
                          <input
                            ref={editInputRef}
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(e, ws);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 text-[14px] font-bold text-slate-800 border border-teal-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500/20 min-w-0"
                          />
                          <button onClick={(e) => saveEdit(e, ws)} disabled={saving} className="p-1 text-teal-600 hover:bg-teal-50 rounded-md transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => cancelEdit(e)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h2 className="text-[17px] font-extrabold text-slate-800 leading-tight mb-1 line-clamp-2">{ws.name}</h2>
                      )}
                      <p className="text-[12px] text-slate-600 flex items-center gap-1.5 font-medium bg-slate-50 inline-flex px-2.5 py-1 rounded-md border border-slate-200/60 shadow-sm">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {cleanRole(ws.role)}
                      </p>
                    </div>
                  </div>

                  {/* Switch Button */}
                  <div className="mt-auto pt-4 border-t border-slate-100 w-full">
                    <button
                      onClick={() => handleSwitchContext(ws)}
                      disabled={isSwitching || isActive}
                      className={`w-full ${isSwitching ? 'p-1' : 'py-2.5 px-3'} rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 cursor-default ring-1 ring-inset ring-teal-200/50'
                          : isSwitching
                          ? 'bg-slate-900 border-none'
                          : 'bg-slate-900 hover:bg-teal-600 text-white shadow-sm hover:shadow-md active:scale-[0.98]'
                      }`}
                    >
                      {isActive ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Selected
                        </span>
                      ) : isSwitching ? (
                        <div className="w-full flex items-center bg-slate-900 rounded-md overflow-hidden h-8 relative">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-[150ms] ease-linear"
                            style={{ width: `${loadingProgress}%` }}
                          />
                          <div className="relative z-10 w-full text-center text-white text-[12px] flex justify-center items-center gap-1.5 drop-shadow-md">
                            <Sparkles className="w-3 h-3 animate-pulse" /> Loading {loadingProgress}%
                          </div>
                        </div>
                      ) : (
                        <> Switch Context <ArrowRight className="w-3.5 h-3.5" /> </>
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
