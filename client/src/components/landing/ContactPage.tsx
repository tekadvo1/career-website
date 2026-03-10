import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import { Zap, Mail, MessageSquare, Clock, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

const faqs = [
  {
    q: 'Who is FindStreak designed for?',
    a: 'FindStreak is built for developers who want to learn by doing. Whether you are trying to break into tech for the first time, switch specialisations, or level up from junior to senior, the platform is designed around your specific goal and current skills.',
  },
  {
    q: 'What exactly happens when I upload my resume?',
    a: 'The AI reads your resume and extracts your current skills, tools, and experience level. It then compares them to what employers are actually hiring for in your chosen role. You get a clear gap analysis showing what you already know and what to learn next.',
  },
  {
    q: 'How are the projects chosen for me?',
    a: 'Projects are recommended by AI based on your target role and current skill level. Each project comes with a structured curriculum broken into daily tasks and milestones, so you have a clear path to completion rather than staring at a blank editor.',
  },
  {
    q: 'Do I need to already know how to code?',
    a: 'FindStreak works best for people who have at least some exposure to coding — even self-taught basics. It is not a from-scratch beginner platform, but if you understand fundamentals and want to grow into a specific tech role, it will guide you clearly.',
  },
  {
    q: 'Is FindStreak free to use?',
    a: 'The core features are free to access — this includes the skill gap analysis, learning roadmap, project recommendations, and AI learning assistant. We believe the tools that help you get a job should not themselves cost money you do not yet have.',
  },
  {
    q: 'What if I am already employed but want to grow my career?',
    a: 'FindStreak is equally useful for experienced developers who want to move into a new specialisation, prepare for senior roles, or just keep their skills aligned with what the industry actually values right now.',
  },
];

const contactOptions = [
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email Us',
    value: 'support@findstreak.com',
    desc: 'For questions about your account, technical issues, or feature suggestions.',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'In-App Chat',
    value: 'Available when logged in',
    desc: 'If you are a registered user, you can message us directly from inside your FindStreak dashboard.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: 'Response Time',
    value: 'Within 24 hours',
    desc: 'We read every message and reply within one business day, Monday through Friday.',
  },
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
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      showAlert('Something went wrong. Please email us directly at support@findstreak.com', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      <LandingHeader />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold rounded-full mb-6">
            Contact
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-5 leading-tight">
            Get in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              Touch
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Have a question about how FindStreak works, a bug to report, or feedback on your experience? We read every message and take it seriously.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-14 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5">
          {contactOptions.map((opt, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center hover:border-teal-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                {opt.icon}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{opt.label}</p>
              <p className="font-extrabold text-slate-900 text-base mb-2">{opt.value}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{opt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14">

          {/* Form */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Send a Message</h2>
            <p className="text-slate-500 mb-8 text-[15px]">We will get back to you within one business day.</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Message Sent</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Thank you <strong>{form.name}</strong>. We will reply to <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 hover:bg-white transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 hover:bg-white transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Topic</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 hover:bg-white transition-all"
                  >
                    <option value="">Select a topic...</option>
                    <option>General Question</option>
                    <option>Bug or Technical Issue</option>
                    <option>Feature Suggestion</option>
                    <option>Account Help</option>
                    <option>Feedback on My Experience</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 hover:bg-white transition-all resize-none"
                    placeholder="Tell us what you need help with or share your feedback..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Common Questions</h2>
            <p className="text-slate-500 mb-8 text-[15px]">Answers to the questions we hear most often.</p>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden hover:border-teal-200 transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-start justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-800 text-sm pr-4 leading-snug">{faq.q}</span>
                    <span className={`text-teal-600 font-black text-lg flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
                      <p className="text-slate-600 text-sm leading-relaxed pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-700 to-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Not a User Yet?</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">
            Create your free account and get a personalised learning plan based on your actual resume and target role — no generic advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-teal-700 font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-4 border-2 border-white/40 text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-all"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900 text-slate-400 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">FindStreak</span>
        </div>
        <p className="text-sm">© 2026 FindStreak. Build real skills through real projects.</p>
      </footer>
    </div>
  );
}
