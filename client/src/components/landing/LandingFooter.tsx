import { useNavigate } from 'react-router-dom';
import { Zap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'Role Analysis', path: '/signup' },
  ],
  Company: [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ],
  Legal: [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-and-conditions' },
    { name: 'Cookie Policy', path: '/cookie-policy' },
  ],
};

export default function LandingFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const handleNav = (path: string) => {
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500 shadow-md shadow-teal-500/20">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-[17px] font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Find<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Streak</span>
              </span>
            </button>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-[260px]">
              The AI-powered career platform that turns aspiring developers into job-ready engineers — through real projects, not tutorials.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Github, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Mail, href: 'mailto:supportfindstreak@tekadvo.com' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-widest mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
                {section}
              </h4>
              <ul className="space-y-3.5">
                {links.map(link => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNav(link.path)}
                      className="text-sm text-slate-400 hover:text-slate-900 transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {year} FindStreak. All rights reserved.
          </p>
          <p className="text-xs text-slate-300">
            Built with care for developers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
