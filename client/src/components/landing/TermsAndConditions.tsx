import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { FileText, ShieldCheck, HeartPulse } from 'lucide-react';

const sections = [
  {
    title: '1. Welcome to FindStreak',
    content: `Hello! We are delighted that you have chosen FindStreak to assist you in your career journey. By creating an account, you are agreeing to these Terms and Conditions. We have written them as clearly as possible so you understand exactly what you can expect from us, and what we ask of you.`
  },
  {
    title: '2. What We Provide for You',
    content: `FindStreak is designed to be your supportive career companion. We offer tools to analyse your skills, suggest structured learning roadmaps, recommend projects, and simulate interviews using AI.

Because learning technology evolves rapidly, we are constantly making improvements. This means that features may be added, updated, or occasionally removed as we strive to give you the absolute best experience.`
  },
  {
    title: '3. What We Ask in Return',
    content: `To keep the platform safe, accurate, and helpful for everyone, we simply ask that you:

• Provide accurate information when you sign up.
• Keep your account password secure and entirely to yourself.
• Treat the platform and other potential users with respect.
• Use our AI tools fairly, without trying to maliciously break, overload, or reverse-engineer them.`
  },
  {
    title: '4. AI Guidance vs. Professional Advice',
    content: `Our AI is incredibly smart and trained on real-world job market data, but it is still software. The roadmaps, skill suggestions, and interview feedback it generates are meant to be an excellent supplement to your learning.

They are provided as helpful guidance, not as guaranteed professional career advice. You remain the master of your own career choices!`
  },
  {
    title: '5. Your Content Belong to You',
    content: `Any resumes or documents you upload to FindStreak remain entirely your intellectual property. By uploading them, you are simply giving us permission to read them so our AI can generate your personalised roadmap. We are absolutely not claiming ownership of your professional history.`
  },
  {
    title: '6. Our Content Belongs to Us',
    content: `While your information is yours, the software, design, text, branding, and structure of FindStreak belong to us. We put an immense amount of care into building this platform, so we ask that you do not copy, redistribute, or try to sell our platform's content as your own without our clear permission.`
  },
  {
    title: '7. If Things Go Wrong',
    content: `We work exceptionally hard to ensure the platform is always available, bug-free, and perfectly accurate. However, because it relies on complex software and external servers, we cannot promise it will be flawless 100% of the time.

If you ever encounter an issue, please let us know! While we cannot be held legally liable for any indirect disruptions to your learning or career progression, we will always do our absolute best to fix problems quickly and kindly.`
  },
  {
    title: '8. Modifying These Terms',
    content: `As the platform grows, we may need to update these terms. If we make significant changes, we will be transparent and gently notify you via an email or a clear notice on the platform so you are never caught out.`
  },
  {
    title: '9. Contacting Us',
    content: `If there is anything in these terms you do not understand or feel uncomfortable with, please talk to us before using the platform. We are real people and we are very happy to clarify things for you.

You can reach us directly at: support@findstreak.com`
  },
];

export default function TermsAndConditions() {

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-14 px-4 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-radial from-teal-100/60 to-transparent blur-3xl rounded-full opacity-60" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white border border-teal-100 shadow-md rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Terms of Service</h1>
          <p className="text-slate-500 font-medium text-base mb-2">A clear, supportive agreement.</p>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            We want building your career to be empowering. We have removed the dense legal jargon so you can confidently understand our mutual agreement.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Summary banner */}
          <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-sm font-black text-teal-700 uppercase tracking-widest mb-6">In Brief</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-white p-4 justify-start rounded-2xl shadow-sm border border-slate-100">
                 <ShieldCheck className="w-6 h-6 text-teal-500" />
                 <p className="text-[15px] font-medium text-slate-700">You must be honest about your identity, and we will be honest with our services.</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 justify-start rounded-2xl shadow-sm border border-slate-100">
                 <HeartPulse className="w-6 h-6 text-teal-500" />
                 <p className="text-[15px] font-medium text-slate-700">We aim to be supportive, but AI career guidance is not a legally binding guarantee of employment.</p>
              </div>
            </div>
          </div>

          {sections.map((sec, i) => (
             <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 transition-shadow duration-300 hover:shadow-md">
              <h2 className="text-2xl font-black text-slate-900 mb-6">{sec.title}</h2>
              <div className="text-slate-600 text-[16px] leading-[1.8] font-medium whitespace-pre-line">{sec.content}</div>
            </div>
          ))}

        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
