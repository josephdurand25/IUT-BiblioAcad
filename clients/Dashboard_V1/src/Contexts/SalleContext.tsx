import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface ISalle {
  id: number;
  numero: string;
  capacite: number;
  type_salle: 'CLASSE' | 'LABO' | 'AMPHI' | 'SEMINAR' | 'AUTRE';
  localisation: string;
  equipements: string | null;
  statut: 'DISPONIBLE' | 'INDISPONIBLE' | 'MAINTENANCE';
  created_at: string;
  updated_at: string;
}

export interface ISalleFilters {
  type_salle?: string;
  statut?: string;
  capacite_min?: number;
  capacite_max?: number;
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
  salleDetails: boolean;
  salleForm: boolean;
  salleDelete: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface SalleState {
  salles: ISalle[];
  selectedSalle: ISalle | null;
  filters: ISalleFilters;
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
  salleStats: {
    totalSalles: number;
    disponibles: number;
    indisponibles: number;
    maintenance: number;
    capaciteTotal: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type SalleAction =
  | { type: "FETCH_SALLES_SUCCESS"; payload: { salles: ISalle[], pagination: PaginationState } }
  | { type: "SET_SELECTED_SALLE"; payload: ISalle | null }
  | { type: "SET_FILTERS"; payload: ISalleFilters }
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
  | { type: "SET_SALLE_STATS"; payload: any }
  | { type: "ADD_SALLE"; payload: ISalle }
  | { type: "UPDATE_SALLE"; payload: ISalle }
  | { type: "DELETE_SALLE"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: SalleState = {
  salles: [],
  selectedSalle: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "numero", direction: "asc" },
  modals: {
    salleDetails: false,
    salleForm: false,
    salleDelete: false,
  },
  salleStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const salleReducer = (state: SalleState, action: SalleAction): SalleState => {
  switch (action.type) {
    case "FETCH_SALLES_SUCCESS":
      return {
        ...state,
        salles: action.payload.salles,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_SALLE":
      return { ...state, selectedSalle: action.payload };
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
    case "SET_SALLE_STATS":
      return { ...state, salleStats: action.payload };
    case "ADD_SALLE":
      return {
        ...state,
        salles: [action.payload, ...state.salles],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_SALLE":
      return {
        ...state,
        salles: state.salles.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case "DELETE_SALLE":
      return {
        ...state,
        salles: state.salles.filter(s => s.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface ISalleContext {
  state: SalleState;
  dispatch: React.Dispatch<SalleAction>;
  fetchSalles: (page?: number, limit?: number) => Promise<void>;
  fetchSalleById: (id: number) => Promise<void>;
  createSalle: (data: Partial<ISalle>) => Promise<void>;
  updateSalle: (id: number, data: Partial<ISalle>) => Promise<void>;
  deleteSalle: (id: number) => Promise<void>;
  fetchSalleStats: () => Promise<void>;
  setFilters: (filters: ISalleFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedSalle: (salle: ISalle | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const SalleContext = createContext<ISalleContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const SalleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(salleReducer, initialState);
  const { addToast } = useToast();

  const fetchSalles = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/salles?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_SALLES_SUCCESS",
            payload: {
              salles: response.data.data || [],
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

  const fetchSalleById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/salles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_SALLE", payload: response.data.data });
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

  const createSalle = useCallback(
    async (data: Partial<ISalle>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/salles", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_SALLE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Salle créée avec succès" });
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

  const updateSalle = useCallback(
    async (id: number, data: Partial<ISalle>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/salles/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_SALLE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Salle mise à jour" });
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

  const deleteSalle = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/salles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_SALLE", payload: id });
          addToast({ type: "success", title: "Succès", message: "Salle supprimée" });
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

  const fetchSalleStats = useCallback(
    async () => {
      try {
        const response = await api.get("/api/salles/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_SALLE_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: ISalleFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedSalle = useCallback((salle: ISalle | null) => {
    dispatch({ type: "SET_SELECTED_SALLE", payload: salle });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: ISalleContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchSalles,
      fetchSalleById,
      createSalle,
      updateSalle,
      deleteSalle,
      fetchSalleStats,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedSalle,
      toggleModal,
    }),
    [state, fetchSalles, fetchSalleById, createSalle, updateSalle, deleteSalle, fetchSalleStats, setFilters, setSearchTerm, resetFilters, setSelectedSalle, toggleModal]
  );

  return <SalleContext.Provider value={value}>{children}</SalleContext.Provider>;
};

export const useSalle = () => {
  const context = useContext(SalleContext);
  if (!context) {
    throw new Error("useSalle must be used within SalleProvider");
  }
  return context;
};
