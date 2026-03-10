import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  Zap, Target, ArrowRight, Users, Globe, Heart, CheckCircle,
  Lightbulb, Shield, TrendingUp
} from 'lucide-react';

const values = [
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Clarity Over Confusion',
    desc: 'We believe every developer deserves a clear, honest answer to "what should I learn next?" — not another list of 200 courses.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'People First',
    desc: 'Every AI decision we build is guided by one question: does this genuinely help real people build better careers?',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Quality & Accuracy',
    desc: 'We go to extreme lengths to ensure our recommendations are accurate, current, and actually used by real companies hiring today.',
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: 'Continuous Innovation',
    desc: 'The tech industry evolves fast. FindStreak\'s AI continuously updates its knowledge so your roadmap is always relevant.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Accessible to All',
    desc: 'We believe great career tools shouldn\'t cost a fortune. Core features are free and always will be.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Outcomes Matter',
    desc: 'We measure our success by one thing: your career growth. Not page views, not time on site — just your results.',
  },
];

const milestones = [
  { year: '2024', title: 'FindStreak Founded', desc: 'Born out of frustration with generic career advice, FindStreak was created to bring real, AI-powered clarity to tech career development.' },
  { year: '2024', title: 'AI Role Analysis Launched', desc: 'Our flagship skill-gap analysis feature launched, helping users identify exactly where they stood versus industry hiring standards.' },
  { year: '2025', title: 'Project Dashboard & XP System', desc: 'We added real-world AI-curated projects with a gamified XP system to make learning hands-on and motivating.' },
  { year: '2025', title: 'Interview Coach & Tech Stack AI', desc: 'Expanded the platform with an AI Interview Coach, Mock Interview mode, and the Tech Stack Generator with step-by-step guides.' },
  { year: '2026', title: 'Multi-Workspace & Full Platform', desc: 'FindStreak became a complete career OS — supporting multiple career workspaces, achievements, missions, and live AI mentoring.' },
];

const teamHighlights = [
  { stat: '10+', label: 'AI Features Built' },
  { stat: '50+', label: 'Supported Career Roles' },
  { stat: '5★', label: 'Average User Rating' },
  { stat: '3mos', label: 'Avg. Time to First Job Offer' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      <LandingHeader />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold rounded-full mb-6">
            Our Story
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            We Built{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              FindStreak
            </span>{' '}
            For Developers Like You
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            We got tired of watching talented developers waste years on the wrong tutorials and generic roadmaps. So we built the platform we always wished existed — one that actually knows your situation and tells you exactly what to do.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-14 items-center">
          {/* Visual block */}
          <div className="flex-1 relative">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-extrabold text-xl tracking-tight">Our Mission</span>
                </div>
                <blockquote className="text-2xl font-bold leading-relaxed text-white/95">
                  "To give every developer on the planet a personalised, AI-powered career co-pilot that removes all guesswork from career growth."
                </blockquote>
                <p className="mt-5 text-teal-100 text-sm leading-relaxed">
                  We believe that with the right guidance, any motivated person can break into tech and build a career they're proud of. FindStreak is that guidance — made intelligent by AI, made personal by your data.
                </p>
              </div>
            </div>

            {/* Floating stats */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              {teamHighlights.map(h => (
                <div key={h.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-teal-600">{h.stat}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">{h.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">The Problem We're Solving</h2>
            <div className="space-y-5 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The tech industry has a paradox: there are more resources than ever to learn from, yet developers feel more lost than ever about their career path. Thousands of courses, bootcamps, YouTube tutorials, and blog posts — but no clear answer to <em>"what should <strong>I</strong> learn, given where I am right now?"</em>
              </p>
              <p>
                Generic roadmaps treat everyone the same. They don't know your background, your strengths, your goal role, or the gap you need to fill. They just dump a list of technologies and leave you to figure out the rest.
              </p>
              <p>
                FindStreak was built to solve this exactly. We take <strong>your</strong> resume, <strong>your</strong> goal, and <strong>your</strong> current level — and give you a personalised, step-by-step plan that respects your time and maximises your results.
              </p>

              <div className="pt-2 space-y-2.5">
                {[
                  'No more generic tutorials that waste your time',
                  'No more guessing what employers actually want',
                  'No more interviewing unprepared and failing at the last step',
                  'No more building projects nobody asked for in your portfolio',
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">What We Stand For</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Our core values guide every product decision, every AI model, and every feature we build.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-all">
                  {v.icon}
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Our Journey So Far</h2>
            <p className="text-slate-500 text-lg">From a frustrating problem to a full AI career platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 to-emerald-400" />
            <div className="space-y-10 pl-16">
              {milestones.map((m, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-12 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md top-1">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest">{m.year}</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1 mb-1">{m.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="w-12 h-12 text-white/40 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-5">Join the FindStreak Community</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">
            Thousands of developers are already using FindStreak to take control of their career path. Your journey starts with one click.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-teal-700 font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Start Your Free Journey <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-slate-400 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">FindStreak</span>
        </div>
        <p className="text-sm">© 2026 FindStreak. Empowering tech careers worldwide.</p>
      </footer>
    </div>
  );
}
