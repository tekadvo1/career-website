import { useNavigate } from 'react-router-dom';
import LandingHeader from './LandingHeader';
import { Zap, Shield } from 'lucide-react';

const sections = [
  {
    title: '1. Who We Are',
    content: `FindStreak ("we", "us", "our") operates the website www.findstreak.com and the FindStreak platform. We are committed to protecting your personal information and being transparent about what we collect and how we use it.

If you have any questions about this Privacy Policy, please contact us at support@findstreak.com.`
  },
  {
    title: '2. What Information We Collect',
    content: `We collect information you provide directly to us when you:

• Create an account (name, email address, password)
• Upload a resume or CV (document content, skills, employment history)
• Use our platform features (learning progress, project activity, chat messages)
• Contact us (message content and contact details)
• Sign in via Google OAuth (name, email address)

We also collect certain technical information automatically, including:
• IP address and device type
• Browser type and version
• Pages visited and time spent
• Cookies and similar tracking technologies (see our Cookie Policy)`
  },
  {
    title: '3. How We Use Your Information',
    content: `We use your information to:

• Create and manage your FindStreak account
• Analyse your resume to generate personalised skill gap reports
• Generate custom learning roadmaps, project recommendations and tech stack guidance
• Power the AI features including the Learning Assistant and Interview Guide
• Track your learning progress, XP, streaks and achievements
• Sync your data across devices
• Send you important account and service notifications
• Respond to your support requests
• Improve and develop the FindStreak platform

We do not sell your personal information to third parties.`
  },
  {
    title: '4. Resume and Career Data',
    content: `When you upload a resume, the file content is processed by our AI to extract skills and experience. This data is:

• Stored securely in our database
• Used exclusively to power FindStreak features for your account
• Not shared with employers, recruiters or third parties without your explicit consent
• Retained as long as your account remains active

You may delete your resume data at any time from your account settings.`
  },
  {
    title: '5. How We Share Your Information',
    content: `We do not sell or rent your personal data. We may share information in the following limited circumstances:

• Service providers: We use trusted third-party services (such as OpenAI for AI processing, hosting providers, email services) that process data on our behalf under strict data processing agreements.
• Legal requirements: We may disclose information if required by law or in response to valid legal process.
• Business transfers: If FindStreak is acquired or merged, your data may be transferred as part of that transaction. We will notify you beforehand.
• With your consent: We may share data in other ways if you have explicitly agreed.`
  },
  {
    title: '6. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide you with services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory reasons.

Analytics and aggregated, anonymised data may be retained indefinitely.`
  },
  {
    title: '7. Your Rights',
    content: `Depending on your location, you may have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you
• Correction: Request that we correct inaccurate or incomplete data
• Deletion: Request that we delete your personal data
• Portability: Request your data in a machine-readable format
• Objection: Object to certain uses of your data
• Withdrawal of consent: Where processing is based on consent, you may withdraw it at any time

To exercise any of these rights, contact us at support@findstreak.com.`
  },
  {
    title: '8. Security',
    content: `We take reasonable and appropriate measures to protect your personal information from unauthorised access, alteration, disclosure or destruction. This includes:

• Encrypted data transmission (HTTPS)
• Encrypted password storage (bcrypt hashing)
• Secure database access controls
• Regular security reviews

No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`
  },
  {
    title: '9. Third-Party Services',
    content: `FindStreak uses the following third-party services that may process your data:

• OpenAI — AI model processing for skill analysis, roadmaps and learning features
• Google — for Google OAuth authentication
• Render / hosting infrastructure — for platform hosting
• Email service provider — for transactional emails

Each of these services has their own privacy policies governing their use of your data.`
  },
  {
    title: '10. Children\'s Privacy',
    content: `FindStreak is not directed at children under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us at support@findstreak.com so we can delete it.`
  },
  {
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our platform. The date at the top of this page indicates when the policy was last updated. Your continued use of FindStreak after changes are posted constitutes your acceptance of the updated policy.`
  },
  {
    title: '12. Contact Us',
    content: `If you have any questions, concerns or requests regarding this Privacy Policy or your personal data, please contact us at:

Email: support@findstreak.com
Website: www.findstreak.com/contact-us`
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white font-sans antialiased">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-14 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-teal-900/40 to-transparent blur-3xl rounded-full" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-12 h-12 bg-teal-950 border border-teal-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-base">Last updated: 11 March 2026</p>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            This policy explains what information FindStreak collects, how we use it, and the choices you have regarding your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((sec, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7">
              <h2 className="text-lg font-black text-white mb-4">{sec.title}</h2>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{sec.content}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/30 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
            <span className="text-white font-black text-lg">FindStreak</span>
          </div>
          <nav className="flex items-center gap-6">
            {[{ label: 'Home', path: '/' }, { label: 'About', path: '/about-us' }, { label: 'Contact', path: '/contact-us' }, { label: 'Cookies', path: '/cookies' }].map(l => (
              <button key={l.label} onClick={() => navigate(l.path)} className="text-sm text-slate-500 hover:text-teal-400 transition-colors font-medium">{l.label}</button>
            ))}
          </nav>
          <p className="text-xs text-slate-600">© 2026 FindStreak.</p>
        </div>
      </footer>
    </div>
  );
}
