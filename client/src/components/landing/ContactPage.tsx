import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Zap, Mail, MessageSquare, Clock, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

const faqs = [
  { q: 'Who is FindStreak designed for?', a: 'FindStreak is built for developers who want to learn by doing. Whether you are trying to break into tech for the first time, switch specialisations, or level up from junior to senior, the platform is designed around your specific goal and current skills.' },
  { q: 'What exactly happens when I upload my resume?', a: 'The AI reads your resume and extracts your current skills, tools, and experience level. It then compares them to what employers are actually hiring for in your chosen role. You get a clear gap analysis showing what you already know and what to learn next.' },
  { q: 'How are the projects chosen for me?', a: 'Projects are recommended by AI based on your target role and current skill level. Each project comes with a structured curriculum broken into daily tasks and milestones, so you have a clear path to completion rather than staring at a blank editor.' },
  { q: 'Do I need to already know how to code?', a: 'FindStreak works best for people who have at least some exposure to coding — even self-taught basics. It is not a from-scratch beginner platform, but if you understand fundamentals and want to grow into a specific tech role, it will guide you clearly.' },
  { q: 'Is FindStreak free to use?', a: 'The core features are free to access — this includes the skill gap analysis, learning roadmap, project recommendations, and AI learning assistant. We believe the tools that help you get a job should not themselves cost money you do not yet have.' },
  { q: 'What if I am already employed but want to grow my career?', a: 'FindStreak is equally useful for experienced developers who want to move into a new specialisation, prepare for senior roles, or just keep their skills aligned with what the industry actually values right now.' },
];

const contactOptions = [
  { icon: <Mail className="w-5 h-5" />, label: 'Email Us', value: 'support@findstreak.com', desc: 'For questions about your account, technical issues, or feature suggestions.' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'In-App Chat', value: 'Available when logged in', desc: 'If you are a registered user, you can message us from inside your FindStreak dashboard.' },
  { icon: <Clock className="w-5 h-5" />, label: 'Response Time', value: 'Within 24 hours', desc: 'We read every message and reply within one business day, Monday through Friday.' },
];

export default function ContactPage() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      const API = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      showAlert('Something went wrong. Please email us directly at support@findstreak.com', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white font-sans antialiased">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-radial from-teal-900/50 to-transparent blur-3xl rounded-full" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(to right, #14b8a6 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950 border border-teal-800/60 text-teal-400 text-xs font-semibold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Contact
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            Get in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Touch</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Have a question, a bug to report, or feedback on your experience? We read every message and take it seriously.
          </p>
        </div>
      </section>

      {/* Contact options */}
      <section className="py-10 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
          {contactOptions.map((opt, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] hover:border-teal-800/50 rounded-2xl p-6 text-center transition-all group">
              <div className="w-11 h-11 rounded-xl bg-teal-950 border border-teal-800/50 text-teal-400 flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-900 transition-colors">{opt.icon}</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{opt.label}</p>
              <p className="font-bold text-white text-sm mb-2">{opt.value}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{opt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14">

          {/* Form */}
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Send a Message</h2>
            <p className="text-slate-500 mb-8 text-[15px]">We will get back to you within one business day.</p>

            {submitted ? (
              <div className="bg-teal-950/30 border border-teal-800/50 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-teal-900/60 border border-teal-700/50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Message Sent</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Thank you <strong className="text-white">{form.name}</strong>. We will reply to <strong className="text-white">{form.email}</strong> within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="mt-6 px-5 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 transition-colors">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {[{ label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Your name' }, { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'your@email.com' }].map(field => (
                    <div key={field.key}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        required
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Topic</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all">
                    <option value="" className="bg-[#0a0f0d]">Select a topic...</option>
                    {['General Question', 'Bug or Technical Issue', 'Feature Suggestion', 'Account Help', 'Feedback on My Experience', 'Other'].map(o => <option key={o} className="bg-[#0a0f0d]">{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all resize-none" placeholder="Tell us what you need help with or share your feedback..." />
                </div>
                <button type="submit" disabled={sending} className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {sending ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Common Questions</h2>
            <p className="text-slate-500 mb-8 text-[15px]">Answers to the questions we hear most often.</p>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className={`rounded-xl border overflow-hidden transition-colors ${openFaq === i ? 'border-teal-800/60 bg-teal-950/20' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-start justify-between px-5 py-4 text-left">
                    <span className="font-bold text-slate-200 text-sm pr-4 leading-snug">{faq.q}</span>
                    <span className={`text-teal-400 font-black text-lg flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 border-t border-white/[0.06]">
                      <p className="text-slate-400 text-sm leading-relaxed pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Not a User Yet?</h2>
          <p className="text-slate-400 text-lg mb-8">Create your free account and get a personalised learning plan based on your actual resume and target role.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-xl transition-all">
              Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/how-it-works')} className="inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold rounded-xl transition-all">
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
