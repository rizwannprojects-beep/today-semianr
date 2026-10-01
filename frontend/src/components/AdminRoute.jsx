import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Verifying administrative authority...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving intended target
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not an admin -> strictly redirect to student dashboard without rendering admin content
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
