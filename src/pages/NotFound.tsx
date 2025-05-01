import { Link } from 'react-router-dom';
import { PiggyBank, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center max-w-md">
        <PiggyBank className="h-16 w-16 text-primary-600 mx-auto" />
        <h1 className="mt-4 text-4xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-2xl font-medium text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn btn-primary inline-flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}