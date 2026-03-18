import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, BrainCircuit, Code2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger: any = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/[0.08] text-teal-400 text-[11px] font-semibold uppercase tracking-widest mb-4">
      <Sparkles className="w-3 h-3" />{children}
    </span>
  );
}

const values = [
  {
    icon: Target,
    title: 'Outcome-Focused',
    desc: "Everything on FindStreak is built around one outcome: getting you hired in a tech role. Features that don't serve that goal don't exist on the platform.",
  },
  {
    icon: BrainCircuit,
    title: 'AI That Understands Context',
    desc: "Our AI assistant knows your role, your current project, and your skill level. It doesn't give generic advice — it gives guidance that is relevant to exactly what you are working on.",
  },
  {
    icon: Code2,
    title: 'Real Work Over Theory',
    desc: 'We believe developers learn by building. Every task on FindStreak replicates real industry work. We do not believe passive learning alone prepares you for a job.',
  },
  {
    icon: Zap,
    title: 'Consistency Wins',
    desc: 'Career growth is not about bursts of effort. It is about daily consistency. The streak system exists because we know that small daily progress beats occasional marathon sessions every time.',
  },
];

export default function AboutPage() {
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
          <motion.div variants={fadeUp}><SectionBadge>About FindStreak</SectionBadge></motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black tracking-tight mb-5 text-slate-900">
            We Believe Developers Learn by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Doing Real Work</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg leading-relaxed">
            FindStreak was built because too many talented developers are stuck watching tutorials without ever building
            the real-world experience that employers actually hire for.
          </motion.p>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-10"
          >
            <motion.div variants={fadeUp}><SectionBadge>Our Mission</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-black mb-5">
              Close the Gap Between Learning and Hiring
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-4 text-gray-400 text-[15px] leading-relaxed">
              <p>
                The tech job market has a paradox: companies say they cannot find skilled developers,
                yet thousands of developers who have spent months or years learning cannot get hired.
                The gap is not knowledge — it is the ability to apply that knowledge to real problems.
              </p>
              <p>
                Traditional online courses and tutorials teach concepts in isolation. They don't teach you how to
                build a complete feature, debug production issues, or communicate through code reviews — the skills
                that actually get evaluated in interviews and on the job.
              </p>
              <p>
                FindStreak is our answer to that problem. We built a platform where every hour of learning produces
                something real — a project, a skill demonstrated in actual code, a portfolio entry that employers
                can verify.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp}><SectionBadge>Our Principles</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight">
              What We Stand For
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 gap-5"
          >
            {values.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-teal-500/20 hover:bg-teal-500/[0.02] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5">
                  <v.icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-bold text-white text-[15px] mb-3">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.div variants={fadeUp}><SectionBadge>Who It's For</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight mb-4">
              Built for Developers at Every Stage
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-3 gap-5"
          >
            {[
              {
                label: 'Beginners',
                desc: 'You are learning your first tech stack and want a clear path to your first job without wasting time on irrelevant courses.',
              },
              {
                label: 'Career Switchers',
                desc: 'You are coming from a different industry and need to build real evidence of your tech skills quickly and efficiently.',
              },
              {
                label: 'Self-Taught Devs',
                desc: 'You have learned a lot but struggle to fill gaps, prove your skills to employers, or pass technical interviews.',
              },
            ].map((g, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center"
              >
                <h3 className="font-bold text-teal-400 text-sm uppercase tracking-widest mb-3">{g.label}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{g.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight mb-4">
              Start Building Your Career Today
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 mb-8">
              Create a free account. Set your target role. Get your personalized roadmap in minutes.
            </motion.p>
            <motion.button
              variants={fadeUp}
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-xl shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
