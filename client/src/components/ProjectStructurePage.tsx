import { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  FileCode2,
  ShieldCheck,
  Layers,
  Database,
  Rocket,
  Play,
  Wand2,
  Copy,
  CheckCircle2,
  Download,
  ChevronRight,
  Monitor,
  Server,
  Code2,
  Smartphone,
  Cloud,
  Loader2,
  BookOpen,
  Terminal,
  Lightbulb,
  Info,
  ArrowRight,
  Sparkles,
  FolderTree,
  RefreshCw,
} from 'lucide-react';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FolderItem {
  path: string;
  description: string;
  explanation: string;
}
interface FileItem {
  name: string;
  description: string;
  purpose: string;
  explanation: string;
}
interface SecurityItem {
  title: string;
  description: string;
  implementation: string;
  importance: string;
}
interface ArchItem {
  layer: string;
  description: string;
  details: string;
}
interface DbItem {
  name: string;
  description: string;
  config: string;
  explanation: string;
}
interface DevOpsItem {
  tool: string;
  description: string;
  setup: string;
  explanation: string;
}
interface ProjectStructure {
  projectName: string;
  projectDescription: string;
  techStack: string[];
  folders: FolderItem[];
  files: FileItem[];
  security: SecurityItem[];
  architecture: ArchItem[];
  database: DbItem[];
  devops: DevOpsItem[];
  gettingStarted: string[];
}

