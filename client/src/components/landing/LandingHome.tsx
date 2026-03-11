import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  ArrowRight, CheckCircle, Code2,
  MessageSquare, BrainCircuit, Sparkles, Map,
  Wrench, Terminal, GitBranch, Trophy, Zap,
  Shield, ChevronRight
} from 'lucide-react';

const stats = [
  { value: '25+', label: 'Career Tools', icon: <Wrench className="w-4 h-4" /> },
  { value: 'AI', label: 'Powered Analysis', icon: <BrainCircuit className="w-4 h-4" /> },
  { value: '100%', label: 'Free to Start', icon: <Shield className="w-4 h-4" /> },
  { value: '∞', label: 'Learning Paths', icon: <GitBranch className="w-4 h-4" /> },
];

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'AI Skill Gap Analysis',
    desc: 'Upload your resume. AI tells you exactly what is missing for your target role — prioritised and actionable.',
    tag: 'Career Planning',
    color: 'teal',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Personalised Roadmap',
    desc: 'A custom learning path that skips what you already know and focuses only on what you actually need.',
    tag: 'Learning',
    color: 'emerald',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Real Project Workspace',
    desc: 'Every project has a full curriculum with daily tasks, milestones and guided steps built for your level.',
    tag: 'Projects',
    color: 'teal',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Mock Interview AI',
    desc: 'Simulate real interviews under pressure. Get evaluated answers and a full performance report at the end.',
    tag: 'Interview Prep',
    color: 'emerald',
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'Tech Stack Generator',
    desc: 'AI tells you every tool, language and framework you need — ranked by importance for your specific role.',
    tag: 'Tech Stack',
    color: 'teal',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'XP & Streak System',
    desc: 'Track real progress with XP, streaks, daily missions and achievement badges — not vanity certificates.',
    tag: 'Motivation',
    color: 'emerald',
  },
];

const steps = [
  {
    num: '01',
    title: 'Upload Resume & Choose Role',
    desc: 'FindStreak reads your current skills and compares them against what companies are actually hiring for.',
  },
  {
    num: '02',
    title: 'Get Your Personal Skill Gap Report',
    desc: 'See exactly what you know, what is missing, and what to learn next — in priority order.',
  },
  {
    num: '03',
    title: 'Build a Structured Real Project',
    desc: 'Not a tutorial to watch. A real project with daily tasks, milestones and guided steps at your level.',
  },
  {
    num: '04',
    title: 'Practice Interviews & Track Growth',
    desc: 'AI mock interviews with feedback. XP and streaks keep you consistent and progressing every day.',
  },
];

const comparison = {
  without: [
    'Watch tutorials with nothing real to show recruiters',
    'Guess what skills employers actually want',
    'Apply with no concrete portfolio or proof of work',
    'Fail interviews because practice was unstructured',
    'Lose motivation after a few days with no direction',
  ],
  with: [
    'Build real guided projects starting from day one',
    'Know exactly which skills to learn and in what order',
    'Walk into interviews with a real portfolio of work',
    'Practice with AI feedback on specific role questions',
    'Stay consistent with daily tasks and streak tracking',
  ],
};

