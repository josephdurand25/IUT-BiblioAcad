import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface INote {
  id: number;
  etudiant_id: number;
  matiere_code: string;
  note: number;
  appreciation: string | null;
  date_evaluation: string;
  type_evaluation: 'EXAMEN' | 'CONTROLE' | 'TP' | 'PROJET' | 'AUTRE';
  created_at: string;
  updated_at: string;
}

export interface INoteFilters {
  etudiant_id?: number;
  matiere_code?: string;
  type_evaluation?: string;
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
  noteDetails: boolean;
  noteForm: boolean;
  noteDelete: boolean;
  notesImport: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface NoteState {
  notes: INote[];
  selectedNote: INote | null;
  filters: INoteFilters;
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
  noteStats: {
    totalNotes: number;
    moyenneGenerale: number;
    noteMax: number;
    noteMin: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type NoteAction =
  | { type: "FETCH_NOTES_SUCCESS"; payload: { notes: INote[], pagination: PaginationState } }
  | { type: "SET_SELECTED_NOTE"; payload: INote | null }
  | { type: "SET_FILTERS"; payload: INoteFilters }
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
  | { type: "SET_NOTE_STATS"; payload: any }
  | { type: "ADD_NOTE"; payload: INote }
  | { type: "UPDATE_NOTE"; payload: INote }
  | { type: "DELETE_NOTE"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: NoteState = {
  notes: [],
  selectedNote: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "date_evaluation", direction: "desc" },
  modals: {
    noteDetails: false,
    noteForm: false,
    noteDelete: false,
    notesImport: false,
  },
  noteStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const noteReducer = (state: NoteState, action: NoteAction): NoteState => {
  switch (action.type) {
    case "FETCH_NOTES_SUCCESS":
      return {
        ...state,
        notes: action.payload.notes,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_NOTE":
      return { ...state, selectedNote: action.payload };
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
    case "SET_NOTE_STATS":
      return { ...state, noteStats: action.payload };
    case "ADD_NOTE":
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface INoteContext {
  state: NoteState;
  dispatch: React.Dispatch<NoteAction>;
  fetchNotes: (page?: number, limit?: number) => Promise<void>;
  fetchNoteById: (id: number) => Promise<void>;
  createNote: (data: Partial<INote>) => Promise<void>;
  updateNote: (id: number, data: Partial<INote>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  fetchNoteStats: () => Promise<void>;
  setFilters: (filters: INoteFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedNote: (note: INote | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const NoteContext = createContext<INoteContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const NoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(noteReducer, initialState);
  const { addToast } = useToast();

  const fetchNotes = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/notes?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_NOTES_SUCCESS",
            payload: {
              notes: response.data.data || [],
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

  const fetchNoteById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_NOTE", payload: response.data.data });
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

  const createNote = useCallback(
    async (data: Partial<INote>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/notes", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_NOTE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Note créée avec succès" });
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

  const updateNote = useCallback(
    async (id: number, data: Partial<INote>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/notes/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_NOTE", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Note mise à jour" });
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

  const deleteNote = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_NOTE", payload: id });
          addToast({ type: "success", title: "Succès", message: "Note supprimée" });
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

  const fetchNoteStats = useCallback(
    async () => {
      try {
        const response = await api.get("/api/notes/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_NOTE_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: INoteFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedNote = useCallback((note: INote | null) => {
    dispatch({ type: "SET_SELECTED_NOTE", payload: note });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: INoteContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchNotes,
      fetchNoteById,
      createNote,
      updateNote,
      deleteNote,
      fetchNoteStats,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedNote,
      toggleModal,
    }),
    [state, fetchNotes, fetchNoteById, createNote, updateNote, deleteNote, fetchNoteStats, setFilters, setSearchTerm, resetFilters, setSelectedNote, toggleModal]
  );

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

export const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within NoteProvider");
  }
  return context;
};
