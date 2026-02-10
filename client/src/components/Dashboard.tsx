import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('token');
    // Redirect to login
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FindStreak</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <User size={40} className="text-indigo-600" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to FindStreak!</h1>
        <p className="text-lg text-gray-600 max-w-md">
          You have successfully logged in. This is your personal dashboard where you can track your progress.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {['Career Tracking', 'Job Applications', 'Networking'].map((item) => (
            <div key={item} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg text-gray-800">{item}</h3>
              <p className="text-gray-500 text-sm mt-2">Manage your {item.toLowerCase()} efficiently.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
