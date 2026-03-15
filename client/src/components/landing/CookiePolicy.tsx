import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Cookie, Settings, CheckCircle } from 'lucide-react';

const sections = [
  {
    title: '1. A Simple Explanation of Cookies',
    content: `You hear about cookies everywhere on the web, but what are they actually doing? A cookie is just a tiny, secure text file that websites save on your phone or computer. 

Cookies do not record personal secrets or give us access to your computer. They are simply there to give your browser a "memory" so our website can recognise you when you move from page to page.`
  },
  {
    title: '2. How We Use Them to Help You',
    content: `At FindStreak, we use cookies incredibly simply and honestly. We use them for:

• Keeping You Logged In: So you don't have to awkwardly type your password every time you click a new link.
• Remembering Your Choices: If you prefer certain settings or workspaces, cookies ensure the platform remembers them for your next visit.
• Understanding Performance: To see which parts of our platform are running smoothly, and which parts might be loading slowly so we can fix them.`
  },
  {
    title: '3. We Do Not Use Advertising Cookies',
    content: `This is a promise: We do completely avoid advertising or "tracking" cookies. You will never see an ad on FindStreak, and we do not use cookies to follow you around the internet or sell your activity to marketers. Your learning journey is your own.`
  },
  {
    title: '4. Essential vs Feature Cookies',
    content: `Essential Cookies: These cannot be turned off because if we did, you wouldn't be able to log in securely.

Feature Cookies: Sometimes we use your browser's "Local Storage" (similar to a cookie) to save your in-app preferences and make the dashboard load faster. This data stays entirely on your own device.`
  },
  {
    title: '5. Changing Your Mind',
    content: `You are always in control of what your browser saves. If you'd prefer to wipe your cookies, it is very easy to do! 

You can clear cookies directly in the "Privacy" or "Security" settings of Google Chrome, Safari, Firefox, or Edge. Just a gentle heads-up: if you clear FindStreak's cookies, it will safely log you out of your account, and you'll just need to log back in again.`
  },
  {
    title: '6. Have Questions?',
    content: `If any part of this feels confusing, please feel completely free to ask us for an explanation.

Simply drop a kind message to: support@findstreak.com`
  },
];

export default function CookiePolicy() {
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
            <Cookie className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Cookie Policy</h1>
          <p className="text-slate-500 font-medium text-base mb-2">Honest and transparent.</p>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            We use very few cookies on our platform, but we believe in explaining exactly what they do in plain English.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Quick summary */}
          <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-sm font-black text-teal-700 uppercase tracking-widest mb-6 text-center">In Summary</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <Settings className="w-5 h-5 text-teal-600" />, label: 'Just the Essentials', desc: 'Used purely to keep you logged in safely.' },
                { icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, label: 'Zero Advertising', desc: 'We do not run ads and we do not track your browsing.' },
              ].map((item, i) => (
                <div key={i} className="text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                  <div className="mb-3">{item.icon}</div>
                  <p className="text-sm font-bold text-slate-900 mb-2">{item.label}</p>
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
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
