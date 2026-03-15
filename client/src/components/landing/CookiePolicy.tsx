import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { Cookie } from 'lucide-react';

const sections = [
  {
    title: '1. What Are Cookies?',
    content: `Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to the website owner.

Cookies do not give us access to your device and contain no sensitive personal information.`
  },
  {
    title: '2. How FindStreak Uses Cookies',
    content: `FindStreak uses cookies and similar technologies for the following purposes:

• Authentication: To keep you logged in to your account securely across browser sessions
• Preferences: To remember your settings and preferences within the platform
• Analytics: To understand how users interact with FindStreak so we can improve the platform
• Security: To help us detect and prevent fraudulent or malicious activity`
  },
  {
    title: '3. Types of Cookies We Use',
    content: `Strictly Necessary Cookies
These cookies are essential for FindStreak to function correctly. They enable core features such as authentication, session management and security. These cookies cannot be disabled.

Examples:
• Session token cookies — keep you logged in during your visit
• CSRF protection tokens — protect against cross-site request forgery attacks

Performance and Analytics Cookies
These cookies collect anonymised information about how users interact with the platform — such as which pages are visited most and whether any errors occur. This data helps us improve FindStreak.

Functional Cookies
These cookies allow the platform to remember choices you have made (such as your preferred language or workspace) and provide enhanced, personalised features.`
  },
  {
    title: '4. Local Storage',
    content: `In addition to cookies, FindStreak uses browser local storage to store certain data on your device. This includes:

• Authentication tokens (JWT) that keep you logged in
• Cached user profile and workspace data for faster page loads
• UI preferences and temporary state

This data is stored only on your device and is not transmitted to third parties. You can clear this data at any time by clearing your browser's local storage or by logging out of FindStreak.`
  },
  {
    title: '5. Third-Party Cookies',
    content: `FindStreak may use third-party services that set their own cookies. These include:

• Google OAuth — if you sign in using Google, Google may set cookies as part of the authentication flow. These are governed by Google's Privacy Policy.
• Error monitoring and analytics tools — may set cookies to track and report on application errors and usage patterns.

We do not use third-party advertising cookies. FindStreak does not show ads and does not track you for advertising purposes.`
  },
  {
    title: '6. Managing and Disabling Cookies',
    content: `Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. Here is how to manage cookies in common browsers:

• Google Chrome: Settings → Privacy and security → Cookies and other site data
• Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data
• Safari: Preferences → Privacy → Cookies and website data
• Microsoft Edge: Settings → Cookies and site permissions

Please note: disabling certain cookies may affect your ability to use FindStreak. In particular, disabling authentication cookies will prevent you from staying logged in.

You can also clear existing cookies through your browser's settings at any time.`
  },
  {
    title: '7. Cookie Duration',
    content: `Session cookies: These are temporary and expire when you close your browser. They keep you logged in during your current visit.

Persistent cookies: These remain on your device for a set period. FindStreak uses persistent cookies for authentication with a typical expiry of 7 to 30 days, after which you will be asked to log in again.`
  },
  {
    title: '8. Your Consent',
    content: `By using FindStreak, you consent to our use of cookies as described in this policy. Strictly necessary cookies do not require your consent as they are essential for the website to function.

For all other cookies, we will ask for your consent where required by applicable law. You may withdraw consent at any time by adjusting your browser settings or clearing your cookies.`
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting a notice on the FindStreak platform or by updating the date at the top of this page. Your continued use of FindStreak after changes are posted constitutes your acceptance of the updated policy.`
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions about how FindStreak uses cookies, please contact us at:

Email: support@findstreak.com
Website: www.findstreak.com/contact-us`
  },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-14 px-4 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-indigo-100 to-transparent blur-3xl rounded-full opacity-60" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white border border-indigo-100 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Cookie className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Cookie Policy</h1>
          <p className="text-slate-500 font-medium text-base">Last updated: 11 March 2026</p>
          <p className="text-slate-600 text-base mt-4 max-w-xl mx-auto leading-relaxed">
            This policy explains how FindStreak uses cookies and similar technologies, and how you can manage your cookie preferences.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Quick summary */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-sm font-black text-indigo-700 uppercase tracking-widest mb-6 text-center">Summary</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: 'Essential Cookies', desc: 'Always active — required to keep you logged in and use the platform' },
                { label: 'No Advertising', desc: 'We do not use advertising or tracking cookies for marketing purposes' },
                { label: 'Local Storage', desc: 'We use browser local storage for your tokens and preferences' },
              ].map((item, i) => (
                <div key={i} className="text-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">{item.label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {sections.map((sec, i) => (
            <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
              <h2 className="text-xl font-black text-slate-900 mb-5">{sec.title}</h2>
              <div className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line">{sec.content}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
