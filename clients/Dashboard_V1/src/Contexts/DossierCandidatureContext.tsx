import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface IDossierCandidature {
  id: number;
  candidat_nom: string;
  candidat_prenom: string;
  candidat_email: string;
  candidat_telephone: string;
  date_dossier: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'EN_REVISION';
  specialite_demandee: string;
  niveau_demande: string;
  documents: string | null;
  date_decision: string | null;
  raison_rejet: string | null;
  created_at: string;
  updated_at: string;
}

export interface IDossierCandidatureFilters {
  statut?: string;
  specialite_demandee?: string;
  niveau_demande?: string;
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
  dossierDetails: boolean;
  dossierForm: boolean;
  dossierDelete: boolean;
  dossierDecision: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface DossierCandidatureState {
  dossiers: IDossierCandidature[];
  selectedDossier: IDossierCandidature | null;
  filters: IDossierCandidatureFilters;
  searchTerm: string;
  processing: boolean;
  success: boolean;
  message: string | undefined;
  errors: Record<string, string>;
  errorType: string | null;
  cause: string | undefined;
  pagination: PaginationState;
  sortConfig: SortConfig;
  modals: ModalStates;
  // Statistiques
  dossierStats: {
    totalDossiers: number;
    enAttente: number;
    approuves: number;
    rejetes: number;
    enRevision: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type DossierCandidatureAction =
  | { type: "FETCH_DOSSIERS_SUCCESS"; payload: { dossiers: IDossierCandidature[], pagination: PaginationState } }
  | { type: "SET_SELECTED_DOSSIER"; payload: IDossierCandidature | null }
  | { type: "SET_FILTERS"; payload: IDossierCandidatureFilters }
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
  | { type: "SET_DOSSIER_STATS"; payload: any }
  | { type: "ADD_DOSSIER"; payload: IDossierCandidature }
  | { type: "UPDATE_DOSSIER"; payload: IDossierCandidature }
  | { type: "DELETE_DOSSIER"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: DossierCandidatureState = {
  dossiers: [],
  selectedDossier: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "date_dossier", direction: "desc" },
  modals: {
    dossierDetails: false,
    dossierForm: false,
    dossierDelete: false,
    dossierDecision: false,
  },
  dossierStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const dossierCandidatureReducer = (state: DossierCandidatureState, action: DossierCandidatureAction): DossierCandidatureState => {
  switch (action.type) {
    case "FETCH_DOSSIERS_SUCCESS":
      return {
        ...state,
        dossiers: action.payload.dossiers,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_DOSSIER":
      return { ...state, selectedDossier: action.payload };
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
    case "SET_DOSSIER_STATS":
      return { ...state, dossierStats: action.payload };
    case "ADD_DOSSIER":
      return {
        ...state,
        dossiers: [action.payload, ...state.dossiers],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_DOSSIER":
      return {
        ...state,
        dossiers: state.dossiers.map(d => d.id === action.payload.id ? action.payload : d),
      };
    case "DELETE_DOSSIER":
      return {
        ...state,
        dossiers: state.dossiers.filter(d => d.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface IDossierCandidatureContext {
  state: DossierCandidatureState;
  dispatch: React.Dispatch<DossierCandidatureAction>;
  fetchDossiers: (page?: number, limit?: number) => Promise<void>;
  fetchDossierById: (id: number) => Promise<void>;
  createDossier: (data: Partial<IDossierCandidature>) => Promise<void>;
  updateDossier: (id: number, data: Partial<IDossierCandidature>) => Promise<void>;
  deleteDossier: (id: number) => Promise<void>;
  approuveDossier: (id: number) => Promise<void>;
  rejectDossier: (id: number, raison: string) => Promise<void>;
  fetchDossierStats: () => Promise<void>;
  setFilters: (filters: IDossierCandidatureFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedDossier: (dossier: IDossierCandidature | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const DossierCandidatureContext = createContext<IDossierCandidatureContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const DossierCandidatureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dossierCandidatureReducer, initialState);
  const { addToast } = useToast();

  const fetchDossiers = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/dossiers-candidature?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_DOSSIERS_SUCCESS",
            payload: {
              dossiers: response.data.data || [],
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
        handleApiError(
          error,
          (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
          (message) => dispatch({ type: "SET_MESSAGE", payload: message ?? undefined }),
          (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
          (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
        );
        addToast({ type: "error", title: "Erreur", message: "Erreur lors du chargement" });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [addToast]
  );

  const fetchDossierById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/dossiers-candidature/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_DOSSIER", payload: response.data.data });
        }
      } catch (error: any) {
        handleApiError(
          error,
          (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
          (message) => dispatch({ type: "SET_MESSAGE", payload: message ?? undefined }),
          (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
          (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
        );
        addToast({ type: "error", title: "Erreur", message: "Erreur lors de la récupération" });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [addToast]
  );

  const createDossier = useCallback(
    async (data: Partial<IDossierCandidature>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/dossiers-candidature", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_DOSSIER", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Dossier créé avec succès" });
        }
      } catch (error: any) {
        handleApiError(
          error,
          (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
          (message) => dispatch({ type: "SET_MESSAGE", payload: message ?? undefined }),
          (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
          (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
        );
        addToast({ type: "error", title: "Erreur", message: "Erreur lors de la création" });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [addToast]
  );

  const updateDossier = useCallback(
    async (id: number, data: Partial<IDossierCandidature>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/dossiers-candidature/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_DOSSIER", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Dossier mis à jour" });
        }
      } catch (error: any) {
        handleApiError(
          error,
          (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
          (message) => dispatch({ type: "SET_MESSAGE", payload: message ?? undefined }),
          (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
          (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
        );
        addToast({ type: "error", title: "Erreur", message: "Erreur lors de la mise à jour" });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [addToast]
  );

  const deleteDossier = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/dossiers-candidature/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_DOSSIER", payload: id });
          addToast({ type: "success", title: "Succès", message: "Dossier supprimé" });
        }
      } catch (error: any) {
        handleApiError(
          error,
          (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
          (message) => dispatch({ type: "SET_MESSAGE", payload: message ?? undefined }),
          (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
          (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
        );
        addToast({ type: "error", title: "Erreur", message: "Erreur lors de la suppression" });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [addToast]
  );

  const approuveDossier = useCallback(
    async (id: number) => {
      await updateDossier(id, { statut: 'APPROUVE' as any });
    },
    [updateDossier]
  );

  const rejectDossier = useCallback(
    async (id: number, raison: string) => {
      await updateDossier(id, { statut: 'REJETE' as any, raison_rejet: raison });
    },
    [updateDossier]
  );

  const fetchDossierStats = useCallback(
    async () => {
      try {
        const response = await api.get("/dossiers-candidature/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_DOSSIER_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: IDossierCandidatureFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedDossier = useCallback((dossier: IDossierCandidature | null) => {
    dispatch({ type: "SET_SELECTED_DOSSIER", payload: dossier });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: IDossierCandidatureContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchDossiers,
      fetchDossierById,
      createDossier,
      updateDossier,
      deleteDossier,
      approuveDossier,
      rejectDossier,
      fetchDossierStats,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedDossier,
      toggleModal,
    }),
    [state, fetchDossiers, fetchDossierById, createDossier, updateDossier, deleteDossier, approuveDossier, rejectDossier, fetchDossierStats, setFilters, setSearchTerm, resetFilters, setSelectedDossier, toggleModal]
  );

  return <DossierCandidatureContext.Provider value={value}>{children}</DossierCandidatureContext.Provider>;
};

export const useDossierCandidature = () => {
  const context = useContext(DossierCandidatureContext);
  if (!context) {
    throw new Error("useDossierCandidature must be used within DossierCandidatureProvider");
  }
  return context;
};
