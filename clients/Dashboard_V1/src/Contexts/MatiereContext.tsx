import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { 
  IMatiere, 
  IMatiereCreate, 
  IMatiereUpdate, 
  IMatiereWithDetails, 
  IMatiereStatistics, 
  IMatiereFilters 
} from "../types/IMatiere";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

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
  matiereDetails: boolean;
  matiereForm: boolean;
  matiereDelete: boolean;
  matiereSchedules: boolean;
  matiereStatistics: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface MatiereState {
  // Données principales
  matieres: IMatiere[];
  matieresWithDetails: IMatiereWithDetails[];
  selectedMatiere: IMatiereWithDetails | null;
  
  // Filtres et recherche
  filters: IMatiereFilters;
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
  statistics: IMatiereStatistics | null;
  
  // Données associées
  enseignantMatieres: Array<{
    enseignant_id: number;
    enseignant_nom: string;
    enseignant_prenom: string;
    matieres: IMatiereWithDetails[];
  }>;
}

// ─────────────────────────── Actions ─────────────────────────────

export type MatiereAction =
  | { type: "FETCH_MATIERES_SUCCESS"; payload: { matieres: IMatiere[], pagination: PaginationState } }
  | { type: "FETCH_MATIERES_WITH_DETAILS_SUCCESS"; payload: IMatiereWithDetails[] }
  | { type: "SET_SELECTED_MATIERE"; payload: IMatiereWithDetails | null }
  | { type: "SET_FILTERS"; payload: IMatiereFilters }
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
  | { type: "SET_STATISTICS"; payload: IMatiereStatistics }
  | { type: "SET_ENSEIGNANT_MATIERES"; payload: Array<{ enseignant_id: number; enseignant_nom: string; enseignant_prenom: string; matieres: IMatiereWithDetails[] }> }
  | { type: "ADD_MATIERE"; payload: IMatiere }
  | { type: "UPDATE_MATIERE"; payload: IMatiere }
  | { type: "DELETE_MATIERE"; payload: string };

// ─────────────────────────── Initial State ─────────────────────────────

export const initialMatiereState: MatiereState = {
  matieres: [],
  matieresWithDetails: [],
  selectedMatiere: null,
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
    field: 'nom',
    direction: 'asc'
  },
  modals: {
    matiereDetails: false,
    matiereForm: false,
    matiereDelete: false,
    matiereSchedules: false,
    matiereStatistics: false
  },
  statistics: null,
  enseignantMatieres: []
};

// ─────────────────────────── Reducer ─────────────────────────────

function matiereReducer(state: MatiereState, action: MatiereAction): MatiereState {
  switch (action.type) {
    case "FETCH_MATIERES_SUCCESS":
      return {
        ...state,
        matieres: action.payload.matieres,
        pagination: action.payload.pagination
      };

    case "FETCH_MATIERES_WITH_DETAILS_SUCCESS":
      return { ...state, matieresWithDetails: action.payload };

    case "SET_SELECTED_MATIERE":
      return { ...state, selectedMatiere: action.payload };

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

    case "SET_STATISTICS":
      return { ...state, statistics: action.payload };

    case "SET_ENSEIGNANT_MATIERES":
      return { ...state, enseignantMatieres: action.payload };

    case "ADD_MATIERE":
      return {
        ...state,
        matieres: [...state.matieres, action.payload],
        matieresWithDetails: [],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case "UPDATE_MATIERE":
      return {
        ...state,
        matieres: state.matieres.map(m =>
          m.code === action.payload.code ? action.payload : m
        ),
        matieresWithDetails: state.matieresWithDetails.map(md =>
          md.code === action.payload.code ? { ...md, ...action.payload } : md
        ),
        selectedMatiere: state.selectedMatiere?.code === action.payload.code 
          ? { ...state.selectedMatiere, ...action.payload }
          : state.selectedMatiere
      };

    case "DELETE_MATIERE":
      return {
        ...state,
        matieres: state.matieres.filter(m => m.code !== action.payload),
        matieresWithDetails: state.matieresWithDetails.filter(md => md.code !== action.payload),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        },
        selectedMatiere: state.selectedMatiere?.code === action.payload 
          ? null 
          : state.selectedMatiere
      };

    default:
      return state;
  }
}

// ─────────────────────────── Context ─────────────────────────────

