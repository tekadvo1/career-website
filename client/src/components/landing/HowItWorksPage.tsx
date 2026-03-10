import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  ArrowRight, Upload, Brain, Map, Code, Briefcase, MessageSquare,
  CheckCircle, Zap, Star, Users, BookOpen, Terminal, Award,
  Gamepad2, Wrench, GitBranch, FileText, FlameKindling, User,
  BarChart3, Sparkles, Target
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <User className="w-7 h-7" />,
    title: 'Create Your Free Account',
    subtitle: 'Takes less than one minute',
    desc: 'Sign up with your email or Google account. No credit card required. Once registered you land directly in your personal FindStreak dashboard where your full learning journey begins.',
    bullets: [
      'Sign up with email or Google in under 60 seconds',
      'No payment details needed to get started',
      'Your data and progress are saved and synced automatically',
      'Access FindStreak from any device at any time',
    ],
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '02',
    icon: <Upload className="w-7 h-7" />,
    title: 'Upload Your Resume and Choose Your Target Role',
    subtitle: 'This is where personalisation begins',
    desc: 'Upload your existing CV or resume in PDF or Word format. Then select your target career role from over 50 supported tech roles. FindStreak reads your resume to understand your current experience, skills, projects and tools you already know.',
    bullets: [
      'Accepts PDF, Word (.doc, .docx) and plain text resume formats',
      'Over 50 tech career roles supported including Software Engineer, Data Scientist, DevOps, ML Engineer, Product Manager and more',
      'The AI extracts your skills, tools, education and experience automatically',
      'You can change your role at any time or create separate career workspaces',
    ],
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '03',
    icon: <Brain className="w-7 h-7" />,
    title: 'Receive Your AI Skill Gap Analysis',
    subtitle: 'Know exactly where you stand vs where you need to be',
    desc: 'The AI compares your current skillset against real hiring requirements for your chosen role. It produces a full analysis showing your strengths, your skill gaps, and a percentage score of how ready you are right now. No guessing — just clear, specific answers.',
    bullets: [
      'Full skills breakdown: what you have, what you are partial on, and what is missing',
      'A career fit percentage score based on real job requirements',
      'Priority list of which skills to focus on first for maximum impact',
      'Strengths section highlighting what you can already market to employers',
    ],
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    accent: 'text-cyan-600',
  },
  {
    number: '04',
    icon: <Map className="w-7 h-7" />,
    title: 'Get Your Personalised Learning Roadmap',
    subtitle: 'A custom step-by-step path built for your situation',
    desc: 'Based on the skill gap analysis, FindStreak generates a structured learning roadmap with topics in logical priority order. Unlike generic guides, this roadmap starts from your actual current skills and focuses only on the gaps — no wasted time on things you already know.',
    bullets: [
      'Fully personalised — built from your resume and your target role, not a recycled template',
      'Topics ordered by dependency and priority so you learn in the right sequence',
      'Visual tree view shows the full roadmap as an interactive diagram',
      'Click any topic to instantly open an AI-generated deep-dive guide on that subject',
    ],
    color: 'from-teal-600 to-emerald-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '05',
    icon: <GitBranch className="w-7 h-7" />,
    title: 'Explore Your Visual Roadmap Tree',
    subtitle: 'See the full picture at a glance',
    desc: 'The Roadmap Tree gives you an interactive visual layout of your entire learning journey. All topics and sub-topics are laid out as connected nodes. You can see which modules are complete, which are in progress, and which are upcoming — all in one view.',
    bullets: [
      'Each node in the tree represents a learning topic or skill area',
      'Completed topics are marked so you always know where you left off',
      'Click any node to get a detailed explanation of that topic from the AI',
      'The whole structure updates as your skills grow and your roadmap evolves',
    ],
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '06',
    icon: <Code className="w-7 h-7" />,
    title: 'Start a Real Project with AI Guidance',
    subtitle: 'Learning by doing — the only way that actually sticks',
    desc: 'FindStreak recommends a real-world project perfectly matched to your role and current skill level. This is not a tutorial to follow passively — it is a project you build yourself, with a full curriculum, structured modules, and specific daily tasks to keep you moving forward.',
    bullets: [
      'Projects are selected by AI to match your skill level: Beginner, Intermediate or Advanced',
      'Each project has a full curriculum broken into modules and daily tasks',
      'Tasks include what to build, what tools to use, and what you will learn by completing it',
      'Everything you complete earns XP and is tracked in your live project dashboard',
    ],
    color: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '07',
    icon: <BarChart3 className="w-7 h-7" />,
    title: 'Track Your Projects in the Dashboard',
    subtitle: 'Real-time view of everything you are working on',
    desc: 'The Project Dashboard gives you a live overview of all your projects — active, completed and saved. You can see your progress on each, the XP you have earned, and your current task. The dashboard updates in real time so it always reflects where you are.',
    bullets: [
      'Live dashboard with real-time sync across all your devices',
      'Shows active projects, completed projects, saved projects and trending picks',
      'Each project card shows current progress, XP value and difficulty level',
      'Search and filter by difficulty level or project type at any time',
    ],
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '08',
    icon: <FileText className="w-7 h-7" />,
    title: 'Use Task Guides When You Get Stuck',
    subtitle: 'Never sit staring at a blank screen',
    desc: 'Inside every project workspace, each task has a View Guide option. Click it and get a complete step-by-step guide written specifically for that task in the context of your project. The guide explains the concept, shows you what to build, and walks you through the process clearly.',
    bullets: [
      'Task-specific guides generated for your actual project context, not generic examples',
      'Explains the concept, the implementation approach and the expected outcome',
      'Shows code examples and practical patterns relevant to the task',
      'Available for every single task across every project at any point',
    ],
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    accent: 'text-cyan-600',
  },
  {
    number: '09',
    icon: <Terminal className="w-7 h-7" />,
    title: 'Discover Your Exact Tech Stack',
    subtitle: 'Know exactly what to install and learn for your role',
    desc: 'The Tech Stack & Tools feature uses AI to generate a complete list of every programming language, framework, library and developer tool you need for your chosen role. It analyses your resume alongside current industry trends so the recommendations are always current.',
    bullets: [
      'Full breakdown by category: Languages, Frameworks, Libraries, DevTools and Cloud platforms',
      'Each recommendation includes why it matters for your specific role',
      'Click View Guide on any tool to get step-by-step installation and setup instructions',
      'A live FindStreak AI assistant is available on every guide to answer your questions in real time',
    ],
    color: 'from-teal-600 to-emerald-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '10',
    icon: <BookOpen className="w-7 h-7" />,
    title: 'Search the AI Resources Hub',
    subtitle: 'Find the right learning materials fast',
    desc: 'The Resources Hub is an AI-powered search engine for learning content. Search by topic, technology or skill and get curated results ranked by relevance to your specific role. No more scrolling through random YouTube results or Reddit threads — just the right material for your situation.',
    bullets: [
      'Search any topic and get AI-ranked courses, tutorials, documentation and articles',
      'Results are filtered for quality and relevance to your target role',
      'Covers all major learning platforms and open documentation sources',
      'Use it alongside your roadmap to go deeper on any topic that needs more study',
    ],
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '11',
    icon: <Sparkles className="w-7 h-7" />,
    title: 'Chat with the AI Learning Assistant',
    subtitle: 'Your always-available career and tech advisor',
    desc: 'The AI Learning Assistant is a dedicated chat that knows your career goals, your target role and your current progress. Ask it anything — from how a specific technical concept works, to what project to start next, to how to phrase something on your CV. It gives you contextual, helpful answers every time.',
    bullets: [
      'Chat history is saved and synced across all your devices',
      'Understands your specific context so answers are relevant to your situation',
      'Ask technical questions, career questions or anything in between',
      'Works alongside your roadmap, projects and resources as a support layer',
    ],
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '12',
    icon: <MessageSquare className="w-7 h-7" />,
    title: 'Prepare for Interviews with AI',
    subtitle: 'Know the questions. Practise the answers. Walk in confident.',
    desc: 'The Interview Guide generates a full set of role-specific interview questions for you — covering technical skills, system design, behavioural questions and situational scenarios. You type your answer to each question and get immediate AI feedback on quality, relevance and what to improve.',
    bullets: [
      'Questions are specific to your target role and cover technical and behavioural areas',
      'Type your answer and get detailed AI feedback on each response',
      'Feedback covers clarity, completeness, structure and professional tone',
      'Your saved answers and feedback are stored so you can review sessions later',
    ],
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '13',
    icon: <Briefcase className="w-7 h-7" />,
    title: 'Run a Real-Time Mock Interview',
    subtitle: 'Simulate the pressure of a real interview before it happens',
    desc: 'The Real-Time Mock Interview puts you in a simulated interview environment. Questions appear one at a time, you answer them under realistic conditions, and at the end you receive a complete performance report. This trains you for the actual experience — not just the theory of it.',
    bullets: [
      'Simulated interview format with questions delivered one at a time',
      'Answers are evaluated in real time by the AI',
      'End-of-session report shows how you performed on each question',
      'Helps eliminate interview anxiety by building real muscle memory through practice',
    ],
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    accent: 'text-cyan-600',
  },
  {
    number: '14',
    icon: <Target className="w-7 h-7" />,
    title: 'Complete Daily Missions to Stay on Track',
    subtitle: 'Small daily wins that compound into big career progress',
    desc: 'The Daily Mission system gives you one focused task to complete each day, linked directly to your active project. Missions ensure you make tangible progress even on the days you only have 20-30 minutes. Each completed mission earns XP and advances your streak.',
    bullets: [
      'One daily mission linked to your active project and current task',
      'Designed to be completable even in short daily sessions',
      'Each completed mission earns XP and counts towards your daily streak',
      'Missions tie together your project work, roadmap progress and skill building',
    ],
    color: 'from-teal-600 to-emerald-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '15',
    icon: <FlameKindling className="w-7 h-7" />,
    title: 'Build and Maintain Your Learning Streak',
    subtitle: 'Consistency is the only thing that separates people who get hired from those who do not',
    desc: 'Your streak tracks consecutive days of active learning and building. Every day you complete a task, mission or project step, your streak grows. Lose a day without any activity and it resets to zero. The streak system is intentionally strict because consistent daily practice is what actually creates skill.',
    bullets: [
      'Streak counts every day you complete any meaningful activity on the platform',
      'Resets to zero if you miss a full day — this keeps the accountability real',
      'Your longest streak is saved so you can always see your personal record',
      'Streaks directly correspond to XP bonuses and achievement unlocks',
    ],
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '16',
    icon: <Award className="w-7 h-7" />,
    title: 'Earn XP and Unlock Achievements',
    subtitle: 'Progress that is visible and meaningful',
    desc: 'Everything you complete on FindStreak earns XP — tasks, projects, missions, interview practice and streak milestones. As your XP grows you unlock achievements and badges that mark significant moments in your learning journey. It is a tangible record of real effort and growth.',
    bullets: [
      'XP is earned for completing tasks, finishing projects, practising interviews and maintaining streaks',
      'Achievements are unlocked for specific milestones like first project, first mock interview and streak goals',
      'Your badge collection is visible on your public profile to share with recruiters',
      'The XP system makes progress concrete so you can always see how far you have come',
    ],
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '17',
    icon: <Gamepad2 className="w-7 h-7" />,
    title: 'Reinforce Learning with Quiz Games',
    subtitle: 'Test your knowledge in a way that is actually engaging',
    desc: 'The Quiz and Games section lets you test your knowledge on role-specific topics in a gameified format. It is a useful way to verify that what you have been building has actually translated into retained understanding — and to identify any gaps you might want to revisit.',
    bullets: [
      'Questions are specific to your chosen tech role and learning topics',
      'Quiz format makes knowledge testing fast, focused and low-pressure',
      'Results help identify areas where your understanding might still be shallow',
      'Works well as a warm-up activity before starting your daily project task',
    ],
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
  {
    number: '18',
    icon: <Wrench className="w-7 h-7" />,
    title: 'Use the Workflow Lifecycle Tools',
    subtitle: 'Work like a professional developer from the start',
    desc: 'The Workflow Lifecycle section gives you productivity and planning tools to help you structure your learning and building like a real software engineer. Sprint planning, task management and workflow structuring — the kind of practices that make you stand out in a team environment.',
    bullets: [
      'Structure your learning week using professional sprint planning methods',
      'Manage tasks across different areas of your learning and project work',
      'Learn the workflows that engineering teams actually use day to day',
      'Prepares you to collaborate effectively in your first real job from day one',
    ],
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    accent: 'text-cyan-600',
  },
  {
    number: '19',
    icon: <Users className="w-7 h-7" />,
    title: 'Run Multiple Career Workspaces',
    subtitle: 'Explore more than one path without losing anything',
    desc: 'Career Workspaces let you maintain completely separate learning environments for different career paths simultaneously. Each workspace has its own roadmap, its own set of projects, its own AI analysis and its own progress. You can switch between workspaces without losing any data in either.',
    bullets: [
      'Create a separate workspace for each career path you are exploring',
      'Each workspace is fully independent: roadmap, projects, analysis and progress',
      'Switch between workspaces instantly from the main navigation menu',
      'Useful for developers deciding between two roles or planning a future career shift',
    ],
    color: 'from-teal-600 to-emerald-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    accent: 'text-teal-600',
  },
  {
    number: '20',
    icon: <Star className="w-7 h-7" />,
    title: 'Share Your Public Profile with Recruiters',
    subtitle: 'Turn your FindStreak journey into a professional calling card',
    desc: 'Your FindStreak profile is publicly shareable via a unique URL. It shows your target role, completed projects, current skills, XP level and earned achievements. Share it in job applications, on LinkedIn or in your resume as evidence of structured, consistent learning and real project work.',
    bullets: [
      'Public profile URL is unique to you and shareable anywhere',
      'Shows completed projects, skills, XP level and badge collection',
      'Gives recruiters concrete evidence of your learning approach and consistency',
      'Updates automatically as you complete more projects and earn more achievements',
    ],
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'text-emerald-600',
  },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      <LandingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold rounded-full mb-6">
            Full Platform Walkthrough
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              FindStreak
            </span>{' '}
            Works
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A complete, step-by-step walkthrough of every feature in the platform — from the moment you sign up to the day you walk into an interview with real projects behind you.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-500 shadow-sm">
            <Zap className="w-4 h-4 text-teal-500" />
            <span><strong className="text-slate-700">20 steps</strong> covering every feature of FindStreak</span>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto space-y-14">
          {steps.map((step, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-start`}>
              {/* Step Number + Icon */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3 lg:w-52">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-6xl font-black text-slate-100 select-none leading-none">{step.number}</div>
              </div>

              {/* Content */}
              <div className={`flex-1 p-7 rounded-2xl border ${step.border} ${step.bg}`}>
                <p className={`text-xs font-bold uppercase tracking-widest ${step.accent} mb-1`}>{step.subtitle}</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3">{step.title}</h2>
                <p className="text-slate-600 text-[14px] leading-relaxed mb-5">{step.desc}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {step.bullets.map((b, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[13px] text-slate-700 font-medium leading-snug">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Ready to Start Step 1?</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">
            Create your free account and complete your first AI skill analysis in under 5 minutes.
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
        <p className="text-sm">© 2026 FindStreak. Build real skills through real projects.</p>
      </footer>
    </div>
  );
}
