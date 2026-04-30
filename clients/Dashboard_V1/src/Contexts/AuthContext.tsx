import React, { createContext, useCallback, useContext, useReducer, useMemo, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../ConfigApp/apiConfigCommunication';
import { handleApiError } from '../ConfigApp/errorHandle';
import { getDataToMemorized, setDataToMemorize, removeDataToMemorized } from '../Utils/LocalDataManager';
import { useToast } from './TaostContainer';
import { jwtDecode } from 'jwt-decode';
import type { 
  IAuthResponse, 
  IAuthState, 
  ILoginCredentials, 
  IPasswordResetConfirm, 
  IRegisterRequest, 
  IUpdateProfileRequest, 
  IUser,
  IRole,
  IPermission,
  ILoginResponse
} from '../types/IAuth';
import type { ApiResponseOk, ApiResponseWithoutData } from '../types/api';
import type { AxiosError } from 'axios';

// Constantes pour les clés de stockage
const AUTH_STORAGE_KEY = 'authData';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const PERMISSIONS_KEY = 'auth_permissions';

// ─────────────────────────── Utilitaire ─────────────────────────────
// Fonction utilitaire pour convertir "1h" en secondes
const convertExpiresIn = (expiresIn: string): number => {
  if (!expiresIn) return 3600; // 1h par défaut
  
  const match = expiresIn.match(/^(\d+)([hd])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 'h') return value * 3600;
    if (unit === 'd') return value * 86400;
  }
  
  return 3600; // Valeur par défaut
};

// ─────────────────────────── Types ─────────────────────────────

export type AuthAction =
  | { type: 'FETCH_ROLES_SUCCESS'; payload: { roles: IRole[] } }
  | { type: 'FETCH_PERMISSIONS_SUCCESS'; payload: { permissions: string[] } }
  | { type: "SET_USER"; payload: IUser | null }
  | { type: "SET_TOKEN"; payload: string | undefined }
  | { type: "SET_PERMISSIONS"; payload: string[] | string | undefined }
  | { type: "SET_ROLES"; payload: IRole[] | undefined }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_SUCCESS"; payload: boolean }
  | { type: "SET_MESSAGE"; payload: string | undefined }
  | { type: "SET_ERROR"; payload: string | undefined }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "SET_ERROR_TYPE"; payload: string | undefined }
  | { type: "SET_CAUSE"; payload: string | undefined }
  | { type: "RESET_ERRORS" }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: ILoginResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: ILoginResponse }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOAD_USER_START' }
  | { type: 'LOAD_USER_SUCCESS'; payload: IUser }
  | { type: 'LOAD_USER_FAILURE'; payload: string }
  | { type: 'UPDATE_PROFILE_START' }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: IUser }
  | { type: 'UPDATE_PROFILE_FAILURE'; payload: string }
  | { type: 'REFRESH_TOKEN_START' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: string }
  | { type: 'REFRESH_TOKEN_FAILURE'; payload: string };

// ─────────────────────────── Initial State ─────────────────────────────

const getInitialState = (): IAuthState => {
  const authDataStr = getDataToMemorized(AUTH_STORAGE_KEY);
  
  let token = null;
  let user = null;
  let permissions = undefined;
  
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      token = authData.access_token || authData.token;
      user = authData.user;
      permissions = authData.permissions;
    } catch (e) {
      console.error('Erreur de parsing authData:', e);
    }
  }
  
  return {
    user,
    token,
    permissions,
    roles: undefined,
    isAuthenticated: false, // Sera vérifié après décodage du token
    isLoading: false,
    success: false,
    error: undefined,
    message: undefined,
    errors: {},
    cause: undefined,
    errorType: undefined
  };
};

const initialState: IAuthState = getInitialState();

// ─────────────────────────── Reducer ─────────────────────────────

