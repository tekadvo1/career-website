import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import {
  ArrowRight, Upload, Brain, Map, Code, BookOpen, MessageSquare,
  CheckCircle, Shield, Briefcase, FileText, Check, Target
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

// Inner component to render the visual graphic for each step
const StepVisual = ({ step }: { step: number }) => {
  return (
    <div key={step} className="w-full h-full flex flex-col items-center justify-center relative p-8 fade-in-transition">
      <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-gradient-radial from-teal-50/50 to-transparent rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[320px]">
        {/* Visual 1 */}
        {step === 0 && (
          <div className="space-y-4">
             <div className="h-16 w-16 bg-white text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-teal-100"><Shield size={32}/></div>
             <div className="h-12 bg-white border border-slate-100 rounded-xl w-full flex items-center px-4 shadow-sm"><div className="w-5 h-5 bg-slate-200 text-transparent rounded-full mr-3"/><div className="h-2 w-24 bg-slate-200 rounded-full"/></div>
             <div className="h-12 bg-white border border-slate-100 rounded-xl w-full flex items-center px-4 shadow-sm"><div className="w-5 h-5 bg-slate-200 text-transparent rounded-full mr-3"/><div className="h-2 w-32 bg-slate-200 rounded-full"/></div>
             <div className="h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl w-full mt-4 shadow-lg shadow-teal-200 flex items-center justify-center"><div className="w-20 h-2 bg-white/50 rounded-full"/></div>
          </div>
        )}
        
        {/* Visual 2 */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="h-40 w-full border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-3xl flex flex-col items-center justify-center text-teal-600 gap-3">
              <Upload size={36} className="text-teal-500" />
              <div className="h-2 w-24 bg-teal-200 rounded-full"/>
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <div className="w-12 h-16 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center opacity-70"><FileText className="text-slate-300" size={20}/></div>
              <div className="w-12 h-16 bg-white rounded-xl border-2 border-teal-400 shadow-md -translate-y-3 flex items-center justify-center"><FileText className="text-teal-500" size={20}/></div>
              <div className="w-12 h-16 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center opacity-70"><FileText className="text-slate-300" size={20}/></div>
            </div>
          </div>
        )}

        {/* Visual 3 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="h-16 w-full bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center px-5 gap-4 opacity-70">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><Check size={20}/></div>
              <div className="flex-1"><div className="h-2.5 w-20 bg-slate-800 rounded-full mb-2"/><div className="h-1.5 w-32 bg-slate-200 rounded-full"/></div>
            </div>
            <div className="h-16 w-full bg-white border-2 border-teal-200 shadow-lg shadow-teal-100 rounded-2xl flex items-center px-5 gap-4 scale-105 transform">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center"><Brain size={20}/></div>
              <div className="flex-1"><div className="h-2.5 w-28 bg-teal-800 rounded-full mb-2"/><div className="h-1.5 w-24 bg-teal-200 rounded-full"/></div>
            </div>
            <div className="h-16 w-full bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center px-5 gap-4 opacity-70">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center"><Target size={20}/></div>
              <div className="flex-1"><div className="h-2.5 w-20 bg-slate-800 rounded-full mb-2"/><div className="h-1.5 w-32 bg-slate-200 rounded-full"/></div>
            </div>
          </div>
        )}

        {/* Visual 4 */}
        {step === 3 && (
          <div className="relative h-[280px] w-full">
             <div className="absolute top-4 left-1/2 -ml-0.5 w-1 h-[240px] bg-slate-200 rounded-full"/>
             <div className="absolute top-4 left-1/2 -ml-0.5 w-1 h-24 bg-teal-400 rounded-full"/>
             
             <div className="absolute top-10 left-1/2 -ml-3 w-6 h-6 bg-teal-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)] border-4 border-white"/>
             <div className="absolute top-32 left-1/2 -ml-2.5 w-5 h-5 bg-white border-4 border-slate-300 rounded-full"/>
             <div className="absolute top-56 left-1/2 -ml-2.5 w-5 h-5 bg-white border-4 border-slate-300 rounded-full"/>

             <div className="absolute top-8 left-4 right-[55%] text-right bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                <div className="h-2.5 w-20 bg-slate-800 rounded-full ml-auto mb-2"/>
                <div className="h-1.5 w-12 bg-slate-300 rounded-full ml-auto"/>
             </div>
             <div className="absolute top-28 right-4 left-[55%] text-left bg-white p-3 rounded-2xl shadow-sm border border-slate-100 opacity-60">
                <div className="h-2.5 w-20 bg-slate-800 rounded-full mb-2"/>
                <div className="h-1.5 w-16 bg-slate-300 rounded-full"/>
             </div>
             <div className="absolute top-52 left-4 right-[55%] text-right bg-white p-3 rounded-2xl shadow-sm border border-slate-100 opacity-60">
                <div className="h-2.5 w-16 bg-slate-800 rounded-full ml-auto mb-2"/>
                <div className="h-1.5 w-20 bg-slate-300 rounded-full ml-auto"/>
             </div>
          </div>
        )}

        {/* Visual 5 */}
        {step === 4 && (
          <div className="bg-slate-900 rounded-3xl w-full h-56 p-5 shadow-2xl overflow-hidden relative border border-slate-800">
             <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"/>
                <div className="w-3 h-3 rounded-full bg-amber-500"/>
                <div className="w-3 h-3 rounded-full bg-emerald-500"/>
             </div>
             <div className="space-y-3 opacity-90 font-mono text-[10px]">
                <div className="h-2 w-1/3 bg-teal-400/80 rounded"/>
                <div className="h-2 w-1/2 bg-indigo-400/80 rounded ml-6"/>
                <div className="h-2 w-1/4 bg-emerald-400/80 rounded ml-6"/>
                <div className="h-2 w-1/5 bg-slate-500/80 rounded"/>
                <div className="h-2 w-2/3 bg-teal-400/80 rounded"/>
             </div>
             <div className="absolute bottom-5 right-5 text-emerald-400/50"><Code size={36} /></div>
          </div>
        )}

        {/* Visual 6 */}
        {step === 5 && (
          <div className="space-y-6">
             <div className="w-[85%] bg-white border border-slate-200 shadow-sm rounded-3xl p-5 rounded-bl-sm">
                <div className="h-2.5 w-1/3 bg-slate-300 rounded mb-3"/>
                <div className="h-2 w-full bg-slate-100 rounded mb-2"/>
                <div className="h-2 w-[80%] bg-slate-100 rounded"/>
             </div>
             <div className="w-[85%] bg-teal-50 border border-teal-200 shadow-md rounded-3xl p-5 rounded-br-sm ml-auto">
                <div className="h-2.5 w-1/3 bg-teal-300 rounded mb-3 ml-auto"/>
                <div className="h-2 w-full bg-teal-100/70 rounded mb-2"/>
                <div className="h-2 w-[80%] bg-teal-100/70 rounded ml-auto"/>
             </div>
          </div>
        )}

        {/* Visual 7 */}
        {step === 6 && (
          <div className="space-y-8 text-center">
             <div className="relative inline-block mt-8">
                <div className="h-32 w-32 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-teal-200/50 mx-auto">
                   <Briefcase size={50} className="text-white"/>
                </div>
                <div className="absolute top-0 -right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-md animate-bounce">
                  ✨
                </div>
             </div>
             <div>
                <div className="h-3 w-32 bg-slate-800 rounded-full mx-auto mb-3"/>
                <div className="h-2 w-48 bg-slate-300 rounded-full mx-auto"/>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Scroll spy logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveStep(index);
            }
          }
        });
      },
      {
        rootMargin: '-30% 0px -60% 0px', // Trigger when a step reaches the top/middle area
        threshold: 0,
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
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

      {/* Steps Container (Scroll Spy Layout) */}
      <section className="py-10 lg:py-24 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start relative">
            
            {/* Left Column: List of Steps */}
            <div className="space-y-20 lg:space-y-40 pb-32">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  ref={(el) => { stepRefs.current[i] = el; }}
                  data-index={i}
                  className={`transition-all duration-700 w-full max-w-xl mx-auto lg:mx-0 ${activeStep === i ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4 lg:hover:opacity-100 cursor-pointer lg:hover:translate-x-0'}`}
                  onClick={() => i !== activeStep && stepRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  <div className="flex items-center gap-5 mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-500 ${activeStep === i ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-teal-600 font-bold text-[11px] uppercase tracking-widest mb-1">{step.subtitle}</p>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{step.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                    {step.desc}
                  </p>
                  
                  <div className="space-y-4">
                    {step.bullets.map((b, j) => (
                      <div key={j} className="flex items-start gap-4">
                        <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 transition-colors duration-500 ${activeStep === i ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className="text-slate-700 font-medium leading-snug text-[15px]">{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Visual (hidden on large screens) */}
                  <div className={`mt-12 lg:hidden w-full aspect-square rounded-[2rem] bg-slate-50 border border-slate-200 overflow-hidden relative shadow-inner transition-all duration-500 ${activeStep === i ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0 overflow-hidden'}`}>
                    <StepVisual step={i} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Sticky Visual (Desktop only) */}
            <div className="hidden lg:flex sticky top-32 h-[calc(100vh-16rem)] max-h-[700px] w-full max-w-lg ml-auto items-center justify-center">
              <div className="w-full aspect-[4/5] rounded-[3rem] bg-slate-50 border border-slate-200 overflow-hidden relative shadow-md">
                {/* We render the visual for the active step */}
                <StepVisual step={activeStep} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-slate-50 border-y border-slate-200 relative overflow-hidden">
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
