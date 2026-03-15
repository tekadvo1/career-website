import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

const sections = [
  {
    title: '1. What Information We Ask For',
    content: `When you join FindStreak, we only ask for the information we absolutely need to provide you with a great experience. This includes:

• Account Basics: Your name, email address, and a secure password.
• Your Professional Background: Information extracted from the resume you choose to upload (like your skills and experience).
• Your Platform Activity: Which topics you are studying, projects you interact with, and your learning streaks.

We don't ask for your address, phone number, or any unnecessary sensitive information.`
  },
  {
    title: '2. How We Help You Using Your Data',
    content: `The entire purpose of collecting your data is to give you a personalised learning experience. We use it to:

• Safely manage your account.
• Understand your current skills so we don't ask you to relearn things you already know.
• Generate a unique learning roadmap specifically for you.
• Track your daily progress and award you with experience points and achievements.`
  },
  {
    title: '3. What We Will Never Do',
    content: `We believe your data belongs to you. We want to be absolutely clear:

• We will never sell your personal information to third parties or advertisers.
• We will never share your personal resume with employers or recruiters without your direct, explicit permission.
• We will never use your data to train public AI models that could expose your private information.`
  },
  {
    title: '4. How We Keep Your Information Safe',
    content: `We take the responsibility of holding your data very seriously. We protect your account using industry-standard security measures, including:

• Encrypting your password so even we cannot see it.
• Using secure connections (HTTPS) whenever data is transferred.
• Restricting access to our databases strictly to authorised engineers.`
  },
  {
    title: '5. Our Trusted Partners',
    content: `To build FindStreak, we use a few highly trusted third-party services that process data securely on our behalf. For example:

• We use secure cloud hosting to run our website.
• We partner with AI providers (like OpenAI) to generate your roadmaps and skill analysis. We have agreements ensuring they do not use your private data to train their public models.

These partners are carefully selected for their commitment to privacy and security.`
  },
  {
    title: '6. Your Rights and Choices',
    content: `You always remain in control of your data. At any time, you have the right to:

• Ask us for a complete copy of the information we hold about you.
• Update or correct your information if it is wrong.
• Delete your uploaded resume at any time.
• Completely delete your FindStreak account. If you choose to leave, we will securely wipe your personal data from our systems.`
  },
  {
    title: '7. Getting in Touch',
    content: `If you have any questions, worries, or need anything clarified about how we handle your privacy, please don't hesitate to reach out. We are friendly and happy to help.

Email us anytime at: privacy@findstreak.com`
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-14 px-4 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-radial from-teal-100/60 to-transparent blur-3xl rounded-full opacity-70" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white border border-teal-100 shadow-md rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500 font-medium text-base mb-2">A friendly, plain-English explanation.</p>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            We believe you shouldn't need a law degree to understand how your data is handled. Here is our straightforward promise to you on how we protect your information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Quick summary */}
          <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-sm font-black text-teal-700 uppercase tracking-widest mb-6 text-center">Our Core Promises</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: <Lock className="w-5 h-5" />, label: 'We Do Not Sell Data', desc: 'Your personal information will never be sold to advertisers.' },
                { icon: <Shield className="w-5 h-5" />, label: 'We Protect Your Privacy', desc: 'Your resume is never shared publicly without your explicit consent.' },
                { icon: <FileText className="w-5 h-5" />, label: 'You Remain in Control', desc: 'You can delete your resume and your account at any time.' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <div className="mb-3 text-teal-600 bg-teal-50 p-2 rounded-xl">{item.icon}</div>
                  <p className="text-[13px] font-bold text-slate-900 mb-2 leading-snug">{item.label}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {sections.map((sec, i) => (
            <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 transition-shadow duration-300 hover:shadow-md">
              <h2 className="text-2xl font-black text-slate-900 mb-6">{sec.title}</h2>
              <div className="text-slate-600 text-[16px] leading-[1.8] font-medium whitespace-pre-line">{sec.content}</div>
            </div>
          ))}

          <div className="text-center mt-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex justify-center mb-4"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
             <p className="text-slate-700 font-bold mb-1">Thank you for trusting FindStreak.</p>
             <p className="text-slate-500 text-[15px] font-medium">We work hard every day to ensure your trust is entirely justified.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
