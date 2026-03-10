import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  ArrowRight, Upload, Brain, Map, Code, Briefcase, MessageSquare,
  CheckCircle, Zap, ChevronRight, Star, Users, BookOpen
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Upload className="w-7 h-7" />,
    title: 'Upload Your Resume & Choose a Role',
    subtitle: 'We start by understanding where you are',
    desc: 'Begin by uploading your existing resume (PDF or Word). Then choose your target career role — whether that\'s Software Engineer, Data Scientist, DevOps Engineer, Product Manager, or any of 50+ supported roles. FindStreak reads your resume and immediately understands your current skill level and experience.',
    bullets: [
      'Supports PDF, Word, and plain text resumes',
      'Over 50 tech career roles and specializations supported',
      'AI instantly identifies your existing strengths and technologies',
      'No technical knowledge required to get started',
    ],
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    number: '02',
    icon: <Brain className="w-7 h-7" />,
    title: 'AI Performs a Deep Skill-Gap Analysis',
    subtitle: 'Powered by advanced AI and real job data',
    desc: 'Our AI engine analyses your resume against thousands of real job descriptions for your target role. It identifies exactly which skills you have, which skills you\'re missing, and how large the gap is. You get a detailed breakdown of strengths, weaknesses, and the precise missing skills that are stopping you from getting hired.',
    bullets: [
      'Precise skill-gap report compared to industry hiring standards',
      'Identifies strengths you may not even know you had',
      'Rates your current readiness as a career fit percentage',
      'Updated with live industry data so it\'s always current',
    ],
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    number: '03',
    icon: <Map className="w-7 h-7" />,
    title: 'Receive Your Personalised Learning Roadmap',
    subtitle: 'A clear, step-by-step path to your goal',
    desc: 'Based on the analysis, FindStreak generates a structured, prioritised learning roadmap specifically for you. Unlike generic courses, this roadmap skips what you already know and focuses purely on your gaps. It tells you what to learn, in what order, and why each step matters for your specific role.',
    bullets: [
      'Fully customised — no two roadmaps are the same',
      'Logical, prioritised sequence to avoid overwhelm',
      'Click any topic to get a deep-dive AI guide on it',
      'Visual tree view so you can see the full journey at a glance',
    ],
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    number: '04',
    icon: <Code className="w-7 h-7" />,
    title: 'Build Real Projects with AI Guidance',
    subtitle: 'Hands-on experience that impresses recruiters',
    desc: 'Theory alone won\'t get you hired. FindStreak recommends real, portfolio-worthy projects perfectly matched to your role and skill level. Each project comes with a full AI-generated curriculum, step-by-step tasks, estimated duration, and XP points. You build actual things that go on your GitHub and portfolio.',
    bullets: [
      'AI-generated project curricula with daily tasks and milestones',
      'Projects matched to your skill level (Beginner, Intermediate, Advanced)',
      'Real-time dashboard tracking your active and completed projects',
      'XP system rewards consistency and completion',
    ],
    color: 'from-teal-600 to-emerald-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    number: '05',
    icon: <Briefcase className="w-7 h-7" />,
    title: 'Discover Your Exact Tech Stack',
    subtitle: 'Know precisely what tools employers expect',
    desc: 'The FindStreak Tech Stack Generator tells you exactly which programming languages, frameworks, libraries, and developer tools you need for your specific role. For each one, it provides a detailed step-by-step installation guide and a live AI mentor you can chat with while learning.',
    bullets: [
      'Real-time search of industry trends and job board data',
      'Recommendations per language, framework, and tool category',
      '"View Guide" button for every tool — instant setup walkthrough',
      'On-page AI mentor answers your questions while you install',
    ],
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    number: '06',
    icon: <MessageSquare className="w-7 h-7" />,
    title: 'Ace Your Interview with AI Practice',
    subtitle: 'Prepare for the real thing before it happens',
    desc: 'FindStreak generates a personalised interview guide filled with role-specific technical and behavioural questions. You can practice answering each question and receive instant, detailed AI feedback on the quality, completeness, and professionalism of your answers. The more you practise, the more confident you become.',
    bullets: [
      'Curated interview questions specific to your target role',
      'AI evaluates your answers and gives structured feedback',
      'Real-time mock interview mode with simulated pressure',
      'Saves your answers so you can review sessions later',
    ],
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
];

const tools = [
  { icon: <BookOpen className="w-5 h-5 text-teal-600" />, name: 'AI Learning Assistant', desc: 'Chat with an AI that knows your career goals and answers any career or tech question instantly.' },
  { icon: <Star className="w-5 h-5 text-amber-500" />, name: 'Achievements & Badges', desc: 'Earn XP and badges for completing tasks, maintaining daily streaks, and hitting career milestones.' },
  { icon: <Users className="w-5 h-5 text-teal-600" />, name: 'Career Workspaces', desc: 'Managing multiple career interests? Switch between separate workspaces without losing any progress.' },
  { icon: <Zap className="w-5 h-5 text-emerald-600" />, name: 'Daily Missions', desc: 'Structured daily tasks that keep you making progress even on your busiest days.' },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      <LandingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold rounded-full mb-6">
            The FindStreak Method
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              FindStreak
            </span>{' '}
            Works
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A proven 6-step AI framework that takes you from where you are today to your dream tech career — with zero guesswork and maximum efficiency.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-16">
          {steps.map((step, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 items-start`}>
              {/* Number + Icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-4 lg:w-64">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-7xl font-black text-slate-100 select-none leading-none">{step.number}</div>
              </div>

              {/* Content */}
              <div className={`flex-1 p-8 rounded-2xl border ${step.border} ${step.bg}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">{step.subtitle}</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{step.title}</h2>
                <p className="text-slate-600 text-[15px] leading-relaxed mb-6">{step.desc}</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {step.bullets.map((b, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional tools row */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Plus Powerful Extra Features</h2>
            <p className="text-slate-500 mt-3">Complementary tools that work alongside your core journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tools.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">{t.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{t.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Ready to Start Your Journey?</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">
            Create your free account and complete your first AI-powered career analysis in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-teal-700 font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-8 py-4 border-2 border-white/40 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-all"
            >
              Login
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
        <p className="text-sm">© 2026 FindStreak. Empowering tech careers worldwide.</p>
      </footer>
    </div>
  );
}
