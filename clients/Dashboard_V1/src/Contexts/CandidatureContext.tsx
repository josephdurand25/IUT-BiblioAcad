import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";

import { useNavigate } from "react-router";
import { useToast } from "./TaostContainer";
import type { 
  ICandidature, 
  ICandidatureFormRequest, 
  ICandidatureUpdateRequest, 
  ICandidatureValidation,
  ICandidatureFilters
} from "../types/ICandidature";
import type { ApiResponseOk, IPaginationResult } from "../types/api";
import type { ISpecialite } from "../types/ISpecialite";
import type { StatutCandidature } from "../types/IGeneral";
import type { IFiliere } from "../types/IFiliere";
import { toFormData } from "../Utils/utils_fuctions";

// ─────────────────────────── Types ─────────────────────────────

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ModalStates {
  candidatureDetails: boolean;
  candidatureForm: boolean;
  candidatureDelete: boolean;
  candidatureValidation: boolean;
  candidatureDocuments: boolean;
}

export interface StatsData {
  total: number;
  en_cours: number;
  complet: number;
  en_evaluation: number;
  valide: number;
  rejete: number;
  annule: number;
  converties_en_etudiant: number;
  nb_specialites: number;
  premiere_candidature: string;
  derniere_candidature: string;
  delai_moyen_traitement_jours: number;
  par_specialite: Array<{
    specialite_demandee: string;
    total: number;
    validees: number;
  }>;
  par_mois: Array<{
    mois: string;
    count: number;
  }>;
}

// ─────────────────────────── State ─────────────────────────────

export interface CandidatureState {
  // Données principales
  candidatures: ICandidature[];
  selectedCandidature: ICandidature | null;
  
  // Filtres et recherche
  filters: ICandidatureFilters;
  searchTerm: string;
  
  // État des opérations
  processing: boolean;
  success: boolean;
  message: string | undefined;
  errors: Record<string, string>;
  errorType: string | null;
  cause: string | undefined;
  
  // Pagination et tri
  pagination: PaginationState;
  sortConfig: SortConfig;
  
  // États des modals
  modals: ModalStates;
  
  // Statistiques
  stats: StatsData | null;
  
  // Données associées
  candidatureDocuments: string[];
  
  // Données académiques disponibles
  filieres: IFiliere[];
  specialites: ISpecialite[];
}

// ─────────────────────────── Actions ─────────────────────────────

export type CandidatureAction =
  | { type: "FETCH_CANDIDATURES_SUCCESS"; payload: { candidatures: ICandidature[], pagination: PaginationState } }
  | { type: "SET_SELECTED_CANDIDATURE"; payload: ICandidature | null }
  | { type: "SET_FILTERS"; payload: ICandidatureFilters }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "RESET_FILTERS" }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_SUCCESS"; payload: boolean }
  | { type: "SET_MESSAGE"; payload: string | undefined }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "SET_ERROR_TYPE"; payload: string | null }
  | { type: "SET_CAUSE"; payload: string | undefined }
  | { type: "RESET_ERRORS" }
  | { type: "SET_PAGINATION"; payload: Partial<PaginationState> }
  | { type: "SET_SORT_CONFIG"; payload: SortConfig }
  | { type: "TOGGLE_MODAL"; payload: { modal: keyof ModalStates; isOpen: boolean } }
  | { type: "SET_STATS"; payload: StatsData }
  | { type: "SET_CANDIDATURE_DOCUMENTS"; payload: string[] }
  | { type: "SET_SPECIALITES"; payload: ISpecialite[] }
  | { type: "SET_FILIERES"; payload: IFiliere[] }
  | { type: "ADD_CANDIDATURE"; payload: ICandidature }
  | { type: "UPDATE_CANDIDATURE"; payload: ICandidature }
  | { type: "DELETE_CANDIDATURE"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

export const initialCandidatureState: CandidatureState = {
  candidatures: [],
  selectedCandidature: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  },
  sortConfig: {
    field: 'date_candidature',
    direction: 'desc'
  },
  modals: {
    candidatureDetails: false,
    candidatureForm: false,
    candidatureDelete: false,
    candidatureValidation: false,
    candidatureDocuments: false
  },
  stats: null,
  candidatureDocuments: [],
  filieres: [],
  specialites: []
};

// ─────────────────────────── Reducer ─────────────────────────────

