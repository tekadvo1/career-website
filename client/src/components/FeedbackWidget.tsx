import { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { getToken, getUser } from '../utils/auth';
import { useLocation } from 'react-router-dom';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  const isChatPage = location.pathname.includes('/ai-assistant');

  // Only show the feedback widget if they are securely logged into the app
  const token = getToken();
  if (!token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Get the current user details to attach to the email automatically
      const user = getUser<{ name?: string, username?: string, email?: string }>() || {};
      const userEmail = user.email || 'anonymous@findstreak.com';
      const userName = user.name || user.username || 'FindStreak User';

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName, 
          email: userEmail,
          subject: `[In-App Feedback] - Path: ${window.location.pathname}`,
          message: feedback
        })
      });

      if (!res.ok) throw new Error('Failed to send feedback');
      
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFeedback('');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed right-6 z-[9999] transition-all duration-300 ${isChatPage ? 'bottom-20 md:bottom-6' : 'bottom-6'}`}>
      {/* The floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-emerald-200 group"
          aria-label="Give Feedback"
        >
          <MessageSquarePlus className="w-5 h-5 group-hover:animate-pulse" />
          <span className="font-semibold text-sm hidden sm:block">Feedback</span>
        </button>
      )}

      {/* The Feedback Modal */}
      {isOpen && (
        <div className="bg-white border flex flex-col border-slate-200 rounded-2xl shadow-2xl w-[300px] sm:w-[350px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <MessageSquarePlus className="w-4 h-4" />
              Send Feedback
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-slate-50">
            {success ? (
              <div className="text-center py-6 text-emerald-600">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6" />
                </div>
                <p className="font-bold">Thank you!</p>
                <p className="text-sm text-emerald-700 mt-1">Your feedback helps us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Have an idea, found a bug, or just want to tell us what you think? We read every message!
                </p>
                
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full h-28 p-3 text-sm border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none shadow-inner"
                  required
                />
                
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                
                <button
                  disabled={isSubmitting || !feedback.trim()}
                  type="submit"
                  className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-sm transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
