import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
// ─────────────────────────── Types ─────────────────────────────

// Unité d'Enseignement
export interface IUniteEnseignement {
  code: string;
  nom: string;
  description: string | null;
  credits_ects: number;
  volume_horaire: number;
  semestre: number;
  responsable_id: number | null;
  created_at: string;
  updated_at: string;
}

// Filière
export interface IFiliere {
  code: string;
  nom: string;
  description: string | null;
  niveau: string;
  duree: number;
  nombre_semestres: number;
  credits_total: number;
  responsable_id: number | null;
  created_at: string;
  updated_at: string;
}

// Groupe UE
export interface IGroupeUE {
  id: number;
  code: string;
  nom: string;
  ue_code: string;
  nombre_places: number;
  nombre_inscrits: number;
  enseignant_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface IAcademicResourcesFilters {
  niveau?: string;
  semestre?: number;
  responsable_id?: number;
  type?: 'UE' | 'FILIERE' | 'GROUPE';
}

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
  ueDetails: boolean;
  ueForm: boolean;
  ueDelete: boolean;
  filiereDetails: boolean;
  filiereForm: boolean;
  filiereDelete: boolean;
  groupeUeDetails: boolean;
  groupeUeForm: boolean;
  groupeUeDelete: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface AcademicResourcesState {
  // Unités d'Enseignement
  ues: IUniteEnseignement[];
  selectedUE: IUniteEnseignement | null;
  
  // Filières
  filieres: IFiliere[];
  selectedFiliere: IFiliere | null;
  
  // Groupes UE
  groupesUE: IGroupeUE[];
  selectedGroupeUE: IGroupeUE | null;
  
  // Filtres et recherche
  filters: IAcademicResourcesFilters;
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
  academicStats: {
    totalUEs: number;
    totalFilieres: number;
    totalGroupesUE: number;
    creditsTotal: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type AcademicResourcesAction =
  // UE Actions
  | { type: "FETCH_UES_SUCCESS"; payload: { ues: IUniteEnseignement[], pagination: PaginationState } }
  | { type: "SET_SELECTED_UE"; payload: IUniteEnseignement | null }
  | { type: "ADD_UE"; payload: IUniteEnseignement }
  | { type: "UPDATE_UE"; payload: IUniteEnseignement }
  | { type: "DELETE_UE"; payload: string }
  
  // Filière Actions
  | { type: "FETCH_FILIERES_SUCCESS"; payload: { filieres: IFiliere[], pagination: PaginationState } }
  | { type: "SET_SELECTED_FILIERE"; payload: IFiliere | null }
  | { type: "ADD_FILIERE"; payload: IFiliere }
  | { type: "UPDATE_FILIERE"; payload: IFiliere }
  | { type: "DELETE_FILIERE"; payload: string }
  
  // Groupe UE Actions
  | { type: "FETCH_GROUPES_UE_SUCCESS"; payload: { groupes: IGroupeUE[], pagination: PaginationState } }
  | { type: "SET_SELECTED_GROUPE_UE"; payload: IGroupeUE | null }
  | { type: "ADD_GROUPE_UE"; payload: IGroupeUE }
  | { type: "UPDATE_GROUPE_UE"; payload: IGroupeUE }
  | { type: "DELETE_GROUPE_UE"; payload: number }
  
  // Common Actions
  | { type: "SET_FILTERS"; payload: IAcademicResourcesFilters }
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
  | { type: "SET_ACADEMIC_STATS"; payload: any };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: AcademicResourcesState = {
  ues: [],
  selectedUE: null,
  filieres: [],
  selectedFiliere: null,
  groupesUE: [],
  selectedGroupeUE: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "nom", direction: "asc" },
  modals: {
    ueDetails: false,
    ueForm: false,
    ueDelete: false,
    filiereDetails: false,
    filiereForm: false,
    filiereDelete: false,
    groupeUeDetails: false,
    groupeUeForm: false,
    groupeUeDelete: false,
  },
  academicStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const academicResourcesReducer = (state: AcademicResourcesState, action: AcademicResourcesAction): AcademicResourcesState => {
  switch (action.type) {
    // UE
    case "FETCH_UES_SUCCESS":
      return {
        ...state,
        ues: action.payload.ues,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_UE":
      return { ...state, selectedUE: action.payload };
    case "ADD_UE":
      return {
        ...state,
        ues: [action.payload, ...state.ues],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_UE":
      return {
        ...state,
        ues: state.ues.map(u => u.code === action.payload.code ? action.payload : u),
      };
    case "DELETE_UE":
      return {
        ...state,
        ues: state.ues.filter(u => u.code !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    
    // Filière
    case "FETCH_FILIERES_SUCCESS":
      return {
        ...state,
        filieres: action.payload.filieres,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_FILIERE":
      return { ...state, selectedFiliere: action.payload };
    case "ADD_FILIERE":
      return {
        ...state,
        filieres: [action.payload, ...state.filieres],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_FILIERE":
      return {
        ...state,
        filieres: state.filieres.map(f => f.code === action.payload.code ? action.payload : f),
      };
    case "DELETE_FILIERE":
      return {
        ...state,
        filieres: state.filieres.filter(f => f.code !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    
    // Groupe UE
    case "FETCH_GROUPES_UE_SUCCESS":
      return {
        ...state,
        groupesUE: action.payload.groupes,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_GROUPE_UE":
      return { ...state, selectedGroupeUE: action.payload };
    case "ADD_GROUPE_UE":
      return {
        ...state,
        groupesUE: [action.payload, ...state.groupesUE],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_GROUPE_UE":
      return {
        ...state,
        groupesUE: state.groupesUE.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case "DELETE_GROUPE_UE":
      return {
        ...state,
        groupesUE: state.groupesUE.filter(g => g.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    
    // Common
    case "SET_FILTERS":
      return { ...state, filters: action.payload, pagination: { ...state.pagination, page: 1 } };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload, pagination: { ...state.pagination, page: 1 } };
    case "RESET_FILTERS":
      return { ...state, filters: {}, searchTerm: "", pagination: { ...state.pagination, page: 1 } };
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
      return { ...state, errors: {}, errorType: null, cause: undefined, message: undefined };
    case "SET_PAGINATION":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case "SET_SORT_CONFIG":
      return { ...state, sortConfig: action.payload };
    case "TOGGLE_MODAL":
      return {
        ...state,
        modals: { ...state.modals, [action.payload.modal]: action.payload.isOpen },
      };
    case "SET_ACADEMIC_STATS":
      return { ...state, academicStats: action.payload };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface IAcademicResourcesContext {
  state: AcademicResourcesState;
  actions: {
    dispatch: React.Dispatch<AcademicResourcesAction>;
    
    // UE
    fetchUEs: (page?: number, limit?: number) => Promise<void>;
    fetchUEByCode: (code: string) => Promise<void>;
    createUE: (data: Partial<IUniteEnseignement>) => Promise<void>;
    updateUE: (code: string, data: Partial<IUniteEnseignement>) => Promise<void>;
    deleteUE: (code: string) => Promise<void>;
    
    // Filière
    fetchFilieres: (page?: number, limit?: number) => Promise<void>;
    fetchFiliereByCode: (code: string) => Promise<void>;
    createFiliere: (data: Partial<IFiliere>) => Promise<void>;
    updateFiliere: (code: string, data: Partial<IFiliere>) => Promise<void>;
    deleteFiliere: (code: string) => Promise<void>;
    
    // Groupe UE
    fetchGroupesUE: (page?: number, limit?: number) => Promise<void>;
    fetchGroupeUEById: (id: number) => Promise<void>;
    createGroupeUE: (data: Partial<IGroupeUE>) => Promise<void>;
    updateGroupeUE: (id: number, data: Partial<IGroupeUE>) => Promise<void>;
    deleteGroupeUE: (id: number) => Promise<void>;
    
    // Common
    fetchAcademicStats: () => Promise<void>;
    setFilters: (filters: IAcademicResourcesFilters) => void;
    setSearchTerm: (term: string) => void;
    resetFilters: () => void;
    toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
  }
}

const AcademicResourcesContext = createContext<IAcademicResourcesContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const AcademicResourcesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(academicResourcesReducer, initialState);
    const { addToast } = useToast();

  
    const handleError = useCallback((error: any, message?: string) => {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
      addToast({ type: "error", title: "Erreur", message: message || "Une erreur est survenue" });
    }, [addToast]);

  // ========== UE Functions ==========
  const fetchUEs = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/unites-enseignement?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_UES_SUCCESS",
            payload: {
              ues: response.data.data || [],
              pagination: {
                page: response.data.pagination?.page || 1,
                limit: response.data.pagination?.limit || 10,
                total: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.totalPages || 0,
              },
            },
          });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors du chargement des UEs");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError]
  );

  const fetchUEByCode = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/unites-enseignement/${code}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_UE", payload: response.data.data });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la récupération");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError]
  );

  const createUE = useCallback(
    async (data: Partial<IUniteEnseignement>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/unites-enseignement", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "ADD_UE", payload: response.data.data });
          addToast({ type: "success", title: "Succès", message: "UE créée avec succès" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la création");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  const updateUE = useCallback(
    async (code: string, data: Partial<IUniteEnseignement>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.put(`/api/unites-enseignement/${code}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "UPDATE_UE", payload: response.data.data });
          addToast({ type: "success", title: "Succès", message: "UE mise à jour" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la mise à jour");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  const deleteUE = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/unites-enseignement/${code}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "DELETE_UE", payload: code });
          addToast({ type: "success", title: "Succès", message: "UE supprimée" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la suppression");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  // ========== Filière Functions ==========
  const fetchFilieres = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/filieres?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_FILIERES_SUCCESS",
            payload: {
              filieres: response.data.data || [],
              pagination: {
                page: response.data.pagination?.page || 1,
                limit: response.data.pagination?.limit || 10,
                total: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.totalPages || 0,
              },
            },
          });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors du chargement");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError]
  );

  const fetchFiliereByCode = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/filieres/${code}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_FILIERE", payload: response.data.data });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la récupération");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError]
  );

  const createFiliere = useCallback(
    async (data: Partial<IFiliere>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.post("/api/filieres", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "ADD_FILIERE", payload: response.data.data });
          addToast({ type: "success", title: "Succès", message: "Filière créée avec succès" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la création");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  const updateFiliere = useCallback(
    async (code: string, data: Partial<IFiliere>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.put(`/api/filieres/${code}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "UPDATE_FILIERE", payload: response.data.data });
          addToast({ type: "success", title: "Succès", message: "Filière mise à jour" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la mise à jour");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  const deleteFiliere = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/filieres/${code}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "DELETE_FILIERE", payload: code });
          addToast({ type: "success", title: "Succès", message: "Filière supprimée" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la suppression");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  // ========== Groupe UE Functions ==========
  const fetchGroupesUE = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/groupe-ue?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_GROUPES_UE_SUCCESS",
            payload: {
              groupes: response.data.data || [],
              pagination: {
                page: response.data.pagination?.page || 1,
                limit: response.data.pagination?.limit || 10,
                total: response.data.pagination?.total || 0,
                totalPages: response.data.pagination?.totalPages || 0,
              },
            },
          });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors du chargement");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError]
  );

  const fetchGroupeUEById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/groupe-ue/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_GROUPE_UE", payload: response.data.data });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la récupération");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError]
  );

  const createGroupeUE = useCallback(
    async (data: Partial<IGroupeUE>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.post("/api/groupe-ue", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "ADD_GROUPE_UE", payload: response.data.data });
          addToast({ type: "success", title: "Succès", message: "Groupe UE créé avec succès" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la création");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  const updateGroupeUE = useCallback(
    async (id: number, data: Partial<IGroupeUE>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.put(`/api/groupe-ue/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "UPDATE_GROUPE_UE", payload: response.data.data });
          addToast({ type: "success", title: "Succès", message: "Groupe UE mis à jour" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la mise à jour");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  const deleteGroupeUE = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/groupe-ue/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "DELETE_GROUPE_UE", payload: id });
          addToast({ type: "success", title: "Succès", message: "Groupe UE supprimé" });
        }
      } catch (error: any) {
        handleError(error, "Erreur lors de la suppression");
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [handleError, addToast]
  );

  // ========== Common Functions ==========
  const fetchAcademicStats = useCallback(
    async () => {
      try {
        const response = await api.get("/api/academic-resources/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_ACADEMIC_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: IAcademicResourcesFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: IAcademicResourcesContext = useMemo(
    () => ({
      state,
      actions: {
        dispatch,
        fetchUEs,
        fetchUEByCode,
        createUE,
        updateUE,
        deleteUE,
        fetchFilieres,
        fetchFiliereByCode,
        createFiliere,
        updateFiliere,
        deleteFiliere,
        fetchGroupesUE,
        fetchGroupeUEById,
        createGroupeUE,
        updateGroupeUE,
        deleteGroupeUE,
        fetchAcademicStats,
        setFilters,
        setSearchTerm,
        resetFilters,
        toggleModal,
      }
    }),
    [state, fetchUEs, fetchUEByCode, createUE, updateUE, deleteUE, fetchFilieres, fetchFiliereByCode, createFiliere, updateFiliere, deleteFiliere, fetchGroupesUE, fetchGroupeUEById, createGroupeUE, updateGroupeUE, deleteGroupeUE, fetchAcademicStats, setFilters, setSearchTerm, resetFilters, toggleModal]
  );

  return <AcademicResourcesContext.Provider value={value}>{children}</AcademicResourcesContext.Provider>;
};

export const useAcademicResources = () => {
  const context = useContext(AcademicResourcesContext);
  if (!context) {
    throw new Error("useAcademicResources must be used within AcademicResourcesProvider");
  }
  return context;
};


