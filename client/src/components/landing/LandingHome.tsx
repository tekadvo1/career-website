import { Link } from 'react-router-dom';
import { ArrowRight, Check, GitBranch, Code2, Mic, Briefcase, Sparkles, Circle } from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const journey = [
  { icon: GitBranch, title: 'Choose your direction', text: 'Set a target role and find the skills to focus on next.' },
  { icon: Code2, title: 'Learn by building', text: 'Turn your roadmap into real projects, one task at a time.' },
  { icon: Mic, title: 'Practice your answers', text: 'Prepare for technical and behavioral questions with AI feedback.' },
  { icon: Briefcase, title: 'Show your work', text: 'Bring your completed projects together in a shareable portfolio.' },
];
const faqs = [
  { question: 'Can I explore without an account?', answer: 'Yes. Browse the career paths and sample roadmaps on this page. Create an account when you want a personalized plan and saved progress.' },
  { question: 'Do I need coding experience?', answer: 'No. Start with a beginner-friendly path, then tell us your experience during onboarding. Each preview lists useful prerequisites.' },
  { question: 'Do I have to upload a resume?', answer: 'No. You can describe your skills and goals instead. A resume is optional context for your personal plan.' },
  { question: 'Does completing a roadmap guarantee a job?', answer: 'No. FindStreak helps you build skills, prepare for interviews, and present your projects. Hiring outcomes depend on your experience, applications, and employers.' },
];

function PlanPreview() {
  return <aside aria-label="Illustrative learning plan" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
    <div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="flex items-center gap-2 text-sm font-semibold"><GitBranch className="h-4 w-4 text-emerald-700"/>Your learning plan</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">Sample preview</span></div>
    <p className="mt-5 text-xs font-medium text-slate-500">YOUR DIRECTION</p><h2 className="mt-1 text-xl font-bold">Frontend Developer</h2>
    <div className="mt-5 space-y-3">{['Learn the web fundamentals', 'Build responsive layouts', 'Create your first React app'].map((task, index) => <div key={task} className={`flex items-center gap-3 rounded-xl p-3 text-sm ${index === 1 ? 'border border-emerald-200 bg-emerald-50' : 'bg-slate-50'}`}>{index === 0 ? <Check className="h-4 w-4 shrink-0 text-emerald-700"/> : <Circle className="h-4 w-4 shrink-0 text-slate-400"/>}<span className="text-slate-700">{task}</span>{index === 1 && <span className="ml-auto text-xs font-semibold text-emerald-700">Next</span>}</div>)}</div>
    <div className="mt-5 rounded-xl border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><Sparkles className="h-4 w-4"/>A LITTLE PROGRESS, EVERY DAY</p><p className="mt-2 text-sm leading-6 text-slate-600">Practice a skill. Build something with it. Keep your next step in sight.</p></div>
  </aside>;
}

export default function LandingHome() {
  return <div className="findstreak-landing bg-white text-slate-900">
    <LandingHeader/>
    <main id="main-content" tabIndex={-1}>
      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:gap-20 lg:px-8">
          <div><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Your next chapter starts with a plan</p><h1 className="max-w-xl text-4xl leading-[1.12] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">A clear path to<br/>your next <span className="text-emerald-700">tech role.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Find your direction, build real projects, and practice for interviews. Move your career forward, one achievable step at a time.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:from-emerald-600 hover:to-teal-700">Build my career plan <ArrowRight className="h-4 w-4"/></Link><Link to="/#career-paths" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Explore career paths</Link></div><p className="mt-4 text-xs text-slate-500">Public path previews · Personalized plans after signup</p></div>
          <PlanPreview/>
        </div>
      </section>
      <section id="features" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-14 sm:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">More than a learning checklist</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Connect learning to something you can show.</h2><div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{journey.map((step, index) => <div key={step.title}><div className="mb-4 flex items-center gap-3"><span className="rounded-xl border border-slate-200 bg-white p-3"><step.icon className="h-5 w-5 text-emerald-700"/></span><span className="text-xs font-medium text-slate-500">0{index + 1}</span></div><h3 className="font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></div>)}</div><Link to="/how-it-works" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">See how it works <ArrowRight className="h-4 w-4"/></Link></div></section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
        <section id="projects" className="scroll-mt-24 rounded-2xl border border-slate-200 p-6 sm:p-8"><Code2 className="mb-5 h-6 w-6 text-emerald-700"/><h2 className="text-2xl font-bold tracking-tight">Make your skills tangible.</h2><p className="mt-3 text-sm leading-6 text-slate-600">Work through focused project tasks with AI guidance. Turn what you learn into work you can add to your portfolio.</p><div className="my-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Example project</p><h3 className="mt-2 font-semibold">Personal portfolio website</h3><p className="mt-2 text-sm text-slate-600">Plan your layout · Build responsive pages · Deploy and share</p></div><Link to="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">Start building with an account <ArrowRight className="h-4 w-4"/></Link></section>
        <section id="interviews" className="scroll-mt-24 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8"><Mic className="mb-5 h-6 w-6 text-emerald-700"/><h2 className="text-2xl font-bold tracking-tight">Practice before the real thing.</h2><p className="mt-3 text-sm leading-6 text-slate-600">Prepare for role-specific interviews, explain your thinking, and use AI feedback to improve your next answer.</p><div className="my-6 rounded-xl border border-emerald-100 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Example practice prompt</p><p className="mt-2 text-sm leading-6 text-slate-700">“Tell me about a project you built. What trade-offs did you make, and what would you improve?”</p></div><Link to="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">Create an account to practice <ArrowRight className="h-4 w-4"/></Link></section>
      </div>
      <section className="border-t border-slate-200 px-4 py-14 sm:py-20"><div className="mx-auto max-w-3xl"><h2 className="mb-7 text-3xl font-bold tracking-tight">A few things you might be wondering.</h2>{faqs.map(faq => <details key={faq.question} className="border-b border-slate-200 py-5"><summary className="cursor-pointer pr-4 font-semibold text-slate-800">{faq.question}</summary><p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p></details>)}<p className="mt-6 text-sm text-slate-600">Have another question? <Link to="/contact" className="font-semibold text-emerald-700">Get in touch</Link></p></div></section>
    </main><LandingFooter/>
  </div>;
}
