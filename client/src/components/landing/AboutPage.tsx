import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Zap, Target, ArrowRight, Heart, CheckCircle, Lightbulb, Shield, TrendingUp, Code, BookOpen } from 'lucide-react';

const values = [
  { icon: <Code className="w-5 h-5" />, title: 'Learning by Building', desc: 'We believe the only way to truly learn software development is to build real things. Every feature we create is designed to get you writing code and shipping projects, not just watching videos.' },
  { icon: <Target className="w-5 h-5" />, title: 'Clarity Over Noise', desc: 'There is too much advice online and not enough clarity. FindStreak tells you exactly what to learn, in what order, for your specific goal — nothing more, nothing less.' },
  { icon: <Heart className="w-5 h-5" />, title: 'Honest About What Works', desc: 'We do not show fake numbers or inflated testimonials. We are building a platform we believe in, and we will earn your trust through the quality of what we actually deliver.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Industry Relevance First', desc: 'Every project, skill recommendation and tech stack suggestion is based on what real companies are actually hiring for — not what sounds impressive on a landing page.' },
  { icon: <Lightbulb className="w-5 h-5" />, title: 'Built for Real Learners', desc: 'FindStreak is designed for people who are serious about transitioning into tech or levelling up their career. Not passive learners — people who want to build things and get hired.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Progress That Compounds', desc: 'Small consistent effort beats intense bursts every time. Our daily missions, XP system and streak tracking are designed to keep you moving forward even on your busiest days.' },
];

const platformFeatures = [
  { area: 'Career Analysis', detail: 'AI reads your resume and compares it to real hiring requirements for your chosen role. You get a precise skill gap report and a career fit score — not an estimate, but a direct comparison against actual job requirements.' },
  { area: 'Personalised Roadmap', detail: 'A learning roadmap generated from your resume and target role. It skips what you already know and gives you a prioritised, logical sequence of topics — with a visual tree view of the full journey.' },
  { area: 'Project-Based Learning', detail: 'AI recommends real-world projects matched to your skill level. Each project has a structured curriculum, daily tasks and milestone tracking — a real project for your portfolio, not a tutorial clone.' },
  { area: 'Tech Stack & Tool Guides', detail: 'The platform generates a complete list of every language, framework and tool your target role requires. Every item has a step-by-step installation guide and a live AI mentor available while you follow it.' },
  { area: 'Interview Preparation', detail: 'AI generates role-specific questions covering technical, behavioural and situational scenarios. You type answers and receive immediate feedback. A real-time mock interview mode simulates the pressure of an actual session.' },
  { area: 'AI Learning Assistant', detail: 'A dedicated AI chat that knows your career context. Ask technical questions, get explanations, request guidance on what to do next. Chat history is saved and synced across all your devices.' },
  { area: 'Daily Missions & Streak Tracking', detail: 'Every day you get one focused mission linked to your active project. Completing it earns XP and extends your daily streak. Missing a day resets it to zero — the accountability is intentionally real.' },
  { area: 'Achievements & XP', detail: 'Every meaningful action earns XP. Completing projects, finishing interviews, maintaining streaks and hitting milestones unlock achievements and badges that appear on your public profile.' },
  { area: 'Career Workspaces', detail: 'Run completely separate learning environments for different career paths simultaneously. Each workspace has its own roadmap, projects, analysis and progress — fully independent and switchable at any time.' },
  { area: 'Public Developer Profile', detail: 'Your profile page is publicly shareable with a unique URL. It shows your target role, skills, completed projects and badges. Share it in job applications or on LinkedIn as evidence of consistent, structured work.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-radial from-indigo-100 to-transparent blur-3xl rounded-full opacity-60" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            About FindStreak
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            We Built the Platform
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">We Needed Ourselves</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            FindStreak exists because learning to code is not the hard part. Knowing what to build, which skills to focus on, and how to go from learning to actually getting hired — that is where most developers get stuck.
          </p>
        </div>
      </section>

      {/* Mission + Why We Built */}
      <section className="py-20 px-4 border-y border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Mission card */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-9 relative overflow-hidden shadow-md lg:sticky lg:top-24">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-indigo-600" /></div>
                <span className="font-black text-indigo-700 uppercase tracking-widest text-xs">Our Mission</span>
              </div>
              <blockquote className="text-2xl font-black leading-snug text-slate-900 mb-5">
                "Help developers learn by building real projects — with AI that knows their specific goals and gaps."
              </blockquote>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Not generic advice. Not another course library. A personalised, hands-on learning system that starts with who you are today and helps you build towards where you want to be.
              </p>
            </div>
          </div>

          {/* Why */}
          <div className="lg:py-4">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Why We Built This</h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>Most developers who want to break into a new role already have some knowledge. The problem is not lack of resources — there are thousands of tutorials. The problem is <strong className="text-slate-900">not knowing what to do with those resources</strong> given your specific situation.</p>
              <p>Which skills are you actually missing? What should you build to prove those skills? How do you answer the interview questions for that specific role? These questions do not have the same answer for every developer.</p>
              <p>FindStreak is our answer to that gap. It uses your actual resume and your actual target role to generate an actual plan — not a recycled template.</p>
            </div>

            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4 text-base">What makes FindStreak different</h3>
              <div className="space-y-3">
                {['Your roadmap is generated from your resume, not a template', 'You build real projects with actual task-by-task guidance', 'The tech stack guide tells you what to install and how to use it', 'Interview practice uses questions specific to your role', 'Progress tracking keeps you consistent without pressure'].map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm font-medium">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Our Principles</span>
            <h2 className="text-4xl font-black text-slate-900 mt-3 mb-3">What We Believe</h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto">The principles behind every decision we make about how FindStreak is built and what it prioritises.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                  {v.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section className="py-20 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest">The Platform</span>
            <h2 className="text-4xl font-black text-slate-900 mt-3 mb-3">What FindStreak Contains Right Now</h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto">A straightforward description of every area of the platform that is currently live and available to you.</p>
          </div>
          <div className="space-y-4">
            {platformFeatures.map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start bg-white border border-slate-200 hover:border-indigo-300 shadow-sm rounded-2xl p-6 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-sm font-black">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{f.area}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Ready to Build Something Real?</h2>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">Upload your resume, choose your target role, and FindStreak will give you a clear, personalised plan to follow starting today.</p>
          <button onClick={() => navigate('/signup')} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all">
            Start for Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
