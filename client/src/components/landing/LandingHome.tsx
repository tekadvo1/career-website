import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  ArrowRight, CheckCircle, Code2,
  MessageSquare, BrainCircuit, Sparkles, Map,
  Wrench, Terminal, Trophy,
  Shield, ChevronRight, Heart
} from 'lucide-react';

const stats = [
  { value: '50+', label: 'Tech Roles Supported', icon: <Wrench className="w-5 h-5" /> },
  { value: 'Custom', label: 'Learning Roadmaps', icon: <Map className="w-5 h-5" /> },
  { value: '100%', label: 'Free to Begin', icon: <Shield className="w-5 h-5" /> },
  { value: '24/7', label: 'AI Mentorship', icon: <BrainCircuit className="w-5 h-5" /> },
];

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'Intelligent Skill Analysis',
    desc: 'Simply upload your current resume. Our AI carefully reviews your background and gently highlights exactly which skills you need to reach your dream role.',
    tag: 'Career Planning',
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: 'Custom Learning Pathways',
    desc: 'No more guessing what to learn next. We generate a friendly, step-by-step roadmap tailored specifically to you, skipping the things you already know.',
    tag: 'Learning',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Hands-On Project Experience',
    desc: 'Learn by doing in a supportive environment. Every project is broken down into manageable daily tasks with detailed guidance so you never feel stuck.',
    tag: 'Projects',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Stress-Free Interview Practice',
    desc: 'Practice for your big day in a safe, simulated environment. Our AI provides kind, constructive feedback to help you build confidence before the real interview.',
    tag: 'Interview Prep',
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: 'Clear Technology Guides',
    desc: 'We demystify the tech stack by explaining exactly which tools, languages, and frameworks matter most for your goals, complete with easy setup guides.',
    tag: 'Tech Stack',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Encouraging Progress Tracking',
    desc: 'Celebrate your wins! Our system rewards your consistency with experience points, daily achievements, and streaks that make learning feel rewarding.',
    tag: 'Motivation',
  },
];

const steps = [
  {
    num: '01',
    title: 'Share Your Experience',
    desc: 'Upload your resume in seconds. We use this to understand your starting point so we never waste your time teaching you what you already know.',
  },
  {
    num: '02',
    title: 'Review Your Career Analysis',
    desc: 'Receive a clear, easy-to-read report showing how your current skills align with the live job market, and what to focus on next.',
  },
  {
    num: '03',
    title: 'Follow Your Guided Plan',
    desc: 'Start working through your personalised roadmap. Everything is structured logically so you always know exactly what to do each day.',
  },
  {
    num: '04',
    title: 'Build, Practice, and Succeed',
    desc: 'Create portfolio-worthy projects, practice with our AI mentor, and walk into your next interview with absolute confidence.',
  },
];

const comparison = {
  without: [
    'Feeling overwhelmed by endless tutorials and generic advice',
    'Uncertainty about which skills actually matter to employers',
    'Struggling to build a standout portfolio from scratch',
    'Experiencing anxiety before unpracticed technical interviews',
    'Losing motivation without a clear, structured daily plan',
  ],
  with: [
    'A clear, reassuring roadmap designed specifically for you',
    'Absolute certainty that you are learning industry-demanded skills',
    'A professional portfolio built through guided, hands-on projects',
    'Quiet confidence gained from simulated, risk-free interview practice',
    'Daily encouragement and a gamified system that makes progress fun',
  ],
};

export default function LandingHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* ── HERO ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-teal-100/80 via-emerald-50/50 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-50/80 rounded-full blur-3xl opacity-60" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <Heart className="w-4 h-4 text-teal-500" />
            Your Supportive Career Companion
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-slate-900">
            A Clear, Guided Path to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500">
              Your Next Career in Tech
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Feeling stuck or overwhelmed by what to learn next? FindStreak gently analyses your current background, removes the guesswork, and provides a friendly, day-by-day plan to help you build real projects and land your dream role.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <button
              onClick={() => navigate('/signup')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-base rounded-xl shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Free Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-base rounded-xl shadow-sm transition-all duration-200"
            >
              Learn How We Help
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            {['No credit card required', 'Welcoming to all backgrounds', 'Step-by-step supportive guidance'].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center py-2 gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 text-teal-600 mb-1">{s.icon}</div>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide text-center px-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">A Friendly Process</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">
              How FindStreak Supports You
            </h2>
            <p className="text-slate-600 text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              We have broken down the overwhelming process of career transition into simple, approachable steps. Here is how we guide you from day one.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => (
                <div key={s.num} className="relative group">
                  <div className="bg-white border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md rounded-2xl p-8 transition-all duration-300 h-full relative z-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-white shadow-sm flex items-center justify-center text-teal-600 font-black text-lg mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      {s.num}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3">{s.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-14">
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center gap-2 text-teal-700 font-bold text-sm transition-colors py-3 px-6 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-100 shadow-sm"
            >
              Read our full process breakdown <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">
              Tools Designed with Empathy
            </h2>
            <p className="text-slate-600 text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              We built our features not just to be smart, but to be truly helpful, encouraging, and easy to understand for everyone.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white border border-slate-200 hover:border-teal-300 rounded-3xl p-8 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 group-hover:from-teal-50/60 to-transparent transition-all duration-300 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-teal-100/50">
                      {f.icon}
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl mb-3 leading-snug">{f.title}</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">A Better Way</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">
              Learning Does Not Have to Be Frustrating
            </h2>
            <p className="text-slate-600 text-base mt-4 max-w-xl mx-auto leading-relaxed">
              We know how difficult and isolating it can feel to learn new tech skills alone. FindStreak is designed to change that entirely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {/* Without */}
            <div className="rounded-3xl border border-red-100 bg-white p-10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-50" />
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <h3 className="font-black text-xl text-slate-900">The Old Way</h3>
              </div>
              <div className="space-y-5 relative z-10">
                {comparison.without.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-red-400 font-bold text-xl leading-none flex-shrink-0 mt-0.5">✕</span>
                    <p className="text-[15px] font-medium text-slate-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With */}
            <div className="rounded-3xl border border-teal-200 bg-white p-10 shadow-md relative overflow-hidden transform md:-translate-y-2 lg:scale-[1.02]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50 rounded-full blur-3xl opacity-80" />
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                <h3 className="font-black text-xl text-teal-800">The FindStreak Way</h3>
              </div>
              <div className="space-y-5 relative z-10">
                {comparison.with.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-emerald-500 font-bold text-xl leading-none flex-shrink-0 mt-0.5">✓</span>
                    <p className="text-[15px] font-bold text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white border-t border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/50 opacity-80" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 bg-white border border-teal-100 shadow-md rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3 hover:rotate-0 transition-all duration-300">
            <Sparkles className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Ready to Take the Next Step<br />With Confidence?
          </h2>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
            Join thousands of others who are moving forward in their careers. Create your free account today and discover how supportive learning can be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-200 transition-all duration-200 hover:-translate-y-1"
            >
               Create Your Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <LandingFooter />
    </div>
  );
}
