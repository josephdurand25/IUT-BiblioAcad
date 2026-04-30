import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface IPresence {
  id: number;
  etudiant_id: number;
  cours_id: number;
  date_presence: string;
  statut: 'PRESENT' | 'ABSENT' | 'JUSTIFIE' | 'RETARD';
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface IPresenceFilters {
  etudiant_id?: number;
  cours_id?: number;
  statut?: string;
  date_debut?: string;
  date_fin?: string;
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
  presenceDetails: boolean;
  presenceForm: boolean;
  presenceDelete: boolean;
  importPresence: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface PresenceState {
  presences: IPresence[];
  selectedPresence: IPresence | null;
  filters: IPresenceFilters;
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
  presenceStats: {
    totalSessions: number;
    presents: number;
    absents: number;
    justifies: number;
    retards: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type PresenceAction =
  | { type: "FETCH_PRESENCES_SUCCESS"; payload: { presences: IPresence[], pagination: PaginationState } }
  | { type: "SET_SELECTED_PRESENCE"; payload: IPresence | null }
  | { type: "SET_FILTERS"; payload: IPresenceFilters }
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
  | { type: "SET_PRESENCE_STATS"; payload: any }
  | { type: "ADD_PRESENCE"; payload: IPresence }
  | { type: "UPDATE_PRESENCE"; payload: IPresence }
  | { type: "DELETE_PRESENCE"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: PresenceState = {
  presences: [],
  selectedPresence: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "date_presence", direction: "desc" },
  modals: {
    presenceDetails: false,
    presenceForm: false,
    presenceDelete: false,
    importPresence: false,
  },
  presenceStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const presenceReducer = (state: PresenceState, action: PresenceAction): PresenceState => {
  switch (action.type) {
    case "FETCH_PRESENCES_SUCCESS":
      return {
        ...state,
        presences: action.payload.presences,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_PRESENCE":
      return { ...state, selectedPresence: action.payload };
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
    case "SET_PRESENCE_STATS":
      return { ...state, presenceStats: action.payload };
    case "ADD_PRESENCE":
      return {
        ...state,
        presences: [action.payload, ...state.presences],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_PRESENCE":
      return {
        ...state,
        presences: state.presences.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case "DELETE_PRESENCE":
      return {
        ...state,
        presences: state.presences.filter(p => p.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface IPresenceContext {
  state: PresenceState;
  dispatch: React.Dispatch<PresenceAction>;
  fetchPresences: (page?: number, limit?: number) => Promise<void>;
  fetchPresenceById: (id: number) => Promise<void>;
  createPresence: (data: Partial<IPresence>) => Promise<void>;
  updatePresence: (id: number, data: Partial<IPresence>) => Promise<void>;
  deletePresence: (id: number) => Promise<void>;
  fetchPresenceStats: () => Promise<void>;
  setFilters: (filters: IPresenceFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedPresence: (presence: IPresence | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const PresenceContext = createContext<IPresenceContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const PresenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(presenceReducer, initialState);
  const { addToast } = useToast();

  const fetchPresences = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/presences?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_PRESENCES_SUCCESS",
            payload: {
              presences: response.data.data || [],
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

  const fetchPresenceById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/presences/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_PRESENCE", payload: response.data.data });
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

  const createPresence = useCallback(
    async (data: Partial<IPresence>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/presences", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_PRESENCE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Présence enregistrée" });
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

  const updatePresence = useCallback(
    async (id: number, data: Partial<IPresence>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/presences/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_PRESENCE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Présence mise à jour" });
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

  const deletePresence = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/presences/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_PRESENCE", payload: id });
          addToast({ type: "success", title: "Succès", message: "Présence supprimée" });
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

  const fetchPresenceStats = useCallback(
    async () => {
      try {
        const response = await api.get("/api/presences/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_PRESENCE_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: IPresenceFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedPresence = useCallback((presence: IPresence | null) => {
    dispatch({ type: "SET_SELECTED_PRESENCE", payload: presence });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: IPresenceContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchPresences,
      fetchPresenceById,
      createPresence,
      updatePresence,
      deletePresence,
      fetchPresenceStats,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedPresence,
      toggleModal,
    }),
    [state, fetchPresences, fetchPresenceById, createPresence, updatePresence, deletePresence, fetchPresenceStats, setFilters, setSearchTerm, resetFilters, setSelectedPresence, toggleModal]
  );

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresence must be used within PresenceProvider");
  }
  return context;
};
