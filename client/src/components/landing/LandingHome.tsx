import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, BrainCircuit, Code2, Target, MessageSquare,
  Briefcase, CheckCircle, BookOpen, BarChart3, FolderKanban,
  TrendingUp, Sparkles, ChevronRight, Trophy, Mic,
  Radio, GitBranch, Star, Shield, Clock, Users
} from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
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

/* ─── Dashboard Mockup ──────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[620px] mx-auto lg:mx-0">
      <div className="absolute inset-0 bg-teal-400/10 blur-[80px] rounded-full scale-75" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 rounded-2xl overflow-hidden border border-slate-200 bg-[#0A1520] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 h-9 bg-[#0C1A2E] border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 w-44 h-5 rounded bg-white/[0.04] border border-white/[0.05] px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-gray-500">findstreak.com/dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex h-[320px]">
          {/* Sidebar */}
          <div className="w-12 border-r border-white/[0.05] bg-[#060E19] flex flex-col items-center py-3 gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mb-1">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            {[BarChart3, Target, FolderKanban, BrainCircuit, BookOpen].map((Icon, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-teal-500/20 text-teal-400' : 'text-gray-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500">Good morning</p>
                <p className="text-sm font-bold text-white">Welcome back, Alex 👋</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">14 Day Streak 🔥</span>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white">Today's Project Task</span>
                <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-medium">In Progress</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-2.5">Implement JWT Authentication Middleware</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1.5, delay: 0.8 }} />
                </div>
                <span className="text-[10px] text-gray-500">65%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <p className="text-[9px] text-gray-500 mb-1">XP Earned Today</p>
                <p className="text-lg font-bold text-white">+340</p>
                <p className="text-[9px] text-amber-400 flex items-center gap-0.5 mt-0.5"><Trophy className="w-2.5 h-2.5" /> Level 6</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <p className="text-[9px] text-gray-500 mb-1">Projects Built</p>
                <p className="text-lg font-bold text-white">7</p>
                <p className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><CheckCircle className="w-2.5 h-2.5" /> 2 completed</p>
              </div>
            </div>
          </div>

          {/* AI Chat */}
          <div className="w-44 border-l border-white/[0.05] bg-[#060E19] flex flex-col">
            <div className="px-3 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-teal-500/20 flex items-center justify-center">
                <BrainCircuit className="w-3 h-3 text-teal-400" />
              </div>
              <span className="text-[11px] font-semibold text-white">AI Guide</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex-1 p-2.5 space-y-2 overflow-hidden">
              <div className="bg-white/[0.04] rounded-lg rounded-tl-none p-2 max-w-[90%]">
                <p className="text-[9px] text-gray-300 leading-relaxed">Ready to tackle JWT? I have a skeleton ready.</p>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/10 rounded-lg rounded-tr-none p-2 max-w-[90%] ml-auto">
                <p className="text-[9px] text-teal-300 leading-relaxed">Show me the middleware pattern.</p>
              </div>
              <div className="bg-white/[0.04] rounded-lg rounded-tl-none p-2 max-w-[90%]">
                <p className="text-[9px] text-gray-300 leading-relaxed">Here's what you'll build step-by-step...</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        className="absolute -top-4 -right-4 z-20 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
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

/* ─── Feature Tabs ──────────────────────────────────── */
const featureTabs = [
  {
    id: 'roadmap', label: 'AI Roadmap', icon: GitBranch,
    title: 'Your exact path — not a generic one',
    desc: 'After analysing your resume or background, FindStreak generates a phase-by-phase roadmap tailored to your role, country, and experience level. Each phase has topics, subtopics, AI study guides, and milestone projects.',
    points: ['Role + country + experience level specific', 'Visual roadmap.sh-style node tree', 'Per-topic AI study guides generated instantly', 'Progress synced live across all devices via SSE'],
    preview: (
      <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-hidden border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Personalized Path · LIVE</span>
        </div>
        {['Foundations', 'Core Frameworks & APIs', 'System Design & Scale'].map((phase, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-emerald-500 border-emerald-400' : i === 1 ? 'bg-teal-500/20 border-teal-400' : 'bg-white/[0.03] border-white/10'}`}>
              {i === 0 && <CheckCircle className="w-2.5 h-2.5 text-white" />}
              {i !== 0 && <span className="text-[8px] text-gray-500 font-bold">{i + 1}</span>}
            </div>
            <div className="flex-1">
              <div className={`text-[11px] font-semibold mb-1 ${i === 0 ? 'text-emerald-300' : i === 1 ? 'text-white' : 'text-gray-600'}`}>{phase}</div>
              {i === 1 && <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden"><div className="h-full w-[40%] bg-teal-500 rounded-full" /></div>}
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${i === 0 ? 'bg-emerald-500/10 text-emerald-400' : i === 1 ? 'bg-teal-500/10 text-teal-400' : 'bg-white/[0.03] text-gray-600'}`}>{i === 0 ? 'Done' : i === 1 ? '40%' : 'Locked'}</span>
          </div>
        ))}
        <div className="mt-3 flex gap-2">
          {['React', 'Node.js', 'PostgreSQL', 'Docker'].map((t, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/10 text-teal-400 font-medium">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'workspace', label: 'Project Workspace', icon: Code2,
    title: 'Build real projects. Not fake exercises.',
    desc: 'Every project in FindStreak is a module-by-module guided workspace. You check off tasks as you complete them, earn XP per task (+20) and per module (+100), and the AI answers questions without giving you the answer directly.',
    points: ['Module-by-module task checklist synced to PostgreSQL', '+20 XP per task, +100 XP per module completed', 'AI assistant aware of your current task and project', 'AI-generated "View Guide" for every single task'],
    preview: (
      <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-hidden border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-white">Module 2: REST API Design</span>
          <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">3/5 tasks</span>
        </div>
        {[
          { text: 'Set up Express router structure', done: true },
          { text: 'Implement CRUD endpoints for /users', done: true },
          { text: 'Add JWT middleware validation', done: true },
          { text: 'Write integration tests with Jest', done: false },
          { text: 'Document API with Swagger', done: false },
        ].map((task, i) => (
          <div key={i} className={`flex items-center gap-2 py-1 ${i >= 3 ? 'opacity-50' : ''}`}>
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-400' : 'border-gray-600'}`}>
              {task.done && <CheckCircle className="w-2 h-2 text-white" />}
            </div>
            <span className={`text-[10px] ${task.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'missions', label: 'Daily Missions & XP', icon: Target,
    title: 'Streaks that actually build habits',
    desc: 'Every day you get fresh missions across learning, project, skill, and community categories. Complete them to earn XP, maintain your streak, and unlock rewards. Missing a day breaks your streak — real accountability.',
    points: ['Daily missions across 4 categories', 'Streak tracked daily in PostgreSQL', 'XP Rewards Store: spend XP on certifications & badges', 'Achievements with Common / Rare / Epic / Legendary rarities'],
    preview: (
      <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-hidden border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-bold text-white">Mission Center</span>
          <span className="ml-auto text-[10px] font-bold text-amber-400">🔥 14 Day Streak</span>
        </div>
        {[
          { label: 'Complete 2 tasks in workspace', xp: '+50 XP', done: true },
          { label: 'Study 1 roadmap topic', xp: '+30 XP', done: true },
          { label: 'Take the daily quiz', xp: '+40 XP', done: false },
        ].map((m, i) => (
          <div key={i} className={`flex items-center gap-2 p-2 rounded-lg mb-1.5 border ${m.done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/[0.05] bg-white/[0.02]'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-emerald-500 border-emerald-400' : 'border-gray-600'}`}>
              {m.done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
            </div>
            <p className={`text-[10px] font-medium flex-1 truncate ${m.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{m.label}</p>
            <span className={`text-[9px] font-bold flex-shrink-0 ${m.done ? 'text-emerald-400' : 'text-amber-400'}`}>{m.xp}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'interview', label: 'Mock Interview', icon: Mic,
    title: 'Practice with an AI that thinks like a senior engineer',
    desc: 'The Real-time Mock Interview uses AI to simulate actual technical and behavioural interviews. Speak your answer and the AI evaluates it in real-time. Plus, the Interview Guide generates role-specific Q&A sets for structured prep.',
    points: ['Voice-based AI mock interviews with real-time feedback', 'AI-generated role-specific technical & behavioural questions', 'Interview performance tracked and stored', 'Study mode: Q&A sets generated per role and level'],
    preview: (
      <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-hidden border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center">
            <Mic className="w-3 h-3 text-rose-400" />
          </div>
          <span className="text-[11px] font-bold text-white">AI Mock Interview</span>
          <div className="ml-auto flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
            <span className="text-[9px] text-rose-400 font-bold">LIVE</span>
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 mb-2 border border-white/[0.04]">
          <p className="text-[9px] text-gray-400 mb-1 font-medium">Interviewer:</p>
          <p className="text-[10px] text-gray-200 leading-relaxed">"Design a rate limiter for a REST API serving 10M requests/day."</p>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
          <div className="flex gap-0.5">
            {[3, 5, 4, 6, 3, 5, 4, 5].map((h, i) => (
              <div key={i} className="w-1 rounded-full bg-rose-400/60" style={{ height: `${h * 3}px` }} />
            ))}
          </div>
          <span className="text-[9px] text-rose-400 font-medium">Recording... 0:42</span>
        </div>
      </div>
    ),
  },
  {
    id: 'portfolio', label: 'Portfolio Builder', icon: Briefcase,
    title: 'Your proof of work, not proof of watching',
    desc: 'The Portfolio Builder auto-reads your completed projects, skills, and stats to generate a recruiter-ready portfolio. Choose from 5 premium themes and share your public URL instantly.',
    points: ['Auto-syncs completed projects and skills from workspace', '5 premium themes: Minimalist, Dark, Creative, Executive, Glass', 'AI-generated professional bio based on your role and projects', 'Public URL: findstreak.com/portfolio/your-username'],
    preview: (
      <div className="bg-white rounded-xl overflow-hidden h-48 border border-slate-200 shadow-sm">
        <div className="h-12 bg-gradient-to-r from-teal-600 to-emerald-600 relative">
          <div className="absolute -bottom-4 left-4 w-10 h-10 rounded-xl bg-white border-2 border-teal-200 shadow flex items-center justify-center">
            <span className="text-sm font-bold text-teal-600">A</span>
          </div>
        </div>
        <div className="pt-6 px-4 pb-3">
          <p className="text-[11px] font-bold text-slate-900">Alex Johnson</p>
          <p className="text-[9px] text-teal-600 font-semibold uppercase tracking-wide">Senior Frontend Developer</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {['React', 'TypeScript', 'Node.js', 'PostgreSQL'].map((s, i) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-teal-50 border border-teal-100 text-teal-700 font-medium">{s}</span>
            ))}
          </div>
          <div className="flex gap-4 mt-2.5">
            <div><p className="text-[12px] font-black text-slate-900">7</p><p className="text-[8px] text-slate-400">Projects</p></div>
            <div><p className="text-[12px] font-black text-slate-900">24</p><p className="text-[8px] text-slate-400">Skills</p></div>
            <div><p className="text-[12px] font-black text-emerald-600">✓ Verified</p><p className="text-[8px] text-slate-400">FindStreak</p></div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function LandingHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roadmap');
  const activeFeature = featureTabs.find(f => f.id === activeTab)!;

  const steps = [
    { num: '01', title: 'Upload Resume or Describe Your Role', desc: 'Drop your PDF/DOCX resume and FindStreak AI parses your skills, gaps, and suggests your ideal role. Or just type your target — Frontend Engineer, DevOps, Backend Dev.', icon: Target },
    { num: '02', title: 'Get Your AI-Generated Roadmap', desc: 'A precise, phase-by-phase roadmap is generated for your specific role, country, and experience level. Not a generic YouTube playlist — a structured career path.', icon: BrainCircuit },
    { num: '03', title: 'Build Real Projects Daily', desc: 'Open your Project Workspace. Check off daily tasks module by module. Earn XP, maintain your streak, and get AI guidance on every step.', icon: Code2 },
    { num: '04', title: 'Prove It and Get Hired', desc: 'Complete the Interview Guide, do live mock AI interviews, and auto-generate your portfolio from real completed projects. Share your verified profile with recruiters.', icon: Briefcase },
  ];

  const pricing = [
    { name: 'Free', price: '$0', period: 'forever', desc: 'Get started and see if FindStreak fits.', features: ['AI Skill Gap Analysis', '1 active project workspace', 'Basic learning roadmap', 'Daily missions (limited)', 'Community access'], cta: 'Start Free', highlighted: false },
    { name: 'Pro', price: '$29', period: '/month', desc: 'The full FindStreak experience for serious career growth.', features: ['Everything in Free', 'Unlimited project workspaces', 'Full AI Learning Assistant', 'Mock Interview Simulator', 'Portfolio Builder (all 5 themes)', 'Priority support', 'XP Rewards Store access'], cta: 'Start Pro Trial', highlighted: true },
    { name: 'Mentor', price: '$79', period: '/month', desc: 'Pro features plus 1-on-1 expert guidance.', features: ['Everything in Pro', '2× monthly expert code reviews', 'Career strategy sessions', 'Resume review', 'Direct mentor Slack access'], cta: 'Start Mentor', highlighted: false },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />

      {/* ── HERO ─────────────────────────────────────── */}
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
                From Skill Gap<br />to Hired — with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Real Projects</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-slate-500 leading-relaxed mb-10">
                FindStreak analyses your background, maps your gaps, and gives you an AI-guided daily plan built around real industry projects — not passive video courses. Build a streak, earn XP, and prove your skills with a verified portfolio.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => navigate('/signup')} className="group flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-[15px] font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200">
                  Start Free — No Card Needed <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => navigate('/how-it-works')} className="group flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-[15px] font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200">
                  See How It Works <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start mt-8">
                {['SSE Real-time Sync', 'OpenAI Powered', 'XP & Streak System', 'Free Plan Available'].map(t => (
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

      {/* ── SOCIAL PROOF BAR ────────────────────────── */}
      <section className="border-y border-slate-100 py-8 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '20+', label: 'Platform Features', icon: Sparkles },
              { value: 'SSE', label: 'Real-time Sync Engine', icon: Radio },
              { value: 'OpenAI', label: 'GPT-4 Powered', icon: BrainCircuit },
              { value: '5', label: 'Portfolio Themes', icon: Briefcase },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 group">
                <stat.icon className="w-5 h-5 text-teal-500 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FEATURE SHOWCASE ────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>Platform Features</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-slate-900">
              One platform.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Zero to hired.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto">Every feature is purpose-built for the journey from skill gap to your next tech job.</motion.p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {featureTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}>
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid md:grid-cols-2 gap-8 items-center bg-slate-50 border border-slate-200 rounded-2xl p-8">
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
              <button onClick={() => navigate('/signup')} className="mt-8 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md hover:-translate-y-0.5 transition-all duration-200">
                Try {activeFeature.label} Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div>{activeFeature.preview}</div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp}><SectionBadge>How It Works</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-slate-900">
              A structured system that actually{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">gets you hired</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto text-lg">Most people fail at self-learning because there's no structure. FindStreak replaces random learning with a proven daily progression system.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="relative group bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-md transition-all duration-300">
                <div className="text-4xl font-black text-slate-100 mb-4 leading-none">{step.num}</div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <step.icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-[15px] mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 z-10" />}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── THE DIFFERENCE ───────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp}><SectionBadge>The Difference</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-slate-900">
              Stop Watching. Start{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Building.</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid md:grid-cols-2 gap-5">
            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-red-100 bg-red-50">
              <h3 className="font-bold text-red-500 text-sm uppercase tracking-wide mb-5">The Old Way</h3>
              <ul className="space-y-4">
                {['Watch tutorial after tutorial, never building anything real', 'Learn generic skills that may not match your target role', 'No feedback on whether you are actually improving', 'Portfolio is just a list of courses watched', 'Practice interview questions with no real context', 'No accountability — you quit after 3 days'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-red-100 border border-red-200 text-red-500 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">✕</span>{item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-teal-200 bg-teal-50">
              <h3 className="font-bold text-teal-700 text-sm uppercase tracking-wide mb-5">The FindStreak Way</h3>
              <ul className="space-y-4">
                {['Build real industry-style projects with AI guiding every task', 'Roadmap tailored to YOUR role, country, and skill level', 'Daily AI feedback and XP shows exactly where you stand', 'Portfolio auto-built from verified completed real work', 'AI Mock Interview that mirrors actual job interviews', 'Streak system + daily missions create unstoppable momentum'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FULL FEATURE GRID ─────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>Full Platform</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-slate-900">
              20+ tools in one{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">career system</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { icon: BrainCircuit, label: 'AI Role Analysis', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: Target, label: 'Resume Analyzer', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: GitBranch, label: 'Learning Roadmap', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
              { icon: Code2, label: 'Project Workspace', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: Zap, label: 'Daily Missions & XP', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: Trophy, label: 'Achievements (4 rarities)', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
              { icon: MessageSquare, label: 'AI Learning Assistant', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: BookOpen, label: 'Resources Hub', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: Mic, label: 'Real-time Mock Interview', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              { icon: BarChart3, label: 'Interview Guide', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: Briefcase, label: 'Portfolio Builder (5 themes)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: Users, label: 'Public Career Profile', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
              { icon: Star, label: 'XP Rewards Store', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { icon: FolderKanban, label: 'Career Workspaces', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
              { icon: TrendingUp, label: 'Tech Stack Guide', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { icon: Shield, label: 'Verified Skill Badges', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} className={`group flex items-center gap-3 p-3.5 rounded-xl border ${f.border} bg-white hover:border-teal-200 hover:shadow-sm transition-all duration-200 cursor-default`}>
                <div className={`w-8 h-8 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-14">
            <motion.div variants={fadeUp}><SectionBadge>Pricing</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-slate-900">Simple, Transparent Pricing</motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-lg mx-auto">Start free and upgrade when you're ready for the full experience.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div key={i} variants={fadeUp} className={`relative flex flex-col rounded-2xl p-7 border transition-all ${plan.highlighted ? 'border-teal-300 bg-teal-50 shadow-xl shadow-teal-500/10' : 'border-slate-200 bg-white hover:shadow-md'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-[10px] font-bold text-white uppercase tracking-wide shadow-md">Most Popular</div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/signup')} className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${plan.highlighted ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md hover:-translate-y-0.5' : 'border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6">
              <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 shadow-xl shadow-teal-500/30 mb-6">
                <Zap className="w-8 h-8 text-white fill-white" />
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-5 text-slate-900">
              Ready to Build Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Tech Career?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
              Start with a free plan today. Upload your resume, get your AI-generated roadmap, and start building real projects in under 5 minutes.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/signup')} className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200">
                Start Free Plan <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => navigate('/how-it-works')} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200">
                <Clock className="w-4 h-4" /> See the Full Journey
              </button>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-xs text-slate-400">No credit card required · Free plan forever · Cancel Pro anytime</motion.p>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
