import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  Zap, ArrowRight, CheckCircle, Code, Award,
  MessageSquare, BookOpen, Rocket, Target,
  BrainCircuit, Layers, Sparkles, Map, BarChart3,
  Gamepad2, Wrench, Terminal, Briefcase, User,
  GitBranch, FileText, Brain, FlameKindling, Trophy
} from 'lucide-react';

const toolkitCategories = [
  {
    category: 'Career Planning & Analysis',
    color: 'teal',
    tools: [
      { icon: <BrainCircuit className="w-5 h-5" />, title: 'AI Skill Gap Analysis', desc: 'Upload your resume. AI reads your current skills and tells you exactly what is missing for your chosen role — with a priority order.' },
      { icon: <BarChart3 className="w-5 h-5" />, title: 'Role Analysis Report', desc: 'A full breakdown of your career fitness: strengths, weaknesses, skill matches, and a percentage score of how ready you are to apply.' },
      { icon: <Briefcase className="w-5 h-5" />, title: 'Career Workspaces', desc: 'Exploring more than one career path? Each workspace holds its own roadmap, projects and progress — all completely separate and saved.' },
    ],
  },
  {
    category: 'Learning Roadmap',
    color: 'emerald',
    tools: [
      { icon: <Map className="w-5 h-5" />, title: 'Personalised Roadmap', desc: 'A custom learning path based on your resume and target role. Skips what you already know. Focuses only on what you actually need.' },
      { icon: <GitBranch className="w-5 h-5" />, title: 'Visual Roadmap Tree', desc: 'See your full learning journey laid out as an interactive visual tree so you always know the big picture and where you are in it.' },
      { icon: <BookOpen className="w-5 h-5" />, title: 'Topic Deep-Dive Guides', desc: 'Click any module in your roadmap and get a complete AI-generated guide explaining that topic, how it works, and why it matters.' },
    ],
  },
  {
    category: 'Project-Based Learning',
    color: 'teal',
    tools: [
      { icon: <Code className="w-5 h-5" />, title: 'AI Project Recommendations', desc: 'FindStreak recommends real-world projects perfectly matched to your role and skill level — not toy exercises, but things you can put on your portfolio.' },
      { icon: <Layers className="w-5 h-5" />, title: 'Structured Project Workspace', desc: 'Every project comes with a full curriculum broken into modules and daily tasks. Open the workspace and always know exactly what to work on next.' },
      { icon: <BarChart3 className="w-5 h-5" />, title: 'Live Project Dashboard', desc: 'Track all your active, completed and saved projects in one real-time dashboard. See your progress and XP at a glance.' },
      { icon: <FileText className="w-5 h-5" />, title: 'Task Step-by-Step Guides', desc: 'Stuck on a specific task? Click View Guide and get a detailed walkthrough for that exact task — written for your project context.' },
      { icon: <Target className="w-5 h-5" />, title: 'Daily Mission System', desc: 'Each day you get a structured mission linked to your active project. Complete it to earn XP and keep your learning streak alive.' },
    ],
  },
  {
    category: 'Tech Stack & Tools',
    color: 'emerald',
    tools: [
      { icon: <Terminal className="w-5 h-5" />, title: 'Tech Stack Generator', desc: 'Upload your resume and role. AI tells you every programming language, framework, library and tool you need to learn — ranked by importance.' },
      { icon: <Rocket className="w-5 h-5" />, title: 'Tool Installation Guides', desc: 'For each tool in your stack, click View Guide and get a step-by-step installation walkthrough with configuration instructions and common errors.' },
      { icon: <Brain className="w-5 h-5" />, title: 'FindStreak AI Mentor (In Guide)', desc: 'While reading any tech guide, a live AI mentor is on the right side ready to answer your questions about that specific tool in real time.' },
    ],
  },
  {
    category: 'Interview Preparation',
    color: 'teal',
    tools: [
      { icon: <MessageSquare className="w-5 h-5" />, title: 'Interview Question Guide', desc: 'AI generates a full set of role-specific interview questions — technical, behavioural and situational — tailored to your target job.' },
      { icon: <Sparkles className="w-5 h-5" />, title: 'AI Answer Feedback', desc: 'Type your answer to any interview question and get instant, detailed AI feedback on quality, completeness, clarity and what to improve.' },
      { icon: <Zap className="w-5 h-5" />, title: 'Real-Time Mock Interview', desc: 'Simulate a real interview under pressure. Questions are timed, answers are evaluated, and you get a full performance report at the end.' },
    ],
  },
  {
    category: 'Resources & Learning Support',
    color: 'emerald',
    tools: [
      { icon: <BookOpen className="w-5 h-5" />, title: 'AI Resources Hub', desc: 'Search for courses, tutorials, documentation and articles by topic or technology. AI ranks results by relevance to your specific role.' },
      { icon: <Brain className="w-5 h-5" />, title: 'AI Learning Assistant', desc: 'A dedicated chat assistant that knows your career goals. Ask any career or tech question and get a contextual, helpful answer instantly.' },
      { icon: <Wrench className="w-5 h-5" />, title: 'Workflow Lifecycle Tools', desc: 'Professional productivity tools to help you plan sprints, manage your learning workflow and structure your development process like a real engineer.' },
    ],
  },
  {
    category: 'Progress & Motivation',
    color: 'teal',
    tools: [
      { icon: <Award className="w-5 h-5" />, title: 'Achievements & Badges', desc: 'Earn badges for completing projects, maintaining streaks, finishing interview prep and hitting career milestones. Progress you can see and feel.' },
      { icon: <FlameKindling className="w-5 h-5" />, title: 'Daily Streak Tracking', desc: 'Your streak tracks consecutive days of learning activity. Stay consistent and watch your streak grow — lose a day and you restart from zero.' },
      { icon: <Trophy className="w-5 h-5" />, title: 'XP Point System', desc: 'Everything you complete earns XP. Complete tasks, finish projects, pass mock interviews and hit milestones — XP quantifies your real progress.' },
      { icon: <Gamepad2 className="w-5 h-5" />, title: 'Quiz & Learning Games', desc: 'Test your knowledge with role-specific quiz games. A fun and competitive way to reinforce what you are building and learning each week.' },
    ],
  },
  {
    category: 'Your Profile & Portfolio',
    color: 'emerald',
    tools: [
      { icon: <User className="w-5 h-5" />, title: 'Public Developer Profile', desc: 'Your FindStreak profile shows your target role, active skills, completed projects and achievements. Share it with recruiters via a unique link.' },
    ],
  },
];

