import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, TrendingUp, User, Calculator } from 'lucide-react';

interface BottomNavigationProps {
  onAddClick?: () => void;
}

export default function BottomNavigation({ onAddClick }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const isInvoicesPage = location.pathname === '/invoices';

  const handleAddClick = () => {
    if (isInvoicesPage && onAddClick) {
      onAddClick();
      return;
    }
    // Default behavior for other pages
    navigate('/transactions');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between relative">
          {/* Left side links */}
          <div className="flex-1 flex justify-start space-x-8">
            <Link 
              to="/" 
              className={`flex flex-col items-center ${isActive('/') ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link 
              to="/dashboard" 
              className={`flex flex-col items-center ${isActive('/dashboard') ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            >
              <BarChart2 className="h-6 w-6" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
          </div>

          {/* Center "+" button */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0">
            <button 
              onClick={handleAddClick}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors">
                <span className="text-2xl">+</span>
              </div>
            </button>
          </div>

          {/* Right side links */}
          <div className="flex-1 flex justify-end space-x-8">
            <Link 
              to="/simulator" 
              className={`flex flex-col items-center ${isActive('/simulator') ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            >
              <Calculator className="h-6 w-6" />
              <span className="text-xs mt-1">Simulator</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex flex-col items-center ${isActive('/profile') ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}