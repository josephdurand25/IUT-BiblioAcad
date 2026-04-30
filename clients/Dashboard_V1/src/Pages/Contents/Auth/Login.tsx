import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../../Contexts/AuthContext';
import { useToast } from '../../../Contexts/TaostContainer';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  // Afficher les erreurs du contexte dans un toast
  useEffect(() => {
    if (state.error) {
      addToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: state.error
      });
      actions.clearError(); // Nettoyer l'erreur après l'avoir affichée
    }
  }, [state.error]);

  // Afficher les messages de succès du contexte dans un toast
  useEffect(() => {
    if (state.message) {
      addToast({
        type: 'success',
        title: 'Succès',
        message: state.message
      });
      actions.clearMessage(); // Nettoyer le message après l'avoir affiché
    }
  }, [state.message]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      actions.clearError();
      actions.clearMessage();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    const validationErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      validationErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Format d'email invalide";
    }
    
    if (!formData.password.trim()) {
      validationErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    // Afficher les erreurs de validation dans des toasts
    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach(error => {
        addToast({
          type: 'warning',
          title: 'Validation',
          message: error
        });
      });
      return;
    }

    try {
      await actions.login({
        email: formData.email,
        password: formData.password,
        rememberMe
      });
      
      // Toast de succès (optionnel car la redirection va se faire)
      addToast({
        type: 'success',
        title: 'Connexion réussie',
        message: 'Vous êtes maintenant connecté'
      });
      
    } catch (error: any) {
      // Les erreurs sont déjà gérées par le contexte et le useEffect ci-dessus
      // On peut ajouter un toast supplémentaire si nécessaire
      console.error('Erreur de connexion:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg rounded-md p-5 bg-white w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <i className="h-6 w-6 text-indigo-600 ri-lock-password-line"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Input 
              name="email" 
              labelText="Email" 
              type="email"
              value={formData.email} 
              onChange={handleChange}
              required={true}
              placeholder="azerty@email.com"
              disabled={state.isLoading}
              inputStyle="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>

          <div className="relative">
            <Input 
              type={showPassword ? 'text' : 'password'}
              name="password" 
              labelText="Mot de passe"
              value={formData.password} 
              onChange={handleChange} 
              required={true}
              placeholder="*******"
              disabled={state.isLoading}
              inputStyle="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              tabIndex={-1}
            >
              {showPassword ? (
                <i className="ri-eye-off-line h-5 w-5"></i>
              ) : (
                <i className="ri-eye-line h-5 w-5"></i>
              )}
            </button>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={state.isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="perso"
            supStyle="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;