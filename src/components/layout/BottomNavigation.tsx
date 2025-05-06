import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, User, Calculator } from 'lucide-react';

export default function BottomNavigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className={`flex flex-col items-center ${isActive('/') ? 'text-[#1A1A40]' : 'text-gray-400 hover:text-[#2A2A50]'}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            to="/dashboard" 
            className={`flex flex-col items-center ${isActive('/dashboard') ? 'text-[#1A1A40]' : 'text-gray-400 hover:text-[#2A2A50]'}`}
          >
            <BarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          
          <Link 
            to="/simulator" 
            className={`flex flex-col items-center ${isActive('/simulator') ? 'text-[#1A1A40]' : 'text-gray-400 hover:text-[#2A2A50]'}`}
          >
            <Calculator className="h-6 w-6" />
            <span className="text-xs mt-1">Simulator</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`flex flex-col items-center ${isActive('/profile') ? 'text-[#1A1A40]' : 'text-gray-400 hover:text-[#2A2A50]'}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}