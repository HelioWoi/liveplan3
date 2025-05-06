import { Link } from 'react-router-dom';
import { PiggyBank, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="text-center max-w-md">
        <PiggyBank className="h-24 w-24 text-[#6366F1] mx-auto" />
        <h1 className="mt-8 text-7xl font-bold text-gray-900">404</h1>
        <h2 className="mt-6 text-3xl font-semibold text-gray-900">Page not found</h2>
        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-[#6366F1] rounded-lg hover:bg-[#4F46E5] transition-colors duration-200"
          >
            <Home className="h-5 w-5 mr-2" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}