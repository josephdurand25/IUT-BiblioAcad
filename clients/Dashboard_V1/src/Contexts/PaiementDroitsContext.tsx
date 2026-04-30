import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface IPaiementDroits {
  id: number;
  etudiant_id: number;
  montant: number;
  type_paiement: string;
  statut: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  date_paiement: string | null;
  date_echeance: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IPaiementDroitsFilters {
  etudiant_id?: number;
  statut?: string;
  type_paiement?: string;
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
  paiementDetails: boolean;
  paiementForm: boolean;
  paiementDelete: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface PaiementDroitsState {
  paiements: IPaiementDroits[];
  selectedPaiement: IPaiementDroits | null;
  filters: IPaiementDroitsFilters;
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
}

// ─────────────────────────── Actions ─────────────────────────────

export type PaiementDroitsAction =
  | { type: "FETCH_PAIEMENTS_SUCCESS"; payload: { paiements: IPaiementDroits[], pagination: PaginationState } }
  | { type: "SET_SELECTED_PAIEMENT"; payload: IPaiementDroits | null }
  | { type: "SET_FILTERS"; payload: IPaiementDroitsFilters }
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
  | { type: "ADD_PAIEMENT"; payload: IPaiementDroits }
  | { type: "UPDATE_PAIEMENT"; payload: IPaiementDroits }
  | { type: "DELETE_PAIEMENT"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: PaiementDroitsState = {
  paiements: [],
  selectedPaiement: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "date_echeance", direction: "asc" },
  modals: {
    paiementDetails: false,
    paiementForm: false,
    paiementDelete: false,
  },
};

// ─────────────────────────── Reducer ─────────────────────────────

const paiementDroitsReducer = (state: PaiementDroitsState, action: PaiementDroitsAction): PaiementDroitsState => {
  switch (action.type) {
    case "FETCH_PAIEMENTS_SUCCESS":
      return {
        ...state,
        paiements: action.payload.paiements,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_PAIEMENT":
      return { ...state, selectedPaiement: action.payload };
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
    case "ADD_PAIEMENT":
      return {
        ...state,
        paiements: [action.payload, ...state.paiements],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_PAIEMENT":
      return {
        ...state,
        paiements: state.paiements.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case "DELETE_PAIEMENT":
      return {
        ...state,
        paiements: state.paiements.filter(p => p.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface IPaiementDroitsContext {
  state: PaiementDroitsState;
  dispatch: React.Dispatch<PaiementDroitsAction>;
  fetchPaiements: (page?: number, limit?: number) => Promise<void>;
  fetchPaiementById: (id: number) => Promise<void>;
  createPaiement: (data: Partial<IPaiementDroits>) => Promise<void>;
  updatePaiement: (id: number, data: Partial<IPaiementDroits>) => Promise<void>;
  deletePaiement: (id: number) => Promise<void>;
  setFilters: (filters: IPaiementDroitsFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedPaiement: (paiement: IPaiementDroits | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const PaiementDroitsContext = createContext<IPaiementDroitsContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const PaiementDroitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(paiementDroitsReducer, initialState);
  const { addToast } = useToast();

  const fetchPaiements = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/paiements-droits?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_PAIEMENTS_SUCCESS",
            payload: {
              paiements: response.data.data || [],
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

  const fetchPaiementById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/paiements-droits/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_PAIEMENT", payload: response.data.data });
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

  const createPaiement = useCallback(
    async (data: Partial<IPaiementDroits>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/paiements-droits", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_PAIEMENT", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Paiement créé avec succès" });
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

  const updatePaiement = useCallback(
    async (id: number, data: Partial<IPaiementDroits>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/paiements-droits/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_PAIEMENT", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Paiement mis à jour" });
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

  const deletePaiement = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/paiements-droits/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_PAIEMENT", payload: id });
          addToast({ type: "success", title: "Succès", message: "Paiement supprimé" });
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

  const setFilters = useCallback((filters: IPaiementDroitsFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedPaiement = useCallback((paiement: IPaiementDroits | null) => {
    dispatch({ type: "SET_SELECTED_PAIEMENT", payload: paiement });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: IPaiementDroitsContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchPaiements,
      fetchPaiementById,
      createPaiement,
      updatePaiement,
      deletePaiement,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedPaiement,
      toggleModal,
    }),
    [state, fetchPaiements, fetchPaiementById, createPaiement, updatePaiement, deletePaiement, setFilters, setSearchTerm, resetFilters, setSelectedPaiement, toggleModal]
  );

  return <PaiementDroitsContext.Provider value={value}>{children}</PaiementDroitsContext.Provider>;
};

export const usePaiementDroits = () => {
  const context = useContext(PaiementDroitsContext);
  if (!context) {
    throw new Error("usePaiementDroits must be used within PaiementDroitsProvider");
  }
  return context;
};