interface MatiereContextType {
  state: MatiereState;
  actions: {
    // CRUD Operations
    fetchMatieres: (page?: number, limit?: number) => Promise<void>;
    fetchMatiereByCode: (code: string) => Promise<void>;
    createMatiere: (data: IMatiereCreate) => Promise<void>;
    updateMatiere: (code: string, data: IMatiereUpdate) => Promise<void>;
    deleteMatiere: (code: string) => Promise<void>;
    
    // Data Fetching
    fetchMatieresWithDetails: (filters?: IMatiereFilters) => Promise<void>;
    fetchMatiereStatistics: () => Promise<void>;
    fetchEnseignantMatieres: (enseignantId?: number) => Promise<void>;
    
    // Search and Filter
    setFilters: (filters: IMatiereFilters) => void;
    setSearchTerm: (term: string) => void;
    applyFilters: () => Promise<void>;
    resetFilters: () => void;
    searchMatieres: (criteria: any) => Promise<void>;
    
    // UI State Management
    setSelectedMatiere: (matiere: IMatiereWithDetails | null) => void;
    resetErrors: () => void;
    setPagination: (pagination: Partial<PaginationState>) => void;
    setSortConfig: (config: SortConfig) => void;
    toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
    
    // Export and Reports
    exportMatieres: (format: 'csv' | 'pdf' | 'excel', filters?: IMatiereFilters) => Promise<void>;
  };
}

const MatiereContext = createContext<MatiereContextType | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

interface MatiereProviderProps {
  children: ReactNode;
}

