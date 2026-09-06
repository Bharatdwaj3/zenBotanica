import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { protectedRoutes } from '../config/routeConfig';

const ProtectedRoute = ({ path, children }) => {
  const { user, loading, error } = useSelector((state) => state.avatar);
  const requiredRole = protectedRoutes[path];

  // Still checking whether the user is logged in - wait, don't redirect yet.
  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Checked, and no user found (not logged in, or session invalid) - redirect.
  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Logged in, but wrong role for this route.
  if (requiredRole !== 'any' && !requiredRole.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default ProtectedRoute;
