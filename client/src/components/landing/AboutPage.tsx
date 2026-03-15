import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Target, Heart, Shield, ArrowRight, Lightbulb, Users, Compass } from 'lucide-react';

const values = [
  { icon: <Compass className="w-6 h-6" />, title: 'Providing Clear Direction', desc: 'The tech industry is filled with overwhelming advice. We aim to cut through the noise by giving you a single, clear, personalised compass to follow.' },
  { icon: <Heart className="w-6 h-6" />, title: 'Leading with Empathy', desc: 'Learning a new skill is vulnerable and difficult. We design every feature to be encouraging, constructive, and supportive, never intimidating.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Radical Honesty', desc: 'We only recommend skills and tools that are actually requested by employers today. We do not sell false promises or sell your data.' },
  { icon: <Target className="w-6 h-6" />, title: 'Practical Application', desc: 'Theory is important, but building is essential. We strongly believe that guided, hands-on experience is the kindest and most effective way to learn.' },
  { icon: <Users className="w-6 h-6" />, title: 'Accessible to Everyone', desc: 'Whether you are self-taught, transitioning from another career, or fresh out of a bootcamp, our platform meets you exactly where you are.' },
  { icon: <Lightbulb className="w-6 h-6" />, title: 'Continuous Growth', desc: 'We celebrate small daily wins because we know that consistent, gentle progress is what builds lasting confidence and true expertise.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-teal-100/60 to-transparent blur-3xl rounded-full opacity-60" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <Heart className="w-4 h-4 text-teal-500" />
            Our Mission & Story
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-slate-900">
            Making Tech Careers <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Accessible for Everyone</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            We believe that anyone with determination should be able to build a fulfilling career in technology. We created FindStreak to provide the clear, supportive guidance we wished we had when we started.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="py-24 px-4 border-y border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-14 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-60" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Why FindStreak Exists</h2>
              <div className="space-y-6 text-slate-600 text-[17px] leading-relaxed font-medium">
                <p>
                  The internet has made it incredibly easy to find tutorials, courses, and documentation. But ironically, this abundance of resources has created a new problem: <strong className="text-slate-900 font-bold">overwhelming confusion.</strong>
                </p>
                <p>
                  When speaking with junior developers and career changers, we constantly heard the same frustrations: "I don't know what to learn next," "I feel like I have tutorial hell," and "I don't know if I'm ready for a real job." The anxiety was palpable.
                </p>
                <p>
                  FindStreak was born from a desire to replace that anxiety with clarity. We wanted to build a gentle, intelligent system that acts like a patient mentor. A platform that looks at your unique background, holds your hand through the difficult parts, and specifically helps you build real confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">What Drives Us</span>
            <h2 className="text-4xl font-black text-slate-900 mt-4 mb-4">Our Core Values</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">The deep beliefs that guide every feature we build, every word we write, and every student we support.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 hover:border-teal-200 shadow-sm hover:shadow-md rounded-3xl p-8 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm text-teal-600 flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-3">{v.title}</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed font-medium">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Let Us Help You Succeed</h2>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">We would be honoured to be part of your career journey. Sign up today and experience a platform built entirely around supporting you.</p>
          <button onClick={() => navigate('/signup')} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all hover:-translate-y-1">
            Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
