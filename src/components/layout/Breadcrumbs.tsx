import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  path: string;
  label: string;
}

const routeMap: Record<string, string> = {
  '': 'Home',
  'dashboard': 'Dashboard',
  'transactions': 'Transactions',
  'goals': 'Goals',
  'investments': 'Investments',
  'bills': 'Bills',
  'simulator': 'Simulator',
  'profile': 'Profile',
  'statement': 'Statement',
  'income': 'Income',
  'expenses': 'Expenses',
  'variables': 'Variables',
  'investment-portfolio': 'Portfolio',
  'passive-income': 'Passive Income',
  'invoices': 'Invoices',
  'tax': 'Tax',
  'help': 'Help'
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = routeMap[value] || value;
    return { path: to, label };
  });

  return (
    <nav className="text-sm text-gray-500 mb-4">
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            to="/home" 
            className="hover:text-[#1A1A40] transition-colors"
          >
            Home
          </Link>
        </li>
        {breadcrumbs.map((item, index) => (
          <li key={item.path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-[#1A1A40] font-medium">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.path}
                className="hover:text-[#1A1A40] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
