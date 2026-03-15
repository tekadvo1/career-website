import { useState } from 'react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Mail, MessageSquare, Clock, CheckCircle, Send, Heart } from 'lucide-react';

const faqs = [
  { q: 'Who is FindStreak built for?', a: 'We built FindStreak for anyone who wants to learn tech skills by actually building things rather than just watching tutorials. It is perfect for career changers, bootcamp grads, and junior developers looking for clear, structured guidance.' },
  { q: 'What happens when I upload my resume?', a: 'Our AI gently reads your resume to understand your current experience level. It then compares your background to live job requirements for your target role, giving you a friendly, clear report of what you need to learn next.' },
  { q: 'How are the projects chosen for me?', a: 'Based on your specific skill gaps, we recommend real-world projects that match your comfort level. Each project comes with a step-by-step daily plan so you never feel lost or overwhelmed.' },
  { q: 'Do I need previous coding experience?', a: 'FindStreak works best if you understand the very basics of coding. We do not teach "what is a variable from scratch," but if you know the fundamentals and want to learn how to put them together, we will absolutely guide you the rest of the way.' },
  { q: 'Is it really free to start?', a: 'Yes. Our core features—including skill analysis, custom roadmaps, and initial project guidance—are completely free. We want to ensure anyone can get the clarity they need without a financial barrier.' },
];

const contactOptions = [
  { icon: <Mail className="w-6 h-6" />, label: 'Email Support', value: 'hello@findstreak.com', desc: 'Reach out anytime. We are happy to help with account questions or feature requests.' },
  { icon: <MessageSquare className="w-6 h-6" />, label: 'In-Platform Chat', value: 'Available in Dashboard', desc: 'Registered users can message our support team directly from inside their workspace.' },
  { icon: <Clock className="w-6 h-6" />, label: 'Our Response Time', value: 'Within 24 hours', desc: 'We genuinely read every single message and aim to reply within one business day.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0); // Open first FAQ by default for friendliness

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-teal-100/60 to-transparent blur-3xl rounded-full opacity-60" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
            <Heart className="w-4 h-4 text-teal-500" />
            We Are Here For You
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Help You?</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            Whether you have a technical question, need career advice, or just want to share feedback about your experience, we would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact options */}
      <section className="py-12 px-4 border-y border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {contactOptions.map((opt, i) => (
            <div key={i} className="bg-white border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md rounded-3xl p-8 text-center transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                {opt.icon}
              </div>
              <p className="font-black text-slate-900 text-lg mb-2">{opt.value}</p>
              <p className="text-slate-600 text-[15px] leading-relaxed font-medium">{opt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-24 px-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">

          {/* Form */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Send a Direct Message</h2>
            <p className="text-slate-600 mb-8 text-[15px] font-medium">Fill out the form below and we will get back to you directly.</p>

            {submitted ? (
              <div className="bg-teal-50 border border-teal-100 rounded-3xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-white border border-teal-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CheckCircle className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Message Sent!</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed mb-8 font-medium">Thank you so much, <strong className="text-slate-900">{form.name}</strong>. We have received your message and will reply to <strong className="text-slate-900">{form.email}</strong> very soon.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="px-6 py-3 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-md shadow-teal-200">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {[{ label: 'What is your name?', key: 'name', type: 'text', placeholder: 'Jane Doe' }, { label: 'What is your email?', key: 'email', type: 'email', placeholder: 'jane@example.com' }].map(field => (
                    <div key={field.key}>
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        required
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all shadow-sm"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">What is this regarding?</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all shadow-sm">
                    <option value="" className="text-slate-500">I need help with...</option>
                    {['General Question', 'Technical Support', 'Career Advice', 'Feedback on the Platform', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">How can we help?</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all resize-none shadow-sm" placeholder="Please share as much detail as possible so we can properly support you..." />
                </div>
                <button type="submit" disabled={sending} className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {sending ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending gently...</> : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-600 mb-8 text-[15px] font-medium">Quick answers to the questions we hear most often.</p>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className={`rounded-3xl border overflow-hidden transition-all duration-300 shadow-sm ${openFaq === i ? 'border-teal-300 bg-white shadow-md' : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-sm cursor-pointer'}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-start justify-between px-6 py-6 text-left focus:outline-none">
                    <span className="font-bold text-slate-900 text-[15px] pr-4 leading-snug">{faq.q}</span>
                    <span className={`text-teal-600 font-light text-2xl flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 pt-2">
                      <div className="border-t border-slate-100 pt-5">
                        <p className="text-slate-600 text-[15px] leading-relaxed font-medium">{faq.a}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
