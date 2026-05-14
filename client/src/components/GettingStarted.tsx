import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
  Rocket, Map, Sparkles, FolderKanban, Target, Trophy,
  Brain, Mic, BookOpen, Globe, ChevronRight, CheckCircle,
  ArrowRight, Zap, Star, Users, BarChart3, MessageSquare,
  Play, Layers, GitBranch, Search, GraduationCap, Medal,
  Briefcase, Code, LayoutGrid, Clock, TrendingUp
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface Step {
  number: number;
  phase: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  features: { icon: React.ReactNode; label: string; desc: string }[];
  cta: { label: string; route: string };
  tip: string;
}

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const steps: Step[] = [
  {
    number: 1,
    phase: 'START',
    title: 'Set Your Career Goal',
    description:
      'Tell FindStreak your target tech role (or upload your resume). The AI instantly reads your background and builds a personalized career plan — no guesswork.',
    icon: <Map className="w-6 h-6" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    features: [
      { icon: <Search className="w-4 h-4" />, label: 'Role Search', desc: 'Type your target job title (e.g. Full Stack Developer)' },
      { icon: <Sparkles className="w-4 h-4" />, label: 'Resume Upload', desc: 'Upload PDF/DOCX — AI auto-detects your skills and gaps' },
      { icon: <Globe className="w-4 h-4" />, label: 'Country Context', desc: 'Set your target market (USA, India, UK…) for localised advice' },
    ],
    cta: { label: 'Start Onboarding', route: '/onboarding' },
    tip: '💡 You can always re-run this from Tools → Start New Journey to change your role at any time.',
  },
  {
    number: 2,
    phase: 'UNDERSTAND',
    title: 'Get Your AI Role Analysis',
    description:
      'The AI generates a full career roadmap for your role: skill gaps, market demand, salary ranges, and a learning priority list. This becomes the backbone of everything on the platform.',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    features: [
      { icon: <TrendingUp className="w-4 h-4" />, label: 'Skill Gap Analysis', desc: 'See exactly what skills you are missing for your target role' },
      { icon: <Map className="w-4 h-4" />, label: 'Learning Roadmap', desc: 'A prioritised phase-by-phase learning path' },
      { icon: <GitBranch className="w-4 h-4" />, label: 'Workflow Lifecycle', desc: 'See how real professionals in your role ship projects' },
    ],
    cta: { label: 'View Role Analysis', route: '/role-analysis' },
    tip: '💡 Re-run Role Analysis anytime to refresh your roadmap as you level up.',
  },
  {
    number: 3,
    phase: 'PLAN',
    title: 'Design Your Project with AI',
    description:
      'Use the AI Project Advisor to pick your exact tech stack and get a custom folder structure generated in seconds. You define what you want to build — the AI gives you a professional blueprint.',
    icon: <Layers className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    features: [
      { icon: <FolderKanban className="w-4 h-4" />, label: 'Project Structure Advisor', desc: 'Get an AI-generated folder structure for any stack' },
      { icon: <Code className="w-4 h-4" />, label: 'Stack Picker', desc: 'Choose your frameworks, databases, and deployment' },
      { icon: <Sparkles className="w-4 h-4" />, label: 'Custom Description', desc: 'Describe your idea — AI tailors the structure to it' },
    ],
    cta: { label: 'Open Project Advisor', route: '/tools' },
    tip: '💡 This is the most important step before you start coding — proper structure = faster development.',
  },
  {
    number: 4,
    phase: 'BUILD',
    title: 'Start Building in Your Workspace',
    description:
      'Pick an AI-recommended project from your Dashboard and start building. Each project comes with a full curriculum — modules, tasks, and estimated time — so you always know what to do next.',
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    features: [
      { icon: <Target className="w-4 h-4" />, label: 'Daily Task', desc: 'One task per session — never overwhelming, always progressing' },
      { icon: <BarChart3 className="w-4 h-4" />, label: 'Progress Tracking', desc: 'See % complete, XP earned, and modules done' },
      { icon: <Briefcase className="w-4 h-4" />, label: 'Multiple Workspaces', desc: 'Explore different career paths in parallel' },
    ],
    cta: { label: 'Go to Dashboard', route: '/dashboard' },
    tip: '💡 You can have multiple active projects — use workspaces to explore different career tracks simultaneously.',
  },
  {
    number: 5,
    phase: 'LEARN',
    title: 'Study with AI Tools',
    description:
      'While you build, use the AI Learning Assistant to ask questions, get explanations, and explore tech topics. Take quizzes to validate your knowledge. Read curated resources from top platforms.',
    icon: <Brain className="w-6 h-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    features: [
      { icon: <MessageSquare className="w-4 h-4" />, label: 'AI Chat Assistant', desc: 'Ask anything — code help, concept explanations, debugging' },
      { icon: <GraduationCap className="w-4 h-4" />, label: 'Quiz Game', desc: 'Test your knowledge on any tech topic with AI quizzes' },
      { icon: <BookOpen className="w-4 h-4" />, label: 'Resource Hub', desc: 'Curated free and paid courses, docs, and tutorials' },
    ],
    cta: { label: 'Open AI Assistant', route: '/ai-assistant' },
    tip: '💡 Chat sessions sync across your devices — start on laptop, continue on phone.',
  },
  {
    number: 6,
    phase: 'PRACTICE',
    title: 'Interview & Mock Practice',
    description:
      'Prepare for real job interviews with AI-generated question banks for your specific role. Practice with a Real-Time Mock Interview that uses your microphone and gives live feedback.',
    icon: <Mic className="w-6 h-6" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    features: [
      { icon: <MessageSquare className="w-4 h-4" />, label: 'Interview Guide', desc: 'AI-generated Q&A tailored to your exact role and level' },
      { icon: <Mic className="w-4 h-4" />, label: 'Real-Time Mock Interview', desc: 'Practice speaking answers aloud with live AI feedback' },
      { icon: <Sparkles className="w-4 h-4" />, label: 'Question Explanations', desc: 'Deep-dive explanations for each interview question' },
    ],
    cta: { label: 'Open Interview Guide', route: '/interview-guide' },
    tip: '💡 Do a mock interview after completing each project — it reinforces what you just built.',
  },
  {
    number: 7,
    phase: 'TRACK',
    title: 'Stay Consistent with Missions & Streaks',
    description:
      'Daily missions give you focused goals. Completing tasks earns XP and maintains your streak. Achievements unlock as you hit milestones. This is what keeps you moving forward every day.',
    icon: <Target className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    features: [
      { icon: <Zap className="w-4 h-4" />, label: 'Daily Missions', desc: 'Focused daily goals tied to your active project' },
      { icon: <Star className="w-4 h-4" />, label: 'XP & Streaks', desc: 'Earn XP for every task — maintain streaks to unlock bonuses' },
      { icon: <Medal className="w-4 h-4" />, label: 'Achievements', desc: '30+ badges you unlock by hitting career milestones' },
    ],
    cta: { label: 'View Missions', route: '/missions' },
    tip: '💡 You get a daily reminder email to keep your streak alive — enable it in Settings.',
  },
  {
    number: 8,
    phase: 'SHOWCASE',
    title: 'Build Your Portfolio & Share It',
    description:
      'Your completed projects automatically appear on your Portfolio page — a public, professional profile validated by FindStreak. Share it with recruiters and add it to your LinkedIn.',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    features: [
      { icon: <Users className="w-4 h-4" />, label: 'Public Portfolio', desc: 'findstreak.com/portfolio/yourusername — shareable link' },
      { icon: <Trophy className="w-4 h-4" />, label: 'FindStreak Validated', desc: 'Completed projects show a verified badge' },
      { icon: <Play className="w-4 h-4" />, label: 'Theme Selection', desc: 'Choose a visual style for your portfolio page' },
    ],
    cta: { label: 'View My Portfolio', route: '/portfolio' },
    tip: '💡 Enable "Public Profile" in Settings to make your portfolio discoverable.',
  },
];

