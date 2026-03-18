import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Sparkles, BrainCircuit, Code2, Target, MessageSquare, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-[11px] font-semibold uppercase tracking-widest mb-4">
      <Sparkles className="w-3 h-3" />{children}
    </span>
  );
}

const steps = [
  {
    num: '01',
    icon: Target,
    title: 'Set Your Target Role',
    subtitle: 'Start with your goal',
    desc: 'Tell FindStreak what tech role you are aiming for — Frontend Developer, Backend Engineer, DevOps, Data Analyst, or any other role. You can also upload your resume or describe your current experience so the AI has full context about where you are starting from.',
    features: [
      'Select from dozens of tech roles',
      'Upload resume (PDF or DOCX) for AI analysis',
      'Manually describe your current skills',
      'Switch roles any time using Workspaces',
    ],
  },
  {
    num: '02',
    icon: BrainCircuit,
    title: 'AI Builds Your Roadmap',
    subtitle: 'Personalised to your level',
    desc: 'Once you set your goal, FindStreak\'s AI analyses the exact skill gap between where you are now and where you need to be. It generates a step-by-step roadmap with topics, technologies, and milestones — all specific to your role and current level. No generic curriculum.',
    features: [
      'Skill gap identified against your target role',
      'Phase-by-phase roadmap generated in seconds',
      'Technologies and tools prioritised by industry demand',
      'Roadmap updates as your skills grow',
    ],
  },
  {
    num: '03',
    icon: Code2,
    title: 'Build Real Projects Daily',
    subtitle: 'Learn by doing, not watching',
    desc: 'Each day, you receive tasks inside real-world project simulations. These are not homework exercises — they mirror work you would do in an actual job. The AI assistant is available throughout every task to answer questions, review your approach, and nudge you in the right direction without giving you the answer.',
    features: [
      'Daily tasks generated for your current skill stage',
      'Real industry-style project simulations',
      'AI guidance and code review at every step',
      'Track streaks to build learning consistency',
    ],
  },
  {
    num: '04',
    icon: MessageSquare,
    title: 'Prepare & Interview',
    subtitle: 'Turn skills into a job offer',
    desc: 'Once you have built real projects, you need to be able to talk about them. FindStreak\'s interview simulator puts you in realistic technical and behavioural interview scenarios designed for your target role. The AI evaluates your answers and gives you actionable feedback — not just "good job".',
    features: [
      'Role-specific technical question sets',
      'Simulated behavioural interviews',
      'AI feedback on answer quality and structure',
      'Review common mistakes before real interviews',
    ],
  },
  {
    num: '05',
    icon: Briefcase,
    title: 'Showcase Your Portfolio',
    subtitle: 'Proof of real work',
    desc: 'Every project you complete inside FindStreak contributes to a professional portfolio you can share with employers. Rather than listing courses you have taken, you can show actual work — complete with task history, technologies used, and completion milestones. This is what modern hiring managers actually want to see.',
    features: [
      'Auto-generated portfolio from completed projects',
      'Shareable public profile link',
      'Project cards with tech stack and status',
      'Demonstrates consistency with streak data',
    ],
  },
];

export default function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />

      {/* Hero */}
      <section
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-gradient-to-b from-slate-50 to-white"
        style={{}}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto relative">
          <motion.div variants={fadeUp}><SectionBadge>How It Works</SectionBadge></motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black tracking-tight mb-5 text-slate-900">
            A System That Actually{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Gets You Hired</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg leading-relaxed mb-10">
            FindStreak replaces random self-study with a structured, AI-guided career growth system.
            Here is exactly how the platform works — step by step.
          </motion.p>
          <motion.div variants={fadeUp}>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={stagger}
              className="grid md:grid-cols-[180px_1fr] gap-8 p-8 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all duration-300"
            >
              {/* Left */}
              <motion.div variants={fadeUp} className="flex flex-col items-start gap-4">
                <div className="text-6xl font-black text-slate-100 leading-none">{step.num}</div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-teal-600 font-semibold uppercase tracking-widest mb-1">{step.subtitle}</p>
                  <h2 className="text-xl font-black text-slate-900">{step.title}</h2>
                </div>
              </motion.div>

              {/* Right */}
              <motion.div variants={fadeUp}>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-6">{step.desc}</p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {step.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight mb-4 text-slate-900">
              Ready to Get Started?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 mb-8">
              Create a free account, set your target role, and get your personalized roadmap in minutes.
            </motion.p>
            <motion.button
              variants={fadeUp}
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
