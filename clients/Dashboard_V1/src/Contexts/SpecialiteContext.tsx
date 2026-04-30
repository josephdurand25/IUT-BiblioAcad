import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";
import type { ISpecialite } from "../types/ISpecialite";

// ─────────────────────────── Types ─────────────────────────────

export interface ISpecialiteFilters {
  niveau?: string;
  responsable_id?: number;
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
  specialiteDetails: boolean;
  specialiteForm: boolean;
  specialiteDelete: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface SpecialiteState {
  specialites: ISpecialite[];
  selectedSpecialite: ISpecialite | null;
  filters: ISpecialiteFilters;
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

export type SpecialiteAction =
  | { type: "FETCH_SPECIALITES_SUCCESS"; payload: { specialites: ISpecialite[], pagination: PaginationState } }
  | { type: "SET_SELECTED_SPECIALITE"; payload: ISpecialite | null }
  | { type: "SET_FILTERS"; payload: ISpecialiteFilters }
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
  | { type: "ADD_SPECIALITE"; payload: ISpecialite }
  | { type: "UPDATE_SPECIALITE"; payload: ISpecialite }
  | { type: "DELETE_SPECIALITE"; payload: string };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: SpecialiteState = {
  specialites: [],
  selectedSpecialite: null,
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
    specialiteDetails: false,
    specialiteForm: false,
    specialiteDelete: false,
  },
};

// ─────────────────────────── Reducer ─────────────────────────────

const specialiteReducer = (state: SpecialiteState, action: SpecialiteAction): SpecialiteState => {
  switch (action.type) {
    case "FETCH_SPECIALITES_SUCCESS":
      return {
        ...state,
        specialites: action.payload.specialites,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_SPECIALITE":
      return { ...state, selectedSpecialite: action.payload };
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
    case "ADD_SPECIALITE":
      return {
        ...state,
        specialites: [action.payload, ...state.specialites],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_SPECIALITE":
      return {
        ...state,
        specialites: state.specialites.map(s => s.code === action.payload.code ? action.payload : s),
      };
    case "DELETE_SPECIALITE":
      return {
        ...state,
        specialites: state.specialites.filter(s => s.code !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface ISpecialiteContext {
  state: SpecialiteState;
  dispatch: React.Dispatch<SpecialiteAction>;
  fetchSpecialites: (page?: number, limit?: number) => Promise<void>;
  fetchSpecialiteByCode: (code: string) => Promise<void>;
  createSpecialite: (data: Partial<ISpecialite>) => Promise<void>;
  updateSpecialite: (code: string, data: Partial<ISpecialite>) => Promise<void>;
  deleteSpecialite: (code: string) => Promise<void>;
  setFilters: (filters: ISpecialiteFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedSpecialite: (specialite: ISpecialite | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const SpecialiteContext = createContext<ISpecialiteContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const SpecialiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(specialiteReducer, initialState);
  const { addToast } = useToast();

  const fetchSpecialites = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/specialites?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_SPECIALITES_SUCCESS",
            payload: {
              specialites: response.data.data || [],
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

  const fetchSpecialiteByCode = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/specialites/${code}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_SPECIALITE", payload: response.data.data });
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

  const createSpecialite = useCallback(
    async (data: Partial<ISpecialite>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/specialites", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_SPECIALITE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Spécialité créée avec succès" });
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

  const updateSpecialite = useCallback(
    async (code: string, data: Partial<ISpecialite>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/specialites/${code}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_SPECIALITE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Spécialité mise à jour" });
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

  const deleteSpecialite = useCallback(
    async (code: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/specialites/${code}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_SPECIALITE", payload: code });
          addToast({ type: "success", title: "Succès", message: "Spécialité supprimée" });
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

  const setFilters = useCallback((filters: ISpecialiteFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedSpecialite = useCallback((specialite: ISpecialite | null) => {
    dispatch({ type: "SET_SELECTED_SPECIALITE", payload: specialite });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: ISpecialiteContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchSpecialites,
      fetchSpecialiteByCode,
      createSpecialite,
      updateSpecialite,
      deleteSpecialite,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedSpecialite,
      toggleModal,
    }),
    [state, fetchSpecialites, fetchSpecialiteByCode, createSpecialite, updateSpecialite, deleteSpecialite, setFilters, setSearchTerm, resetFilters, setSelectedSpecialite, toggleModal]
  );

  return <SpecialiteContext.Provider value={value}>{children}</SpecialiteContext.Provider>;
};

export const useSpecialite = () => {
  const context = useContext(SpecialiteContext);
  if (!context) {
    throw new Error("useSpecialite must be used within SpecialiteProvider");
  }
  return context;
};
