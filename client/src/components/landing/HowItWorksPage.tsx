import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, User, Check, Circle, Code2, Mic, Briefcase } from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const steps = [
  {
    num: '01',
    title: 'Choose your direction',
    desc: 'Select a target role and share your current experience level. You can upload a resume if you have one, but it is completely optional.',
    Mock: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">YOUR GOAL</p>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-800 text-sm">Frontend Developer</span>
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">EXPERIENCE</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="text-slate-600 text-sm">Beginner</span>
        </div>
      </div>
    )
  },
  {
    num: '02',
    title: 'Get your personal roadmap',
    desc: 'The platform identifies areas to develop and organizes your learning into manageable topics based on your specific goal.',
    Mock: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 relative text-left">
        <div className="absolute left-7 top-10 bottom-6 w-0.5 bg-slate-100 z-0"></div>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-emerald-500 shrink-0 ring-4 ring-white" />
            <span className="text-sm font-semibold text-slate-900">HTML & CSS Basics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-emerald-500 bg-white shrink-0 ring-4 ring-white" />
            <span className="text-sm font-semibold text-emerald-700">Responsive Layouts</span>
            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">CURRENT</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-slate-200 shrink-0 ring-4 ring-white" />
            <span className="text-sm font-medium text-slate-500">JavaScript DOM</span>
          </div>
        </div>
      </div>
    )
  },
  {
    num: '03',
    title: 'Build real projects',
    desc: 'Work through project tasks guided by AI when you need help. Turn what you learn into practical output, not just points.',
    Mock: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 text-left">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">ACTIVE PROJECT</p>
        <h4 className="text-sm font-bold text-slate-900 mb-4">Personal Portfolio Website</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
             <Check className="h-3 w-3 text-emerald-500 shrink-0" />
             <span className="text-xs text-slate-500 line-through">Plan the layout</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
             <Circle className="h-3 w-3 text-emerald-600 shrink-0" />
             <span className="text-xs font-semibold text-emerald-800">Build responsive grid</span>
             <span className="ml-auto text-[10px] font-bold text-emerald-600">NEXT</span>
          </div>
        </div>
      </div>
    )
  },
  {
    num: '04',
    title: 'Practice for interviews',
    desc: 'Answer role-specific questions and receive illustrative AI feedback to help you improve your clarity and depth.',
    Mock: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 text-left">
         <div className="flex items-center gap-2 mb-3">
            <Mic className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Sample Practice Prompt</span>
         </div>
         <p className="text-sm text-slate-800 mb-4 border-l-2 border-slate-200 pl-3">"What are the benefits of using a CSS preprocessor?"</p>
         <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI FEEDBACK</p>
            <p className="text-xs text-slate-600 leading-relaxed">Great answer. Next time, try to mention variables and nesting as specific examples to demonstrate deeper understanding.</p>
         </div>
      </div>
    )
  },
  {
    num: '05',
    title: 'Share your work',
    desc: 'Bring your completed projects and skills together into a shareable portfolio layout.',
    Mock: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 text-left">
        <div className="flex items-center gap-3 mb-5">
           <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold shrink-0">JS</div>
           <div>
              <p className="text-sm font-bold text-slate-900">John Smith</p>
              <p className="text-xs text-slate-500">Frontend Developer</p>
           </div>
        </div>
        <div className="space-y-2">
           <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Weather Dashboard</span>
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">React</span>
           </div>
           <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Task Tracker</span>
              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">JS</span>
           </div>
        </div>
      </div>
    )
  }
];

