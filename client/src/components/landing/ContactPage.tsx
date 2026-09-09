import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

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
        setErrorMsg(data.error || 'We couldn’t send your message. Please try again or email us directly.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('We couldn’t send your message. Please try again or email us directly.');
    }
  };

  const inputClass = `w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400
    focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200`;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />
      
      <main id="main-content" tabIndex={-1}>
        {/* 1. Compact introduction */}
        <section className="pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white text-center">
          <div className="max-w-3xl mx-auto">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />CONTACT FINDSTREAK
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              How can we help?
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have a question, something isn’t working, or an idea to share? Send us a message.
            </p>
          </div>
        </section>

        {/* 2. Main contact area */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Form - Orders first on mobile, second on desktop */}
            <div className="order-1 lg:order-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message.</h2>

              {status === 'success' ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent</h3>
                  <p className="text-slate-600 text-sm max-w-xs leading-relaxed mb-6">
                    Your message has been sent. Thank you for getting in touch.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Name <span className="text-slate-400 font-normal" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email address <span className="text-slate-400 font-normal" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Topic
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={inputClass + ' cursor-pointer appearance-none bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat'}
                    >
                      <option value="">Select a topic...</option>
                      <option value="General Question">General question</option>
                      <option value="Technical Support">Technical support</option>
                      <option value="Product Feedback">Product feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Message <span className="text-slate-400 font-normal" aria-hidden="true">*</span>
                    </label>
                    <p id="message-hint" className="text-xs text-slate-500 mb-2">
                      For technical issues, describe what happened and what you expected. Please don’t include passwords or sensitive account details.
                    </p>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      aria-describedby="message-hint"
                      className={inputClass + ' resize-none'}
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100" role="alert">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{errorMsg}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-live="polite"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send message'
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                      By submitting this form, you agree to our <Link to="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link>.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Left Column - Helpful Context - Orders second on mobile, first on desktop */}
            <div className="order-2 lg:order-1 lg:pt-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Let’s get your message to the right place.</h2>
              <ul className="space-y-6 text-slate-600 mb-10">
                <li>
                  <strong className="block text-slate-900 font-semibold mb-1">General questions</strong>
                  Understanding FindStreak and its features.
                </li>
                <li>
                  <strong className="block text-slate-900 font-semibold mb-1">Technical support</strong>
                  Trouble accessing or using the platform.
                </li>
                <li>
                  <strong className="block text-slate-900 font-semibold mb-1">Feedback</strong>
                  Ideas for improving the experience.
                </li>
              </ul>
              
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">Email us directly</h3>
                <p className="text-sm text-slate-600 mb-3">You can also reach our support team at:</p>
                <a
                  href="mailto:supportfindstreak@tekadvo.com"
                  className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                >
                  supportfindstreak@tekadvo.com <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 4. Helpful links */}
        <section className="py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Looking for a quick answer?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link to="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                How FindStreak works
              </Link>
              <span className="hidden sm:block text-slate-300">•</span>
              <Link to="/#career-paths" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Explore career paths
              </Link>
              <span className="hidden sm:block text-slate-300">•</span>
              <Link to="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Reset your password
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
