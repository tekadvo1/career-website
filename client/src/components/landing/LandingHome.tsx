import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, BrainCircuit, Code2, Target, MessageSquare,
  Briefcase, CheckCircle, BookOpen, BarChart3, FolderKanban,
  Sparkles, ChevronRight, Trophy, Mic,
  Radio, GitBranch, Star, Clock, Users,
  ChevronDown, Flame, Bot, LayoutGrid, Upload,
  TrendingUp, FileText
} from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-[11px] font-semibold uppercase tracking-widest mb-4">
      <Sparkles className="w-3 h-3" />{children}
    </span>
  );
}

/* ─── Real Dashboard Mockup (matches actual Sidebar.tsx nav) ───── */
function DashboardMockup() {
  // Real nav items from Sidebar.tsx
  const navItems = [
    { icon: BarChart3, active: true },
    { icon: Briefcase, active: false },
    { icon: Target, active: false },
    { icon: FolderKanban, active: false },
    { icon: BookOpen, active: false },
    { icon: Bot, active: false },
    { icon: LayoutGrid, active: false },
  ];

  return (
    <div className="relative w-full max-w-[640px] mx-auto lg:mx-0">
      <div className="absolute inset-0 bg-teal-400/10 blur-[80px] rounded-full scale-75" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 rounded-2xl overflow-hidden border border-slate-200 bg-[#0A1520] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.35)]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 h-9 bg-[#0C1A2E] border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 w-52 h-5 rounded bg-white/[0.05] border border-white/[0.06] px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-gray-500">findstreak.com/dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex h-[350px]">
          {/* Real Sidebar — matches Sidebar.tsx */}
          <div className="w-[72px] border-r border-white/[0.05] bg-[#060E19] flex flex-col items-center py-3 gap-1">
            {/* Logo */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            {navItems.map(({ icon: Icon, active }, i) => (
              <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                active ? 'bg-emerald-500/20 border-r-2 border-emerald-500' : 'text-gray-600 hover:text-gray-400'
              }`}>
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-gray-600'}`} />
              </div>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-gray-500">Good morning</p>
                <p className="text-sm font-bold text-white">Welcome back, Alex 👋</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">14 Day Streak</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Total XP', value: '4,280', color: 'text-amber-400' },
                { label: 'Active Projects', value: '3', color: 'text-teal-400' },
                { label: 'Completed', value: '2', color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-2">
                  <p className="text-[8px] text-gray-500 mb-0.5">{s.label}</p>
                  <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Active project card */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-white">Today's Project Task</span>
                <span className="text-[8px] bg-teal-500/15 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded-full">In Progress</span>
              </div>
              <p className="text-[9px] text-gray-400 mb-2">Implement JWT Authentication Middleware</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: '65%' }}
                    transition={{ duration: 1.5, delay: 0.8 }} />
                </div>
                <span className="text-[9px] text-gray-500">65%</span>
              </div>
            </div>

            {/* Recommended projects */}
            <div>
              <p className="text-[9px] text-gray-500 mb-2 uppercase tracking-wider">Recommended Projects</p>
              <div className="space-y-1.5">
                {[
                  { title: 'E-Commerce REST API', diff: 'Intermediate', xp: 800, match: 96 },
                  { title: 'React Portfolio App', diff: 'Beginner', xp: 400, match: 91 },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-lg px-2.5 py-2">
                    <div>
                      <p className="text-[9px] font-semibold text-white leading-tight">{p.title}</p>
                      <p className="text-[8px] text-gray-500">{p.diff} · +{p.xp} XP</p>
                    </div>
                    <span className="text-[8px] text-emerald-400 font-bold">{p.match}% match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Chat Panel — matches ProjectWorkspace.tsx AI panel */}
          <div className="w-[130px] border-l border-white/[0.05] bg-[#060E19] flex flex-col">
            <div className="px-2.5 py-2.5 border-b border-white/[0.05] flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-teal-500/20 flex items-center justify-center">
                <Bot className="w-3 h-3 text-teal-400" />
              </div>
              <span className="text-[10px] font-semibold text-white">AI Guide</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-hidden">
              <div className="bg-white/[0.05] rounded-lg rounded-tl-none p-2">
                <p className="text-[9px] text-gray-300 leading-relaxed">Ready to tackle JWT? I have a skeleton ready.</p>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/10 rounded-lg rounded-tr-none p-2 ml-1">
                <p className="text-[9px] text-teal-300 leading-relaxed">Show me the middleware pattern.</p>
              </div>
              <div className="bg-white/[0.05] rounded-lg rounded-tl-none p-2">
                <p className="text-[9px] text-gray-300 leading-relaxed">Here's what you'll build step-by-step...</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        className="absolute -top-4 -right-4 z-20 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xl"
        animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-800 leading-tight">Milestone Unlocked</p>
          <p className="text-[9px] text-slate-400">Frontend Basics — Complete</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 z-20 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xl"
        animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-800 leading-tight">+150 XP Earned</p>
          <p className="text-[9px] text-slate-400">Task completed</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── How It Works Steps (real flow from actual code) ──────────── */
const steps = [
  {
    num: '01',
    icon: Upload,
    title: 'Sign Up & Set Your Goal',
    subtitle: 'Takes 2 minutes',
    desc: 'Create your free account, pick your target tech role (Frontend, Backend, Full-Stack, DevOps, Data Analyst, and more), select your experience level (Beginner / Intermediate / Advanced), and your country. Optionally upload your resume (PDF or DOCX) so the AI has full context about your background.',
    points: [
      'Dozens of tech roles to choose from',
      'Upload resume (PDF or DOCX) for AI analysis',
      'Manually describe skills if no resume',
      'Country-specific role requirements factored in',
    ],
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'AI Analyses Your Skill Gap',
    subtitle: 'Instant analysis, no waiting',
    desc: 'FindStreak\'s AI (powered by OpenAI) reads your resume and background, maps your exact distance from the target role, and produces a detailed Role Analysis — identifying your strengths, gaps, and the fastest path to job-readiness. This is not a generic skill list. It is specific to your experience and your target role.',
    points: [
      'Gap analysis: your skills vs. role requirements',
      'Strengths identified — what you can skip',
      'Priority areas surfaced — what to focus on first',
      'Role Analysis readable in full, saved to your profile',
    ],
  },
  {
    num: '03',
    icon: GitBranch,
    title: 'Your Personal Roadmap is Built',
    subtitle: 'Phase-by-phase, node-by-node',
    desc: 'A phase-by-phase learning roadmap is generated and visualised as an interactive node tree. Each phase has topics, sub-topics, and technologies. Click any node to open an AI-generated study guide written specifically for your role and level. Your progress is synced in real-time via SSE.',
    points: [
      'Visual roadmap tree: phases → topics → subtopics',
      'AI study guide per topic — generated on demand',
      'Real-time progress synced across all devices (SSE)',
      'Manage multiple career paths with Career Workspaces',
    ],
  },
  {
    num: '04',
    icon: Code2,
    title: 'Build Real Projects Every Day',
    subtitle: 'Learn by doing — not by watching',
    desc: 'The Project Dashboard recommends projects matched to your role and current skill stage. Every project opens a Workspace with real modules and tasks — not homework. Complete module tasks (+20 XP each), finish a module (+100 XP), and get AI guidance at every step without receiving free answers. Your daily streak tracks consistency.',
    points: [
      'AI-recommended projects matched to your role',
      '+20 XP per task completed, +100 XP per module',
      'AI task guide: "View Guide" button on every single task',
      'AI chat available inside every project workspace',
    ],
  },
  {
    num: '05',
    icon: Target,
    title: 'Complete Daily Missions & Earn XP',
    subtitle: 'Streak system + Rewards Store',
    desc: 'Every day, Fresh Missions unlock across four categories: Learning, Project, Skill, and Community. Complete them to earn XP and keep your streak alive. The XP Rewards Store lets you spend earned XP on skill badges and rewards. Achievements come in four rarity tiers: Common, Rare, Epic, and Legendary.',
    points: [
      'Daily missions across 4 categories',
      'Streak tracked — missing a full day resets it',
      'XP Rewards Store: spend XP on skill badges',
      'Achievements: Common / Rare / Epic / Legendary tiers',
    ],
  },
  {
    num: '06',
    icon: Mic,
    title: 'Practice Interviews & Get Ready to Apply',
    subtitle: 'Voice-based AI interviewer',
    desc: 'The Interview Guide gives you role-specific technical and behavioural question sets to study. When you\'re ready, open the Real-Time Mock Interview. Answer questions by typing or using your microphone. The AI evaluates each answer with a score and detailed feedback, and shows you the ideal answer strategy after each question.',
    points: [
      'Interview Guide: role-specific Q&A sets to study',
      'Real-time Mock Interview: voice or type your answers',
      'AI score (0–100) + feedback on each answer',
      'Ideal answer strategy revealed after each question',
    ],
  },
  {
    num: '07',
    icon: Briefcase,
    title: 'Publish Your Portfolio & Get Hired',
    subtitle: 'Proof of real work, not certificates',
    desc: 'FindStreak\'s Portfolio Builder auto-reads your completed projects, skills, XP score, and streak data, then generates a recruiter-ready public portfolio. Choose from 5 premium themes: Minimalist Clean, Dark Mode Obsidian, Creative Modern, Executive Professional, and Glass Morphism. Share your public URL instantly.',
    points: [
      '5 premium portfolio themes to choose from',
      'AI-generated professional bio from your role & projects',
      'Public URL: findstreak.com/portfolio/username',
      'Shareable on LinkedIn, GitHub, and job applications',
    ],
  },
];

/* ─── Feature Tabs ───────────────────────────────────────────── */
const featureTabs = [
  {
    id: 'roadmap', label: 'AI Roadmap', icon: GitBranch,
    title: 'A learning path built around you — not a generic playlist',
    desc: 'After your role analysis, FindStreak generates an interactive node-tree roadmap specific to your role, country, and experience level. Each phase has topics, sub-topics, and AI study guides generated on demand.',
    points: ['Role, country, and level specific', 'Visual node tree — phases → topics', 'AI study guide per topic (generated on click)', 'Real-time progress sync via SSE'],
  },
  {
    id: 'workspace', label: 'Project Workspace', icon: Code2,
    title: 'Real project modules. Real tasks. Real XP.',
    desc: 'Every project is a workspace with module-by-module task checklists synced to the database. +20 XP per task, +100 XP per module. The AI assistant is context-aware — it knows which task you\'re working on.',
    points: ['Module-by-module checklist, DB-synced', '+20 XP per task · +100 XP per module', 'AI chat aware of current task and project', 'AI-generated View Guide for every task'],
  },
  {
    id: 'missions', label: 'Daily Missions', icon: Target,
    title: 'Daily habits that build a career',
    desc: 'Fresh missions unlock every day across Learning, Project, Skill, and Community categories. Complete them to earn XP, maintain your streak, and unlock rewards from the Rewards Store.',
    points: ['4 mission categories: Learning, Project, Skill, Community', 'Streak resets if you miss a full day', 'XP Rewards Store: trade XP for skill badges', 'Achievements: Common / Rare / Epic / Legendary'],
  },
  {
    id: 'interview', label: 'Mock Interview', icon: Mic,
    title: 'Practice with an AI that thinks like a senior engineer',
    desc: 'Study role-specific interview Q&A sets in the Interview Guide. Then open the Real-Time Mock Interview — answer by voice or text, get a score (0–100), detailed feedback, and the ideal answer strategy after each question.',
    points: ['Voice or text answers — your choice', 'AI score (0–100) on every answer', 'Detailed feedback + ideal answer revealed', 'Role-specific technical & behavioural Q sets'],
  },
  {
    id: 'portfolio', label: 'Portfolio Builder', icon: Briefcase,
    title: 'Proof of work — auto-generated from your projects',
    desc: 'The Portfolio Builder reads your completed projects, skills, XP, and streak data to build a recruiter-ready portfolio. Pick from 5 premium themes and share your public URL directly with employers.',
    points: ['5 premium themes: Minimalist, Dark, Creative, Executive, Glass', 'AI-generated bio from your role and projects', 'Public URL: findstreak.com/portfolio/your-name', 'Shareable on LinkedIn and job applications'],
  },
];

/* ─── FAQ ─────────────────────────────────────────────────────── */
const faqs = [
  { q: 'Do I need prior coding experience?', a: 'No. During onboarding you pick your experience level — Beginner, Intermediate, or Advanced. If you select Beginner, the roadmap and daily tasks start from the fundamentals. The AI adjusts everything to where you actually are.' },
  { q: 'How is this different from Udemy or YouTube?', a: 'Tutorials teach concepts passively. FindStreak makes you build real projects every day, guided by an AI that nudges you without giving away answers. You finish with a portfolio of verified work — not a completion certificate.' },
  { q: 'What tech roles can I target?', a: 'Frontend Developer, Backend Developer, Full-Stack Developer, DevOps Engineer, Data Analyst, and more. Each role has its own roadmap, project types, and interview Q&A sets.' },
  { q: 'How does the streak system work?', a: 'Complete at least one task or mission each day and your streak counter increases. Missing a full day breaks the streak. It is designed to build real daily consistency — the single biggest predictor of career progress.' },
  { q: 'What is the XP Rewards Store?', a: 'As you complete tasks, modules, and missions, you earn XP. The Rewards Store lets you spend that XP on skill badges and other rewards that show up on your profile and portfolio.' },
  { q: 'How does the Portfolio Builder work?', a: 'The Portfolio Builder automatically reads your completed projects, earned skills, XP score, and streak data from your account. You pick one of 5 premium themes, write or generate a bio with AI, then publish your public portfolio URL to share with employers.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? 'border-teal-300' : 'border-slate-200'}`}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-teal-600' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Personas ─────────────────────────────────────────────────── */
const personas = [
  {
    emoji: '🌱', title: 'Complete Beginner',
    bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-700',
    desc: "You want to break into tech but don't know what to learn or where to start.",
    points: ['AI picks your starting point for you', 'No experience needed to begin', 'Daily tasks grow with your skill level', 'Streak keeps you consistent every day'],
  },
  {
    emoji: '🔄', title: 'Career Switcher',
    bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-700',
    desc: "You're switching from a different field and need to get job-ready as fast as possible.",
    points: ['Resume analysis finds your transferable skills', 'Roadmap skips what you already know', 'Real projects prove your capability to employers', 'Portfolio shows real work — not just course completions'],
  },
  {
    emoji: '⚡', title: 'Self-Taught Dev',
    bg: 'bg-violet-50', border: 'border-violet-200', accent: 'text-violet-700',
    desc: 'You know some coding but feel stuck in tutorial hell and need structure to break through.',
    points: ['Stop watching — start building real projects', 'Gap analysis shows exactly what is missing', 'Mock interviews prepare you for real hiring conversations', 'Portfolio converts learning into shareable proof of work'],
  },
];

/* ─── Main ─────────────────────────────────────────────────────── */
export default function LandingHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roadmap');
  const activeFeature = featureTabs.find(f => f.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
            <motion.div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0" initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 mb-6">
                  <Radio className="w-3 h-3 text-teal-500 animate-pulse" />
                  <span className="text-teal-700 text-[11px] font-semibold uppercase tracking-widest">Real-time AI Career Platform</span>
                </div>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.06] tracking-tight mb-6 text-slate-900">
                Stop Watching Tutorials.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Start Building a Career.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 leading-relaxed mb-4">
                FindStreak is an AI-powered career platform that turns self-learners into job-ready developers — through real projects, daily streaks, and personalised roadmaps.
              </motion.p>
              <motion.p variants={fadeUp} className="text-base text-slate-400 leading-relaxed mb-10">
                Upload your resume or describe your goal. FindStreak builds you a precise, role-specific learning plan — then holds you accountable every single day through streaks, XP, and daily missions.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => navigate('/signup')} className="group flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200">
                  Start Free — No Card Needed <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => navigate('/how-it-works')} className="group flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-[15px] font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                  See How It Works <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-8">
                {['No credit card required', 'Free plan forever', 'OpenAI-powered AI', 'SSE real-time sync'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-500" />{t}
                  </span>
                ))}
              </motion.div>
            </motion.div>
            <div className="flex-1 w-full"><DashboardMockup /></div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ─────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Sound familiar?</motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-black mb-10 leading-snug">
              "I've been learning for months but still can't build anything real or land an interview."
            </motion.h2>
            <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-6 text-sm">
              {[
                { icon: '😩', title: 'Tutorial Hell', desc: "You've watched hundreds of hours of content but freeze when someone says \"build something from scratch.\"" },
                { icon: '🗺️', title: 'No Direction', desc: "You don't know if you're learning the right things, in the right order, for the job you actually want." },
                { icon: '⏰', title: 'No Accountability', desc: 'You study for a week then real life gets in the way and you have not touched code in 3 weeks.' },
              ].map((p, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white/[0.05] border border-white/10 rounded-xl p-5 text-left">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <p className="font-bold text-white mb-2">{p.title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.p variants={fadeUp} className="mt-10 text-slate-400 text-sm">
              FindStreak was built specifically to eliminate all three of these problems.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ──────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>Who Is This For?</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              FindStreak works at{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">every stage</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto">Whether you're starting from zero or stuck mid-way, the AI calibrates to where you are right now.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {personas.map((p, i) => (
              <motion.div key={i} variants={fadeUp} className={`rounded-2xl border ${p.border} ${p.bg} p-6`}>
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className={`text-lg font-black mb-2 ${p.accent}`}>{p.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{p.desc}</p>
                <ul className="space-y-2.5">
                  {p.points.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />{b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>How It Works</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              From signup to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">job offer</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto">
              Every step in FindStreak maps to a real feature inside the platform. Nothing is vague.
            </motion.p>
          </motion.div>
          <div className="space-y-5">
            {steps.map((step, i) => (
              <motion.div key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
                className="grid md:grid-cols-[160px_1fr] gap-6 p-7 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all duration-300"
              >
                <motion.div variants={fadeUp} className="flex flex-col items-start gap-3">
                  <div className="text-5xl font-black text-slate-100 leading-none">{step.num}</div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-widest mb-1">{step.subtitle}</p>
                    <h3 className="text-lg font-black text-slate-900 leading-snug">{step.title}</h3>
                  </div>
                </motion.div>
                <motion.div variants={fadeUp}>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{step.desc}</p>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {step.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />{pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('/how-it-works')} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
              Full How It Works page <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FEATURE SHOWCASE ─────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>Platform Features</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              One platform.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Every tool you need.</span>
            </motion.h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {featureTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}>
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8 items-center bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 leading-snug">{activeFeature.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">{activeFeature.desc}</p>
              <ul className="space-y-3">
                {activeFeature.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />{pt}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className="mt-8 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 shadow-md hover:-translate-y-0.5 transition-all duration-200">
                Try {activeFeature.label} Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4">
                  <activeFeature.icon className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-slate-800 font-bold mb-2">{activeFeature.label}</p>
                <div className="mt-4 space-y-2">
                  {activeFeature.points.slice(0, 3).map((pt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 text-left">
                      <CheckCircle className="w-3 h-3 text-teal-500 flex-shrink-0" />{pt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>The Difference</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              FindStreak vs. learning alone
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl border border-red-100 bg-red-50">
              <h3 className="font-bold text-red-500 text-sm uppercase tracking-wide mb-5">Learning Alone (Old Way)</h3>
              <ul className="space-y-4">
                {[
                  'Watch a 10-hour course and retain 20% of it',
                  'Generic curriculum not matched to your target role',
                  'No feedback — you don\'t know if you\'re on the right track',
                  'Portfolio = a list of courses completed',
                  'Interview prep = reading a blog post the night before',
                  'Stop after 2 weeks when motivation fades',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-red-100 border border-red-200 text-red-500 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50">
              <h3 className="font-bold text-teal-700 text-sm uppercase tracking-wide mb-5">The FindStreak Way</h3>
              <ul className="space-y-4">
                {[
                  'Build a real project every day — skills stick because you use them',
                  'Roadmap tailored to YOUR role, country, and skill level',
                  'AI reviews every step and tells you exactly what to improve',
                  'Portfolio auto-built from completed, verified real projects',
                  'AI mock interviews scored 0–100 with ideal answer revealed',
                  'Daily streak + XP missions build unstoppable consistency',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL FEATURE GRID ──────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>Everything Included</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              20+ tools built into one career system
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { icon: FileText, label: 'Resume Parser (PDF/DOCX)', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: BrainCircuit, label: 'AI Role Analysis', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: GitBranch, label: 'Learning Roadmap (Node Tree)', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
              { icon: Code2, label: 'Project Workspace', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: BarChart3, label: 'Project Dashboard (SSE)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: FolderKanban, label: 'My Projects View', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
              { icon: Briefcase, label: 'Career Workspaces', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: Target, label: 'Daily Missions & Streaks', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: Trophy, label: 'Achievements (4 Rarities)', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
              { icon: Star, label: 'XP Rewards Store', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: Bot, label: 'AI Learning Assistant', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: BookOpen, label: 'Resources Hub', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: Mic, label: 'Real-time Mock Interview', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              { icon: MessageSquare, label: 'Interview Guide (Q&A Sets)', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: Briefcase, label: 'Portfolio Builder (5 Themes)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: Users, label: 'Public Career Profile', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
              { icon: TrendingUp, label: 'Tech Stack Guide', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: LayoutGrid, label: 'Tools & Utilities', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`group flex items-center gap-3 p-3.5 rounded-xl border ${f.border} bg-white hover:border-teal-200 hover:shadow-sm transition-all duration-200`}>
                <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>FAQ</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Frequently Asked Questions</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}><FAQItem q={faq.q} a={faq.a} /></motion.div>
            ))}
          </motion.div>
          <p className="text-center text-sm text-slate-400 mt-8">
            Still have questions?{' '}
            <button onClick={() => navigate('/contact')} className="text-teal-600 hover:text-teal-700 font-medium">Contact us →</button>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6">
              <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 shadow-xl shadow-teal-500/30 mb-6">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-5 text-slate-900">
              Your next tech job starts{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">today.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
              Upload your resume, get your AI roadmap, and complete your first project task — all in under 10 minutes. Free plan, no card required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/signup')} className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200">
                Start Free Plan <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => navigate('/how-it-works')} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                <Clock className="w-4 h-4" /> See the Full Journey
              </button>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-xs text-slate-400">No credit card required · Free plan forever · Cancel anytime</motion.p>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
