import { Link } from 'react-router-dom';
import { Compass, Home as HomeIcon } from 'lucide-react';
import Button from '../components/Button.jsx';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#FFF3E0] border border-[#FF9800]/30 flex items-center justify-center text-[#FF9800] mb-6 shadow-xs">
        <Compass className="w-9 h-9 animate-pulse" />
      </div>
      <h1 className="text-5xl font-black text-[#16324F]">404</h1>
      <h2 className="text-xl font-bold text-[#16324F] mt-2">Page Not Located</h2>
      <p className="text-xs sm:text-sm text-[#526579] max-w-sm mt-1 mb-6 font-medium leading-relaxed">
        The campus link you followed might have expired, been moved, or does not exist in the lost & found registry.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" icon={HomeIcon} className="font-bold">
          Return to Campus Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
