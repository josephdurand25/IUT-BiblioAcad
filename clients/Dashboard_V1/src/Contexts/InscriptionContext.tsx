import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface IInscription {
  id: number;
  etudiant_id: number;
  cours_id: number;
  date_inscription: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETEE' | 'ANNULEE';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IInscriptionFilters {
  etudiant_id?: number;
  cours_id?: number;
  statut?: string;
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
  inscriptionDetails: boolean;
  inscriptionForm: boolean;
  inscriptionDelete: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface InscriptionState {
  // Données principales
  inscriptions: IInscription[];
  selectedInscription: IInscription | null;
  
  // Filtres et recherche
  filters: IInscriptionFilters;
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
}

// ─────────────────────────── Actions ─────────────────────────────

export type InscriptionAction =
  | { type: "FETCH_INSCRIPTIONS_SUCCESS"; payload: { inscriptions: IInscription[], pagination: PaginationState } }
  | { type: "SET_SELECTED_INSCRIPTION"; payload: IInscription | null }
  | { type: "SET_FILTERS"; payload: IInscriptionFilters }
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
  | { type: "ADD_INSCRIPTION"; payload: IInscription }
  | { type: "UPDATE_INSCRIPTION"; payload: IInscription }
  | { type: "DELETE_INSCRIPTION"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: InscriptionState = {
  inscriptions: [],
  selectedInscription: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "date_inscription", direction: "desc" },
  modals: {
    inscriptionDetails: false,
    inscriptionForm: false,
    inscriptionDelete: false,
  },
};

// ─────────────────────────── Reducer ─────────────────────────────

const inscriptionReducer = (state: InscriptionState, action: InscriptionAction): InscriptionState => {
  switch (action.type) {
    case "FETCH_INSCRIPTIONS_SUCCESS":
      return {
        ...state,
        inscriptions: action.payload.inscriptions,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_INSCRIPTION":
      return { ...state, selectedInscription: action.payload };
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
    case "ADD_INSCRIPTION":
      return {
        ...state,
        inscriptions: [action.payload, ...state.inscriptions],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_INSCRIPTION":
      return {
        ...state,
        inscriptions: state.inscriptions.map(i => i.id === action.payload.id ? action.payload : i),
      };
    case "DELETE_INSCRIPTION":
      return {
        ...state,
        inscriptions: state.inscriptions.filter(i => i.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface IInscriptionContext {
  state: InscriptionState;
  dispatch: React.Dispatch<InscriptionAction>;
  // Actions
  fetchInscriptions: (page?: number, limit?: number) => Promise<void>;
  fetchInscriptionById: (id: number) => Promise<void>;
  createInscription: (data: Partial<IInscription>) => Promise<void>;
  updateInscription: (id: number, data: Partial<IInscription>) => Promise<void>;
  deleteInscription: (id: number) => Promise<void>;
  setFilters: (filters: IInscriptionFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedInscription: (inscription: IInscription | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const InscriptionContext = createContext<IInscriptionContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const InscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inscriptionReducer, initialState);
  const { addToast } = useToast();

  // Fetch
  const fetchInscriptions = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/inscriptions?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_INSCRIPTIONS_SUCCESS",
            payload: {
              inscriptions: response.data.data || [],
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

  // Fetch by ID
  const fetchInscriptionById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/inscriptions/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_INSCRIPTION", payload: response.data.data });
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

  // Create
  const createInscription = useCallback(
    async (data: Partial<IInscription>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/inscriptions", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_INSCRIPTION", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          dispatch({ type: "SET_MESSAGE", payload: "Inscription créée avec succès" });
          addToast({ type: "success", title: "Succès", message: "Inscription créée avec succès" });
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

  // Update
  const updateInscription = useCallback(
    async (id: number, data: Partial<IInscription>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/inscriptions/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_INSCRIPTION", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          dispatch({ type: "SET_MESSAGE", payload: "Inscription mise à jour" });
          addToast({ type: "success", title: "Succès", message: "Inscription mise à jour" });
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

  // Delete
  const deleteInscription = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/inscriptions/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_INSCRIPTION", payload: id });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Inscription supprimée" });
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

  // Utilitaires
  const setFilters = useCallback((filters: IInscriptionFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedInscription = useCallback((inscription: IInscription | null) => {
    dispatch({ type: "SET_SELECTED_INSCRIPTION", payload: inscription });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: IInscriptionContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchInscriptions,
      fetchInscriptionById,
      createInscription,
      updateInscription,
      deleteInscription,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedInscription,
      toggleModal,
    }),
    [state, fetchInscriptions, fetchInscriptionById, createInscription, updateInscription, deleteInscription, setFilters, setSearchTerm, resetFilters, setSelectedInscription, toggleModal]
  );

  return <InscriptionContext.Provider value={value}>{children}</InscriptionContext.Provider>;
};

// ─────────────────────────── Hook ─────────────────────────────

export const useInscription = () => {
  const context = useContext(InscriptionContext);
  if (!context) {
    throw new Error("useInscription must be used within InscriptionProvider");
  }
  return context;
};