/* ─── Quick-access feature cards ──────────────────────────────────────────── */
const quickFeatures = [
  { icon: <LayoutGrid className="w-5 h-5 text-emerald-600" />, label: 'Tools Hub', sub: 'All advanced tools in one place', route: '/tools', bg: 'bg-emerald-50' },
  { icon: <GitBranch className="w-5 h-5 text-orange-600" />, label: 'Workflow Lifecycle', sub: 'How professionals ship projects', route: '/workflow-lifecycle', bg: 'bg-orange-50' },
  { icon: <Code className="w-5 h-5 text-indigo-600" />, label: 'Tech Stack Explorer', sub: 'Trending technologies for your role', route: '/tech-stack', bg: 'bg-indigo-50' },
  { icon: <Clock className="w-5 h-5 text-rose-600" />, label: 'Learning Roadmap', sub: 'Phase-by-phase topic tracker', route: '/roadmap', bg: 'bg-rose-50' },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function GettingStarted() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
      <Sidebar activePage="getting-started" />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 relative overflow-hidden">
        {/* background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
            <Rocket className="w-3.5 h-3.5" /> Platform Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            How FindStreak Works
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Follow this 8-step workflow to go from zero to job-ready — with AI guiding you at every stage.
            Each step links directly to the tool you need.
          </p>

          {/* 8-step progress strip */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => {
                  setActiveStep(s.number);
                  document.getElementById(`step-${s.number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all group"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  {s.number}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-400">{s.phase}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Steps ────────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">

        {steps.map((step, idx) => {
          const isActive = activeStep === step.number;
          const isEven = idx % 2 === 0;
          return (
            <div
              id={`step-${step.number}`}
              key={step.number}
              onClick={() => setActiveStep(isActive ? null : step.number)}
              className={`group relative bg-white rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg ${
                isActive ? `${step.borderColor} shadow-lg` : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${step.bgColor.replace('bg-', 'bg-').replace('-50', '-400')} transition-all ${isActive ? 'w-1.5' : ''}`} />

              <div className={`flex flex-col md:flex-row gap-0 ${isEven ? '' : 'md:flex-row-reverse'}`}>

                {/* ── Left Panel: step info ── */}
                <div className="flex-1 p-5 md:p-7">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Step number + icon */}
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${step.bgColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${step.color}`}>
                      {step.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step.color} mb-0.5 block`}>
                        Step {step.number} — {step.phase}
                      </span>
                      <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-tight">
                        {step.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    {step.description}
                  </p>

                  {/* Tip box */}
                  <div className={`${step.bgColor} ${step.borderColor} border rounded-xl px-4 py-3 text-xs text-slate-600 leading-relaxed mb-5`}>
                    {step.tip}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(step.cta.route); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-sm ${step.bgColor.replace('bg-', 'bg-').replace('-50', '-500')} hover:${step.bgColor.replace('bg-', 'bg-').replace('-50', '-600')}`}
                    style={{ background: '' }}
                  >
                    <ArrowRight className="w-4 h-4" />
                    {step.cta.label}
                  </button>
                </div>

                {/* ── Right Panel: features (visible when expanded) ── */}
                <div className={`md:w-72 flex-shrink-0 border-t md:border-t-0 ${isEven ? 'md:border-l' : 'md:border-r'} border-slate-100 ${step.bgColor} p-5 md:p-6`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">What you get</p>
                  <div className="space-y-4">
                    {step.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm ${step.color}`}>
                          {f.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{f.label}</p>
                          <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step number watermark */}
              <div className={`absolute bottom-2 right-4 text-8xl font-black ${step.color} opacity-[0.04] pointer-events-none select-none`}>
                {step.number}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Access strip ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">More Tools to Explore</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickFeatures.map((f, i) => (
              <button
                key={i}
                onClick={() => navigate(f.route)}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl ${f.bg} border border-transparent hover:border-slate-200 transition-all hover:shadow-sm text-left group`}
              >
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{f.label}</p>
                  <p className="text-[10px] text-slate-500 leading-snug">{f.sub}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 self-end transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary banner ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl pointer-events-none" />
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-xl md:text-2xl font-black text-white mb-2">You Now Know the Full Flow</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Start at Step 1, follow the path, and you'll have real projects, real skills, and a real portfolio — ready to show any recruiter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/onboarding', { state: { force: true } })}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-all text-sm shadow-md"
            >
              <Rocket className="w-4 h-4" /> Start Step 1 Now
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm border border-white/10"
            >
              <BarChart3 className="w-4 h-4" /> Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
