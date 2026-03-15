import { useNavigate } from 'react-router-dom';
import { Target, Linkedin, Twitter, Github } from 'lucide-react';

export default function LandingFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 px-4 text-slate-600 antialiased font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand Area */}
        <div className="md:col-span-1">
          <div 
            className="flex items-center gap-3 cursor-pointer mb-6 group inline-flex"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-200 transition-transform group-hover:scale-105">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
              FindStreak
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
            Empowering professionals with AI-guided learning pathways, hands-on projects, and the clarity needed to succeed in the tech industry.
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links Area */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">Platform</h3>
            <ul className="space-y-3.5">
              {['Features', 'How It Works', 'Career Pathways', 'Project Library'].map(link => (
                <li key={link}>
                  <button onClick={() => navigate(link === 'How It Works' ? '/how-it-works' : '/')} className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">Company</h3>
            <ul className="space-y-3.5">
              {['About Us', 'Contact Support', 'Our Mission', 'Careers'].map(link => (
                <li key={link}>
                  <button onClick={() => navigate(link === 'About Us' ? '/about' : link === 'Contact Support' ? '/contact' : '/')} className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wide">Legal</h3>
            <ul className="space-y-3.5">
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Service', path: '/terms-and-conditions' },
                { name: 'Cookie Policy', path: '/cookie-policy' }
              ].map(link => (
                <li key={link.name}>
                  <button onClick={() => navigate(link.path)} className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-400 font-medium">
          &copy; {currentYear} FindStreak. All rights reserved.
        </p>
        <p className="text-sm text-slate-400 font-medium flex items-center gap-1">
          Designed with care for developers worldwide.
        </p>
      </div>
    </footer>
  );
}