const authReducer = (state: IAuthState, action: AuthAction): IAuthState => {
  switch (action.type) {
    case 'FETCH_ROLES_SUCCESS':
      return { ...state, roles: action.payload.roles };
      
    case 'FETCH_PERMISSIONS_SUCCESS':
      return { ...state, permissions: action.payload.permissions };

    case 'SET_USER':
      return { ...state, user: action.payload };
      
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
      
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
      
    case 'SET_ROLES':
      return { ...state, roles: action.payload };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'SET_PROCESSING':
      return { ...state,isLoading: action.payload };
      
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
      
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
      
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_ERROR_TYPE':
        return { ...state, errorType: action.payload };

    case 'SET_CAUSE':
      return { ...state, cause: action.payload };
      
    case 'RESET_ERRORS':
      return { 
        ...state, 
        error: undefined,
        errors: {},
        message: undefined, 
        errorType: undefined,
        cause: undefined,
      };

    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'LOAD_USER_START':
    case 'UPDATE_PROFILE_START':
    case 'REFRESH_TOKEN_START':
      return {
        ...state,
        isLoading: true,
        error: undefined,
        message: undefined,
        errors: {},
        errorType: undefined,
        cause: undefined
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS': {
      const userData = action.payload;
  
      // Créer l'objet pour le stockage
      const authData = {
        access_token: userData.token,  // Le token vient de userData
        token: userData.token,
        user: {
          id: userData.id,
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          role: userData.role,
          statut: userData.statut,
          genre: userData.genre,
          avatar_url: userData.avatar_url,
          departement: userData.departement,
          bureau: userData.bureau,
          matricule: userData.matricule,
          last_login: userData.last_login,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        },
        permissions: userData.permissions,  // Les permissions viennent de userData
        expires_in: userData.expiresIn ? convertExpiresIn(userData.expiresIn) : undefined,
        created_at: new Date().toISOString()
      };
      
      setDataToMemorize(AUTH_STORAGE_KEY, authData);
      
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: {
          id: userData.id,
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          role: userData.role,
          statut: userData.statut,
          genre: userData.genre,
          avatar_url: userData.avatar_url,
          departement: userData.departement,
          bureau: userData.bureau,
          matricule: userData.matricule,
          last_login: userData.last_login,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        },
        token: userData.token,
        permissions: userData.permissions,
        error: undefined,
        success: true,
        errorType: undefined,
      };
    }

    case 'LOAD_USER_SUCCESS':
      // Mettre à jour l'utilisateur dans le stockage
      const authDataStr = getDataToMemorized(AUTH_STORAGE_KEY);
      if (authDataStr) {
        try {
          const authData = JSON.parse(authDataStr);
          authData.user = action.payload;
          setDataToMemorize(AUTH_STORAGE_KEY, authData);
        } catch (e) {
          console.error('Erreur de mise à jour user:', e);
        }
      }
      
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: undefined,
      };

    case 'UPDATE_PROFILE_SUCCESS':
      // Mettre à jour l'utilisateur dans le stockage
      const profileDataStr = getDataToMemorized(AUTH_STORAGE_KEY);
      if (profileDataStr) {
        try {
          const authData = JSON.parse(profileDataStr);
          authData.user = action.payload;
          setDataToMemorize(AUTH_STORAGE_KEY, authData);
        } catch (e) {
          console.error('Erreur de mise à jour profil:', e);
        }
      }
      
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        message: 'Profil mis à jour avec succès',
        error: undefined,
        errorType: undefined,
        success: true,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
    case 'LOAD_USER_FAILURE':
    case 'UPDATE_PROFILE_FAILURE':
    case 'REFRESH_TOKEN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: undefined,
        error: action.payload 
      }

    case 'LOGOUT':
      removeDataToMemorized(AUTH_STORAGE_KEY);
      return {
        ...initialState,
        isAuthenticated: false,
        user: null,
        token: undefined,
        permissions: undefined,
        roles: undefined,
      };

    case 'REFRESH_TOKEN_SUCCESS': {
      const tokenDataStr = getDataToMemorized(AUTH_STORAGE_KEY);
      if (tokenDataStr) {
        try {
          const authData = JSON.parse(tokenDataStr);
          authData.access_token = action.payload;
          authData.token = action.payload;
          authData.created_at = new Date().toISOString();
          setDataToMemorize(AUTH_STORAGE_KEY, authData);
        } catch (e) {
          console.error('Erreur de mise à jour du token:', e);
        }
      }
      return {
        ...state,
        token: action.payload,
        error: undefined,
      };
    }

    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

