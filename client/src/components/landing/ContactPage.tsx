import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import {
  Zap, Mail, MessageSquare, Clock, CheckCircle, Send, ArrowRight
} from 'lucide-react';

const faqs = [
  { q: 'Is FindStreak really free to use?', a: 'Yes. The core features — role analysis, roadmap generation, tech stack guide, and AI assistant — are completely free. We believe career acceleration tools should be accessible to everyone.' },
  { q: 'What career roles does FindStreak support?', a: 'FindStreak supports 50+ tech career roles including Software Engineer, Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, ML Engineer, DevOps Engineer, Cloud Architect, Product Manager, and many more.' },
  { q: 'Can I upload any type of resume?', a: 'Yes. We accept PDF, Microsoft Word (.doc, .docx), and plain text resumes. Our AI parses all standard resume formats to extract your skills, experience, and education.' },
  { q: 'How accurate is the AI skill gap analysis?', a: 'Our AI is trained on real job postings and continuously updated with the latest hiring requirements. It\'s highly accurate for most mainstream tech roles, though it works best for clearly defined technical positions.' },
  { q: 'Can I explore multiple career paths at the same time?', a: 'Absolutely. The Career Workspaces feature allows you to run separate roadmaps, projects, and analysis for as many different career goals as you want — all in one account.' },
  { q: 'Do I need any coding experience to use FindStreak?', a: 'No. FindStreak works for complete beginners as well as experienced professionals. The AI adapts all recommendations to your current level.' },
];

const contactOptions = [
  { icon: <Mail className="w-5 h-5" />, label: 'Email Support', value: 'support@findstreak.com', desc: 'For account issues, bug reports, or feature requests.' },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Live Chat', value: 'Available in-app', desc: 'Chat directly with our team from inside your FindStreak dashboard.' },
  { icon: <Clock className="w-5 h-5" />, label: 'Response Time', value: 'Within 24 hours', desc: 'We respond to all messages within one business day, Monday–Friday.' },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSubmitted(true);
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
            Contact Us
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-5 leading-tight">
            We're Here to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              Help
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Have a question, found a bug, or want to share feedback? We'd love to hear from you. Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 px-4 border-b border-slate-100">
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

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Send Us a Message</h2>
            <p className="text-slate-500 mb-8 text-[15px]">Fill in the form and we'll get back to you as soon as possible.</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Message Received!</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Thank you for reaching out, <strong>{form.name}</strong>. We've received your message and will respond to <strong>{form.email}</strong> within 24 hours.
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-slate-50 hover:bg-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-slate-50 hover:bg-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-slate-50 hover:bg-white"
                  >
                    <option value="">Select a subject...</option>
                    <option>General Question</option>
                    <option>Technical Issue / Bug Report</option>
                    <option>Feature Request</option>
                    <option>Account Help</option>
                    <option>Partnership / Business Enquiry</option>
                    <option>Feedback & Suggestions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 transition-all bg-slate-50 hover:bg-white resize-none"
                    placeholder="Describe your question or issue in detail..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-slate-500 mb-8 text-[15px]">Quick answers to the most common questions about FindStreak.</p>
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
          <h2 className="text-4xl font-black text-white mb-5">Haven't Started Yet?</h2>
          <p className="text-teal-100 text-lg mb-8 leading-relaxed">
            Create your free account and get your personalised AI career analysis in minutes.
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
        <p className="text-sm">© 2026 FindStreak. Empowering tech careers worldwide.</p>
      </footer>
    </div>
  );
}
