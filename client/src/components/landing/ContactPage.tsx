import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger: any = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-[11px] font-semibold uppercase tracking-widest mb-4">
      <Sparkles className="w-3 h-3" />{children}
    </span>
  );
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  const inputClass = `w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400
    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200`;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />

      {/* Hero */}
      <section
        className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden bg-gradient-to-b from-slate-50 to-white"
        style={{}}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto relative">
          <motion.div variants={fadeUp}><SectionBadge>Contact Us</SectionBadge></motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-slate-900">
            Get in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Touch</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg">
            Have a question, suggestion, or need help? Send us a message and we will get back to you within 24 hours.
          </motion.p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
          >
            <motion.h2 variants={fadeUp} className="text-xl font-bold text-slate-900 mb-6">Send a Message</motion.h2>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5">
                  <CheckCircle className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Thanks for reaching out. We will reply to your email within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Alex Johnson"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="alex@example.com"
                      required
                      className={inputClass}
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass + ' cursor-pointer'}
                  >
                    <option value="">Select a topic...</option>
                    <option value="General Question">General Question</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing & Pricing">Billing & Pricing</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your question or issue in detail..."
                    required
                    rows={6}
                    className={inputClass + ' resize-none'}
                  />
                </motion.div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{errorMsg}</p>
                  </motion.div>
                )}

                <motion.button
                  variants={fadeUp}
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-4"
          >
            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Email Support</h3>
              <p className="text-sm text-gray-500 mb-2">For any general queries or support requests.</p>
              <a
                href="mailto:supportfindstreak@tekadvo.com"
                className="text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium break-all"
              >
                supportfindstreak@tekadvo.com
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">Response Time</h3>
              <p className="text-sm text-gray-500">
                We aim to respond to all messages within <span className="text-white font-medium">24 hours</span> on business days.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Platform</h3>
              <p className="text-sm text-slate-400">
                Accessible globally at{' '}
                <a href="https://findstreak.com" className="text-teal-600 hover:text-teal-700 transition-colors font-medium">
                  findstreak.com
                </a>
              </p>
            </motion.div>

            {/* Note */}
            <motion.div variants={fadeUp} className="p-5 rounded-xl border border-emerald-100 bg-emerald-50">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="text-emerald-700 font-semibold">Pro tip:</span> If you already have an account, you can also reach support directly from within the app using the AI Assistant page.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
