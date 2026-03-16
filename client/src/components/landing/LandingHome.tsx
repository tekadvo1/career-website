import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  Terminal,
  Trophy,
  Code2,
  CheckCircle,
  LayoutDashboard,
  Server,
  Cloud,
  Bug,
  Sparkles,
  Zap,
  Briefcase,
  PlayCircle
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      <LandingHeader />

      {/* ── HERO ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* Left Content */}
        <motion.div 
          className="flex-1 text-center lg:text-left z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI-Guided Career Accelerator</span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 mb-6">
            Build Your Tech Career by Working on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-teal-800 to-teal-700">
              Real AI-Guided Projects
            </span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
            FindStreak analyzes your background and creates a personalized roadmap. Then it guides you daily through real-world projects, interview preparation, and measurable progress.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
            <button
              onClick={() => navigate('/signup')}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Your Free Career Plan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg shadow-sm transition-all duration-200"
            >
              See How It Works
              <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>
          </motion.div>

          <motion.div variants={fadeIn} className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-500" /> Learn by doing</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-teal-500" /> Industry-style projects</span>
          </motion.div>
        </motion.div>

        {/* Right Dashboard Mockup */}
        <motion.div 
          className="flex-1 w-full max-w-2xl lg:max-w-none relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-teal-100 rounded-full blur-[100px] opacity-50 z-0"></div>
          
          <div className="relative z-10 bg-white border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden flex flex-col">
            {/* Mockup Header */}
            <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-48 bg-white border border-slate-200 rounded text-[10px] text-slate-400 font-medium flex items-center justify-center">
                  findstreak.com / dashboard
                </div>
              </div>
            </div>
            
            {/* Mockup Content */}
            <div className="p-6 grid grid-cols-3 gap-6 bg-slate-50/50">
               {/* Left column */}
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Daily Project Task</h3>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm group hover:border-teal-200 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-sm font-semibold text-slate-900">Implement Authentication UI</span>
                       <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium">In Progress</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 mb-2 overflow-hidden">
                       <motion.div 
                         className="bg-teal-500 h-1.5 rounded-full" 
                         initial={{ width: 0 }} 
                         animate={{ width: "65%" }} 
                         transition={{ duration: 1.5, delay: 1 }}
                       />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">65% Completed • Estimated 2h left</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Skill Gap</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <span className="text-xs font-medium text-slate-700">TypeScript Generics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                      <span className="text-xs font-medium text-slate-700">React Hooks (Mastered)</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-slate-100">
                       <Zap className="w-24 h-24" />
                    </div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Current Streak</h3>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <motion.span 
                        className="text-3xl font-black text-slate-900"
                      >
                         14
                      </motion.span>
                      <span className="text-xs font-medium text-slate-500">Days</span>
                    </div>
                  </div>
                </div>
              </div>

               {/* Right column - AI Chat */}
              <div className="col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-100 flex items-center justify-center">
                    <BrainCircuit className="w-3.5 h-3.5 text-teal-700" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">AI Guide</span>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-3">
                  <div className="bg-slate-100 rounded-lg rounded-tl-none p-2 text-[10px] text-slate-700 font-medium w-5/6">
                    Ready to tackle the JWT integration? I've prepared a code skeleton for you.
                  </div>
                  <div className="bg-teal-50 border border-teal-100 rounded-lg rounded-tr-none p-2 text-[10px] text-teal-900 font-medium w-5/6 self-end">
                    Yes, let's look at the fetch interceptors first.
                  </div>
                </div>
                <div className="p-2 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-[9px] text-slate-400">
                    Ask for a hint...
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <motion.div 
             className="absolute -right-6 top-12 bg-white border border-slate-200 rounded-lg shadow-lg p-3 flex items-center gap-3 z-20"
             animate={{ y: [0, -8, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
             <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
               <CheckCircle className="w-4 h-4 text-emerald-600" />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-900">Milestone Reached</p>
               <p className="text-[9px] text-slate-500">Frontend Basics completed</p>
             </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ── REAL-TIME PROJECT LEARNING SECTION ──────────────────────────────────── */}
      <section id="projects" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              Learn by Building Real Projects — Guided by AI
            </h2>
            <p className="text-slate-600">
              Users are not just watching tutorials. They are completing structured tasks inside real project simulations, preparing them for actual industry work.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: 'Build a React Dashboard', icon: LayoutDashboard, diff: 'Beginner', time: '12h', progress: 100 },
              { title: 'Create a REST API Service', icon: Server, diff: 'Intermediate', time: '18h', progress: 45 },
              { title: 'Deploy a Cloud Feature', icon: Cloud, diff: 'Advanced', time: '8h', progress: 0 },
              { title: 'Fix Production Bug Scenario', icon: Bug, diff: 'Advanced', time: '4h', progress: 0 },
            ].map((p, i) => (
              <motion.div 
                key={i} variants={fadeIn}
                className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                  <p.icon className="w-5 h-5 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{p.title}</h3>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 mb-4">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">{p.diff}</span>
                  <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> AI Hints available</span>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1.5">
                    <span>{p.progress}% Complete</span>
                    <span>Est. {p.time}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className={`h-1.5 rounded-full ${p.progress === 100 ? 'bg-emerald-500' : 'bg-teal-500'}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">How It Works</h2>
          </motion.div>

          <div className="relative">
             {/* Connector line */}
            <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-slate-100">
               <motion.div 
                 className="h-full bg-teal-500 origin-left"
                 initial={{ scaleX: 0 }}
                 whileInView={{ scaleX: 1 }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 viewport={{ once: true, margin: "-100px" }}
               />
            </div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10"
            >
              {[
                { num: '1', title: 'Upload Resume or Background' },
                { num: '2', title: 'AI Analyzes Skills' },
                { num: '3', title: 'Get Personalized Roadmap' },
                { num: '4', title: 'Build Real Projects + Prepare Interviews' },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeIn} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-xl font-black text-slate-900 mb-6 bg-gradient-to-b from-white to-slate-50 relative">
                     <div className="absolute inset-0 rounded-2xl border-2 border-transparent hover:border-teal-500 transition-colors cursor-default" />
                    {step.num}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm max-w-[180px] leading-snug">{step.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Core Platform Features</h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: BrainCircuit, title: 'AI Skill Gap Analysis', desc: 'Identify exactly what you need to learn.' },
              { icon: Sparkles, title: 'Personalized Learning Path', desc: 'A custom curriculum tailored to you.' },
              { icon: Code2, title: 'Real-Time Project Guidance', desc: 'Step-by-step help inside simulated tasks.' },
              { icon: Terminal, title: 'Interview Simulator', desc: 'Practice with AI technical interviewers.' },
              { icon: Trophy, title: 'Progress Tracking System', desc: 'Measure your growth visibly.' },
              { icon: Briefcase, title: 'Portfolio Builder', desc: 'Showcase your real-world project completions.' },
            ].map((f, i) => (
              <motion.div 
                key={i} variants={fadeIn}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                  <f.icon className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-[15px] mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRODUCT EXPERIENCE PREVIEW ──────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
           <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Inside the Experience</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Experience a platform built like the tools you will use in your actual job.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-4 shadow-2xl"
          >
            {/* Minimal App UI Mockup */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
               {/* Header */}
               <div className="h-12 border-b border-slate-100 flex items-center px-6 justify-between">
                 <div className="flex gap-4">
                   <span className="text-sm font-bold text-slate-900">Project Board</span>
                   <span className="text-sm font-medium text-slate-400">Timeline</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                     <Zap className="w-3.5 h-3.5 text-teal-500 fill-teal-500" /> 14 Day Streak
                   </div>
                 </div>
               </div>
               {/* Content */}
               <div className="flex-1 flex bg-slate-50/50 p-6 gap-6 overflow-hidden">
                 {/* Kanban */}
                 <div className="flex-1 flex gap-4">
                   <div className="w-1/3 bg-slate-100 rounded-lg p-3">
                     <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">To Do</h4>
                     <div className="bg-white p-3 rounded shadow-sm border border-slate-200 mb-2">Write API Tests</div>
                     <div className="bg-white p-3 rounded shadow-sm border border-slate-200">Setup CI/CD</div>
                   </div>
                   <div className="w-1/3 bg-slate-100 rounded-lg p-3">
                     <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">In Progress</h4>
                     <motion.div className="bg-white p-3 rounded shadow-sm border border-teal-200 ring-1 ring-teal-100 relative overflow-hidden group hover:shadow-md transition-all">
                       <span className="text-sm font-medium text-slate-900 block mb-2">Build Authorization Middleware</span>
                       <div className="flex gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200"></div>
                       </div>
                     </motion.div>
                   </div>
                   <div className="w-1/3 bg-slate-100 rounded-lg p-3">
                     <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Done</h4>
                     <div className="bg-white p-3 rounded shadow-sm border border-slate-200 opacity-60">Design DB Schema</div>
                   </div>
                 </div>
                 {/* Right Side Agent */}
                 <div className="w-64 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
                    <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">AI Assistant</span>
                    </div>
                    <div className="p-4 flex-1">
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                        I noticed you're starting on the Authorization Middleware. I recommend reviewing JWT verification concepts first. Would you like a quick refresher?
                      </p>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Success Stories</h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
               { quote: "The mock real-world tasks made all the difference. I wasn't just copying code anymore.", author: "Sarah Jenkins", role: "Junior Frontend Engineer", badge: "Got frontend role offer" },
               { quote: "FindStreak's daily roadmap kept me accountable. The AI guidance felt like a real senior dev reviewing my PRs.", author: "David Chen", role: "Full Stack Developer", badge: "Built 5 projects in 3 months" },
               { quote: "I aced my technical interview because the simulated environment here is exactly like the real thing.", author: "Maya Patel", role: "React Engineer", badge: "Transitioned in 4 months" },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                   <span className="inline-flex items-center bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                     {t.badge}
                   </span>
                </div>
                <p className="text-sm text-slate-600 mb-6 italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.author}</p>
                    <p className="text-[10px] font-medium text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Simple, Transparent Pricing</h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { name: 'Free', price: '$0', desc: 'Basic roadmap and community access', isPro: false },
              { name: 'Pro', price: '$29/mo', desc: 'Full AI guidance + interview prep', isPro: true },
              { name: 'Mentor', price: '$99/mo', desc: '1-on-1 expert checks + Pro features', isPro: false }
            ].map((plan, i) => (
              <motion.div 
                key={i} variants={fadeIn}
                className={`flex flex-col p-6 rounded-2xl border ${plan.isPro ? 'border-teal-500 shadow-lg scale-105 bg-white relative z-10' : 'border-slate-200 shadow-sm bg-slate-50'}`}
              >
                {plan.isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-black text-slate-900 mb-4">{plan.price}</div>
                <p className="text-sm font-medium text-slate-500 mb-8">{plan.desc}</p>
                <button className={`mt-auto py-2.5 rounded-lg text-sm font-bold transition-all ${plan.isPro ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  Select {plan.name}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight mb-6"
          >
            Start Building Your <br className="hidden sm:block" />Tech Career Today
          </motion.h2>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <button
               onClick={() => navigate('/signup')} 
               className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]"
            >
               Start Your Free Plan
               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
