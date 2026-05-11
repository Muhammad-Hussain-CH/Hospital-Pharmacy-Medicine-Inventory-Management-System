import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-[#EDE9FE] flex items-center justify-center mb-6">
        <AlertCircle size={36} className="text-[#7C3AED]" />
      </div>
      <h1 className="text-6xl font-bold text-[#7C3AED] mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/"
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors">
        <Home size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}
