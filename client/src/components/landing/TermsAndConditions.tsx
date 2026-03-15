import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import { FileText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By creating an account or using FindStreak ("the Platform", "the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use FindStreak.

These terms apply to all visitors, users and others who access or use the Service. By clicking "Create Account" or continuing to use FindStreak, you confirm that you have read, understood and accepted these Terms and Conditions in full.`
  },
  {
    title: '2. Description of Service',
    content: `FindStreak is an AI-powered career development platform that helps developers and technology professionals:

• Analyse their skill gaps against real job market requirements
• Generate personalised learning roadmaps based on their resume and target role
• Receive project recommendations with structured curricula and task guidance
• Prepare for technical interviews with AI-driven feedback
• Track progress, earn XP, and maintain learning streaks
• Access tech stack recommendations and learning resources

The Service is provided "as is" and we reserve the right to modify, suspend or discontinue any feature or the entire Service at any time with reasonable notice where possible.`
  },
  {
    title: '3. Accounts and Registration',
    content: `To use FindStreak, you must create an account. You agree to:

• Provide accurate, complete and current information when registering
• Maintain the security of your password and not share it with others
• Promptly notify us if you suspect any unauthorised use of your account
• Take responsibility for all activity that occurs under your account
• Not create accounts for others without their permission
• Not create multiple accounts for the purpose of circumventing any limitations

You must be at least 16 years old to create an account on FindStreak. By registering, you confirm that you meet this age requirement.`
  },
  {
    title: '4. Acceptable Use',
    content: `You agree to use FindStreak only for lawful purposes and in a way that does not infringe the rights of others. You must not:

• Use the platform for any unlawful purpose or in violation of any regulations
• Upload content that is harmful, offensive, defamatory, or that infringes intellectual property rights
• Attempt to gain unauthorised access to any part of the platform or our systems
• Scrape, crawl or use automated means to access the Service without permission
• Reverse engineer, decompile or otherwise attempt to extract source code
• Use the Service to send unsolicited communications of any kind
• Impersonate another person or misrepresent your identity
• Upload malware, viruses or any other malicious code

We reserve the right to suspend or terminate accounts found to be in violation of these conditions.`
  },
  {
    title: '5. Resume and Content You Submit',
    content: `When you upload a resume or provide other content to FindStreak, you grant us a limited, non-exclusive, non-transferable licence to use that content solely for the purpose of providing the Service to you.

You retain all ownership rights to content you submit. You represent and warrant that:

• You own or have the right to submit any content you provide
• Your content does not violate the rights of any third party
• Your content does not contain personal data of third parties without their consent

We will not sell, share, or use your resume or submitted content for any purpose other than providing FindStreak features to your account.`
  },
  {
    title: '6. Intellectual Property',
    content: `FindStreak and its original content, features and functionality are and will remain the exclusive property of FindStreak and its creators. This includes but is not limited to:

• The platform design, user interface and user experience
• The AI models, algorithms and methodologies (to the extent owned by us)
• All written content, guides, and documentation created by us
• The FindStreak brand, logo, and trademarks

You may not copy, reproduce, distribute or create derivative works from the Service without our explicit written permission.

AI-generated content produced by FindStreak on your behalf (such as your personalised roadmap, analysis, and project guides) is provided to you for your personal use only.`
  },
  {
    title: '7. Third-Party Services',
    content: `FindStreak integrates with third-party services including OpenAI for AI processing and Google for authentication. Your use of these features is also subject to the terms and policies of those third-party providers.

We are not responsible for the actions, content or policies of third-party services. Links or integrations with external services do not constitute an endorsement.`
  },
  {
    title: '8. Disclaimer of Warranties',
    content: `FindStreak is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that:

• The Service will be uninterrupted, error-free, or completely secure
• The AI-generated analysis, roadmaps, or recommendations will be accurate or complete
• The Service will meet your specific expectations or requirements
• Any errors or defects will be corrected within a specific timeframe

Career guidance, skill assessments, and job market analysis provided by FindStreak are based on AI processing and should not be taken as professional career advice. We recommend consulting qualified professionals for important career decisions.`
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, FindStreak and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:

• Loss of profits, data, goodwill or other intangible losses
• Any loss resulting from your reliance on AI-generated content
• Any issues arising from your use of or inability to use the Service
• Any unauthorised access to or alteration of your data

Our total aggregate liability for any claims relating to the Service shall not exceed the amount you have paid to FindStreak in the twelve months preceding the claim (or £50 if you have not made any payments).`
  },
  {
    title: '10. Privacy',
    content: `Your use of FindStreak is also governed by our Privacy Policy, which is incorporated into these Terms and Conditions by reference. By using the Service, you consent to the collection and use of your data as described in our Privacy Policy.

Please review our Privacy Policy at www.findstreak.com/privacy before using the Service.`
  },
  {
    title: '11. Termination',
    content: `We may suspend or terminate your account at any time if:

• You violate these Terms and Conditions
• We suspect fraudulent, abusive or harmful activity
• We are required to do so by law

You may delete your account at any time from your account settings. Upon termination, your right to use the Service will immediately cease. We may retain certain data as required by law or legitimate business purposes.`
  },
  {
    title: '12. Changes to These Terms',
    content: `We reserve the right to modify these Terms and Conditions at any time. When we make significant changes, we will notify you by email or by posting a notice on the platform. The updated terms will be effective immediately upon posting.

Your continued use of FindStreak after changes are posted constitutes your acceptance of the updated Terms and Conditions. If you do not agree to the new terms, you must stop using the Service.`
  },
  {
    title: '13. Governing Law',
    content: `These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`
  },
  {
    title: '14. Contact',
    content: `If you have any questions about these Terms and Conditions, please contact us at:

Email: support@findstreak.com
Website: www.findstreak.com/contact-us`
  },
];

export default function TermsAndConditions() {

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-14 px-4 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-teal-100 to-transparent blur-3xl rounded-full opacity-60" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white border border-teal-100 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900">Terms &amp; Conditions</h1>
          <p className="text-slate-500 font-medium text-base">Last updated: 11 March 2026</p>
          <p className="text-slate-600 text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Please read these Terms and Conditions carefully before using FindStreak. By creating an account, you agree to be bound by these terms.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Summary banner */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-sm font-black text-teal-700 uppercase tracking-widest mb-4">Key Points</h2>
            <ul className="space-y-3">
              {[
                'You must be 16 or older to use FindStreak',
                'AI-generated content is for guidance only — not professional advice',
                'You own all content you submit; we only use it to provide the Service',
                'We do not sell your data to third parties',
                'By creating an account, you accept these terms in full',
              ].map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{pt}</span>
                </li>
              ))}
            </ul>
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
