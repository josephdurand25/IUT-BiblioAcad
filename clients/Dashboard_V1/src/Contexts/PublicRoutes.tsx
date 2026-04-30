// components/PublicRoute.tsx
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

export const PublicRoute = () => {
  const { isAuthenticated, state: { isLoading } } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupérer l'URL d'origine ou dashboard par défaut
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoading) return;

    // Si déjà authentifié, rediriger
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher les routes publiques
  return <Outlet />;
};