export const MatiereProvider: React.FC<MatiereProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(matiereReducer, initialMatiereState);
  const { addToast } = useToast();

  // ═══════════════════════ Helper Functions ═══════════════════════

  const handleError = useCallback((error: any) => {
    handleApiError(
      error,
      (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
      (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
      (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
      (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
    );
  }, []);

  const resetProcessing = useCallback(() => {
    dispatch({ type: "SET_PROCESSING", payload: false });
  }, []);

  const startProcessing = useCallback(() => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });
  }, []);

  // ═══════════════════════ CRUD Operations ═══════════════════════

  const fetchMatieres = useCallback(async (page = 1, limit = 7) => {
    startProcessing();
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      if (state.searchTerm) {
        params.append('search', state.searchTerm);
      }

      const response = await api.get<ApiResponseOk<IPaginationResult<IMatiere[]>>>(
        `/api/matieres?${params}`
      );
      console.log('response matiere',response);
      

      dispatch({
        type: "FETCH_MATIERES_SUCCESS",
        payload: {
          matieres: response.data.data,
          pagination: response.data.pagination
        }
      });

      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [state.filters, state.searchTerm, startProcessing, resetProcessing, handleError]);

  const fetchMatiereByCode = useCallback(async (code: string) => {
    startProcessing();

    try {
      const response = await api.get<ApiResponseOk<IMatiereWithDetails>>(`/api/matieres/${code}`);
      
      dispatch({ type: "SET_SELECTED_MATIERE", payload: response.data });
      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [startProcessing, resetProcessing, handleError]);

  const createMatiere = useCallback(async (data: IMatiereCreate) => {
    startProcessing();

    try {
      const response = await api.post<ApiResponseOk<IMatiere>>('/api/matieres', data);
      const newMatiere = response.data;

      dispatch({ type: "ADD_MATIERE", payload: newMatiere });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: "Matière créée avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Matière "${newMatiere.nom}" créée avec succès`
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [startProcessing, resetProcessing, handleError, addToast]);

  const updateMatiere = useCallback(async (code: string, data: IMatiereUpdate) => {
    startProcessing();

    try {
      const response = await api.put<ApiResponseOk<IMatiere>>(`/api/matieres/${code}`, data);
      const updatedMatiere = response.data;

      dispatch({ type: "UPDATE_MATIERE", payload: updatedMatiere });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: "Matière mise à jour avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Matière "${updatedMatiere.nom}" modifiée avec succès`
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [startProcessing, resetProcessing, handleError, addToast]);

  const deleteMatiere = useCallback(async (code: string) => {
    startProcessing();

    try {
      const foundMatiere = state.matieres.find(m => m.code === code);
      const matiereNom = foundMatiere?.nom || '';

      const response = await api.delete<ApiResponseOk<any>>(`/api/matieres/${code}`);
      
      dispatch({ type: "DELETE_MATIERE", payload: code });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: "Matière supprimée avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Matière "${matiereNom}" supprimée avec succès`
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [state.matieres, startProcessing, resetProcessing, handleError, addToast]);

  // ═══════════════════════ Data Fetching ═══════════════════════

  const fetchMatieresWithDetails = useCallback(async (filters?: IMatiereFilters) => {
    startProcessing();

    try {
      const params = new URLSearchParams();
      const currentFilters = filters || state.filters;
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const url = params.toString() 
        ? `/api/matieres/with-details?${params}`
        : '/api/matieres/with-details';

      const response = await api.get<ApiResponseOk<IMatiereWithDetails[]>>(url);
      
      dispatch({ type: "FETCH_MATIERES_WITH_DETAILS_SUCCESS", payload: response.data });
      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [state.filters, startProcessing, resetProcessing, handleError]);

  const fetchMatiereStatistics = useCallback(async () => {
    startProcessing();

    try {
      const response = await api.get<ApiResponseOk<IMatiereStatistics>>('/api/matieres/statistics');
      
      dispatch({ type: "SET_STATISTICS", payload: response.data });
      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [startProcessing, resetProcessing, handleError]);

  const fetchEnseignantMatieres = useCallback(async (enseignantId?: number) => {
    startProcessing();

    try {
      const url = enseignantId 
        ? `/api/matieres/enseignant/${enseignantId}`
        : '/api/matieres/enseignant';

      const response = await api.get<ApiResponseOk<Array<{
        enseignant_id: number;
        enseignant_nom: string;
        enseignant_prenom: string;
        matieres: IMatiereWithDetails[];
      }>>>(url);
      
      dispatch({ type: "SET_ENSEIGNANT_MATIERES", payload: response.data });
      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [startProcessing, resetProcessing, handleError]);

  // ═══════════════════════ Search and Filter ═══════════════════════

  const setFilters = useCallback((filters: IMatiereFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const applyFilters = useCallback(async () => {
    await fetchMatieres(1);
  }, [fetchMatieres]);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    fetchMatieres(1);
  }, [fetchMatieres]);

  const searchMatieres = useCallback(async (criteria: any) => {
    startProcessing();

    try {
      const response = await api.post<ApiResponseOk<IPaginationResult<IMatiere[]>>>(
        '/api/matieres/search/advanced',
        criteria
      );
      
      dispatch({
        type: "FETCH_MATIERES_SUCCESS",
        payload: {
          matieres: response.data.data,
          pagination: response.data.pagination
        }
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [state.pagination, startProcessing, resetProcessing, handleError]);

  // ═══════════════════════ UI State Management ═══════════════════════

  const setSelectedMatiere = useCallback((matiere: IMatiereWithDetails | null) => {
    dispatch({ type: "SET_SELECTED_MATIERE", payload: matiere });
  }, []);

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

  // ═══════════════════════ Export and Reports ═══════════════════════

  const exportMatieres = useCallback(async (format: 'csv' | 'pdf' | 'excel', filters?: IMatiereFilters) => {
    startProcessing();

    try {
      const params = new URLSearchParams({
        format,
        filters: JSON.stringify(filters || state.filters)
      });

      const response = await api.get(`/api/matieres/export?${params}`, {
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `matieres.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: `Export ${format} généré avec succès` });
      
      addToast({
        type: 'success',
        title: 'Export réussi',
        message: `Le fichier matieres.${format} a été téléchargé`
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      resetProcessing();
    }
  }, [state.filters, startProcessing, resetProcessing, handleError, addToast]);

  // ═══════════════════════ Context Value ═══════════════════════

  const contextValue = useMemo(
    () => ({
      state,
      actions: {
        fetchMatieres,
        fetchMatiereByCode,
        createMatiere,
        updateMatiere,
        deleteMatiere,
        fetchMatieresWithDetails,
        fetchMatiereStatistics,
        fetchEnseignantMatieres,
        setFilters,
        setSearchTerm,
        applyFilters,
        resetFilters,
        searchMatieres,
        setSelectedMatiere,
        resetErrors,
        setPagination,
        setSortConfig,
        toggleModal,
        exportMatieres,
      },
    }),
    [
      state,
      fetchMatieres,
      fetchMatiereByCode,
      createMatiere,
      updateMatiere,
      deleteMatiere,
      fetchMatieresWithDetails,
      fetchMatiereStatistics,
      fetchEnseignantMatieres,
      setFilters,
      setSearchTerm,
      applyFilters,
      resetFilters,
      searchMatieres,
      setSelectedMatiere,
      resetErrors,
      setPagination,
      setSortConfig,
      toggleModal,
      exportMatieres,
    ]
  );

  return (
    <MatiereContext.Provider value={contextValue}>
      {children}
    </MatiereContext.Provider>
  );
};

// ─────────────────────────── Hook ─────────────────────────────

export const useMatieres = (): MatiereContextType => {
  const context = useContext(MatiereContext);

  if (!context) {
    throw new Error("useMatieres doit être utilisé dans MatiereProvider");
  }
  return context;
};