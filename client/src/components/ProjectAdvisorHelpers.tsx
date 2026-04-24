import { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, Folder, FileCode, FileText,
  Database, Rocket, GitBranch, ChevronDown, ChevronRight,
  Loader2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface FileNode {
  name: string;
  type: 'folder' | 'file';
  description: string;
  children?: FileNode[];
}
export interface TechItem  { name: string; reason: string; badge: string; }
export interface ToolItem  { name: string; reason: string; category: string; }
export interface DatabaseColumn { name: string; type: string; description: string; }
export interface DatabaseTable  { name: string; description: string; columns: DatabaseColumn[]; }

export interface Recommendations {
  languages:  TechItem[];
  frameworks: TechItem[];
  tools:      ToolItem[];
  deployment: TechItem[];
  summary:    string;
}
export interface ProjectStructure {
  overview:  string;
  stack:     string;
  tree:      FileNode[];
  backend?:  FileNode[];
  database?: DatabaseTable[];
  envVars:   string[];
  workflow:  string[];
}

// ── Project type options ───────────────────────────────────────────────────────
export const PROJECT_TYPES = [
  { id: 'website',    label: 'Website',           sub: 'Blog, landing page, portfolio',       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  { id: 'ecommerce',  label: 'E-Commerce Store',  sub: 'Online shop, marketplace, cart',      color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200'    },
  { id: 'mobile',     label: 'Mobile App',        sub: 'iOS, Android, cross-platform',        color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
  { id: 'dashboard',  label: 'Dashboard',         sub: 'Analytics, Power BI, data viz',       color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  { id: 'api',        label: 'Backend / API',     sub: 'REST, GraphQL, microservices',        color: 'text-slate-700',   bg: 'bg-slate-100',  border: 'border-slate-300'   },
  { id: 'fullstack',  label: 'Full-Stack App',    sub: 'Complete web application',            color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'saas',       label: 'SaaS Platform',     sub: 'Multi-tenant, subscriptions, SaaS',  color: 'text-cyan-600',    bg: 'bg-cyan-50',    border: 'border-cyan-200'    },
  { id: 'ai',         label: 'AI / ML Project',   sub: 'ML model, AI tool, data pipeline',   color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200'  },
  { id: 'game',       label: 'Game',              sub: '2D, 3D, browser, mobile game',        color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200'  },
  { id: 'desktop',    label: 'Desktop App',       sub: 'Windows, macOS, Linux native app',    color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-200'    },
  { id: 'extension',  label: 'Browser Extension', sub: 'Chrome, Firefox plugin',              color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200'  },
  { id: 'cli',        label: 'CLI Tool',          sub: 'Command-line utility, script, tool',  color: 'text-green-700',   bg: 'bg-green-50',   border: 'border-green-200'   },
];

// ── Pre-baked AI description suggestions per project type ─────────────────────
export const SUGGESTIONS: Record<string, string[]> = {
  website: [
    'A portfolio website for a freelance designer with project galleries, a blog, and a contact form.',
    'A SaaS marketing landing page with pricing tiers, feature comparisons, and email sign-up.',
    'A personal finance blog with category filters, search, newsletter subscription, and dark mode.',
    'A restaurant website with an online menu, table reservation system, and Google Maps integration.',
  ],
  ecommerce: [
    'An online marketplace where users buy and sell handmade goods, with Stripe payments and seller profiles.',
    'A clothing store with size filters, wishlists, cart, and real-time inventory management.',
    'A digital products store where users download eBooks and templates after payment.',
    'A subscription box service with recurring billing, product curation, and shipping tracking.',
  ],
  mobile: [
    'A fitness tracker app where users log workouts, track calories burned, and view weekly progress charts.',
    'A food delivery app where users browse local restaurants, build an order cart, and pay via card.',
    'A habit tracker that sends push notifications and shows monthly completion streaks.',
    'A language learning app with flashcard decks, spaced repetition, and daily lesson streaks.',
  ],
  dashboard: [
    'A sales analytics dashboard showing revenue, conversions, and funnel drop-off with interactive charts.',
    'An HR dashboard tracking employee attendance, performance reviews, and leave requests.',
    'A Power BI-style reporting tool for e-commerce owners to visualise daily sales and top products.',
    'A real-time IoT sensor dashboard that displays device health, alerts, and historical data.',
  ],
  api: [
    'A REST API for a food ordering platform with JWT auth, menu CRUD, and order management endpoints.',
    'A GraphQL API for a social media app supporting posts, comments, likes, and user relationships.',
    'A microservice for processing payments using Stripe, with webhook handling and transaction logs.',
    'A public weather data API that aggregates from multiple sources and returns normalised JSON responses.',
  ],
  fullstack: [
    'A project management tool like Trello with boards, cards, team collaboration, and real-time updates.',
    'A job board where companies post listings and candidates apply, with email notifications.',
    'A real-time chat application with rooms, direct messages, online presence, and file sharing.',
    'A booking platform for salons — clients book appointments, stylists manage their calendar.',
  ],
  saas: [
    'A multi-tenant CRM platform where teams manage leads, pipelines, and client emails with role-based access.',
    'An AI writing assistant SaaS with subscription tiers, usage quotas, and team workspaces.',
    'A project invoicing tool for freelancers with time tracking, PDF export, and Stripe billing.',
    'A no-code form builder SaaS where users create embeddable forms and view submission analytics.',
  ],
  ai: [
    'An AI-powered resume screener that ranks candidates and highlights skill gaps against a job description.',
    'A document Q&A chatbot using RAG — users upload PDFs and ask questions answered from the content.',
    'A real-time sentiment analysis pipeline for social media comments using a fine-tuned BERT model.',
    'An image classification web app where users upload photos and the model identifies objects.',
  ],
  game: [
    'A 2D platformer game with character progression, enemies, collectibles, and leaderboards.',
    'A browser-based multiplayer trivia game with real-time scoring and custom question packs.',
    'A mobile puzzle game with 100 levels, hint systems, and in-app purchases.',
    'A top-down RPG with procedural dungeon generation, inventory system, and boss fights.',
  ],
  desktop: [
    'A cross-platform note-taking app with markdown support, tags, local sync, and offline access.',
    'A desktop video editor with timeline trimming, filters, and batch export.',
    'A personal finance manager that imports bank CSV exports and generates spending breakdowns.',
    'A code snippet manager with syntax highlighting, search, and GitHub Gist sync.',
  ],
  extension: [
    'A Chrome extension that summarises the current webpage using AI with one click.',
    'A browser extension that blocks distracting websites during focus sessions with a Pomodoro timer.',
    'A GitHub extension that shows PR review stats, code ownership, and open issue counts inline.',
    'A reading-mode extension that strips ads, adjusts font, and saves articles to a reading list.',
  ],
  cli: [
    'A CLI tool that scaffolds a new project from customisable templates with a single command.',
    'A command-line Git workflow tool that automates branch naming, PR creation, and changelogs.',
    'A dev CLI that monitors multiple local servers, shows logs, and restarts crashed processes.',
    'A bulk image resizer CLI with format conversion, quality control, and folder watching.',
  ],
};

export const LEVELS = [
  { id: 'beginner',     label: 'Beginner',     desc: 'Learning the basics'   },
  { id: 'intermediate', label: 'Intermediate', desc: 'Built a few projects'  },
  { id: 'advanced',     label: 'Advanced',     desc: 'Production experience' },
];

export const STEPS = ['Project Type', 'Details', 'Tech Stack', 'Structure'];

// ── Typewriter hook ───────────────────────────────────────────────────────────
export function useTypewriter(text: string, speed = 12): string {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return displayed;
}

// ── Animated loading screen with SVG ring + % ─────────────────────────────────
const REC_MSGS    = ['Analyzing your project type…', 'Researching best languages…', 'Comparing top frameworks…', 'Evaluating tools & deployment options…', 'Finalizing your recommendation…'];
const STRUCT_MSGS = ['Designing the architecture…', 'Building your folder tree…', 'Defining database tables…', 'Setting up environment variables…', 'Writing your dev workflow steps…'];

export function LoadingScreen({ stage }: { stage: 'recs' | 'structure' }) {
  const [pct,    setPct]    = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs   = stage === 'recs' ? REC_MSGS : STRUCT_MSGS;
  const pctRef = useRef(0);

  useEffect(() => {
    const pctIv = setInterval(() => {
      pctRef.current = Math.min(pctRef.current + (100 - pctRef.current) * 0.018, 97);
      setPct(Math.round(pctRef.current));
    }, 300);
    const msgIv = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 5000);
    return () => { clearInterval(pctIv); clearInterval(msgIv); };
  }, [msgs.length]);

  const r   = 40;
  const len = 2 * Math.PI * r;

  return (
    <div className="max-w-sm mx-auto text-center py-20">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r} fill="none"
            stroke="#10b981" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={len}
            strokeDashoffset={len * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-slate-900">{pct}%</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
        <h3 className="text-base font-extrabold text-slate-900">AI is working…</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6 min-h-[20px]">{msgs[msgIdx]}</p>
      <p className="text-xs text-slate-400">This usually takes 30 – 90 seconds. Please wait.</p>
    </div>
  );
}

// ── Badge chip ────────────────────────────────────────────────────────────────
export function BadgeChip({ label }: { label: string }) {
  const map: Record<string, string> = {
    Recommended: 'bg-emerald-100 text-emerald-700',
    Trending:    'bg-violet-100  text-violet-700',
    Popular:     'bg-blue-100    text-blue-700',
    Core:        'bg-slate-100   text-slate-600',
    Essential:   'bg-amber-100   text-amber-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${map[label] || 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
}

// ── Recursive file-tree node ──────────────────────────────────────────────────
export function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === 'folder';

  const fileIcon = () => {
    const n = node.name.toLowerCase();
    if (n.includes('.env'))                                                        return <FileText  className="w-3.5 h-3.5 text-rose-400   shrink-0" />;
    if (['.json', '.toml', '.yaml', '.yml'].some(e => n.endsWith(e)))             return <FileText  className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
    if (n.includes('route') || n.includes('controller') || n.includes('handler')) return <GitBranch className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    if (n.includes('docker') || n.includes('deploy') || n.includes('ci'))         return <Rocket    className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (n.includes('schema') || n.endsWith('.sql') || n.includes('migrat'))       return <Database  className="w-3.5 h-3.5 text-blue-400   shrink-0" />;
    return <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div>
      <button
        onClick={() => isDir && setOpen(o => !o)}
        style={{ paddingLeft: depth * 20 + 10 }}
        className={`w-full flex items-center gap-2 py-1.5 pr-3 rounded-lg text-left transition-colors
          ${isDir ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
      >
        {isDir
          ? (open ? <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" /> : <Folder className="w-4 h-4 text-amber-500 shrink-0" />)
          : fileIcon()}
        <span className={`text-[13px] ${isDir ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
          {node.name}
        </span>
        {isDir && (open
          ? <ChevronDown  className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          : <ChevronRight className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />)}
        {node.description && (
          <span className="text-[11px] text-slate-400 ml-auto pl-4 truncate max-w-[200px] hidden sm:block">
            {node.description}
          </span>
        )}
      </button>
      {isDir && open && node.children?.map((c, i) => (
        <FileTreeNode key={i} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}
