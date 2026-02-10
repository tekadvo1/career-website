import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => navigate('/signin'), 3000); // Redirect to signin after 3s
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Verifying Email...</h2>
            <p className="text-slate-500 text-sm mt-2">Just a moment while we check your link.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Verified!</h2>
            <p className="text-slate-500 text-sm mt-2">{message}</p>
            <p className="text-xs text-slate-400 mt-4">Redirecting shortly...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Verification Failed</h2>
            <p className="text-slate-500 text-sm mt-2">{message}</p>
            <div className="mt-6">
               <a href="/signin" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium transition-colors">
                 Go to Login
               </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
