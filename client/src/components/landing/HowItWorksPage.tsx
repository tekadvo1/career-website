import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  ArrowRight, Upload, Brain, Map, Code, BookOpen, MessageSquare,
  CheckCircle, Shield, Briefcase
} from 'lucide-react';

const steps = [
  { 
    icon: <Shield className="w-6 h-6" />, 
    title: '1. Create Your Secure Account', 
    subtitle: 'Takes less than a minute', 
    desc: 'Getting started is completely free and requires no payment information. We value your privacy and only ask for the essentials to set up your personal learning dashboard reliably.', 
    bullets: ['Quick sign-up with email or Google', 'No credit card or commitment required', 'Your data is securely stored and private'] 
  },
  { 
    icon: <Upload className="w-6 h-6" />, 
    title: '2. Share Your Background', 
    subtitle: 'Help us understand you', 
    desc: 'Simply upload your current resume in PDF or Word format. Our AI gently reviews it to understand your existing skills and experience. This ensures we never ask you to relearn things you already know.', 
    bullets: ['Accepts standard PDF or Word formats', 'We safely process and protect your document', 'Choose from over 50 supported tech career paths'] 
  },
  { 
    icon: <Brain className="w-6 h-6" />, 
    title: '3. Receive Your Gap Analysis', 
    subtitle: 'Clarity on what to learn', 
    desc: 'We compare your current background against live, real-world job requirements for your chosen role. You receive a clear, encouraging report showing exactly where to focus your energy next.', 
    bullets: ['Easy-to-read breakdown of strengths and gaps', 'Removes the anxiety of guessing what employers want', 'Prioritises the most impactful skills first'] 
  },
  { 
    icon: <Map className="w-6 h-6" />, 
    title: '4. Follow Your Custom Roadmap', 
    subtitle: 'A step-by-step guide just for you', 
    desc: 'Using your analysis, we generate a highly structured, visual learning path. It breaks down intimidating topics into small, friendly, manageable steps that feel rewarding to complete.', 
    bullets: ['Fully personalised to your unique starting point', 'Visual tree layout keeps you oriented and calm', 'Click any topic for detailed, beginner-friendly explanations'] 
  },
  { 
    icon: <Code className="w-6 h-6" />, 
    title: '5. Build Real, Guided Projects', 
    subtitle: 'Learn by doing, safely', 
    desc: 'Forget overwhelming tutorials. We recommend a project matched exactly to your skill level. It comes broken down into daily tasks, with step-by-step guidance so you are fully supported throughout.', 
    bullets: ['Projects matched carefully to your current comfort level', 'Structured daily tasks prevent burnout', 'Builds a tangible portfolio to show recruiters'] 
  },
  { 
    icon: <MessageSquare className="w-6 h-6" />, 
    title: '6. Practice Interviews with Empathy', 
    subtitle: 'Build confidence without pressure', 
    desc: 'Interviews are stressful. We provide a safe, simulated environment to practice. Our AI mentor gently evaluates your answers and provides constructive, positive feedback to help you improve.', 
    bullets: ['Low-pressure environment to reduce anxiety', 'Questions specific to your target job role', 'Constructive feedback focused on helping you shine'] 
  },
  { 
    icon: <Briefcase className="w-6 h-6" />, 
    title: '7. Prepare for Success', 
    subtitle: 'Get ready for your new career', 
    desc: 'As you complete projects and practice interviews, your FindStreak profile grows. You earn experience points, track your streak, and build a resume-ready portfolio of work that employers value.', 
    bullets: ['Track your daily wins and see your growth', 'Maintain motivation through a positive reward system', 'Share an impressive portfolio profile with recruiters'] 
  }
];

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(0); // Open the first one by default for friendliness

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-teal-100/60 to-transparent rounded-full blur-3xl opacity-70" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <BookOpen className="w-4 h-4 text-teal-500" />
            A Guided Journey
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            How Can We Help You <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Achieve Your Goals?</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
            We have designed FindStreak to be as uncomplicated and supportive as possible. Here are the 7 simple steps we take together to get you ready for your next tech role.
          </p>
        </div>
      </section>

      {/* Steps Container */}
      <section className="py-20 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-5">
          {steps.map((step, i) => {
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm ${isOpen ? 'border-teal-300 bg-white shadow-md transform scale-[1.01]' : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-md cursor-pointer'}`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center gap-5 px-6 py-6 text-left focus:outline-none"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all border shadow-sm ${isOpen ? 'bg-teal-600 text-white border-teal-700 scale-110' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0 pl-2">
                    <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-1">{step.subtitle}</p>
                    <h3 className={`font-black text-xl leading-snug ${isOpen ? 'text-slate-900' : 'text-slate-800'}`}>{step.title}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-slate-100' : ''}`}>
                    <span className={`text-2xl font-light transition-transform duration-300 ${isOpen ? 'text-teal-600 rotate-45' : 'text-slate-400'}`}>+</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-8 pb-8 pt-2">
                    <div className="pl-16 ml-3 border-t border-slate-100 pt-6">
                      <p className="text-slate-600 text-[15px] leading-relaxed mb-6 font-medium">{step.desc}</p>
                      <div className="grid gap-3">
                        {step.bullets.map((b, j) => (
                          <div key={j} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[15px] text-slate-700 font-medium leading-snug">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white border-t border-slate-200 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Ready to Take Step 1?</h2>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">Create your free account today and let us guide you through your first personalised skill analysis in under 5 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all hover:-translate-y-1">
              Start Your Free Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
