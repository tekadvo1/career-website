import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  ArrowRight, CheckCircle, Code2,
  MessageSquare, BrainCircuit, Sparkles, Map,
  Wrench, Terminal, GitBranch, Trophy,
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
    color: 'indigo',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Personalised Roadmap',
    desc: 'A custom learning path that skips what you already know and focuses only on what you actually need.',
    tag: 'Learning',
    color: 'blue',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Real Project Workspace',
    desc: 'Every project has a full curriculum with daily tasks, milestones and guided steps built for your level.',
    tag: 'Projects',
    color: 'indigo',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Mock Interview AI',
    desc: 'Simulate real interviews under pressure. Get evaluated answers and a full performance report at the end.',
    tag: 'Interview Prep',
    color: 'blue',
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'Tech Stack Generator',
    desc: 'AI tells you every tool, language and framework you need — ranked by importance for your specific role.',
    tag: 'Tech Stack',
    color: 'indigo',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'XP & Streak System',
    desc: 'Track real progress with XP, streaks, daily missions and achievement badges — not vanity certificates.',
    tag: 'Motivation',
    color: 'blue',
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* ── HERO ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 px-4 overflow-hidden bg-white">
        {/* Background mesh - subtle & clean */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-indigo-100 via-blue-50/50 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60" />
          {/* Grid lines - very faint */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            AI-Powered Career Acceleration Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-slate-900">
            Stop Watching Tutorials.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
              Start Building Real
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
              Projects.
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            FindStreak analyses your skills, pinpoints your exact gaps, and gives you a
            real hands-on project to build today. Every step is guided by AI and
            tailored to your target career role.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <button
              onClick={() => navigate('/signup')}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Learning for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-base rounded-xl shadow-sm transition-all duration-200"
            >
              See How It Works
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-5">
            {['No credit card required', 'Free to start', 'Project-based learning from day one'].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center py-4 gap-1">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">{s.icon}</div>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">The Process</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">
              Exactly What Happens<br />When You Join
            </h2>
            <p className="text-slate-600 text-base mt-4 max-w-xl mx-auto">
              No fluff. A clear guided path from where you are now to where you need to be.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={s.num} className="relative group">
                  <div className="bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300 h-full relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2">{s.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors py-2 px-4 rounded-full bg-indigo-50 hover:bg-indigo-100"
            >
              See the full step-by-step breakdown <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">
              Every Tool You Need.<br />Nothing You Don't.
            </h2>
            <p className="text-slate-600 text-base mt-4 max-w-2xl mx-auto">
              FindStreak covers every stage of the developer journey. From skill gap to hired — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Subtle highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 group-hover:from-indigo-50/50 to-transparent transition-all duration-300 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {f.icon}
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* All tools CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
              {[
                'Career Workspaces', 'Visual Roadmap Tree', 'Topic Deep-Dive Guides',
                'Live Project Dashboard', 'Daily Mission System', 'AI Resources Hub',
                'AI Learning Assistant', 'Workflow Lifecycle Tools', 'Achievements & Badges',
                'Quiz & Learning Games', 'Public Developer Profile', 'Role Analysis Report',
              ].map(tag => (
                <span key={tag} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 shadow-sm px-3.5 py-1.5 rounded-full">
                   {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Why FindStreak</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">
              Recruiters Hire People<br />Who Have Built Things
            </h2>
            <p className="text-slate-600 text-base mt-4 max-w-xl mx-auto">
              Watching a course gives you a certificate. Building a project gives you something to show.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Without */}
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
              <div className="flex items-center gap-2.5 mb-8 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <p className="font-black text-sm uppercase tracking-widest text-slate-900">Without FindStreak</p>
              </div>
              <div className="space-y-4 relative z-10">
                {comparison.without.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-lg leading-none flex-shrink-0 mt-0.5">✕</span>
                    <p className="text-sm font-medium text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8 shadow-md relative overflow-hidden transform md:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-80" />
              <div className="flex items-center gap-2.5 mb-8 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                <p className="font-black text-sm uppercase tracking-widest text-indigo-700">With FindStreak</p>
              </div>
              <div className="space-y-4 relative z-10">
                {comparison.with.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold text-lg leading-none flex-shrink-0 mt-0.5">✓</span>
                    <p className="text-sm font-semibold text-slate-800">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200"
            >
              Start Building Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white border-t border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 opacity-50" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white border border-indigo-100 shadow-md rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Ready to Build Your<br />First Project?
          </h2>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Create your free account, upload your resume, and FindStreak will show you
            exactly where to start — no guesswork, no wasted time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200"
            >
               Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-base rounded-xl shadow-sm transition-all duration-200"
            >
              Login to My Account
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