function candidatureReducer(state: CandidatureState, action: CandidatureAction): CandidatureState {
  switch (action.type) {
    case "FETCH_CANDIDATURES_SUCCESS":
      return {
        ...state,
        candidatures: action.payload.candidatures,
        pagination: action.payload.pagination
      };

    case "SET_SELECTED_CANDIDATURE":
      return { ...state, selectedCandidature: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };

    case "RESET_FILTERS":
      return { ...state, filters: {}, searchTerm: "" };

    case "SET_PROCESSING":
      return { ...state, processing: action.payload };

    case "SET_SUCCESS":
      return { ...state, success: action.payload };

    case "SET_MESSAGE":
      return { ...state, message: action.payload };

    case "SET_ERRORS":
      return { ...state, errors: action.payload };

    case "SET_ERROR_TYPE":
      return { ...state, errorType: action.payload };

    case "SET_CAUSE":
      return { ...state, cause: action.payload };

    case "RESET_ERRORS":
      return {
        ...state,
        errors: {},
        errorType: null,
        cause: undefined,
        message: undefined
      };

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case "SET_SORT_CONFIG":
      return { ...state, sortConfig: action.payload };

    case "TOGGLE_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.isOpen
        }
      };

    case "SET_STATS":
      return { ...state, stats: action.payload };

    case "SET_CANDIDATURE_DOCUMENTS":
      return { ...state, candidatureDocuments: action.payload };

    case "SET_SPECIALITES":
      return { ...state, specialites: action.payload };
    
      case "SET_FILIERES":
      return { ...state, filieres: action.payload };

    case "ADD_CANDIDATURE":
      return {
        ...state,
        candidatures: [...state.candidatures, action.payload],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case "UPDATE_CANDIDATURE":
      if (!action.payload || typeof action.payload !== 'object' || !('id' in action.payload)) {
        console.error('UPDATE_CANDIDATURE action payload invalide:', action.payload);
        return state;
      }
      return {
        ...state,
        candidatures: state.candidatures.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
        selectedCandidature: state.selectedCandidature?.id === action.payload.id 
          ? action.payload 
          : state.selectedCandidature
      };

    case "DELETE_CANDIDATURE":
      return {
        ...state,
        candidatures: state.candidatures.filter(c => c.id !== action.payload),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        },
        selectedCandidature: state.selectedCandidature?.id === action.payload 
          ? null 
          : state.selectedCandidature
      };

    default:
      return state;
  }
}

// ─────────────────────────── Context ─────────────────────────────

interface CandidatureContextType {
  state: CandidatureState;
  actions: {
    // CRUD
    fetchCandidatures: (page?: number, limit?: number) => Promise<void>;
    fetchCandidatureById: (id: number) => Promise<void>;
    fetchCandidaturesByEmail: (email: string) => Promise<void>;
    fetchCandidaturesByStatut: (statut: StatutCandidature, page?: number, limit?: number) => Promise<void>;
    fetchCandidaturesBySpecialite: (specialite: string, page?: number, limit?: number) => Promise<void>;
    fetchCandidatureByEtudiantId: (etudiantId: number) => Promise<void>;
    createCandidature: (data: ICandidatureFormRequest) => Promise<void>;
    updateCandidature: (id: number, data: ICandidatureUpdateRequest) => Promise<void>;
    validerCandidature: (id: number, validation: ICandidatureValidation) => Promise<void>;
    deleteCandidature: (id: number) => Promise<void>;
    
    // Statistiques et données associées
    fetchStats: () => Promise<void>;
    fetchFilieres: () => Promise<void>;
    fetchSpecialites: () => Promise<void>;
    checkEmailExists: (email: string) => Promise<boolean>;
    
    // Filtres et recherche
    setSelectedCandidature: (candidature: ICandidature | null) => void;
    setFilters: (filters: ICandidatureFilters) => void;
    setSearchTerm: (term: string) => void;
    applyFilters: () => Promise<void>;
    resetFilters: () => void;
    resetErrors: () => void;
    
    // Pagination et tri
    setPagination: (pagination: Partial<PaginationState>) => void;
    setSortConfig: (config: SortConfig) => void;
    
    // Modals
    toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
  };
}

const CandidatureContext = createContext<CandidatureContextType | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

interface CandidatureProviderProps {
  children: ReactNode;
}

