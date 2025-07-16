import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useApp();
  const location = useLocation();

  if (!state.user) {
    // Not authenticated, redirect to /auth, preserve intended location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 