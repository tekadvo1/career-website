import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FolderOpen,
  FileCode2,
  ShieldCheck,
  Layers,
  Database,
  Rocket,
  Play,
  Copy,
  CheckCircle2,
  Download,
  ChevronRight,
  Loader2,
  BookOpen,
  Terminal,
  Lightbulb,
  Info,
  Sparkles,
  FolderTree,
  RefreshCw,
  Send,
  Bot,
  User,
  Zap,
  Hash,
  MessageSquare,
  Code2,
} from 'lucide-react';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FolderItem   { path: string; description: string; explanation: string; }
interface FileItem     { name: string; description: string; purpose: string; explanation: string; }
interface SecurityItem { title: string; description: string; implementation: string; importance: string; }
interface ArchItem     { layer: string; description: string; details: string; }
interface DbItem       { name: string; description: string; config: string; explanation: string; }
interface DevOpsItem   { tool: string; description: string; setup: string; explanation: string; }
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
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'folders',        label: 'Folders',         icon: FolderOpen,  color: '#10b981' },
  { key: 'files',          label: 'Files',           icon: FileCode2,   color: '#06b6d4' },
  { key: 'security',       label: 'Security',        icon: ShieldCheck, color: '#ef4444' },
  { key: 'architecture',   label: 'Architecture',    icon: Layers,      color: '#8b5cf6' },
  { key: 'database',       label: 'Database',        icon: Database,    color: '#f59e0b' },
  { key: 'devops',         label: 'DevOps',          icon: Rocket,      color: '#6366f1' },
  { key: 'gettingStarted', label: 'Getting Started', icon: Play,        color: '#10b981' },
];
type TabKey = 'folders' | 'files' | 'security' | 'architecture' | 'database' | 'devops' | 'gettingStarted';

// ── Quick prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🔐 Cyber Security', value: 'Cyber Security Platform with threat detection and monitoring' },
  { label: '🛒 E-Commerce',     value: 'E-Commerce platform with Stripe payments and inventory management' },
  { label: '🤖 AI SaaS',        value: 'AI-powered SaaS platform with OpenAI integration and subscription billing' },
  { label: '💬 Chat App',       value: 'Real-time messaging app with WebSockets and end-to-end encryption' },
  { label: '🏥 Healthcare',     value: 'Healthcare patient management system with HIPAA compliance' },
  { label: '📊 Dashboard',      value: 'Analytics dashboard with real-time data visualization and reporting' },
  { label: '🎮 Game Backend',   value: 'Multiplayer game backend with leaderboards and real-time matchmaking' },
  { label: '🏦 FinTech',        value: 'FinTech banking app with KYC verification and transaction processing' },
];

