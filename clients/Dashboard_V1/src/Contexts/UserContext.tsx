import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";
import { useToast } from "./TaostContainer";
import type { ApiResponseOk, IPaginationResult } from "../types/api";

// ─────────────────────────── Types ─────────────────────────────

export interface IUser {
  id: number;
  username: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: 'administrator' | 'teacher' | 'student' | 'user';
  statut: 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'BLOQUE';
  date_derniere_connexion: string | null;
  created_at: string;
  updated_at: string;
}

export interface IUserFilters {
  role?: string;
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
  userDetails: boolean;
  userForm: boolean;
  userDelete: boolean;
  changePassword: boolean;
}

// ─────────────────────────── State ─────────────────────────────

export interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  filters: IUserFilters;
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
  userStats: {
    totalUsers: number;
    administrateurs: number;
    enseignants: number;
    etudiants: number;
    utilisateurs: number;
    actifs: number;
    inactifs: number;
  } | null;
}

// ─────────────────────────── Actions ─────────────────────────────

export type UserAction =
  | { type: "FETCH_USERS_SUCCESS"; payload: { users: IUser[], pagination: PaginationState } }
  | { type: "SET_SELECTED_USER"; payload: IUser | null }
  | { type: "SET_FILTERS"; payload: IUserFilters }
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
  | { type: "SET_USER_STATS"; payload: any }
  | { type: "ADD_USER"; payload: IUser }
  | { type: "UPDATE_USER"; payload: IUser }
  | { type: "DELETE_USER"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

const initialState: UserState = {
  users: [],
  selectedUser: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  sortConfig: { field: "username", direction: "asc" },
  modals: {
    userDetails: false,
    userForm: false,
    userDelete: false,
    changePassword: false,
  },
  userStats: null,
};

// ─────────────────────────── Reducer ─────────────────────────────

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "FETCH_USERS_SUCCESS":
      return {
        ...state,
        users: action.payload.users,
        pagination: action.payload.pagination,
        processing: false,
        success: true,
      };
    case "SET_SELECTED_USER":
      return { ...state, selectedUser: action.payload };
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
    case "SET_USER_STATS":
      return { ...state, userStats: action.payload };
    case "ADD_USER":
      return {
        ...state,
        users: [action.payload, ...state.users],
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u),
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
        pagination: { ...state.pagination, total: state.pagination.total - 1 },
      };
    default:
      return state;
  }
};

// ─────────────────────────── Context ─────────────────────────────

interface IUserContext {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  createUser: (data: Partial<IUser> & { password: string }) => Promise<void>;
  updateUser: (id: number, data: Partial<IUser>) => Promise<void>;
  updateUserStatus: (id: number, statut: string) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  changePassword: (id: number, ancienMotDePasse: string, nouveauMotDePasse: string) => Promise<void>;
  fetchUserStats: () => Promise<void>;
  setFilters: (filters: IUserFilters) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  setSelectedUser: (user: IUser | null) => void;
  toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { addToast } = useToast();

  const fetchUsers = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/users?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({
            type: "FETCH_USERS_SUCCESS",
            payload: {
              users: response.data.data || [],
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

  const fetchUserById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.get(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data?.success) {
          dispatch({ type: "SET_SELECTED_USER", payload: response.data.data });
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

  const createUser = useCallback(
    async (data: Partial<IUser> & { password: string }) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.post("/api/users", data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "ADD_USER", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Utilisateur créé avec succès" });
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

  const updateUser = useCallback(
    async (id: number, data: Partial<IUser>) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/users/${id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "UPDATE_USER", payload: response.data.data });
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Utilisateur mis à jour" });
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

  const updateUserStatus = useCallback(
    async (id: number, statut: string) => {
      await updateUser(id, { statut: statut as any });
    },
    [updateUser]
  );

  const deleteUser = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      try {
        const response = await api.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "DELETE_USER", payload: id });
          addToast({ type: "success", title: "Succès", message: "Utilisateur supprimé" });
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

  const changePassword = useCallback(
    async (id: number, ancienMotDePasse: string, nouveauMotDePasse: string) => {
      dispatch({ type: "SET_PROCESSING", payload: true });
      dispatch({ type: "RESET_ERRORS" });
      try {
        const response = await api.put(`/api/users/${id}/change-password`, {
          ancienMotDePasse,
          nouveauMotDePasse,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_SUCCESS", payload: true });
          addToast({ type: "success", title: "Succès", message: "Mot de passe modifié avec succès" });
        }
      } catch (error: any) {
        handleApiError(
          error,
          (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
          (message) => dispatch({ type: "SET_MESSAGE", payload: message ?? undefined }),
          (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
          (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
        );
        addToast({ type: "error", title: "Erreur", message: "Erreur lors de la modification" });
      } finally {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [addToast]
  );

  const fetchUserStats = useCallback(
    async () => {
      try {
        const response = await api.get("/api/users/statistics", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data?.success) {
          dispatch({ type: "SET_USER_STATS", payload: response.data.data });
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des statistiques", error);
      }
    },
    []
  );

  const setFilters = useCallback((filters: IUserFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setSelectedUser = useCallback((user: IUser | null) => {
    dispatch({ type: "SET_SELECTED_USER", payload: user });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  const value: IUserContext = useMemo(
    () => ({
      state,
      dispatch,
      fetchUsers,
      fetchUserById,
      createUser,
      updateUser,
      updateUserStatus,
      deleteUser,
      changePassword,
      fetchUserStats,
      setFilters,
      setSearchTerm,
      resetFilters,
      setSelectedUser,
      toggleModal,
    }),
    [state, fetchUsers, fetchUserById, createUser, updateUser, updateUserStatus, deleteUser, changePassword, fetchUserStats, setFilters, setSearchTerm, resetFilters, setSelectedUser, toggleModal]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
