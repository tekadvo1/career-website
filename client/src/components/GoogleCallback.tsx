import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setToken, setUser } from '../utils/auth';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        // sessionStorage is tab-isolated — keeps this tab's session independent
        setToken(token);
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.status === 'success') {
            setUser(data.user);

            if (data.user.lastRoleAnalysis) {
                sessionStorage.setItem('lastRoleAnalysis', JSON.stringify(data.user.lastRoleAnalysis));
            } else {
                sessionStorage.removeItem('lastRoleAnalysis');
            }

            if (data.user.onboarding_completed) {
               navigate('/dashboard');
            } else {
               navigate('/onboarding');
            }
          } else {
            // Fallback if API fails
            navigate('/onboarding');
          }
        } catch (e) {
          console.error('Failed to fetch user details:', e);
          navigate('/onboarding');
        }
      } else {
        console.error('No token found');
        navigate('/signin');
      }
    };
    
    fetchUser();
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