const faqs = [
  { question: 'Can I explore before signing up?', answer: 'Yes. Browse the career paths and sample roadmaps on the homepage. Create an account when you want a personalized plan and saved progress.' },
  { question: 'Do I need a resume?', answer: 'No. You can describe your skills and goals instead. A resume is optional context for your personal plan.' },
  { question: 'Can I start without coding experience?', answer: 'Yes. Simply select an entry-level role and indicate you are a beginner. The platform will suggest foundational skills to start.' },
  { question: 'How is my roadmap personalized?', answer: 'The roadmap is tailored based on your current experience, target role, and any specific background (like a resume) you provide, highlighting the precise gaps you need to fill.' },
  { question: 'Does completing a roadmap guarantee a job?', answer: 'No. FindStreak helps you build skills, prepare for interviews, and present your projects. Hiring outcomes depend on your experience, applications, and employers.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        {/* 1. Compact introduction */}
        <section className="pt-24 pb-16 px-4 sm:px-6 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center">
          <div className="max-w-3xl mx-auto">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />HOW FINDSTREAK WORKS
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              From a career goal to work you can show.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Choose your direction, follow a personal learning plan, and turn your progress into projects, interview practice, and a portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 transition-colors">
                Build my career plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/#career-paths" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Explore career paths
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Five-step journey */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute left-1/2 -ml-px top-8 bottom-8 w-px bg-slate-200"></div>
            
            <ol className="relative border-l border-slate-200 ml-3 sm:ml-4 md:border-none md:ml-0 space-y-16">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <li key={step.num} className="relative pl-8 md:pl-0">
                     {/* Mobile line marker */}
                     <span className="md:hidden absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-white border border-slate-200 text-xs font-bold text-slate-400">
                        {step.num}
                     </span>
                     
                     <div className="md:grid md:grid-cols-2 md:gap-24 items-center">
                        <div className={`mb-8 md:mb-0 ${!isEven ? 'md:order-2' : 'md:text-right'}`}>
                           <p className="text-emerald-600 font-bold text-sm mb-2 md:hidden">STEP {step.num}</p>
                           <p className="hidden md:block text-emerald-600 font-bold text-sm mb-2">STEP {step.num}</p>
                           <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                           <p className="text-slate-600 text-base leading-relaxed">{step.desc}</p>
                        </div>
                        
                        {/* Central desktop line marker */}
                        <div className="hidden md:flex absolute left-1/2 -ml-4 w-8 h-8 bg-white rounded-full border border-slate-200 items-center justify-center z-10 text-xs font-bold text-slate-400 ring-4 ring-white">
                           {step.num}
                        </div>

                        <div className={`${!isEven ? 'md:order-1' : ''}`}>
                           <step.Mock />
                           <p className="text-center text-[10px] uppercase font-bold text-slate-400 mt-3 tracking-wider">Example Preview</p>
                        </div>
                     </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* 3. Explain where to begin */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
           <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold tracking-tight text-slate-900">Start from where you are.</h2>
                 <p className="mt-4 text-slate-600">No matter your background, we adapt to your goals.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                 <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <User className="h-6 w-6 text-emerald-600 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">New to tech</h3>
                    <p className="text-sm text-slate-600">Start with foundational skills. We'll introduce the basics and guide you step-by-step toward your first project.</p>
                 </div>
                 <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <Briefcase className="h-6 w-6 text-emerald-600 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">Changing careers</h3>
                    <p className="text-sm text-slate-600">Share your transferable skills and target role. We'll bridge the gap so you can leverage your past experience.</p>
                 </div>
                 <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <Code2 className="h-6 w-6 text-emerald-600 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">Already learning</h3>
                    <p className="text-sm text-slate-600">Identify gaps in your knowledge and apply what you already know through practical, hands-on projects.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 4. Focused FAQs */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-7 text-3xl font-bold tracking-tight text-slate-900 text-center">Frequently asked questions</h2>
            <div className="space-y-2">
              {faqs.map(faq => (
                <details key={faq.question} className="border border-slate-200 rounded-xl py-5 px-6 group bg-slate-50 [&[open]]:bg-white">
                  <summary className="cursor-pointer font-semibold text-slate-800 list-none flex justify-between items-center [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="text-slate-400 group-open:rotate-45 transition-transform text-2xl font-light leading-none">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Final action */}
        <section className="py-24 px-4 sm:px-6 bg-slate-900 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 opacity-50"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">Start with a direction.<br/>Take it one step at a time.</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                 <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 px-6 py-4 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-colors">
                   Build my career plan <ArrowRight className="h-4 w-4" />
                 </Link>
                 <Link to="/#career-paths" className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-6 py-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
                   Explore career paths
                 </Link>
              </div>
           </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