export interface AuthContextType {
  isAuthenticated: boolean;
  state: IAuthState;
  actions: {
    login: (credentials: ILoginCredentials) => Promise<void>;
    register: (userData: IRegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    updateProfile: (data: IUpdateProfileRequest) => Promise<void>;
    updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    confirmPasswordReset: (data: IPasswordResetConfirm) => Promise<void>;
    refreshToken: () => Promise<void>;
    checkTokenExpiration: () => boolean;
    getToken: () => Promise<string>;
    resetErrors: () => void;
    clearError: () => void;
    clearMessage: () => void;
    setUser: (user: IUser | null) => void;
    setToken: (token: string | null) => void;
    setPermissions: (permissions: string[] | string | undefined) => void;
    setMessage: (message: string | undefined) => void;
    setErrors: (errors: Record<string, string>) => void;
    setError: (error: string | undefined) => void;
    setCause: (cause: string | undefined) => void;
    setErrorType: (type: string | undefined) => void;
    setSuccess: (success: boolean) => void;
    setProcessing: (processing: boolean) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    hasRole: (roles: string | string[]) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    hasPermission: (permissions: string[], mode?: 'all' | 'any') => boolean;
    isAdmin: () => boolean;
    isSuper: () => boolean;
    isTeacher: () => boolean;
    isStudent: () => boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Vérification de l'expiration du token au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'RESET_ERRORS' });
      const storedData = getDataToMemorized(AUTH_STORAGE_KEY);
      
      if (storedData) {
        try {
          const authData = JSON.parse(storedData);
          const { access_token, user, permissions } = authData;
          
          if (access_token) {
            const isValid = checkTokenValidity(access_token, authData);
            
            if (isValid) {
              api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
              dispatch({ type: 'SET_USER', payload: user });
              dispatch({ type: 'SET_TOKEN', payload: access_token });
              dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
              dispatch({ type: 'SET_AUTHENTICATED', payload: true });
            } else {
              // Token expiré, essayer de le rafraîchir
              try {
                await refreshToken();
              } catch {
                removeDataToMemorized(AUTH_STORAGE_KEY);
                dispatch({ type: 'SET_USER', payload: undefined });
                dispatch({ type: 'SET_TOKEN', payload: undefined });
                dispatch({ type: 'SET_PERMISSIONS', payload: undefined });
                dispatch({ type: 'SET_AUTHENTICATED', payload: false });
                addToast({
                  type: 'warning',
                  title: 'Session expirée',
                  message: 'Votre session a expiré, veuillez vous reconnecter'
                });
              }
            }
          }
        } catch (e) {
          console.error("Erreur lors de l'initialisation de l'auth:", e);
          removeDataToMemorized(AUTH_STORAGE_KEY);
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'SET_TOKEN', payload: undefined });
          dispatch({ type: 'SET_PERMISSIONS', payload: undefined });
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        }
      }
    };
    
    initializeAuth();
  }, []);

  // Fonction utilitaire pour vérifier la validité du token
  const checkTokenValidity = useCallback((token: string, authData?: any): boolean => {
    try {
      // Essayer de décoder le JWT
      const decoded: any = jwtDecode(token);
      
      if (decoded.exp && decoded.exp > Date.now() / 1000) {
        return true;
      }
      
      // Si pas d'expiration dans le JWT, utiliser les données stockées
      if (authData?.expires_in && authData?.created_at) {
        const createdAt = new Date(authData.created_at).getTime() / 1000;
        const expiresAt = createdAt + authData.expires_in;
        
        if (expiresAt > Date.now() / 1000) {
          return true;
        }
      }
      
      return false;
    } catch (e) {
      console.error('Erreur de décodage du token:', e);
      return false;
    }
  }, []);

  // Vérification périodique de l'expiration du token
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (state.token && state.isAuthenticated) {
        const isValid = checkTokenValidity(state.token, getDataToMemorized(AUTH_STORAGE_KEY));
        
        if (!isValid) {
          addToast({
            type: 'warning',
            title: 'Session expirée',
            message: 'Votre session a expiré, tentative de rafraîchissement...'
          });
          
          refreshToken();
        }
      }
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(checkInterval);
  }, [state.token, state.isAuthenticated]);

  // ═══════════════════════ Auth Actions ═══════════════════════

  const login = useCallback(async (credentials: ILoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await api.post<ApiResponseOk<ILoginResponse>>('/auth/login', credentials);
      console.info('réponse login:', response);
      if (response.success && response.data) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: response.data
        });
        
        addToast({
          type: 'success',
          title: 'Connexion réussie',
          message: `Bienvenue ${response.data.prenom} ${response.data.nom}`
        });
        
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'LOGIN_FAILURE', payload: msg });
          addToast({
            type: 'error',
            title: 'Erreur de connexion',
            message: msg
          });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [navigate, addToast]);

  const register = useCallback(async (userData: IRegisterRequest) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await api.post<ApiResponseOk<IAuthResponse>>('/auth/register', userData);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'REGISTER_SUCCESS', 
          payload: response.data 
        });
        
        addToast({
          type: 'success',
          title: 'Inscription réussie',
          message: 'Votre compte a été créé avec succès'
        });
        
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Erreur d\'inscription');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'REGISTER_FAILURE', payload: msg });
          addToast({
            type: 'error',
            title: 'Erreur d\'inscription',
            message: msg
          });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [navigate, addToast]);

  const logout = useCallback(async () => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // Vérifier si le token est encore valide avant d'appeler l'API
      const isValid = state.token ? checkTokenValidity(state.token) : false;
      
      if (isValid) {
        await api.post<ApiResponseWithoutData>('/auth/logout');
      }
      
      dispatch({ type: 'LOGOUT' });
      
      addToast({
        type: 'info',
        title: 'Déconnexion',
        message: 'Vous avez été déconnecté'
      });
      
      navigate('/');
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => dispatch({ type: 'SET_MESSAGE', payload: msg }),
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      
      // Même en cas d'erreur, déconnecter localement
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.token, navigate, addToast, checkTokenValidity]);

  const loadUser = useCallback(async () => {
    dispatch({ type: 'LOAD_USER_START' });
    
    try {
      const response = await api.get<ApiResponseOk<IUser>>('/auth/me');
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'LOAD_USER_SUCCESS', 
          payload: response.data 
        });
      } else {
        throw new Error(response.message || 'Impossible de charger l\'utilisateur');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'LOAD_USER_FAILURE', payload: msg });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      
      // Si le token est invalide, déconnecter
      if (error.status === 401) {
        logout();
      }
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [logout]);

  const updateProfile = useCallback(async (data: IUpdateProfileRequest) => {
    dispatch({ type: 'UPDATE_PROFILE_START' });
    
    try {
      let response;
      
      if (data.photo_profil instanceof File) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value instanceof File ? value : String(value));
          }
        });
        
        response = await api.post<ApiResponseOk<IUser>>(
          '/auth/profile',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await api.put<ApiResponseOk<IUser>>('/auth/profile', data);
      }
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'UPDATE_PROFILE_SUCCESS', 
          payload: response.data 
        });
        
        addToast({
          type: 'success',
          title: 'Profil mis à jour',
          message: 'Vos informations ont été mises à jour avec succès'
        });
      } else {
        throw new Error(response.message || 'Erreur de mise à jour');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: msg });
          addToast({
            type: 'error',
            title: 'Erreur de mise à jour',
            message: msg
          });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [addToast]);

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    dispatch({ type: 'UPDATE_PROFILE_START' });
    
    try {
      const response = await api.put<ApiResponseOk<{ message: string }>>(
        '/auth/password',
        { old_password: oldPassword, new_password: newPassword }
      );
      
      if (response.success) {
        dispatch({ type: 'SET_MESSAGE', payload: response.message || 'Mot de passe mis à jour' });
        addToast({
          type: 'success',
          title: 'Mot de passe modifié',
          message: 'Votre mot de passe a été mis à jour avec succès'
        });
      } else {
        throw new Error(response.message || 'Erreur de mise à jour');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: msg });
          addToast({
            type: 'error',
            title: 'Erreur de mise à jour',
            message: msg
          });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [addToast]);

  const requestPasswordReset = useCallback(async (email: string) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await api.post<ApiResponseOk<{ message: string }>>(
        '/auth/password/reset-request',
        { email }
      );
      
      if (response.success) {
        dispatch({ type: 'SET_MESSAGE', payload: response.message || 'Email de réinitialisation envoyé' });
        addToast({
          type: 'success',
          title: 'Email envoyé',
          message: 'Consultez votre boîte mail pour réinitialiser votre mot de passe'
        });
      } else {
        throw new Error(response.message || 'Erreur de demande');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'REGISTER_FAILURE', payload: msg });
          addToast({
            type: 'error',
            title: 'Erreur',
            message: msg
          });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [addToast]);

  const confirmPasswordReset = useCallback(async (data: IPasswordResetConfirm) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await api.post<ApiResponseOk<{ message: string }>>(
        '/auth/password/reset-confirm',
        data
      );
      
      if (response.success) {
        dispatch({ type: 'SET_MESSAGE', payload: response.message || 'Mot de passe réinitialisé' });
        addToast({
          type: 'success',
          title: 'Mot de passe réinitialisé',
          message: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe'
        });
      } else {
        throw new Error(response.message || 'Erreur de réinitialisation');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'REGISTER_FAILURE', payload: msg });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [addToast]);

  const refreshToken = useCallback(async () => {
    dispatch({ type: 'REFRESH_TOKEN_START' });
    
    try {
       console.log('🔄 Tentative de refresh avec token:', state.token);
      const response = await api.post<ApiResponseOk<ILoginResponse>>('/auth/refreshToken');
      
      if (response.success && response.data?.token) {
        console.log('token rafraichi',response.data?.token);
        
        dispatch({ 
          type: 'REFRESH_TOKEN_SUCCESS', 
          payload: response.data.token 
        });
        addToast({
            type: 'success',
            title: 'Token rafraîchi !',
            message: 'Votre token a été rafraîchi'
          });
        
        // Mettre à jour le header Authorization
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data.token;
      } else {
        throw new Error(response.message || 'Erreur de rafraîchissement');
      }
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
        (msg) => {
          dispatch({ type: 'SET_MESSAGE', payload: msg });
          dispatch({ type: 'REFRESH_TOKEN_FAILURE', payload: msg });
        },
        (type) => dispatch({ type: 'SET_ERROR_TYPE', payload: type }),
        (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
      );
      console.log('Context-> le rafraichissement a échoué',error);
      // Si le refresh échoue, déconnecter
      await logout();
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [logout]);

  const checkTokenExpiration = useCallback((): boolean => {
    const token = state.token;
    if (!token) return false;
    
    try {
      const decoded: any = jwtDecode(token);
      const isValid = decoded.exp && decoded.exp > Date.now() / 1000;
      
      if (!isValid) {
        const minutesLeft = Math.floor((decoded.exp - Date.now() / 1000) / 60);
        
        if (minutesLeft < 10 && minutesLeft > 0) {
          addToast({
            type: 'info',
            title: 'Session bientôt expirée',
            message: `Votre session expire dans ${minutesLeft} minutes`
          });
        }
      }
      
      return !!isValid;
    } catch (e) {
      console.error('Erreur de vérification token:', e);
      return false;
    }
  }, [state.token, addToast]);

  const getToken = useCallback(async (): Promise<string> => {
    let token = state.token;
    
    if (!token) {
      const storedData = getDataToMemorized(AUTH_STORAGE_KEY);
      if (storedData) {
        try {
          const { access_token } = JSON.parse(storedData);
          token = access_token;
        } catch (e) {
          console.error('Erreur de récupération token:', e);
        }
      }
    }
    
    return token || '';
  }, [state.token]);

  // ═══════════════════════ Helper Functions ═══════════════════════

  const resetErrors = useCallback(() => {
    dispatch({ type: 'RESET_ERRORS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: undefined });
  }, []);

  const clearMessage = useCallback(() => {
    dispatch({ type: 'SET_MESSAGE', payload: undefined });
  }, []);

  const setUser = useCallback((user: IUser | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setToken = useCallback((token: string | null) => {
    dispatch({ type: 'SET_TOKEN', payload: token });
  }, []);

  const setPermissions = useCallback((permissions: string[] | string | undefined) => {
    dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
  }, []);

  const setMessage = useCallback((message: string | undefined) => {
    dispatch({ type: 'SET_MESSAGE', payload: message });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const setError = useCallback((error: AxiosError<any>) => {
    handleApiError(
      error,
      (errors) => dispatch({ type: 'SET_ERRORS', payload: errors }),
      (msg) => dispatch({ type: 'SET_MESSAGE', payload: msg }),
      (ErrorType) => null,
      (cause) => dispatch({ type: 'SET_CAUSE', payload: cause })
    );
  }, []);

  const setErrorType = useCallback((type: string | undefined) => {
    dispatch({ type: 'SET_ERROR_TYPE', payload: type });
  }, []);

  const setCause = useCallback((cause: string | undefined) => {
    dispatch({ type: 'SET_CAUSE', payload: cause });
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    dispatch({ type: 'SET_SUCCESS', payload: success });
  }, []);

  const setProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  }, []);

  const setAuthenticated = useCallback((isAuthenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
  }, []);

  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!state.user) return false;
    
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(state.user.role.toUpperCase());
  }, [state.user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const hasPermission = useCallback((permissions: string[], mode: 'all' | 'any' = 'all'): boolean => {
    const userPermissions = state.permissions;
    
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    
    return mode === 'all'
      ? permissions.every(p => userPermissions.includes(p))
      : permissions.some(p => userPermissions.includes(p));
  }, [state.permissions]);

  const isAdmin = useCallback((): boolean => {
    return hasRole(['ADMINISTRATEUR', 'SUPER_ADMIN']);
  }, [hasRole]);

  const isSuper = useCallback((): boolean => {
    return hasRole('SUPER_ADMIN');
  }, [hasRole]);

  const isTeacher = useCallback((): boolean => {
    return hasRole('ENSEIGNANT');
  }, [hasRole]);

  const isStudent = useCallback((): boolean => {
    return hasRole('ETUDIANT');
  }, [hasRole]);

  // ═══════════════════════ Context Value ═══════════════════════

  const contextValue = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      state,
      actions: {
        login,
        register,
        logout,
        loadUser,
        updateProfile,
        updatePassword,
        requestPasswordReset,
        confirmPasswordReset,
        refreshToken,
        checkTokenExpiration,
        getToken,
        resetErrors,
        clearError,
        clearMessage,
        setUser,
        setToken,
        setPermissions,
        setMessage,
        setErrors,
        setError,
        setCause,
        setSuccess,
        setProcessing,
        setAuthenticated,
        hasRole,
        hasAnyRole,
        hasPermission,
        isAdmin,
        isSuper,
        isTeacher,
        isStudent,
      },
    }),
    [
      state,
      login,
      register,
      logout,
      loadUser,
      updateProfile,
      updatePassword,
      requestPasswordReset,
      confirmPasswordReset,
      refreshToken,
      checkTokenExpiration,
      getToken,
      resetErrors,
      clearError,
      clearMessage,
      setUser,
      setToken,
      setPermissions,
      setMessage,
      setErrors,
      setError,
      setCause,
      setSuccess,
      setProcessing,
      setAuthenticated,
      hasRole,
      hasAnyRole,
      hasPermission,
      isAdmin,
      isSuper,
      isTeacher,
      isStudent,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────── Hook ─────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};