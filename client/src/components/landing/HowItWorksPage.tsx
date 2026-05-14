import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, Target, BrainCircuit, Code2, Mic, Briefcase, CheckCircle, Sparkles, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fadeUp: any = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };

/* ─── UI Mock Panels ─────────────────────────────────────────────────────── */
function MockSignup() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full">
      <div className="flex items-center gap-2 mb-5"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><Zap className="w-4 h-4 text-white fill-white" /></div><span className="font-bold text-slate-800 text-sm">FindStreak</span></div>
      <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-widest">Create free account</p>
      {['Full name', 'Email address', 'Password'].map((pl, i) => (<div key={i} className="mb-3 h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 flex items-center"><span className="text-xs text-slate-300">{pl}</span></div>))}
      <div className="h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center mt-4"><span className="text-white text-sm font-bold">Get Started Free →</span></div>
      <p className="text-center text-[10px] text-slate-400 mt-3">No credit card required</p>
    </div>
  );
}

function MockRole() {
  const roles = ['Frontend Developer', 'Backend Engineer', 'Data Scientist'];
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 w-full">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select your target role</p>
      {roles.map((r, i) => (<div key={i} className={`mb-2 px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-between ${i === 0 ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{r}{i === 0 && <CheckCircle className="w-4 h-4 text-teal-500" />}</div>))}
      <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /><span className="text-xs text-emerald-700 font-medium">AI will analyze your gap instantly</span></div>
    </div>
  );
}

function MockRoadmap() {
  const phases = [{ label: 'Phase 1', title: 'Core Foundations', done: true }, { label: 'Phase 2', title: 'Advanced Patterns', done: false }, { label: 'Phase 3', title: 'System Design', done: false }];
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 w-full">
      <div className="flex items-center justify-between mb-4"><p className="text-sm font-bold text-slate-800">Your Learning Roadmap</p><span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-bold">AI Generated</span></div>
      {phases.map((p, i) => (<div key={i} className={`flex items-center gap-3 mb-3 p-3 rounded-xl ${p.done ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${p.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div><div><p className={`text-xs font-bold ${p.done ? 'text-emerald-700' : 'text-slate-600'}`}>{p.label}</p><p className="text-[11px] text-slate-500">{p.title}</p></div>{p.done && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}</div>))}
    </div>
  );
}

function MockWorkspace() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 w-full">
      <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs font-bold text-slate-700">Active Project — React Todo App</span></div>
      <div className="h-1.5 bg-slate-100 rounded-full mb-4"><div className="h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full" style={{ width: '62%' }} /></div>
      {['Set up Express server', 'Configure Prisma ORM', 'Build REST endpoints'].map((t, i) => (<div key={i} className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${i < 2 ? 'bg-slate-50' : 'bg-teal-50 border border-teal-200'}`}><div className={`w-4 h-4 rounded flex items-center justify-center ${i < 2 ? 'bg-emerald-500' : 'border-2 border-teal-400'}`}>{i < 2 && <CheckCircle className="w-3 h-3 text-white" />}</div><span className={`text-xs font-medium ${i < 2 ? 'line-through text-slate-400' : 'text-teal-700'}`}>{t}</span></div>))}
      <div className="mt-3 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl p-2"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /><span className="text-[11px] text-indigo-600 font-medium">AI assistant available 24/7</span></div>
    </div>
  );
}

function MockInterview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 w-full">
      <div className="flex items-center gap-2 mb-4"><Mic className="w-4 h-4 text-rose-500" /><p className="text-sm font-bold text-slate-800">Mock Interview — Live</p><span className="ml-auto text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-bold animate-pulse">● Recording</span></div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3"><p className="text-xs font-semibold text-slate-700 mb-1">Q: Explain React's reconciliation algorithm.</p><p className="text-[11px] text-slate-400 italic">Your answer is being evaluated...</p></div>
      <div className="grid grid-cols-3 gap-2 text-center"><div className="bg-emerald-50 rounded-lg p-2"><p className="text-xs font-black text-emerald-600">92%</p><p className="text-[9px] text-slate-400">Clarity</p></div><div className="bg-teal-50 rounded-lg p-2"><p className="text-xs font-black text-teal-600">87%</p><p className="text-[9px] text-slate-400">Accuracy</p></div><div className="bg-blue-50 rounded-lg p-2"><p className="text-xs font-black text-blue-600">95%</p><p className="text-[9px] text-slate-400">Depth</p></div></div>
    </div>
  );
}

function MockPortfolio() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 w-full">
      <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm">JS</div><div><p className="text-sm font-bold text-slate-800">John Smith</p><p className="text-[11px] text-slate-400">findstreak.com/p/johnsmith</p></div><span className="ml-auto text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-bold">✓ Verified</span></div>
      {['React Todo App', 'REST API Server', 'ML Dashboard'].map((proj, i) => (<div key={i} className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-100"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-xs font-medium text-slate-700 flex-1">{proj}</span><Flame className="w-3.5 h-3.5 text-orange-400" /></div>))}
    </div>
  );
}

/* ─── Steps Data ─────────────────────────────────────────────────────────── */
const steps = [
  { num: '00', phase: 'BEGIN', icon: UserPlus, color: 'from-violet-500 to-purple-600', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', title: 'Create Your Free Account', subtitle: 'No credit card. 60 seconds.', desc: 'Sign up in seconds — just your name, email, and password. Your AI career plan starts immediately after account creation. No subscription needed to get your first roadmap.', bullets: ['Free account — forever for core features', 'Google sign-in supported', 'Secure JWT authentication', 'Start your journey in under 60 seconds'], mock: MockSignup },
  { num: '01', phase: 'ANALYSE', icon: Target, color: 'from-teal-500 to-emerald-500', light: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', title: 'Set Your Target Role', subtitle: 'Or upload your resume', desc: 'Tell the AI exactly what role you are aiming for. Upload your resume for a deep analysis of your current skills, or just type your role and experience level. The AI identifies your gap in seconds.', bullets: ['Choose from dozens of tech roles', 'Upload resume PDF or DOCX', 'Set experience level and country', 'Switch roles anytime with Workspaces'], mock: MockRole },
  { num: '02', phase: 'PLAN', icon: BrainCircuit, color: 'from-blue-500 to-indigo-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', title: 'AI Builds Your Roadmap', subtitle: 'Personalised in seconds', desc: "FindStreak's AI maps the exact skills you're missing and generates a phase-by-phase learning roadmap — specific to your role, your level, and your target job market. Not a generic template.", bullets: ['Skill gap identified against target role', 'Phase-by-phase roadmap generated instantly', 'Technologies ranked by industry demand', 'Roadmap updates as you grow'], mock: MockRoadmap },
  { num: '03', phase: 'BUILD', icon: Code2, color: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', title: 'Build Real Projects Daily', subtitle: 'Learn by doing — not watching', desc: 'Each day you get focused tasks inside real-world project simulations. The AI assistant guides you through every task — answering questions and reviewing your approach — without just giving you the answer.', bullets: ['AI-recommended projects for your role', 'Structured curriculum with modules and tasks', '24/7 AI learning assistant while you build', 'Earn XP and maintain streaks daily'], mock: MockWorkspace },
  { num: '04', phase: 'PRACTICE', icon: Mic, color: 'from-rose-500 to-pink-600', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', title: 'Interview & Mock Practice', subtitle: 'Turn skills into a job offer', desc: 'Practice with AI-generated role-specific interview questions. The Real-Time Mock Interview uses your microphone and gives live feedback on clarity, accuracy, and depth — so you walk into real interviews confident.', bullets: ['Role-specific technical question banks', 'Real-time mock interview with microphone', 'AI feedback on every answer', 'Review common mistakes before real interviews'], mock: MockInterview },
  { num: '05', phase: 'SHOWCASE', icon: Briefcase, color: 'from-amber-500 to-orange-500', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', title: 'Showcase Your Portfolio', subtitle: 'Proof of real work', desc: 'Every completed project builds your public portfolio — a verified profile you can share with recruiters. Instead of listing courses, you show actual work with real project history and a FindStreak Verified badge.', bullets: ['Auto-generated portfolio from completed projects', 'Shareable link: findstreak.com/p/username', 'FindStreak Verified badge on all projects', 'Streak data proves your consistency'], mock: MockPortfolio },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />

      {/* ── Hero ── */}
      <section className="pt-28 pb-16 px-4 sm:px-6 text-center relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-800">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(20,184,166,0.15) 0%, transparent 60%)' }} />
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-3xl mx-auto relative z-10">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-[11px] font-bold uppercase tracking-widest mb-5"><Sparkles className="w-3 h-3" />How It Works</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 text-white leading-tight">
            From Zero to{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Job-Ready</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-400 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            A 6-step AI-powered system that replaces random self-study with a structured career growth path — from your first sign-up to landing your first offer.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/signup')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200">
              Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/signin')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all duration-200">
              Already have an account? Sign In
            </button>
          </motion.div>
          {/* Step count strip */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mt-10 flex-wrap">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-[10px] font-black shadow-md`}>{s.num}</div>
                {i < steps.length - 1 && <div className="w-6 h-px bg-white/10 hidden sm:block" />}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 px-4 sm:px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Vertical line desktop */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-emerald-100 to-slate-100 -translate-x-1/2 hidden lg:block" />

            <div className="space-y-16 lg:space-y-24">
              {steps.map((step, idx) => {
                const isLeft = idx % 2 === 0;
                const Mock = step.mock;
                return (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                    className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-0 ${!isLeft ? 'lg:flex-row-reverse' : ''}`}
                  >
                    {/* Centre node */}
                    <div className="absolute left-1/2 -translate-x-1/2 z-20 hidden lg:flex">
                      <motion.div variants={fadeUp} className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform`} onClick={() => navigate('/signup')}>
                        <step.icon className="w-6 h-6 text-white" />
                      </motion.div>
                    </div>

                    {/* Text side */}
                    <div className={`flex-1 ${isLeft ? 'lg:pr-20 lg:text-right' : 'lg:pl-20 lg:text-left'} text-left`}>
                      <motion.div variants={fadeUp}>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${step.light} border ${step.border} ${step.text} text-[10px] font-bold uppercase tracking-widest mb-3`}>
                          Step {step.num} — {step.phase}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight">{step.title}</h2>
                        <p className={`text-xs font-bold ${step.text} mb-3`}>{step.subtitle}</p>
                        <p className="text-slate-500 text-[15px] leading-relaxed mb-5 max-w-md">{step.desc}</p>
                        <ul className={`space-y-2 mb-6 ${isLeft ? 'lg:ml-auto' : ''} max-w-xs`}>
                          {step.bullets.map((b, bi) => (
                            <li key={bi} className={`flex items-center gap-2 text-sm text-slate-700 ${isLeft ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
                              <CheckCircle className={`w-4 h-4 ${step.text} flex-shrink-0`} />
                              {b}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => navigate('/signup')}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${step.color} shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
                        >
                          {idx === 0 ? 'Create Free Account' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    </div>

                    {/* Spacer for centre icon */}
                    <div className="w-14 hidden lg:block flex-shrink-0" />

                    {/* Mock panel side */}
                    <div className="flex-1 w-full lg:max-w-sm">
                      <motion.div variants={fadeUp} onClick={() => navigate('/signup')} className="cursor-pointer hover:-translate-y-1 transition-transform duration-300 hover:shadow-2xl rounded-2xl">
                        <Mock />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-14 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['6 Steps', 'From zero to hired'], ['100% AI', 'Personalised plan'], ['Daily Tasks', 'Build real habits'], ['Free to Start', 'No credit card']].map(([stat, label], i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex flex-col items-center">
              <p className="text-2xl md:text-3xl font-black text-teal-600 mb-1">{stat}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(20,184,166,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(16,185,129,0.08) 0%, transparent 50%)' }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-[11px] font-bold uppercase tracking-widest mb-5"><Sparkles className="w-3 h-3" />Ready to start?</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Your career plan is<br />waiting — start in 60 seconds
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 text-base mb-8 leading-relaxed">
            Create your free account, set your target role, and get your full personalised roadmap instantly. No credit card. No setup.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/signup')} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all text-sm">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/signin')} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all text-sm">
              Sign In →
            </button>
          </motion.div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