const howItLooks = [
  { step: '01', title: 'Upload your resume and choose your target role', desc: 'FindStreak reads your current skills and compares them against what real companies are hiring for right now.' },
  { step: '02', title: 'AI generates your personal skill gap report', desc: 'You see exactly what you already know, what is missing, and what to learn next in priority order.' },
  { step: '03', title: 'A project is recommended that you build right now', desc: 'Not a tutorial to watch. A real structured project with daily tasks, milestones and guided steps built for your level.' },
  { step: '04', title: 'Practice interviews and track your growth', desc: 'AI-powered mock interviews with feedback. Your XP and streak keep you consistent and progressing every single day.' },
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
            {['No credit card required', 'Free to start', 'Project-based learning from day one'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Steps */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white">Here Is Exactly What Happens When You Join</h2>
            <p className="text-teal-100 mt-3 text-lg">No fluff. A clear guided path from where you are now to where you want to be.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItLooks.map(h => (
              <div key={h.step} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="text-4xl font-black text-white/20 mb-3 leading-none">{h.step}</div>
                <h3 className="font-bold text-white text-sm mb-2 leading-snug">{h.title}</h3>
                <p className="text-teal-100 text-xs leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate('/how-it-works')} className="inline-flex items-center gap-2 text-white font-bold text-sm border border-white/30 rounded-xl px-5 py-2.5 hover:bg-white/10 transition-all">
              See the full step-by-step breakdown <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Complete Feature Toolkit */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-600 font-bold text-sm uppercase tracking-widest">Complete Toolkit</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-slate-900">Every Feature. Every Tool. All in One Place.</h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
              FindStreak covers every stage of the developer learning journey. Here is everything the platform includes — nothing hidden, nothing extra to pay for.
            </p>
          </div>

          <div className="space-y-14">
            {toolkitCategories.map((cat) => (
              <div key={cat.category}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-0.5 w-6 rounded-full bg-${cat.color}-500`} />
                  <h3 className={`text-xs font-black uppercase tracking-widest text-${cat.color}-600`}>{cat.category}</h3>
                  <div className={`h-0.5 flex-1 rounded-full bg-${cat.color}-100`} />
                </div>

                {/* Tool Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.tools.map((tool, j) => (
                    <div key={j} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        {tool.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{tool.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{tool.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  'Lose motivation after a few days with no direction',
                ],
                bad: true,
              },
              {
                label: 'With FindStreak',
                items: [
                  'Build real guided projects from your very first day',
                  'Know exactly which skills to learn and in what order',
                  'Walk into interviews with a portfolio of real work',
                  'Practise with AI feedback on real interview questions',
                  'Stay consistent with daily tasks and streak tracking',
                ],
                bad: false,
              },
            ].map(col => (
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
