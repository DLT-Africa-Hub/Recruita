import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Also check localStorage as fallback (in case context hasn't updated yet)
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const isAuth = isAuthenticated || (token && storedUser);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Get user from context or localStorage
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
