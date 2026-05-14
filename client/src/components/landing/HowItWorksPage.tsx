import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, Target, BrainCircuit, Code2, Mic, Briefcase, CheckCircle, Sparkles, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fu: any = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const sw: any = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

/* ── Mock panels ─────────────────────────────────────────────────────────── */
function MockSignup() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-w-sm mx-auto w-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><Zap className="w-4 h-4 text-white fill-white" /></div>
        <span className="font-bold text-slate-800 text-sm">FindStreak</span>
      </div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Create free account</p>
      {['Full name', 'Email address', 'Password'].map((pl, i) => (
        <div key={i} className="mb-2.5 h-9 rounded-lg bg-slate-50 border border-slate-200 px-3 flex items-center">
          <span className="text-xs text-slate-300">{pl}</span>
        </div>
      ))}
      <div className="h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center mt-4">
        <span className="text-white text-sm font-bold">Get Started Free →</span>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-3">No credit card required • Free forever</p>
    </div>
  );
}

function MockRole() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 max-w-sm mx-auto w-full">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Select your target role</p>
      {['Frontend Developer', 'Backend Engineer', 'Data Scientist'].map((r, i) => (
        <div key={i} className={`mb-2 px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-between ${i === 0 ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          {r}{i === 0 && <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />}
        </div>
      ))}
      <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="text-xs text-emerald-700 font-medium">AI will analyse your skill gap instantly</span>
      </div>
    </div>
  );
}

function MockRoadmap() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 max-w-sm mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-800">Your Learning Roadmap</p>
        <span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-bold">AI Generated</span>
      </div>
      {[{ label: 'Phase 1', title: 'Core Foundations', done: true }, { label: 'Phase 2', title: 'Advanced Patterns', done: false }, { label: 'Phase 3', title: 'System Design', done: false }].map((p, i) => (
        <div key={i} className={`flex items-center gap-3 mb-2.5 p-3 rounded-xl ${p.done ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${p.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold ${p.done ? 'text-emerald-700' : 'text-slate-600'}`}>{p.label}</p>
            <p className="text-[11px] text-slate-500 truncate">{p.title}</p>
          </div>
          {p.done && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function MockWorkspace() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 max-w-sm mx-auto w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="text-xs font-bold text-slate-700">Active Project — React Todo App</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mb-4">
        <div className="h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full" style={{ width: '62%' }} />
      </div>
      {['Set up Express server', 'Configure Prisma ORM', 'Build REST endpoints'].map((t, i) => (
        <div key={i} className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${i < 2 ? 'bg-slate-50' : 'bg-teal-50 border border-teal-200'}`}>
          <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${i < 2 ? 'bg-emerald-500' : 'border-2 border-teal-400'}`}>{i < 2 && <CheckCircle className="w-3 h-3 text-white" />}</div>
          <span className={`text-xs font-medium ${i < 2 ? 'line-through text-slate-400' : 'text-teal-700'}`}>{t}</span>
        </div>
      ))}
      <div className="mt-3 flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl p-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
        <span className="text-[11px] text-indigo-600 font-medium">AI assistant available 24/7</span>
      </div>
    </div>
  );
}

function MockInterview() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 max-w-sm mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-4 h-4 text-rose-500 flex-shrink-0" />
        <p className="text-sm font-bold text-slate-800">Mock Interview — Live</p>
        <span className="ml-auto text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-bold animate-pulse whitespace-nowrap">● REC</span>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
        <p className="text-xs font-semibold text-slate-700 mb-1">Q: Explain React's reconciliation algorithm.</p>
        <p className="text-[11px] text-slate-400 italic">Your answer is being evaluated...</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[['92%', 'Clarity', 'emerald'], ['87%', 'Accuracy', 'teal'], ['95%', 'Depth', 'blue']].map(([val, lbl, col], i) => (
          <div key={i} className={`bg-${col}-50 rounded-lg p-2`}>
            <p className={`text-xs font-black text-${col}-600`}>{val}</p>
            <p className="text-[9px] text-slate-400">{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockPortfolio() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 max-w-sm mx-auto w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">JS</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">John Smith</p>
          <p className="text-[11px] text-slate-400 truncate">findstreak.com/p/johnsmith</p>
        </div>
        <span className="text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">✓ Verified</span>
      </div>
      {['React Todo App', 'REST API Server', 'ML Dashboard'].map((proj, i) => (
        <div key={i} className="flex items-center gap-2 mb-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium text-slate-700 flex-1">{proj}</span>
          <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/* ── Steps ───────────────────────────────────────────────────────────────── */
const steps = [
  { num: '00', phase: 'BEGIN',    Icon: UserPlus,    grad: 'from-violet-500 to-purple-600',  ring: 'ring-violet-200',  tag: 'bg-violet-50 text-violet-700 border-violet-200',  title: 'Create Your Free Account',  sub: 'No credit card. 60 seconds.', desc: 'Sign up in seconds — just your name, email, and password. Your AI career plan starts immediately after account creation. No subscription needed to get your first roadmap.', bullets: ['Free account — forever for core features', 'Google sign-in supported', 'Secure JWT authentication', 'Start your journey in under 60 seconds'], Mock: MockSignup },
  { num: '01', phase: 'ANALYSE',  Icon: Target,      grad: 'from-teal-500 to-emerald-500',   ring: 'ring-teal-200',    tag: 'bg-teal-50 text-teal-700 border-teal-200',        title: 'Set Your Target Role',      sub: 'Or upload your resume',       desc: 'Tell the AI what role you are aiming for. Upload your resume for a deep gap analysis, or just type your role and experience level — the AI maps your skill gap in seconds.',         bullets: ['Choose from dozens of tech roles', 'Upload resume PDF or DOCX', 'Set experience level and country', 'Switch roles anytime with Workspaces'], Mock: MockRole },
  { num: '02', phase: 'PLAN',     Icon: BrainCircuit,grad: 'from-blue-500 to-indigo-600',    ring: 'ring-blue-200',    tag: 'bg-blue-50 text-blue-700 border-blue-200',        title: 'AI Builds Your Roadmap',    sub: 'Personalised in seconds',     desc: "FindStreak's AI maps the exact skills you're missing and generates a phase-by-phase learning roadmap — specific to your role, your level, and your target job market.",              bullets: ['Skill gap identified instantly', 'Phase-by-phase roadmap generated', 'Technologies ranked by industry demand', 'Roadmap updates as you grow'], Mock: MockRoadmap },
  { num: '03', phase: 'BUILD',    Icon: Code2,       grad: 'from-emerald-500 to-teal-600',   ring: 'ring-emerald-200', tag: 'bg-emerald-50 text-emerald-700 border-emerald-200',title: 'Build Real Projects Daily', sub: 'Learn by doing, not watching', desc: 'Each day you get focused tasks inside real-world project simulations. The AI assistant guides you through every task — answering questions without just giving you the answer.',       bullets: ['AI-recommended projects for your role', 'Structured curriculum with modules', '24/7 AI learning assistant', 'Earn XP and maintain streaks daily'], Mock: MockWorkspace },
  { num: '04', phase: 'PRACTICE', Icon: Mic,         grad: 'from-rose-500 to-pink-600',      ring: 'ring-rose-200',    tag: 'bg-rose-50 text-rose-700 border-rose-200',        title: 'Interview & Mock Practice', sub: 'Turn skills into a job offer', desc: 'Practice with AI-generated role-specific interview questions. Real-Time Mock Interview uses your microphone and gives live feedback on clarity, accuracy, and depth.',                  bullets: ['Role-specific question banks', 'Real-time mock with microphone', 'AI feedback on every answer', 'Review mistakes before real interviews'], Mock: MockInterview },
  { num: '05', phase: 'SHOWCASE', Icon: Briefcase,   grad: 'from-amber-500 to-orange-500',   ring: 'ring-amber-200',   tag: 'bg-amber-50 text-amber-700 border-amber-200',     title: 'Showcase Your Portfolio',   sub: 'Proof of real work',          desc: 'Every completed project builds your public portfolio — a verified profile you share with recruiters. Show actual work with real project history and a FindStreak Verified badge.',   bullets: ['Auto-generated from completed projects', 'Shareable link: findstreak.com/p/you', 'FindStreak Verified badge', 'Streak data proves consistency'], Mock: MockPortfolio },
];

export default function HowItWorksPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#0f2a1f 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%,rgba(20,184,166,0.18) 0%,transparent 70%)' }} />
        <motion.div initial="hidden" animate="visible" variants={sw} className="max-w-3xl mx-auto relative z-10">
          <motion.div variants={fu}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-[11px] font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> How It Works
            </span>
          </motion.div>
          <motion.h1 variants={fu} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 text-white leading-[1.1]">
            From Zero to{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Job-Ready</span>
          </motion.h1>
          <motion.p variants={fu} className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            A 6-step AI-powered system that replaces random self-study with a structured career growth path.
          </motion.p>
          <motion.div variants={fu} className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button onClick={() => nav('/signup')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/30 hover:-translate-y-0.5 transition-all">
              Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => nav('/signin')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all">
              Sign In →
            </button>
          </motion.div>
          {/* Step pill row */}
          <motion.div variants={fu} className="flex flex-wrap justify-center gap-2">
            {steps.map((s, i) => (
              <button key={i} onClick={() => { nav('/signup'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-white/10 transition-all group">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${s.grad} flex items-center justify-center text-white text-[9px] font-black`}>{s.num}</div>
                <span className="text-[11px] text-slate-400 font-semibold group-hover:text-teal-400 transition-colors">{s.phase}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={sw}
                onClick={() => nav('/signup')}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

                  {/* Text block */}
                  <div className="flex-1 p-7 md:p-10">
                    <motion.div variants={fu} className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.grad} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <step.Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${step.tag}`}>
                        Step {step.num} — {step.phase}
                      </span>
                    </motion.div>
                    <motion.h2 variants={fu} className="text-2xl md:text-3xl font-black text-slate-900 mb-1 leading-tight">{step.title}</motion.h2>
                    <motion.p variants={fu} className="text-sm font-semibold text-teal-600 mb-4">{step.sub}</motion.p>
                    <motion.p variants={fu} className="text-slate-500 text-[15px] leading-relaxed mb-6 max-w-lg">{step.desc}</motion.p>
                    <motion.ul variants={fu} className="grid sm:grid-cols-2 gap-2.5 mb-6">
                      {step.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </motion.ul>
                    <motion.div variants={fu}>
                      <button onClick={(e) => { e.stopPropagation(); nav('/signup'); }} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${step.grad} shadow-md hover:-translate-y-0.5 transition-all`}>
                        {idx === 0 ? 'Create Free Account' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </div>

                  {/* Mock panel */}
                  <div className={`lg:w-80 xl:w-96 flex-shrink-0 flex items-center justify-center p-6 md:p-8 ${isEven ? 'lg:border-l' : 'lg:border-r'} border-t lg:border-t-0 border-slate-100 bg-gradient-to-br from-slate-50 to-white`}>
                    <motion.div variants={fu} className="w-full group-hover:-translate-y-1 transition-transform duration-300">
                      <step.Mock />
                    </motion.div>
                  </div>

                </div>

                {/* Bottom accent bar */}
                <div className={`h-1 bg-gradient-to-r ${step.grad} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['6 Steps', 'Zero to hired'], ['100% AI', 'Personalised plan'], ['Daily Tasks', 'Real habits built'], ['Free to Start', 'No credit card']].map(([stat, lbl], i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <p className="text-2xl md:text-3xl font-black text-teal-600 mb-1">{stat}</p>
              <p className="text-xs text-slate-500">{lbl}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse 60% 60% at 20% 50%,rgba(20,184,166,0.1) 0%,transparent 70%),radial-gradient(ellipse 60% 60% at 80% 50%,rgba(16,185,129,0.07) 0%,transparent 70%)' }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sw} className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div variants={fu}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-[11px] font-bold uppercase tracking-widest mb-5">
              <Sparkles className="w-3 h-3" /> Ready to start?
            </span>
          </motion.div>
          <motion.h2 variants={fu} className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Your career plan is<br />waiting — start in 60 seconds
          </motion.h2>
          <motion.p variants={fu} className="text-slate-400 text-base mb-8 leading-relaxed max-w-lg mx-auto">
            Create your free account, set your target role, and get your full personalised roadmap instantly.
          </motion.p>
          <motion.div variants={fu} className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => nav('/signup')} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all text-sm">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => nav('/signin')} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all text-sm">
              Sign In →
            </button>
          </motion.div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
