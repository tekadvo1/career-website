import { Link } from 'react-router-dom';
import { ArrowRight, Target, BrainCircuit, Code2, Zap, Sparkles } from 'lucide-react';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        {/* 1. Compact introduction */}
        <section className="pt-24 pb-16 px-4 sm:px-6 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white text-center">
          <div className="max-w-3xl mx-auto">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />ABOUT FINDSTREAK
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Make your next career step clearer.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              FindStreak brings learning plans, practical projects, interview practice, and portfolios into one place—helping you turn a career goal into steady action.
            </p>
          </div>
        </section>

        {/* 2. Why FindStreak exists */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">
              Learning takes effort. Finding direction shouldn’t take all of it.
            </h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                Learners often navigate disconnected tutorials, project ideas, and interview resources. 
              </p>
              <p>
                Knowing what to work on next—and how it connects to a career goal—can be difficult.
              </p>
              <p>
                FindStreak exists to connect these activities into a clearer, manageable journey.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Our mission */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-6 leading-snug">
                Help people turn career goals into practical skills and work they can show.
              </h2>
              <p className="text-emerald-800/80 text-lg max-w-2xl mx-auto leading-relaxed">
                We aim to make the next step easier to understand, progress easier to follow, and learning easier to put into practice.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Principles behind the product */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Principles behind the product</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <Target className="h-6 w-6 text-emerald-600 mb-5" />
                <h3 className="font-bold text-slate-900 mb-3 text-lg">Clear direction</h3>
                <p className="text-slate-600 leading-relaxed">
                  Help learners understand what to focus on and why it matters.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <Code2 className="h-6 w-6 text-emerald-600 mb-5" />
                <h3 className="font-bold text-slate-900 mb-3 text-lg">Learning through practice</h3>
                <p className="text-slate-600 leading-relaxed">
                  Connect skills to projects and useful work.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <Zap className="h-6 w-6 text-emerald-600 mb-5" />
                <h3 className="font-bold text-slate-900 mb-3 text-lg">Progress at a realistic pace</h3>
                <p className="text-slate-600 leading-relaxed">
                  Encourage consistent effort without making rewards more important than learning.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <BrainCircuit className="h-6 w-6 text-emerald-600 mb-5" />
                <h3 className="font-bold text-slate-900 mb-3 text-lg">Work you can explain</h3>
                <p className="text-slate-600 leading-relaxed">
                  Help learners present their projects, decisions, and skills clearly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Who we’re building for */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Who we're building for</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Starting in tech</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  People looking for an understandable starting point.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Changing careers</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  People connecting existing experience with a new direction.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">Building on existing skills</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  People ready to move from learning concepts to applying them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. How we think about AI */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-emerald-600" />
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Guidance that supports your thinking.</h2>
            </div>
            <ul className="space-y-4 text-slate-600 text-lg leading-relaxed list-disc pl-5">
              <li>AI can help organize learning and provide suggestions or practice feedback.</li>
              <li>Learners still need to build, investigate, and make decisions.</li>
              <li>AI-generated guidance can be imperfect and should be checked against reliable resources.</li>
            </ul>
          </div>
        </section>

        {/* 7. A direct invitation */}
        <section className="py-24 px-4 sm:px-6 bg-slate-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 opacity-50"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
              Have an idea that could make FindStreak better?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              We’d like to hear what would make your learning journey clearer or more useful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 px-6 py-4 text-sm font-semibold text-white shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-colors">
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/#career-paths" className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-800/50 px-6 py-4 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
                Explore career paths
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