export const CandidatureProvider: React.FC<CandidatureProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(candidatureReducer, initialCandidatureState);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ═══════════════════════ CRUD Operations ═══════════════════════

  const fetchCandidatures = useCallback(async (page = 1, limit = 10) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...state.filters,
        ...(state.searchTerm && { search: state.searchTerm })
      });

      const response = await api.get<ApiResponseOk<IPaginationResult<ICandidature>>>(
        `/candidatures?${params}`
      );

      const apiResult: IPaginationResult<ICandidature> = response.data;
      const candidatures = apiResult.data;
      const pagination = apiResult.pagination!;

      console.log('Candidatures fetched:', candidatures);
      console.log('Pagination:', pagination);

      dispatch({
        type: "FETCH_CANDIDATURES_SUCCESS",
        payload: { candidatures, pagination }
      });

      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchCandidatureById = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.get<ApiResponseOk<ICandidature>>(`/candidatures/${id}`);
      const candidature = response.data;
      
      dispatch({ type: "SET_SELECTED_CANDIDATURE", payload: candidature });
      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchCandidaturesByEmail = useCallback(async (email: string) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.get<ApiResponseOk<ICandidature[]>>(`/candidatures/email/${email}`);
      const candidatures = response.data;
      
      dispatch({
        type: "FETCH_CANDIDATURES_SUCCESS",
        payload: {
          candidatures,
          pagination: {
            page: 1,
            limit: candidatures.length,
            total: candidatures.length,
            totalPages: 1
          }
        }
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchCandidaturesByStatut = useCallback(async (statut: StatutCandidature, page = 1, limit = 10) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<ApiResponseOk<ICandidature[]>>(
        `/candidatures/statut/${statut}?${params}`
      );
      const candidatures = response.data;
      
      dispatch({
        type: "FETCH_CANDIDATURES_SUCCESS",
        payload: {
          candidatures,
          pagination: {
            page,
            limit,
            total: candidatures.length,
            totalPages: Math.ceil(candidatures.length / limit)
          }
        }
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchCandidaturesBySpecialite = useCallback(async (specialite: string, page = 1, limit = 10) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get<ApiResponseOk<ICandidature[]>>(
        `/candidatures/specialite/${specialite}?${params}`
      );
      const candidatures = response.data;
      
      dispatch({
        type: "FETCH_CANDIDATURES_SUCCESS",
        payload: {
          candidatures,
          pagination: {
            page,
            limit,
            total: candidatures.length,
            totalPages: Math.ceil(candidatures.length / limit)
          }
        }
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchCandidatureByEtudiantId = useCallback(async (etudiantId: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.get<ApiResponseOk<ICandidature>>(`/candidatures/etudiant/${etudiantId}`);
      const candidature = response.data;
      
      dispatch({ type: "SET_SELECTED_CANDIDATURE", payload: candidature });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const createCandidature = useCallback(async (data: ICandidatureFormRequest) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });
    console.log('Creating candidature with data:', data);
    try {
      const formDataToSend: FormData = data instanceof FormData ? data : toFormData(data as Record<string, any>);
      console.log('formdata to send');
      for (var pair of formDataToSend.entries()) {
        console.log(pair[0] + ", " + pair[1]);
      }
      
      // 5. Envoyer la requête
      const response = await api.post<ApiResponseOk<ICandidature>>('/candidatures', formDataToSend);
      const newCandidature = response.data;

      dispatch({ type: "ADD_CANDIDATURE", payload: newCandidature });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Candidature créée avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Candidature de ${newCandidature.prenom} ${newCandidature.nom} créée avec succès`
      });
      
      navigate('/candidatures');
    } catch (error: any) {
      // Handle validation errors
      if (error.response?.data?.errors) {
        dispatch({ type: "SET_ERRORS", payload: error.response.data.errors });
        dispatch({ type: "SET_MESSAGE", payload: error.response.data.message || "Erreur de validation" });
        dispatch({ type: "SET_ERROR_TYPE", payload: "validation" });
        return;
      }
      
      // Handle API errors
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [navigate, addToast]);

  const updateCandidature = useCallback(async (id: number, data: ICandidatureUpdateRequest) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.put<ApiResponseOk<ICandidature>>(`/candidatures/${id}`, data);
      const updatedCandidature = response.data;

      dispatch({ type: "UPDATE_CANDIDATURE", payload: updatedCandidature });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Candidature mise à jour avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Candidature ${updatedCandidature.reference || ''} mise à jour`
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [addToast]);

  const validerCandidature = useCallback(async (id: number, validation: ICandidatureValidation) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.put<ApiResponseOk<ICandidature>>(`/candidatures/${id}/valider`, validation);
      const updatedCandidature = response.data;

      dispatch({ type: "UPDATE_CANDIDATURE", payload: updatedCandidature });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Candidature validée avec succès" });
      console.log('Candidature validée:', updatedCandidature);
      const action = updatedCandidature.statut === 'VALIDE' ? 'acceptée' : 'rejetée';
      addToast({
        type: updatedCandidature.statut === 'VALIDE' ? 'success' : 'warning',
        title: 'Validation',
        message: `Candidature ${action} avec succès`
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [addToast]);

  const deleteCandidature = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const foundCandidature = state.candidatures.find(c => c.id === id);
      const nom_complet = foundCandidature ? `${foundCandidature.prenom} ${foundCandidature.nom}` : '';

      const response = await api.delete<ApiResponseOk<any>>(`/candidatures/${id}`);
      
      dispatch({ type: "DELETE_CANDIDATURE", payload: id });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Candidature supprimée avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Candidature de ${nom_complet} supprimée`
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [state.candidatures, addToast]);

  // ═══════════════════════ Statistiques et données associées ═══════════════════════

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<StatsData>>('/candidatures/stats');
      const stats = response.data;
      
      dispatch({ type: "SET_STATS", payload: stats });
      console.log('Stats candidatures:', stats);
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchSpecialites = useCallback(async () => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<ISpecialite[]>>('/specialites');
      const specialites = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      dispatch({ type: "SET_SPECIALITES", payload: specialites });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchFilieres = useCallback(async () => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<IFiliere[]>>('/filieres');
      const filieres = response.data.data || [];
      console.log('les filière récupérés: ', response)
      dispatch({ type: "SET_FILIERES", payload: filieres });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponseOk<{ hasActive: boolean }>>(`/candidatures/check-email/${email}`);
      return response.data.hasActive;
    } catch (error) {
      console.error('Erreur lors de la vérification email:', error);
      return false;
    }
  }, []);

  // ═══════════════════════ Helper Functions ═══════════════════════

  const setSelectedCandidature = useCallback((candidature: ICandidature | null) => {
    dispatch({ type: "SET_SELECTED_CANDIDATURE", payload: candidature });
  }, []);

  const setFilters = useCallback((filters: ICandidatureFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const applyFilters = useCallback(async () => {
    await fetchCandidatures(1);
  }, [fetchCandidatures]);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    fetchCandidatures(1);
  }, [fetchCandidatures]);

  const resetErrors = useCallback(() => {
    dispatch({ type: "RESET_ERRORS" });
  }, []);

  const setPagination = useCallback((pagination: Partial<PaginationState>) => {
    dispatch({ type: "SET_PAGINATION", payload: pagination });
  }, []);

  const setSortConfig = useCallback((config: SortConfig) => {
    dispatch({ type: "SET_SORT_CONFIG", payload: config });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  // ═══════════════════════ Context Value ═══════════════════════

  const contextValue = useMemo(
    () => ({
      state,
      actions: {
        // CRUD
        fetchCandidatures,
        fetchCandidatureById,
        fetchCandidaturesByEmail,
        fetchCandidaturesByStatut,
        fetchCandidaturesBySpecialite,
        fetchCandidatureByEtudiantId,
        createCandidature,
        updateCandidature,
        validerCandidature,
        deleteCandidature,
        
        // Statistiques et données associées
        fetchStats,
        fetchSpecialites,
        fetchFilieres,
        checkEmailExists,
        
        // Filtres et recherche
        setSelectedCandidature,
        setFilters,
        setSearchTerm,
        applyFilters,
        resetFilters,
        resetErrors,
        
        // Pagination et tri
        setPagination,
        setSortConfig,
        
        // Modals
        toggleModal,
      },
    }),
    [
      state,
      fetchCandidatures,
      fetchCandidatureById,
      fetchCandidaturesByEmail,
      fetchCandidaturesByStatut,
      fetchCandidaturesBySpecialite,
      fetchCandidatureByEtudiantId,
      createCandidature,
      updateCandidature,
      validerCandidature,
      deleteCandidature,
      fetchStats,
      fetchSpecialites,
      fetchFilieres,
      checkEmailExists,
      setSelectedCandidature,
      setFilters,
      setSearchTerm,
      applyFilters,
      resetFilters,
      resetErrors,
      setPagination,
      setSortConfig,
      toggleModal,
    ]
  );

  return (
    <CandidatureContext.Provider value={contextValue}>
      {children}
    </CandidatureContext.Provider>
  );
};

// ─────────────────────────── Hook ─────────────────────────────

export const useCandidatures = (): CandidatureContextType => {
  const context = useContext(CandidatureContext);

  if (!context) {
    throw new Error("useCandidatures doit être utilisé dans CandidatureProvider");
  }
  return context;
};