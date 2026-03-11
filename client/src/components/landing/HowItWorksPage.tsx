import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  ArrowRight, Upload, Brain, Map, Code, Briefcase, MessageSquare,
  CheckCircle, Zap, Users, BookOpen, Terminal, Award,
  Gamepad2, Wrench, GitBranch, FileText, FlameKindling, User,
  BarChart3, Sparkles, Target
} from 'lucide-react';

const steps = [
  { number: '01', icon: <User className="w-6 h-6" />, title: 'Create Your Free Account', subtitle: 'Takes less than one minute', desc: 'Sign up with your email or Google account. No credit card required. Once registered you land directly in your personal FindStreak dashboard where your full learning journey begins.', bullets: ['Sign up with email or Google in under 60 seconds', 'No payment details needed to get started', 'Your data and progress are saved and synced automatically', 'Access FindStreak from any device at any time'] },
  { number: '02', icon: <Upload className="w-6 h-6" />, title: 'Upload Your Resume and Choose Your Target Role', subtitle: 'This is where personalisation begins', desc: 'Upload your existing CV or resume in PDF or Word format. Then select your target career role from over 50 supported tech roles. FindStreak reads your resume to understand your current experience, skills, projects and tools.', bullets: ['Accepts PDF, Word (.doc, .docx) resume formats', 'Over 50 tech career roles supported', 'The AI extracts your skills, tools, education and experience', 'You can change your role or create separate career workspaces'] },
  { number: '03', icon: <Brain className="w-6 h-6" />, title: 'Receive Your AI Skill Gap Analysis', subtitle: 'Know exactly where you stand vs where you need to be', desc: 'The AI compares your current skillset against real hiring requirements for your chosen role. It produces a full analysis showing your strengths, skill gaps, and a percentage score of how ready you are right now.', bullets: ['Full skills breakdown: what you have, what is missing', 'A career fit percentage score based on real job requirements', 'Priority list of which skills to focus on first', 'Strengths section highlighting what you can already market'] },
  { number: '04', icon: <Map className="w-6 h-6" />, title: 'Get Your Personalised Learning Roadmap', subtitle: 'A custom step-by-step path built for your situation', desc: 'Based on the skill gap analysis, FindStreak generates a structured learning roadmap with topics in logical priority order. Unlike generic guides, this roadmap starts from your actual current skills.', bullets: ['Fully personalised — built from your resume and target role', 'Topics ordered by dependency and priority', 'Visual tree view as an interactive diagram', 'Click any topic to open an AI-generated deep-dive guide'] },
  { number: '05', icon: <GitBranch className="w-6 h-6" />, title: 'Explore Your Visual Roadmap Tree', subtitle: 'See the full picture at a glance', desc: 'The Roadmap Tree gives you an interactive visual layout of your entire learning journey. All topics and sub-topics are laid out as connected nodes so you always know where you are.', bullets: ['Each node represents a learning topic or skill area', 'Completed topics are marked so you know where you left off', 'Click any node to get a detailed AI explanation', 'Structure updates as your skills and roadmap evolve'] },
  { number: '06', icon: <Code className="w-6 h-6" />, title: 'Start a Real Project with AI Guidance', subtitle: 'Learning by doing — the only way that sticks', desc: 'FindStreak recommends a real-world project perfectly matched to your role and skill level. A full curriculum, structured modules, and specific daily tasks keep you moving forward.', bullets: ['Projects matched to your level: Beginner, Intermediate or Advanced', 'Full curriculum broken into modules and daily tasks', 'Tasks include what to build, what tools to use, and what you will learn', 'Everything you complete earns XP and is tracked live'] },
  { number: '07', icon: <BarChart3 className="w-6 h-6" />, title: 'Track Your Projects in the Dashboard', subtitle: 'Real-time view of everything you are working on', desc: 'The Project Dashboard gives you a live overview of all your projects — active, completed and saved. Progress syncs in real time across all your devices.', bullets: ['Live dashboard with real-time sync across devices', 'Shows active, completed and saved projects', 'Each project card shows current progress and XP value', 'Search and filter by difficulty level at any time'] },
  { number: '08', icon: <FileText className="w-6 h-6" />, title: 'Use Task Guides When You Get Stuck', subtitle: 'Never sit staring at a blank screen', desc: 'Inside every project workspace, each task has a View Guide option. Click it and get a complete step-by-step guide written specifically for that task in your project context.', bullets: ['Task-specific guides for your actual project context', 'Explains concept, implementation approach and expected outcome', 'Shows code examples relevant to the task', 'Available for every task across every project'] },
  { number: '09', icon: <Terminal className="w-6 h-6" />, title: 'Discover Your Exact Tech Stack', subtitle: 'Know exactly what to install and learn for your role', desc: 'The Tech Stack & Tools feature generates a complete list of every language, framework, library and tool you need. Recommendations are always current against industry trends.', bullets: ['Full breakdown: Languages, Frameworks, Libraries, Cloud', 'Each recommendation includes why it matters for your role', 'Click View Guide for step-by-step installation instructions', 'Live AI assistant available on every guide in real time'] },
  { number: '10', icon: <BookOpen className="w-6 h-6" />, title: 'Search the AI Resources Hub', subtitle: 'Find the right learning materials fast', desc: 'The Resources Hub is an AI-powered search engine for learning content. Search by topic or technology and get curated results ranked by relevance to your specific role.', bullets: ['Get AI-ranked courses, tutorials, documentation and articles', 'Results filtered for quality and relevance to your target role', 'Covers all major learning platforms and open documentation', 'Use alongside your roadmap to deep-dive any topic'] },
  { number: '11', icon: <Sparkles className="w-6 h-6" />, title: 'Chat with the AI Learning Assistant', subtitle: 'Your always-available career and tech advisor', desc: 'The AI Learning Assistant is a dedicated chat that knows your career goals and current progress. Ask it anything — technical concepts, what to build next, how to phrase your CV.', bullets: ['Chat history saved and synced across all devices', 'Understands your context so answers are always relevant', 'Ask technical questions, career questions or anything between', 'Works alongside your roadmap and projects as a support layer'] },
  { number: '12', icon: <MessageSquare className="w-6 h-6" />, title: 'Prepare for Interviews with AI', subtitle: 'Know the questions. Practise the answers. Walk in confident.', desc: 'The Interview Guide generates a full set of role-specific interview questions — technical, behavioural and situational. Type your answer and get immediate AI feedback on each response.', bullets: ['Questions specific to your target role and seniority', 'Detailed AI feedback on clarity, completeness and tone', 'Covers technical skills, system design and behavioural areas', 'Saved answers and feedback stored for review later'] },
  { number: '13', icon: <Briefcase className="w-6 h-6" />, title: 'Run a Real-Time Mock Interview', subtitle: 'Simulate the pressure of a real interview before it happens', desc: 'The Real-Time Mock Interview puts you in a simulated interview environment. Questions appear one at a time, you answer under realistic conditions, then receive a full performance report.', bullets: ['Simulated format with questions delivered one at a time', 'Answers evaluated in real time by the AI', 'End-of-session report shows performance on each question', 'Builds real muscle memory and eliminates interview anxiety'] },
  { number: '14', icon: <Target className="w-6 h-6" />, title: 'Complete Daily Missions to Stay on Track', subtitle: 'Small daily wins that compound into big career progress', desc: 'The Daily Mission system gives you one focused task to complete each day, linked to your active project. Even 20-30 minutes a day earns XP and advances your streak.', bullets: ['One daily mission linked to your active project', 'Designed to be completable even in short sessions', 'Each completed mission earns XP and counts to your streak', 'Ties together your project work and roadmap progress'] },
  { number: '15', icon: <FlameKindling className="w-6 h-6" />, title: 'Build and Maintain Your Learning Streak', subtitle: 'Consistency is the only thing that separates people who get hired', desc: 'Your streak tracks consecutive days of active learning. Every day you complete a task or mission, your streak grows. Lose a day and it resets — intentionally strict because consistent practice creates real skill.', bullets: ['Streak counts every day you complete any meaningful activity', 'Resets to zero if you miss a full day', 'Your longest streak is always saved', 'Streaks correspond directly to XP bonuses and achievements'] },
  { number: '16', icon: <Award className="w-6 h-6" />, title: 'Earn XP and Unlock Achievements', subtitle: 'Progress that is visible and meaningful', desc: 'Everything you complete earns XP — tasks, projects, missions, interview practice and streak milestones. As your XP grows you unlock achievements and badges that mark real moments in your journey.', bullets: ['XP earned for tasks, projects, interviews and streaks', 'Achievements unlocked for specific milestones', 'Badge collection visible on your public profile', 'XP makes progress concrete so you can see how far you have come'] },
  { number: '17', icon: <Gamepad2 className="w-6 h-6" />, title: 'Reinforce Learning with Quiz Games', subtitle: 'Test your knowledge in a way that is actually engaging', desc: 'The Quiz and Games section lets you test your knowledge on role-specific topics in a gamified format — a useful way to verify your building has translated into retained understanding.', bullets: ['Questions specific to your chosen tech role', 'Quiz format makes knowledge testing fast and focused', 'Results help identify areas where understanding may be shallow', 'Works well as a warm-up before starting your daily task'] },
  { number: '18', icon: <Wrench className="w-6 h-6" />, title: 'Use the Workflow Lifecycle Tools', subtitle: 'Work like a professional developer from the start', desc: 'The Workflow Lifecycle section gives you planning tools to structure your learning like a real software engineer — sprint planning, task management and workflow structuring.', bullets: ['Structure your week using professional sprint planning', 'Manage tasks across learning and project work', 'Learn the workflows engineering teams actually use day to day', 'Prepares you to collaborate effectively from day one'] },
  { number: '19', icon: <Users className="w-6 h-6" />, title: 'Run Multiple Career Workspaces', subtitle: 'Explore more than one path without losing anything', desc: 'Career Workspaces let you maintain completely separate learning environments for different career paths simultaneously. Each workspace has its own roadmap, projects, analysis and progress.', bullets: ['Create a separate workspace for each career path', 'Each workspace fully independent: roadmap, projects, progress', 'Switch instantly from the main navigation menu', 'Useful for developers deciding between two roles'] },
  { number: '20', icon: <User className="w-6 h-6" />, title: 'Share Your Public Profile with Recruiters', subtitle: 'Turn your FindStreak journey into a professional calling card', desc: 'Your FindStreak profile is publicly shareable via a unique URL. It shows completed projects, skills, XP level and earned achievements — concrete evidence of consistent learning.', bullets: ['Public profile URL unique to you and shareable anywhere', 'Shows completed projects, skills, XP and badge collection', 'Updates automatically as you complete more projects', 'Gives recruiters concrete evidence of your approach'] },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white font-sans antialiased">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-radial from-teal-900/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(to right, #14b8a6 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950 border border-teal-800/60 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Full Platform Walkthrough
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">FindStreak</span>{' '}
            Works
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            A complete step-by-step walkthrough of every feature — from the moment you sign up to the day you walk into an interview with real projects behind you.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-2.5 text-sm text-slate-400">
            <Zap className="w-4 h-4 text-teal-400" />
            <span><strong className="text-white">20 steps</strong> covering every feature of FindStreak</span>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-3">
          {steps.map((step, i) => {
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-teal-800/60 bg-white/[0.05]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center gap-5 px-6 py-5 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-teal-900 text-teal-400 border border-teal-700' : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-teal-600 uppercase tracking-widest">{step.number}</span>
                      <span className="text-[11px] text-slate-600 uppercase tracking-wide font-medium hidden sm:block">{step.subtitle}</span>
                    </div>
                    <h3 className={`font-bold text-base leading-snug mt-0.5 ${isOpen ? 'text-white' : 'text-slate-300'}`}>{step.title}</h3>
                  </div>
                  <span className={`text-lg font-black flex-shrink-0 transition-transform duration-200 ${isOpen ? 'text-teal-400 rotate-45' : 'text-slate-600'}`}>+</span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-white/[0.06]">
                    <p className="text-slate-400 text-sm leading-relaxed mt-4 mb-5">{step.desc}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {step.bullets.map((b, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300 font-medium leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Start Step 1?</h2>
          <p className="text-slate-400 text-lg mb-8">Create your free account and complete your first AI skill analysis in under 5 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-xl transition-all">
              Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/signin')} className="inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold rounded-xl transition-all">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
