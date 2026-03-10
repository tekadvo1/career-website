import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  Zap, Target, ArrowRight, Heart, CheckCircle,
  Lightbulb, Shield, TrendingUp, Code, BookOpen
} from 'lucide-react';

const values = [
  {
    icon: <Code className="w-6 h-6" />,
    title: 'Learning by Building',
    desc: 'We believe the only way to truly learn software development is to build real things. Every feature we create is designed to get you writing code and shipping projects, not just watching videos.',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Clarity Over Noise',
    desc: 'There is too much advice online and not enough clarity. FindStreak tells you exactly what to learn, in what order, for your specific goal — nothing more, nothing less.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Honest About What Works',
    desc: 'We do not show fake numbers or inflated testimonials. We are building a platform we believe in, and we will earn your trust through the quality of what we actually deliver.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Industry Relevance First',
    desc: 'Every project, skill recommendation and tech stack suggestion is based on what real companies are actually hiring for — not what sounds impressive on a landing page.',
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: 'Built for Real Learners',
    desc: 'FindStreak is designed for people who are serious about transitioning into tech or levelling up their existing career. Not passive learners. People who want to build things and get hired.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Progress That Compounds',
    desc: 'Small consistent effort beats intense bursts every time. Our daily missions, XP system and streak tracking are designed to keep you moving forward even on your busiest days.',
  },
];

const timeline = [
  {
    year: '2024',
    title: 'FindStreak Founded',
    desc: 'We started FindStreak because we were frustrated with career advice that was either too generic or completely disconnected from how companies actually hire developers.',
  },
  {
    year: '2024',
    title: 'AI Skill Gap Analysis Launched',
    desc: 'Our first feature — analysing your resume and showing you exactly which skills you are missing for your target role — went live. It replaced hours of guessing with a clear, specific answer.',
  },
  {
    year: '2025',
    title: 'Project Dashboard and Daily Task System',
    desc: 'We added structured, AI-recommended projects with daily task breakdowns, milestone tracking and XP. Users could finally learn by doing something real instead of just studying in theory.',
  },
  {
    year: '2025',
    title: 'Interview Coach and Tech Stack Guide',
    desc: 'We built an interview practice system with AI feedback on answers, and a tech stack generator that tells you exactly which tools to install and how to use them for your role.',
  },
  {
    year: '2026',
    title: 'The Full Platform',
    desc: 'FindStreak now covers the complete learning journey: skill analysis, roadmap, project building, tech stack setup, resource discovery, interview prep, and streak tracking all in one place.',
  },
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
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold rounded-full mb-6">
            About FindStreak
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            We Built the Platform We{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              Needed Ourselves
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            FindStreak exists because learning to code is not the hard part. Knowing what to build, which skills to focus on, and how to go from learning to actually getting hired — that is where most developers get stuck.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-14 items-start">
          <div className="flex-1 lg:sticky lg:top-24">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-extrabold text-lg">Our Mission</span>
                </div>
                <blockquote className="text-2xl font-bold leading-relaxed">
                  "Help developers learn by building real projects — with AI that knows their specific goals and gaps."
                </blockquote>
                <p className="mt-5 text-teal-100 text-sm leading-relaxed">
                  Not generic advice. Not another course library. A personalised, hands-on learning system that starts with who you are today and helps you build towards where you want to be.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Why We Built This</h2>
            <div className="space-y-5 text-slate-600 text-[15px] leading-relaxed">
              <p>
                Most developers who want to break into a new role or level up already have some knowledge. The problem is not lack of resources — there are thousands of tutorials and courses available. The problem is <strong>not knowing what to do with those resources</strong> given your specific situation.
              </p>
              <p>
                Which skills are you actually missing? What should you build to prove those skills? Which tools does your target company use? How do you answer the interview questions for that specific role? These questions do not have the same answer for every developer, but most platforms treat them as if they do.
              </p>
              <p>
                FindStreak is our answer to that gap. It uses your actual resume and your actual target role to generate an actual plan — not a one-size-fits-all roadmap recycled from a blog post.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4">
                <h3 className="font-black text-slate-900 mb-4 text-base">What makes FindStreak different</h3>
                <div className="space-y-3">
                  {[
                    'Your roadmap is generated from your resume, not a template',
                    'You build real projects with actual task-by-task guidance',
                    'The tech stack guide tells you what to install and how to use it',
                    'Interview practice uses questions specific to your role',
                    'Progress tracking keeps you consistent without pressure',
                  ].map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">What We Believe</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">The principles behind every decision we make about how FindStreak is built and what it prioritises.</p>
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
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">How We Got Here</h2>
            <p className="text-slate-500 text-lg">A brief history of what we built and why.</p>
          </div>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-400 to-emerald-400" />
            <div className="space-y-10 pl-16">
              {timeline.map((m, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-12 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md top-1">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest">{m.year}</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1 mb-2">{m.title}</h3>
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
          <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-5">Ready to Build Something Real?</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">
            Upload your resume, choose your target role, and FindStreak will give you a clear, personalised plan to follow starting today.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-teal-700 font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
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
        <p className="text-sm">© 2026 FindStreak. Build real skills through real projects.</p>
      </footer>
    </div>
  );
}
