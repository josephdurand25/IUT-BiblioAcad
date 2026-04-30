import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface ISessionExamen {
  id: number;
  nom: string;
  date_debut: string;
  date_fin: string;
  duree_examen: number;
  statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINER' | 'ANNULEE';
  description: string | null;
  lieu: string | null;
  superviseur_id: number | null;
  nombre_candidats: number;
  created_at: string;
  updated_at: string;
}

export interface ISessionExamenFilters {
  statut?: string;
  superviseur_id?: number;
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
  sessionDetails: boolean;
  sessionForm: boolean;
  sessionDelete: boolean;
  sessionCandidats: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface SessionExamenState {
  sessions: ISessionExamen[];
  selectedSession: ISessionExamen | null;
  filters: ISessionExamenFilters;
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
  sessionStats: {
    totalSessions: number;
    planifiees: number;
    enCours: number;
    terminees: number;
    annulees: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type SessionExamenAction =
  | { type: "FETCH_SESSIONS_SUCCESS"; payload: { sessions: ISessionExamen[], pagination: PaginationState } }
  | { type: "SET_SELECTED_SESSION"; payload: ISessionExamen | null }
  | { type: "SET_FILTERS"; payload: ISessionExamenFilters }
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
  | { type: "SET_SESSION_STATS"; payload: any }
  | { type: "ADD_SESSION"; payload: ISessionExamen }
  | { type: "UPDATE_SESSION"; payload: ISessionExamen }
  | { type: "DELETE_SESSION"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: SessionExamenState = {
  sessions: [],
  selectedSession: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "date_debut", direction: "desc" },
  modals: {
    sessionDetails: false,
    sessionForm: false,
    sessionDelete: false,
    sessionCandidats: false,
  },
  sessionStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const sessionExamenReducer = (state: SessionExamenState, action: SessionExamenAction): SessionExamenState => {
  switch (action.type) {
    case "FETCH_SESSIONS_SUCCESS":
      return {
        ...state,
        sessions: action.payload.sessions,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_SESSION":
      return { ...state, selectedSession: action.payload };
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
    case "SET_SESSION_STATS":
      return { ...state, sessionStats: action.payload };
    case "ADD_SESSION":
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case "DELETE_SESSION":
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface ISessionExamenContext {
  state: SessionExamenState;
  dispatch: React.Dispatch<SessionExamenAction>;
  fetchSessions: (page?: number, limit?: number) => Promise<void>;
  fetchSessionById: (id: number) => Promise<void>;
  createSession: (data: Partial<ISessionExamen>) => Promise<void>;
  updateSession: (id: number, data: Partial<ISessionExamen>) => Promise<void>;
  deleteSession: (id: number) => Promise<void>;
  fetchSessionStats: () => Promise<void>;
  setFilters: (filters: ISessionExamenFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedSession: (session: ISessionExamen | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const SessionExamenContext = createContext<ISessionExamenContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const SessionExamenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sessionExamenReducer, initialState);
  const { addToast } = useToast();

  const fetchSessions = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/sessions-examen?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_SESSIONS_SUCCESS",
            payload: {
              sessions: response.data.data || [],
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

  const fetchSessionById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/sessions-examen/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_SESSION", payload: response.data.data });
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

  const createSession = useCallback(
    async (data: Partial<ISessionExamen>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/sessions-examen", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_SESSION", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Session créée avec succès" });
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

  const updateSession = useCallback(
    async (id: number, data: Partial<ISessionExamen>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/sessions-examen/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_SESSION", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Session mise à jour" });
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

  const deleteSession = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/sessions-examen/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_SESSION", payload: id });
          addToast({ type: "success", title: "Succès", message: "Session supprimée" });
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

  const fetchSessionStats = useCallback(
    async () => {
      try {
        const response = await api.get("/api/sessions-examen/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_SESSION_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: ISessionExamenFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedSession = useCallback((session: ISessionExamen | null) => {
    dispatch({ type: "SET_SELECTED_SESSION", payload: session });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: ISessionExamenContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchSessions,
      fetchSessionById,
      createSession,
      updateSession,
      deleteSession,
      fetchSessionStats,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedSession,
      toggleModal,
    }),
    [state, fetchSessions, fetchSessionById, createSession, updateSession, deleteSession, fetchSessionStats, setFilters, setSearchTerm, resetFilters, setSelectedSession, toggleModal]
  );

  return <SessionExamenContext.Provider value={value}>{children}</SessionExamenContext.Provider>;
};

export const useSessionExamen = () => {
  const context = useContext(SessionExamenContext);
  if (!context) {
    throw new Error("useSessionExamen must be used within SessionExamenProvider");
  }
  return context;
};