// ── Role Config ────────────────────────────────────────────────────────────────
const ROLES = [
  { key: 'Frontend Developer',  label: 'Frontend',   icon: Monitor,    color: '#06b6d4', bg: 'from-cyan-500/20 to-blue-500/10',    border: 'border-cyan-500/30'   },
  { key: 'Backend Developer',   label: 'Backend',    icon: Server,     color: '#10b981', bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30'},
  { key: 'Full Stack Developer',label: 'Full Stack', icon: Code2,      color: '#8b5cf6', bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30' },
  { key: 'Mobile Developer',    label: 'Mobile',     icon: Smartphone, color: '#f97316', bg: 'from-orange-500/20 to-red-500/10',    border: 'border-orange-500/30' },
  { key: 'DevOps Engineer',     label: 'DevOps',     icon: Cloud,      color: '#6366f1', bg: 'from-indigo-500/20 to-purple-500/10', border: 'border-indigo-500/30' },
];

// ── Tab Config ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'folders',       label: 'Folders',         icon: FolderOpen,  color: '#10b981' },
  { key: 'files',         label: 'Files',           icon: FileCode2,   color: '#06b6d4' },
  { key: 'security',      label: 'Security',        icon: ShieldCheck, color: '#ef4444' },
  { key: 'architecture',  label: 'Architecture',    icon: Layers,      color: '#8b5cf6' },
  { key: 'database',      label: 'Database',        icon: Database,    color: '#f59e0b' },
  { key: 'devops',        label: 'DevOps',          icon: Rocket,      color: '#6366f1' },
  { key: 'gettingStarted',label: 'Getting Started', icon: Play,        color: '#10b981' },
];

type TabKey = 'folders' | 'files' | 'security' | 'architecture' | 'database' | 'devops' | 'gettingStarted';

// ── Helper: clean role string ──────────────────────────────────────────────────
const cleanRole = (r: string) => r?.split('(')[0]?.split('-')[0]?.trim() ?? r;

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProjectStructurePage() {
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  const [activeTab, setActiveTab] = useState<TabKey>('folders');
  const [customInput, setCustomInput] = useState('');
  const [structure, setStructure] = useState<ProjectStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Detect user role from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('user') || localStorage.getItem('findstreakUser');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        const raw_role = u.role || u.selected_role || '';
        const cleaned = cleanRole(raw_role);
        const matched = ROLES.find(r => r.key.toLowerCase() === cleaned.toLowerCase());
        if (matched) setSelectedRole(matched.key);
      } catch { /* ignore */ }
    }
  }, []);

  const roleConfig = ROLES.find(r => r.key === selectedRole) ?? ROLES[0];

  // ── Fetch structure from backend ─────────────────────────────────────────────
  const fetchStructure = useCallback(async (role: string, custom?: string) => {
    setLoading(true);
    setError('');
    setExpandedItem(null);
    try {
      let res: Response;
      if (custom?.trim()) {
        res = await apiFetch('/api/project-structure/custom', {
          method: 'POST',
          body: JSON.stringify({ role, customDescription: custom }),
        });
      } else {
        res = await apiFetch(`/api/project-structure/${encodeURIComponent(role)}`);
      }
      if (!res.ok) throw new Error('Failed to generate structure');
      const data = await res.json();
      setStructure(data.structure);
      setActiveTab('folders');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Copy to clipboard ────────────────────────────────────────────────────────
  const copyText = (text: string, id: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch { /**/ }
      document.body.removeChild(el);
    }
  };

  // ── Export JSON ──────────────────────────────────────────────────────────────
  const exportJSON = () => {
    if (!structure) return;
    const blob = new Blob([JSON.stringify(structure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-structure-${selectedRole.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(prev => prev === id ? null : id);
  };

  // ── Render Tab Content ────────────────────────────────────────────────────────
  const renderTabContent = () => {
    if (!structure) return null;
    const tabColor = TABS.find(t => t.key === activeTab)?.color ?? '#10b981';

    if (activeTab === 'folders') {
      return (
        <div className="space-y-2">
          {structure.folders.map((f, i) => {
            const id = `folder-${i}`;
            const expanded = expandedItem === id;
            return (
              <div
                key={id}
                className="group border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => toggleExpand(id)}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tabColor}20` }}>
                    <FolderOpen className="w-4 h-4" style={{ color: tabColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono font-semibold text-emerald-300">{f.path}</code>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); copyText(f.path, id + '-copy'); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Copy path"
                    >
                      {copiedId === id + '-copy' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 pt-0 ml-11 border-t border-white/5">
                    <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Why this folder?</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{f.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'files') {
      return (
        <div className="space-y-2">
          {structure.files.map((f, i) => {
            const id = `file-${i}`;
            const expanded = expandedItem === id;
            return (
              <div
                key={id}
                className="group border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => toggleExpand(id)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tabColor}20` }}>
                    <FileCode2 className="w-4 h-4" style={{ color: tabColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono font-semibold text-cyan-300">{f.name}</code>
                    <p className="text-xs text-slate-400 mt-0.5">{f.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); copyText(f.name, id + '-copy'); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedId === id + '-copy' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    </button>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4 pt-0 ml-11 border-t border-white/5">
                    <div className="mt-3 space-y-2">
                      <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">Description</p>
                        <p className="text-sm text-slate-300">{f.description}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Deep Explanation</p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{f.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'security') {
      return (
        <div className="space-y-3">
          {structure.security.map((s, i) => {
            const id = `sec-${i}`;
            const expanded = expandedItem === id;
            return (
              <div
                key={id}
                className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-4 ml-11 border-t border-white/5">
                    <div className="mt-3 space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">How to implement</p>
                        <p className="text-sm text-slate-300">{s.implementation}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">Why it matters</p>
                        <p className="text-sm text-slate-300">{s.importance}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'architecture') {
      return (
        <div className="space-y-3">
          {structure.architecture.map((a, i) => {
            const id = `arch-${i}`;
            const expanded = expandedItem === id;
            return (
              <div
                key={id}
                className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{a.layer}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-4 ml-11 border-t border-white/5">
                    <div className="mt-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">In-Depth</p>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{a.details}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'database') {
      return (
        <div className="space-y-3">
          {structure.database.map((d, i) => {
            const id = `db-${i}`;
            const expanded = expandedItem === id;
            return (
              <div
                key={id}
                className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{d.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-4 ml-11 border-t border-white/5">
                    <div className="mt-3 space-y-2">
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Configuration</p>
                        <p className="text-sm text-slate-300">{d.config}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Why this choice?</p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{d.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'devops') {
      return (
        <div className="space-y-3">
          {structure.devops.map((d, i) => {
            const id = `devops-${i}`;
            const expanded = expandedItem === id;
            return (
              <div
                key={id}
                className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{d.tool}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-4 ml-11 border-t border-white/5">
                    <div className="mt-3 space-y-2">
                      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Setup Guide</p>
                        <p className="text-sm text-slate-300">{d.setup}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Why it's critical</p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{d.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'gettingStarted') {
      return (
        <div className="space-y-3">
          {structure.gettingStarted.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                style={{ backgroundColor: `${roleConfig.color}20`, color: roleConfig.color }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
              </div>
              <button
                onClick={() => copyText(step, `step-${i}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
              >
                {copiedId === `step-${i}` ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Global Sidebar */}
      <Sidebar activePage="project-structure" />

      {/* ─────────────────────────────── MAIN LAYOUT ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen ml-0">

        {/* ── Top Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between ml-10 md:ml-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FolderTree className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Project Structure</h1>
              <p className="text-[11px] text-slate-500">AI-powered architecture guide for every role</p>
            </div>
          </div>
          {structure && (
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          )}
        </header>

        {/* ── Three-pane Layout ───────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden ml-10 md:ml-12">

          {/* ── LEFT PANEL: Role + Generate ──────────────────────────────────── */}
          <aside className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col overflow-y-auto bg-[#0d1117]">
            {/* Role Selection */}
            <div className="p-4 border-b border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Developer Role</p>
              <div className="space-y-1.5">
                {ROLES.map(role => {
                  const Icon = role.icon;
                  const active = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      onClick={() => setSelectedRole(role.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 border ${
                        active
                          ? `${role.bg} ${role.border} bg-gradient-to-r`
                          : 'border-transparent hover:bg-white/5 hover:border-white/5'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: active ? `${role.color}25` : '#ffffff08' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: active ? role.color : '#94a3b8' }} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${active ? 'text-white' : 'text-slate-400'}`}>{role.key}</p>
                        <p className="text-[10px] text-slate-500">{role.label} Development</p>
                      </div>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: role.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Mode Toggle + Textarea */}
            <div className="p-4 border-b border-white/5">
              <button
                onClick={() => setIsCustomMode(v => !v)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  isCustomMode
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                    : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Custom AI Generation</span>
                <Sparkles className="w-3 h-3 ml-auto" />
              </button>

              {isCustomMode && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Describe your project... e.g. 'E-commerce platform with Stripe, admin panel, and inventory system'"
                    className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                    rows={4}
                  />
                  <p className="text-[10px] text-slate-600">Describe your project for a personalized structure</p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="p-4">
              <button
                onClick={() => fetchStructure(selectedRole, isCustomMode ? customInput : undefined)}
                disabled={loading || (isCustomMode && !customInput.trim())}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#1e293b' : `linear-gradient(135deg, ${roleConfig.color}, #10b981)`,
                  boxShadow: loading ? 'none' : `0 0 20px ${roleConfig.color}30`,
                  color: '#fff',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Structure
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {structure && !loading && (
                <button
                  onClick={() => fetchStructure(selectedRole, isCustomMode ? customInput : undefined)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/5 border border-white/5 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              )}
            </div>

            {/* Tech Stack Pills (shown after generation) */}
            {structure && (
              <div className="px-4 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {structure.techStack.map(t => (
                    <span
                      key={t}
                      className="px-2 py-1 text-[10px] font-medium rounded-md border"
                      style={{
                        backgroundColor: `${roleConfig.color}12`,
                        borderColor: `${roleConfig.color}30`,
                        color: roleConfig.color,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── CENTER PANEL: Tabs + Content ─────────────────────────────────── */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Empty State */}
            {!structure && !loading && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `linear-gradient(135deg, ${roleConfig.color}20, #10b98120)` }}
                >
                  <FolderTree className="w-10 h-10" style={{ color: roleConfig.color }} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ready to Build?</h2>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                  Select your developer role and click <span className="text-emerald-400 font-medium">Generate Structure</span> to get a complete, AI-explained project architecture.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm w-full">
                  {[
                    { icon: FolderOpen,  label: 'Every folder explained' },
                    { icon: ShieldCheck, label: 'Security best practices' },
                    { icon: Rocket,      label: 'Full DevOps setup' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                      <Icon className="w-5 h-5 text-emerald-400" />
                      <p className="text-[10px] text-slate-500 text-center">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${roleConfig.color}15` }}
                >
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: roleConfig.color }} />
                </div>
                <p className="text-sm font-medium text-slate-300">AI is generating your project structure...</p>
                <p className="text-xs text-slate-500 mt-1">This may take 10–20 seconds</p>
                <div className="mt-4 flex gap-1.5">
                  {[0, 1, 2].map(n => (
                    <div
                      key={n}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: roleConfig.color, animationDelay: `${n * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-400 mb-1">Generation Failed</p>
                <p className="text-xs text-slate-500 max-w-xs">{error}</p>
                <button
                  onClick={() => fetchStructure(selectedRole)}
                  className="mt-4 px-4 py-2 text-xs font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Structure Loaded */}
            {structure && !loading && (
              <>
                {/* Project Info Banner */}
                <div
                  className="px-6 py-4 border-b border-white/5 flex items-center gap-4"
                  style={{ background: `linear-gradient(135deg, ${roleConfig.color}08, transparent)` }}
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-white truncate">{structure.projectName}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{structure.projectDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-[10px] font-medium rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {structure.folders.length} folders
                    </span>
                    <span className="px-2 py-1 text-[10px] font-medium rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      {structure.files.length} files
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-white/5 bg-[#0d1117] no-scrollbar">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key as TabKey); setExpandedItem(null); }}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                          active
                            ? 'text-white border-current'
                            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/10'
                        }`}
                        style={active ? { color: tab.color, borderColor: tab.color } : {}}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="max-w-3xl mx-auto">
                    {/* Tab header */}
                    <div className="flex items-center gap-2 mb-4">
                      {(() => {
                        const tab = TABS.find(t => t.key === activeTab);
                        if (!tab) return null;
                        const Icon = tab.icon;
                        return (
                          <>
                            <Icon className="w-4 h-4" style={{ color: tab.color }} />
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: tab.color }}>{tab.label}</p>
                            <span className="ml-auto text-[10px] text-slate-600">Click any item to expand</span>
                          </>
                        );
                      })()}
                    </div>
                    {renderTabContent()}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* No-scrollbar style */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