export default function LandingHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white font-sans antialiased">
      <LandingHeader />

      {/* ── HERO ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 px-4 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-teal-900/60 via-teal-950/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/30 rounded-full blur-3xl" />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(to right, #14b8a6 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950 border border-teal-800/60 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-8 shadow-lg shadow-teal-950/50">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            AI-Powered Career Acceleration Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Stop Watching Tutorials.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300">
              Start Building Real
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300">
              Projects.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FindStreak analyses your skills, pinpoints your exact gaps, and gives you a
            real hands-on project to build today. Every step is guided by AI and
            tailored to your target career role.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <button
              onClick={() => navigate('/signup')}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-base rounded-xl shadow-xl shadow-teal-900/50 hover:shadow-teal-700/60 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Learning for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-700/60 text-slate-300 hover:text-white font-bold text-base rounded-xl transition-all duration-200"
            >
              See How It Works
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-5">
            {['No credit card required', 'Free to start', 'Project-based learning from day one'].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/5">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center py-4 gap-1">
              <div className="flex items-center gap-2 text-teal-400 mb-1">{s.icon}</div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">The Process</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-white">
              Exactly What Happens<br />When You Join
            </h2>
            <p className="text-slate-500 text-base mt-4 max-w-xl mx-auto">
              No fluff. A clear guided path from where you are now to where you need to be.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-teal-800 to-transparent" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={s.num} className="relative group">
                  <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-teal-800/60 rounded-2xl p-6 transition-all duration-300 h-full">
                    <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800/50 flex items-center justify-center text-teal-400 font-black text-sm mb-5 group-hover:bg-teal-900 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-bold text-white text-sm leading-snug mb-2">{s.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold text-sm transition-colors"
            >
              See the full step-by-step breakdown <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-white">
              Every Tool You Need.<br />Nothing You Don't.
            </h2>
            <p className="text-slate-500 text-base mt-4 max-w-2xl mx-auto">
              FindStreak covers every stage of the developer journey. From skill gap to hired — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-teal-800/50 rounded-2xl p-6 transition-all duration-300 overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/0 group-hover:from-teal-900/20 to-transparent transition-all duration-300 rounded-2xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-teal-950 border border-teal-800/50 group-hover:bg-teal-900 text-teal-400 flex items-center justify-center transition-colors">
                      {f.icon}
                    </div>
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-950/80 border border-teal-800/40 px-2 py-1 rounded-full uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-2 leading-snug">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* All tools CTA */}
          <div className="mt-10 text-center">
            <div className="inline-flex flex-wrap justify-center gap-2 mb-6">
              {[
                'Career Workspaces', 'Visual Roadmap Tree', 'Topic Deep-Dive Guides',
                'Live Project Dashboard', 'Daily Mission System', 'AI Resources Hub',
                'AI Learning Assistant', 'Workflow Lifecycle Tools', 'Achievements & Badges',
                'Quiz & Learning Games', 'Public Developer Profile', 'Role Analysis Report',
              ].map(tag => (
                <span key={tag} className="text-xs text-slate-500 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Why FindStreak</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-white">
              Recruiters Hire People<br />Who Have Built Things
            </h2>
            <p className="text-slate-500 text-base mt-4 max-w-xl mx-auto">
              Watching a course gives you a certificate. Building a project gives you something to show.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Without */}
            <div className="rounded-2xl border border-red-900/40 bg-red-950/10 p-7">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="font-black text-sm uppercase tracking-widest text-red-400">Without FindStreak</p>
              </div>
              <div className="space-y-3.5">
                {comparison.without.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-red-500/70 font-bold text-lg leading-none flex-shrink-0 mt-0.5">✕</span>
                    <p className="text-sm text-slate-400">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="rounded-2xl border border-teal-800/50 bg-teal-950/20 p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <p className="font-black text-sm uppercase tracking-widest text-teal-400">With FindStreak</p>
              </div>
              <div className="space-y-3.5">
                {comparison.with.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-teal-400 font-bold text-lg leading-none flex-shrink-0 mt-0.5">✓</span>
                    <p className="text-sm text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-base rounded-xl shadow-xl shadow-teal-900/50 transition-all duration-200"
            >
              Start Building Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-radial from-teal-900/30 to-transparent blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-teal-950 border border-teal-800/50 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-7 h-7 text-teal-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
              Ready to Build Your<br />First Project?
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Create your free account, upload your resume, and FindStreak will show you
              exactly where to start — no guesswork, no wasted time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-base rounded-xl shadow-xl shadow-teal-900/50 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/signin')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-700/60 text-slate-300 hover:text-white font-bold text-base rounded-xl transition-all duration-200"
              >
                Login to My Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
