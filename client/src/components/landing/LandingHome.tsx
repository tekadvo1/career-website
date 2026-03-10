import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  Zap, ArrowRight, CheckCircle, Code, Award,
  MessageSquare, BookOpen, Rocket, Target,
  BrainCircuit, Layers, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'AI Skill Gap Analysis',
    desc: 'Upload your resume and select your target role. The AI identifies exactly which skills you are missing and what you need to focus on.',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Personalised Learning Roadmap',
    desc: 'Get a step-by-step roadmap built around your current level and your goal. No generic advice — every step is specific to you.',
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: 'Real Project-Based Learning',
    desc: 'Learn by building. Each AI-recommended project comes with a structured curriculum, daily tasks, and guided milestones so you actually finish.',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Tech Stack Guide',
    desc: 'Know exactly which languages, frameworks and tools your target role requires — with step-by-step installation guides for each one.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'AI Interview Preparation',
    desc: 'Practice answering real interview questions for your role. Get instant AI feedback on your answers so you walk into interviews prepared.',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Curated Learning Resources',
    desc: 'AI-searched courses, tutorials and documentation ranked by relevance to your role. No more searching through random results.',
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'Progress & Streak Tracking',
    desc: 'Stay consistent with daily tasks, XP points and streak tracking. Small daily progress compounds into real career growth over time.',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Multiple Career Workspaces',
    desc: 'Exploring more than one career path? Keep separate roadmaps, projects and progress for each without losing anything.',
  },
];

const howItLooks = [
  { step: '01', title: 'You upload your resume and choose your target role', desc: 'FindStreak reads your current skills and compares them against what real companies are hiring for.' },
  { step: '02', title: 'AI generates your personal skill gap report', desc: 'You see exactly what you already know, what is missing, and what to learn next — in priority order.' },
  { step: '03', title: 'You get a structured project to build right now', desc: 'Not a tutorial to watch. A real project with tasks, milestones and guided steps to build something tangible.' },
  { step: '04', title: 'You practice interviews and track your growth', desc: 'AI-powered mock interviews show you where to improve. Your XP and streak keep you consistent day to day.' },
];

export default function LandingHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-28 pb-24 px-4 overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-40 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-700 text-sm font-bold mb-8 shadow-sm">
            <Zap className="w-4 h-4 text-teal-500" />
            Learn Tech by Building Real Projects
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
            Stop Watching Tutorials.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              Start Building Real Projects.
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            FindStreak analyses your skills, identifies your exact gaps, and gives you a hands-on project to build right now. Every step is guided by AI and tailored to your target career role.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="group px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              Start Learning for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-4 border-2 border-teal-200 text-teal-700 rounded-2xl font-bold text-lg hover:bg-teal-50 transition-all"
            >
              See How It Works
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              'No credit card required',
              'Free to start',
              'Project-based learning from day one',
            ].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Looks - Quick Steps */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white">Here Is Exactly What Happens When You Join</h2>
            <p className="text-teal-100 mt-3 text-lg">No fluff. Just a clear, guided path from where you are now to where you want to be.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItLooks.map((h) => (
              <div key={h.step} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="text-4xl font-black text-white/20 mb-3 leading-none">{h.step}</div>
                <h3 className="font-bold text-white text-sm mb-2 leading-snug">{h.title}</h3>
                <p className="text-teal-100 text-xs leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold text-sm uppercase tracking-widest">What Is Included</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">Everything You Need to Go From Learning to Hired</h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">Every tool on this platform exists to help you build real things and develop real skills — not just to look impressive.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-100 rounded-xl flex items-center justify-center mb-4 text-teal-600 group-hover:from-teal-500 group-hover:to-emerald-500 group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why project-based */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-16">
          <div className="flex-1">
            <span className="text-teal-600 font-bold text-sm uppercase tracking-widest">Why Project-Based Learning?</span>
            <h2 className="text-4xl font-black mt-3 mb-6 text-slate-900">Recruiters Hire People Who Have Built Things</h2>
            <p className="text-slate-600 text-[16px] leading-relaxed mb-6">
              Watching a course gives you a certificate. Building a project gives you something to show. Recruiters, hiring managers and technical interviewers all care about what you have actually made — not what you have watched.
            </p>
            <p className="text-slate-600 text-[16px] leading-relaxed mb-8">
              FindStreak is built around this reality. When you use it, you leave with a portfolio of real work, genuine hands-on experience, and the ability to talk confidently about what you built and how.
            </p>
            <div className="space-y-3">
              {[
                'Build projects recruiters can actually see on your GitHub or portfolio',
                'Learn the exact tools and stack your target role uses daily',
                'Practice real interview questions for your specific role',
                'Understand your skill gaps clearly instead of guessing what to learn',
                'Stay consistent with structured daily tasks rather than aimless studying',
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <p className="text-slate-700 text-sm font-medium">{b}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="mt-10 px-7 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Start Building Today <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4">
            {[
              {
                label: 'Without FindStreak',
                items: [
                  'Watch tutorials without building anything real',
                  'Guess what skills employers actually want',
                  'Apply to jobs with nothing concrete to show',
                  'Fail interviews because practise was not structured',
                  'Lose motivation after a few days with no progress',
                ],
                bad: true,
              },
              {
                label: 'With FindStreak',
                items: [
                  'Build real projects guided step by step every day',
                  'Know exactly what skills to learn and in what order',
                  'Walk into interviews with a portfolio of real work',
                  'Practise with AI feedback on real interview questions',
                  'Stay consistent with daily tasks and streak tracking',
                ],
                bad: false,
              },
            ].map((col) => (
              <div key={col.label} className={`rounded-2xl border p-6 ${col.bad ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`font-black text-sm mb-4 uppercase tracking-wide ${col.bad ? 'text-red-600' : 'text-emerald-700'}`}>{col.label}</p>
                <div className="space-y-2">
                  {col.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`mt-0.5 flex-shrink-0 font-bold text-base leading-none ${col.bad ? 'text-red-400' : 'text-emerald-500'}`}>{col.bad ? '✕' : '✓'}</span>
                      <p className={`text-sm ${col.bad ? 'text-red-700' : 'text-emerald-800'}`}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <Rocket className="w-12 h-12 text-white/30 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Build Your First Project?</h2>
          <p className="text-teal-100 text-xl mb-10 leading-relaxed">
            Create your free account, upload your resume, and FindStreak will show you exactly where to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-teal-700 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-4 border-2 border-white/40 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Login to My Account
            </button>
          </div>
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
        <p className="text-sm">© 2026 FindStreak. Build real skills through real projects.</p>
        <div className="flex justify-center gap-6 mt-3 text-xs">
          {[
            { label: 'Home', path: '/' },
            { label: 'About', path: '/about-us' },
            { label: 'How It Works', path: '/how-it-works' },
            { label: 'Contact', path: '/contact-us' },
          ].map(l => (
            <button key={l.label} onClick={() => navigate(l.path)} className="hover:text-teal-400 transition-colors">{l.label}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
