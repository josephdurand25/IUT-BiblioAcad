// components/ProtectedRoute.tsx
import { Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useEffect } from 'react';

export const ProtectedRoute = () => {
  const { isAuthenticated, state: { isLoading } } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // if (!isAuthenticated) {
  //   return <Navigate to="../login" replace  state={{ from: location.pathname }}  />;
  // }

  return isAuthenticated ? <Outlet /> : null;
};