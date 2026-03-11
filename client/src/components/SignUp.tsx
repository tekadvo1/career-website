import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to create an account');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
      console.log('User registered:', data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 font-sans p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden md:max-h-[90vh]">

        {/* LEFT SIDE - Sign Up Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 text-xs mt-1">Join us today and get started</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-3 bg-red-50 text-red-600 p-2 rounded-lg text-xs flex items-center border border-red-100">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-3 bg-green-50 text-green-600 p-2 rounded-lg text-xs flex items-center border border-green-100">
              <CheckCircle size={16} className="mr-2 flex-shrink-0" /> Account created! Please check your email to verify.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input
                id="username" name="username" type="text" required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input
                id="email" name="email" type="email" required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-8 text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm</label>
                <div className="relative">
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all pr-8 text-sm"
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions checkbox */}
            <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${acceptedTerms ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-teal-600 border-teal-600' : 'bg-white border-gray-300 hover:border-teal-400'}`}
                >
                  {acceptedTerms && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              <label htmlFor="acceptTerms" className="text-[11px] text-slate-600 leading-snug cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                I agree to FindStreak's{' '}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); navigate('/terms'); }}
                  className="text-teal-600 hover:text-teal-700 font-bold underline underline-offset-2"
                >
                  Terms &amp; Conditions
                </button>,{' '}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); navigate('/privacy'); }}
                  className="text-teal-600 hover:text-teal-700 font-bold underline underline-offset-2"
                >
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); navigate('/cookies'); }}
                  className="text-teal-600 hover:text-teal-700 font-bold underline underline-offset-2"
                >
                  Cookie Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className={`w-full py-2.5 mt-1 font-bold rounded-lg shadow-md transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                acceptedTerms
                  ? 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE - Social Login */}
        <div className="w-full md:w-2/5 p-6 md:p-8 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-center items-center text-center">

          <div className="mb-4 md:mb-6">
            <h2 className="text-base font-bold text-slate-800">Or continue with</h2>
            <p className="text-slate-500 text-xs mt-1">Fast and secure access</p>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/google'}
            className="w-full max-w-xs flex justify-center items-center py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-slate-700 font-semibold hover:bg-white hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-all duration-200 group text-sm"
          >
            <svg className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <p className="text-[10px] text-slate-400 mt-3 max-w-[200px] leading-relaxed">
            By signing in with Google you also agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-teal-600 hover:underline font-semibold">Terms</button> &amp;{' '}
            <button onClick={() => navigate('/privacy')} className="text-teal-600 hover:underline font-semibold">Privacy Policy</button>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200 w-full max-w-xs">
            <p className="text-sm text-slate-600">Already have an account?</p>
            <a href="/signin" className="inline-block mt-2 font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors">
              Sign in to your account
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
