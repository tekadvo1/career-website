import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      console.error('No token found');
      navigate('/signin');
    }
  }, [token, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Logging you in...</h2>
        <p className="text-gray-500 mt-2">Please wait while we verify your Google account.</p>
        <div className="mt-4 flex justify-center">
           <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