// ── Markdown renderer (simple) ────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black/30 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 border border-white/5"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-300">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/^### (.+)$/gm, '<p class="text-xs font-bold text-slate-200 mt-3 mb-1">$1</p>')
    .replace(/^## (.+)$/gm,  '<p class="text-sm font-bold text-white mt-3 mb-1">$1</p>')
    .replace(/^- (.+)$/gm,   '<div class="flex gap-1.5 items-start my-0.5"><span class="text-emerald-400 mt-0.5 flex-shrink-0">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g,   ' ');
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProjectStructurePage() {
  // Structure state
  const [prompt, setPrompt]               = useState('');
  const [structure, setStructure]         = useState<ProjectStructure | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [activeTab, setActiveTab]         = useState<TabKey>('folders');
  const [expandedItem, setExpandedItem]   = useState<string | null>(null);
  const [copiedId, setCopiedId]           = useState<string | null>(null);
  const [isCached, setIsCached]           = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  // Chat state
  const [chatMessages, setChatMessages]   = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]         = useState('');
  const [chatLoading, setChatLoading]     = useState(false);
  const chatEndRef                        = useRef<HTMLDivElement>(null);
  const chatInputRef                      = useRef<HTMLTextAreaElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Generate structure ──────────────────────────────────────────────────────
  const generateStructure = useCallback(async (p?: string) => {
    const finalPrompt = (p ?? prompt).trim();
    if (!finalPrompt) return;

    setLoading(true);
    setError('');
    setExpandedItem(null);
    setStructure(null);
    setChatMessages([]);

    try {
      const res = await apiFetch('/api/project-structure/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setStructure(data.structure);
      setIsCached(data.cached ?? false);
      setCurrentPrompt(finalPrompt);
      setActiveTab('folders');

      // Welcome message
      setChatMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `I've analyzed the **${data.structure.projectName}** structure for you! 🎉\n\nI know this project inside-out — ask me anything:\n- Why a specific folder was chosen\n- How to implement a feature\n- Security best practices for this project\n- Which tech stack decisions were made and why`,
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  // ── Send chat message ───────────────────────────────────────────────────────
  const sendChat = useCallback(async (msg?: string) => {
    const message = (msg ?? chatInput).trim();
    if (!message || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiFetch('/api/project-structure/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          structure,
          history,
          projectPrompt: currentPrompt,
        }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I hit an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, structure, currentPrompt]);

  // ── Copy helper ─────────────────────────────────────────────────────────────
  const copyText = (text: string, id: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.left = '-9999px';
      document.body.appendChild(el); el.select();
      try { document.execCommand('copy'); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); } catch {/**/}
      document.body.removeChild(el);
    }
  };

  // ── Export JSON ─────────────────────────────────────────────────────────────
  const exportJSON = () => {
    if (!structure) return;
    const blob = new Blob([JSON.stringify(structure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-structure-${currentPrompt.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: string) => setExpandedItem(prev => prev === id ? null : id);

  // ── Tab Content Renderer ────────────────────────────────────────────────────
  const renderTabContent = () => {
    if (!structure) return null;
    const tabColor = TABS.find(t => t.key === activeTab)?.color ?? '#10b981';

    if (activeTab === 'folders') {
      return (
        <div className="space-y-2">
          {structure.folders.map((f, i) => {
            const id = `folder-${i}`; const expanded = expandedItem === id;
            return (
              <div key={id} className="group border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden">
                <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => toggleExpand(id)}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tabColor}20` }}>
                    <FolderOpen className="w-3.5 h-3.5" style={{ color: tabColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono font-semibold text-emerald-300">{f.path}</code>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); copyText(f.path, id + '-copy'); }} className="p-1 rounded-lg hover:bg-white/10 transition-colors" title="Copy path">
                      {copiedId === id + '-copy' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-3.5 pt-0 ml-10 border-t border-white/5">
                    <div className="mt-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Why this folder?</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{f.explanation}</p>
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
            const id = `file-${i}`; const expanded = expandedItem === id;
            return (
              <div key={id} className="group border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden">
                <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => toggleExpand(id)}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tabColor}20` }}>
                    <FileCode2 className="w-3.5 h-3.5" style={{ color: tabColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono font-semibold text-cyan-300">{f.name}</code>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{f.purpose}</p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); copyText(f.name, id + '-copy'); }} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                      {copiedId === id + '-copy' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-3.5 pt-0 ml-10 border-t border-white/5">
                    <div className="mt-2.5 space-y-2">
                      <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                        <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">Description</p>
                        <p className="text-xs text-slate-300">{f.description}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Info className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Deep Explanation</p>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{f.explanation}</p>
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
        <div className="space-y-2">
          {structure.security.map((s, i) => {
            const id = `sec-${i}`; const expanded = expandedItem === id;
            return (
              <div key={id} className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer" onClick={() => toggleExpand(id)}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{s.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.description}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-3.5 ml-10 border-t border-white/5">
                    <div className="mt-2.5 space-y-2">
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">How to implement</p>
                        <p className="text-xs text-slate-300">{s.implementation}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1">Why it matters</p>
                        <p className="text-xs text-slate-300">{s.importance}</p>
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
        <div className="space-y-2">
          {structure.architecture.map((a, i) => {
            const id = `arch-${i}`; const expanded = expandedItem === id;
            return (
              <div key={id} className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer" onClick={() => toggleExpand(id)}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{a.layer}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{a.description}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-3.5 ml-10 border-t border-white/5">
                    <div className="mt-2.5 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3 h-3 text-violet-400 flex-shrink-0" />
                        <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">In-Depth</p>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{a.details}</p>
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
        <div className="space-y-2">
          {structure.database.map((d, i) => {
            const id = `db-${i}`; const expanded = expandedItem === id;
            return (
              <div key={id} className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer" onClick={() => toggleExpand(id)}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{d.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.description}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-3.5 ml-10 border-t border-white/5">
                    <div className="mt-2.5 space-y-2">
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Configuration</p>
                        <p className="text-xs text-slate-300">{d.config}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">Why this choice?</p>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{d.explanation}</p>
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
        <div className="space-y-2">
          {structure.devops.map((d, i) => {
            const id = `devops-${i}`; const expanded = expandedItem === id;
            return (
              <div key={id} className="border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden cursor-pointer" onClick={() => toggleExpand(id)}>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{d.tool}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.description}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="px-4 pb-3.5 ml-10 border-t border-white/5">
                    <div className="mt-2.5 space-y-2">
                      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">Setup Guide</p>
                        <p className="text-xs text-slate-300">{d.setup}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Info className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Why it's critical</p>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{d.explanation}</p>
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
        <div className="space-y-2">
          {structure.gettingStarted.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 border border-white/5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all group">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs bg-emerald-500/20 text-emerald-400">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-200 leading-relaxed">{step}</p>
              </div>
              <button onClick={() => copyText(step, `step-${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10">
                {copiedId === `step-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // ── Quick chat suggestions ─────────────────────────────────────────────────
  const CHAT_SUGGESTIONS = structure ? [
    `Why was ${structure.folders[0]?.path ?? 'src/'} chosen?`,
    'What are the biggest security risks?',
    'How do I set up the database?',
    'What should I build first?',
  ] : [
    'What is a monorepo structure?',
    'Explain microservices vs monolith',
    'What is clean architecture?',
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#0d1117] text-white flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Global Sidebar */}
      <Sidebar activePage="project-structure" />

      {/* ───────────────────── MAIN 3-PANE LAYOUT ─────────────────────── */}
      <div className="flex-1 flex flex-col ml-10 md:ml-12 h-[100dvh] overflow-hidden">

        {/* ── Top Header ─────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm border-b border-white/5 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FolderTree className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Project Structure</h1>
              <p className="text-[10px] text-slate-500">AI-powered architecture generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCached && (
              <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <Zap className="w-2.5 h-2.5" /> Cached
              </span>
            )}
            {structure && (
              <button
                onClick={exportJSON}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
              >
                <Download className="w-3 h-3" /> Export JSON
              </button>
            )}
          </div>
        </header>

        {/* ── Three Panes ────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">

          {/* ══════════════ LEFT PANEL: Prompt Input ══════════════════════ */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col lg:overflow-y-auto bg-[#0c1016]">

            {/* Prompt section */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Describe Your Project</p>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generateStructure(); }}
                placeholder="e.g. Cyber Security platform with threat detection, SIEM dashboard, and incident response tools..."
                className="w-full px-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 resize-none transition-all leading-relaxed"
                rows={5}
              />
              <p className="text-[9px] text-slate-600 mt-1.5">Ctrl+Enter to generate</p>
            </div>

            {/* Quick Prompts */}
            <div className="p-4 border-b border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Quick Start</p>
              <div className="space-y-1">
                {QUICK_PROMPTS.map(qp => (
                  <button
                    key={qp.value}
                    onClick={() => { setPrompt(qp.value); generateStructure(qp.value); }}
                    className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/5 truncate"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="p-4">
              <button
                onClick={() => generateStructure()}
                disabled={loading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: loading || !prompt.trim()
                    ? '#1e293b'
                    : 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: (!loading && prompt.trim()) ? '0 0 20px #10b98130' : 'none',
                  color: '#fff',
                }}
              >
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                ) : (
                  <><Play className="w-3.5 h-3.5" /> Generate Structure</>
                )}
              </button>
              {structure && !loading && (
                <button
                  onClick={() => generateStructure()}
                  className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/5 border border-white/5 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              )}
            </div>

            {/* Tech stack pills (if generated) */}
            {structure && (
              <div className="px-4 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1">
                  {structure.techStack.map(t => (
                    <span key={t} className="px-2 py-1 text-[10px] font-medium rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats if generated */}
            {structure && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Folders', val: structure.folders.length, color: '#10b981' },
                    { label: 'Files',   val: structure.files.length,   color: '#06b6d4' },
                    { label: 'Security',val: structure.security.length, color: '#ef4444' },
                    { label: 'Steps',   val: structure.gettingStarted.length, color: '#8b5cf6' },
                  ].map(s => (
                    <div key={s.label} className="p-2 rounded-lg bg-white/3 border border-white/5 text-center">
                      <p className="text-base font-bold" style={{ color: s.color }}>{s.val}</p>
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ══════════════ MIDDLE PANEL: Structure Output ════════════════ */}
          <main className="flex-1 flex flex-col min-h-[600px] lg:min-h-0 min-w-0 overflow-hidden">

            {/* Empty state */}
            {!structure && !loading && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                  <FolderTree className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Describe Your Project</h2>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Type any project idea on the left — like <span className="text-emerald-400 font-medium">"Cyber Security Platform"</span>, <span className="text-cyan-400 font-medium">"E-Commerce with Stripe"</span>, or <span className="text-violet-400 font-medium">"Healthcare App"</span> — and get a complete AI-generated architecture.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2.5 max-w-xs w-full">
                  {[
                    { icon: FolderOpen,  label: 'Folders explained',   color: '#10b981' },
                    { icon: ShieldCheck, label: 'Security practices',   color: '#ef4444' },
                    { icon: Code2,       label: 'Full architecture',    color: '#8b5cf6' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/3 border border-white/5">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <p className="text-[10px] text-slate-500 text-center">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/15">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-slate-300">Generating your project structure...</p>
                <p className="text-xs text-slate-500 mt-1">AI is crafting a tailored architecture</p>
                <div className="mt-4 flex gap-1.5">
                  {[0, 1, 2].map(n => (
                    <div key={n} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-400 mb-1">Generation Failed</p>
                <p className="text-xs text-slate-500 max-w-xs">{error}</p>
                <button onClick={() => generateStructure()} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all">
                  Try Again
                </button>
              </div>
            )}

            {/* Structure loaded */}
            {structure && !loading && (
              <>
                {/* Project Info Banner */}
                <div className="px-5 py-3 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-white">{structure.projectName}</h2>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded">AI GENERATED</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{structure.projectDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Tab Bar */}
                <div className="flex overflow-x-auto border-b border-white/5 bg-[#0d1117] no-scrollbar flex-shrink-0">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key as TabKey); setExpandedItem(null); }}
                        className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-medium whitespace-nowrap transition-all border-b-2 ${
                          active ? 'text-white border-current' : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/10'
                        }`}
                        style={active ? { color: tab.color, borderColor: tab.color } : {}}
                      >
                        <Icon className="w-3 h-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-1.5 mb-3">
                      {(() => {
                        const tab = TABS.find(t => t.key === activeTab);
                        if (!tab) return null;
                        const Icon = tab.icon;
                        return (
                          <>
                            <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: tab.color }}>{tab.label}</p>
                            <span className="ml-auto text-[9px] text-slate-600 italic">Click to expand</span>
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

          {/* ══════════════ RIGHT PANEL: AI Chat Assistant ════════════════ */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col bg-[#0c1016] min-h-[500px] lg:min-h-0">

            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-tight">AI Assistant</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[9px] text-slate-500">{structure ? 'Context-aware' : 'Ready to help'}</p>
                </div>
              </div>
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">

              {/* Default greeting if no messages */}
              {chatMessages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <p className="text-xs font-semibold text-white mb-1">Ask me anything!</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-2">
                    {structure
                      ? `I know everything about your ${structure.projectName} structure.`
                      : 'Generate a structure first, or ask me a general architecture question.'}
                  </p>
                </div>
              )}

              {/* Chat messages */}
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user' ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-3 h-3 text-emerald-400" />
                      : <Bot className="w-3 h-3 text-violet-400" />
                    }
                  </div>
                  <div className={`flex-1 max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500/10 border border-emerald-500/15 text-slate-200 text-right'
                      : 'bg-white/[0.04] border border-white/5 text-slate-300'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div
                        className="prose-custom"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {chatLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-violet-400" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/5 rounded-xl px-3 py-2.5 flex items-center gap-1.5">
                    {[0, 1, 2].map(n => (
                      <div key={n} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {!chatLoading && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
                {CHAT_SUGGESTIONS.slice(0, 2).map(s => (
                  <button
                    key={s}
                    onClick={() => sendChat(s)}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/8 border border-white/5 rounded-lg transition-all truncate max-w-full"
                  >
                    <Hash className="w-2.5 h-2.5 inline mr-1 text-violet-400" />
                    {s.length > 28 ? s.slice(0, 28) + '…' : s}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input */}
            <div className="p-3 border-t border-white/5 flex-shrink-0">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder={structure ? `Ask about ${structure.projectName}...` : 'Ask an architecture question...'}
                  className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed transition-all"
                  rows={2}
                />
                <button
                  onClick={() => sendChat()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  style={{
                    background: (!chatInput.trim() || chatLoading)
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    boxShadow: (chatInput.trim() && !chatLoading) ? '0 0 12px #7c3aed30' : 'none',
                  }}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-[9px] text-slate-600 mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
