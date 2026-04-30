import React, { createContext, useCallback, useContext, useReducer, useMemo, type ReactNode, useEffect } from "react";
import { handleApiError } from "../ConfigApp/errorHandle";
import api from "../ConfigApp/apiConfigCommunication";

import { useNavigate } from "react-router";
import { useToast } from "./TaostContainer";
import type { IEtudiant, IEtudiantCours, IEtudiantFilters, IEtudiantFormRequest, IEtudiantMoyenne, IEtudiantNote, IEtudiantUpdateRequest } from "../types/IStudent";
import type { StatutAcademique } from "../types/IGeneral";
import type { ApiResponseOk, IPaginationResult } from "../types/api";
import type { IFiliere } from "../types/IFiliere";
import type { ISpecialite } from "../types/ISpecialite";
import type { PaginationState, SortConfig } from "../types/generalTypes";

// ─────────────────────────── Types ─────────────────────────────

export interface ModalStates {
  studentDetails: boolean;
  studentForm: boolean;
  studentDelete: boolean;
  studentNotes: boolean;
  studentCourses: boolean;
}

export interface StatsData {
  total: number;
  inscrits: number;         // Aligné avec IEtudiantStatistics
  non_inscrits: number;
  diplomes: number;
  abandons: number;
  exclus: number;
  parFiliere: Array<{
    filiere: string;
    total: number;
    inscrits: number;      // Aligné avec IEtudiantStatistics
    diplomes: number;
    abandons: number;
    age_moyen: number;
  }>;
}

// ─────────────────────────── State ─────────────────────────────

export interface StudentState {
  // Données principales
  students: IEtudiant[];
  selectedStudent: IEtudiant | null;
  
  // Filtres et recherche
  filters: IEtudiantFilters;
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
  stats: StatsData | null;
  
  // Données associées
  studentCourses: IEtudiantCours[];
  studentNotes: IEtudiantNote[];
  studentMoyenne: IEtudiantMoyenne | null;

  // Données académiques disponibles
  filieres: IFiliere[];
  specialites: ISpecialite[];

  //Données académiques
  specialite?: ISpecialite[];
  filiereS?: IFiliere;
}

// ─────────────────────────── Actions ─────────────────────────────

export type StudentAction =
  | { type: "FETCH_STUDENTS_SUCCESS"; payload: { students: IEtudiant[], pagination: PaginationState } }
  | { type: "SET_SELECTED_STUDENT"; payload: IEtudiant | null }
  | { type: "SET_FILTERS"; payload: IEtudiantFilters }
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
  | { type: "SET_STATS"; payload: StatsData }
  | { type: "SET_STUDENT_COURSES"; payload: IEtudiantCours[] }
  | { type: "SET_STUDENT_NOTES"; payload: IEtudiantNote[] }
  | { type: "SET_STUDENT_MOYENNE"; payload: IEtudiantMoyenne }
  | { type: "SET_FILIERS"; payload: IFiliere[] }
  | { type: "SET_SPECIALITES"; payload: ISpecialite[] }
  | { type: "ADD_STUDENT"; payload: IEtudiant }
  | { type: "UPDATE_STUDENT"; payload: IEtudiant }
  | { type: "DELETE_STUDENT"; payload: number };

// ─────────────────────────── Initial State ─────────────────────────────

export const initialStudentState: StudentState = {
  students: [],
  selectedStudent: null,
  filters: {},
  searchTerm: "",
  processing: false,
  success: false,
  message: undefined,
  errors: {},
  errorType: null,
  cause: undefined,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  },
  sortConfig: {
    field: 'nom',
    direction: 'asc'
  },
  modals: {
    studentDetails: false,
    studentForm: false,
    studentDelete: false,
    studentNotes: false,
    studentCourses: false
  },
  stats: null,
  studentCourses: [],
  studentNotes: [],
  studentMoyenne: null,
  filieres: [],
  specialites: []
};

// ─────────────────────────── Reducer ─────────────────────────────

function studentReducer(state: StudentState, action: StudentAction): StudentState {
  switch (action.type) {
    case "FETCH_STUDENTS_SUCCESS":
      return {
        ...state,
        students: action.payload.students,
        pagination: action.payload.pagination
      };

    case "SET_SELECTED_STUDENT":
      return { ...state, selectedStudent: action.payload };

    case "SET_FILTERS":
      return { ...state, filters: action.payload };

    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };

    case "RESET_FILTERS":
      return { ...state, filters: {}, searchTerm: "" };

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
      return {
        ...state,
        errors: {},
        errorType: null,
        cause: undefined,
        message: undefined
      };

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case "SET_SORT_CONFIG":
      return { ...state, sortConfig: action.payload };

    case "TOGGLE_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.isOpen
        }
      };

    case "SET_STATS":
      return { ...state, stats: action.payload };

    case "SET_STUDENT_COURSES":
      return { ...state, studentCourses: action.payload };

    case "SET_STUDENT_NOTES":
      return { ...state, studentNotes: action.payload };

    case "SET_STUDENT_MOYENNE":
      return { ...state, studentMoyenne: action.payload };

    case "SET_FILIERS":
      return { ...state, filieres: action.payload };

    case "SET_SPECIALITES":
      return { ...state, specialites: action.payload };

    case "ADD_STUDENT":
      return {
        ...state,
        students: [...state.students, action.payload],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case "UPDATE_STUDENT":
      if (!action.payload || typeof action.payload !== 'object' || !('id' in action.payload)) {
        console.error('UPDATE_STUDENT action payload invalide:', action.payload);
        return state;
      }
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
        selectedStudent: state.selectedStudent?.id === action.payload.id 
          ? action.payload 
          : state.selectedStudent
      };

    case "DELETE_STUDENT":
      return {
        ...state,
        students: state.students.filter(s => s.id !== action.payload),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        },
        selectedStudent: state.selectedStudent?.id === action.payload 
          ? null 
          : state.selectedStudent
      };

    default:
      return state;
  }
}

// ─────────────────────────── Context ─────────────────────────────

interface StudentContextType {
  state: StudentState;
  actions: {
    fetchStudents: (page?: number, limit?: number) => Promise<void>;
    fetchStudentById: (id: number) => Promise<void>;
    createStudent: (data: IEtudiantFormRequest) => Promise<void>;
    updateStudent: (id: number, data: IEtudiantUpdateRequest) => Promise<void>;
    deleteStudent: (id: number) => Promise<void>;
    toggleStudentStatus: (id: number, statut?: StatutAcademique) => Promise<void>;
    fetchStudentCourses: (id: number) => Promise<void>;
    fetchStudentNotes: (id: number) => Promise<void>;
    fetchStudentMoyenne: (id: number) => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchFilieres: () => Promise<void>;
    fetchSpecialites: () => Promise<void>;
    searchStudents: (criteria: any) => Promise<void>;
    setSelectedStudent: (student: IEtudiant | null) => void;
    setFilters: (filters: IEtudiantFilters) => void;
    setSearchTerm: (term: string) => void;
    applyFilters: () => Promise<void>;
    resetFilters: () => void;
    resetErrors: () => void;
    setPagination: (pagination: Partial<PaginationState>) => void;
    setSortConfig: (config: SortConfig) => void;
    toggleModal: (modal: keyof ModalStates, isOpen: boolean) => void;
  };
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// ─────────────────────────── Provider ─────────────────────────────

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, initialStudentState);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ═══════════════════════ CRUD Operations ═══════════════════════

  const fetchStudents = useCallback(async (page = 1, limit = 10) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...state.filters,
        ...(state.searchTerm && { search: state.searchTerm })
      });

      // La réponse du serveur est ApiResponseOk<IPaginationResult<IEtudiant[]>>
      const response = await api.get<ApiResponseOk<IPaginationResult<IEtudiant>>>(
        `/students?${params}`
      );

      // Extraire les données de la réponse API
      const apiResult: IPaginationResult<IEtudiant> = response.data; 
      const students = apiResult.data; 
      const pagination = apiResult.pagination!;

      console.log('result  students', students);
      console.log('result  pagination', pagination);
      console.log('result fetch students', apiResult);
      dispatch({
        type: "FETCH_STUDENTS_SUCCESS",
        payload: { students, pagination }
      });

      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [state.filters, state.searchTerm]);

  const fetchStudentById = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.get<ApiResponseOk<IEtudiant>>(`/students/${id}`);
      const student = response.data;
      
      dispatch({ type: "SET_SELECTED_STUDENT", payload: student });
      dispatch({ type: "SET_SUCCESS", payload: true });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const createStudent = useCallback(async (data: IEtudiantFormRequest) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      // Import validation schema
      const { studentsSchema, yupToFormErrors } = await import('../Validations/StudentsCheckForm');
      
      // Validate data
      await studentsSchema.validate(data, { abortEarly: false });
      
      const response = await api.post<ApiResponseOk<IEtudiant>>('/students', data);
      const newStudent = response.data;

      dispatch({ type: "ADD_STUDENT", payload: newStudent });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Étudiant créé avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Étudiant ${newStudent.nom} ${newStudent.prenom} créé avec succès`
      });
      
      navigate('/students');
    } catch (error: any) {
      // Handle validation errors
      if (error.inner) {
        const { yupToFormErrors } = await import('../Validations/StudentsCheckForm');
        const validationErrors = yupToFormErrors(error);
        dispatch({ type: "SET_ERRORS", payload: validationErrors });
        dispatch({ type: "SET_MESSAGE", payload: "Erreur de validation des données" });
        dispatch({ type: "SET_ERROR_TYPE", payload: "validation" });
        return;
      }
      
      // Handle API errors
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [navigate, addToast]);

  const updateStudent = useCallback(async (id: number, data: IEtudiantUpdateRequest) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.put<ApiResponseOk<IEtudiant>>(`/students/${id}`, data);
      const updatedStudent = response.data;

      dispatch({ type: "UPDATE_STUDENT", payload: updatedStudent });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Étudiant mis à jour avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Étudiant ${updatedStudent.nom} ${updatedStudent.prenom} modifié avec succès`
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [addToast]);

  const deleteStudent = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const foundStudent = state.students.find(e => e.id === id);
      const nom_complet = foundStudent ? `${foundStudent.nom} ${foundStudent.prenom}` : '';

      const response = await api.delete<ApiResponseOk<any>>(`/students/${id}`);
      
      dispatch({ type: "DELETE_STUDENT", payload: id });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Étudiant supprimé avec succès" });
      
      addToast({
        type: 'success',
        title: 'Succès',
        message: `Étudiant ${nom_complet} supprimé avec succès`
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [state.students, addToast]);

  const toggleStudentStatus = useCallback(async (id: number, statut?: StatutAcademique) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const foundStudent = state.students.find(e => e.id === id);
      const nom_complet = foundStudent ? `${foundStudent.nom} ${foundStudent.prenom}` : '';
      
      const response = await api.post<ApiResponseOk<IEtudiant>>(
        `/students/${id}/toggle-statut`,
        { statut }
      );
      
      const updatedStudent = response.data;
      
      dispatch({ type: "UPDATE_STUDENT", payload: updatedStudent });
      dispatch({ type: "SET_SUCCESS", payload: true });
      dispatch({ type: "SET_MESSAGE", payload: response.message || "Statut modifié avec succès" });
      
      const statusMessage = foundStudent?.statut === 'ACTIF' ? 'désactivé' : 'activé';
      addToast({
        type: 'success',
        title: 'Résultat de l\'opération',
        message: `Étudiant ${nom_complet} ${statusMessage} avec succès`
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [state.students, addToast]);

  // ═══════════════════════ Related Data ═══════════════════════

  const fetchStudentCourses = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<IEtudiantCours[]>>(`/students/${id}/courses`);
      const courses = response.data;
      
      console.log('Courses fetched:', courses);
      dispatch({ type: "SET_STUDENT_COURSES", payload: courses });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchStudentNotes = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<IEtudiantNote[]>>(`/students/${id}/notes`);
      const notes = response.data;
      
      console.log('Notes fetched:', notes);
      dispatch({ type: "SET_STUDENT_NOTES", payload: notes });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchStudentMoyenne = useCallback(async (id: number) => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<IEtudiantMoyenne>>(`/students/${id}/moyenne`);
      const moyenne = response.data;
      
      dispatch({ type: "SET_STUDENT_MOYENNE", payload: moyenne });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<StatsData>>('/students/stats');
      const stats = response.data;
      
      dispatch({ type: "SET_STATS", payload: stats });
      console.log('Stats context:', stats);
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchFilieres = useCallback(async () => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<IFiliere[]>>('/filieres');
      const filieres = response.data.data || [];
      console.log('les filière récupérés: ', response)
      dispatch({ type: "SET_FILIERS", payload: filieres });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  const fetchSpecialites = useCallback(async () => {
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      const response = await api.get<ApiResponseOk<ISpecialite[]>>('/specialites');
      const specialites = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ type: "SET_SPECIALITES", payload: specialites });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);


  const searchStudents = useCallback(async (criteria: any) => {
    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "RESET_ERRORS" });

    try {
      const response = await api.post<ApiResponseOk<IEtudiant[]>>(
        '/students/search/advanced',
        criteria
      );
      const students = response.data;
      
      dispatch({
        type: "FETCH_STUDENTS_SUCCESS",
        payload: {
          students: students,
          pagination: state.pagination
        }
      });
    } catch (error: any) {
      handleApiError(
        error,
        (errors) => dispatch({ type: "SET_ERRORS", payload: errors }),
        (msg) => dispatch({ type: "SET_MESSAGE", payload: msg }),
        (type) => dispatch({ type: "SET_ERROR_TYPE", payload: type }),
        (cause) => dispatch({ type: "SET_CAUSE", payload: cause })
      );
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, [state.pagination]);

  // ═══════════════════════ Helper Functions ═══════════════════════

  const setSelectedStudent = useCallback((student: IEtudiant | null) => {
    dispatch({ type: "SET_SELECTED_STUDENT", payload: student });
  }, []);

  const setFilters = useCallback((filters: IEtudiantFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
  }, []);

  const applyFilters = useCallback(async () => {
    await fetchStudents(1);
  }, [fetchStudents]);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    fetchStudents(1);
  }, [fetchStudents]);

  const resetErrors = useCallback(() => {
    dispatch({ type: "RESET_ERRORS" });
  }, []);

  const setPagination = useCallback((pagination: Partial<PaginationState>) => {
    dispatch({ type: "SET_PAGINATION", payload: pagination });
  }, []);

  const setSortConfig = useCallback((config: SortConfig) => {
    dispatch({ type: "SET_SORT_CONFIG", payload: config });
  }, []);

  const toggleModal = useCallback((modal: keyof ModalStates, isOpen: boolean) => {
    dispatch({ type: "TOGGLE_MODAL", payload: { modal, isOpen } });
  }, []);

  // ═══════════════════════ Context Value ═══════════════════════

  const contextValue = useMemo(
    () => ({
      state,
      actions: {
        fetchStudents,
        fetchStudentById,
        createStudent,
        updateStudent,
        deleteStudent,
        toggleStudentStatus,
        fetchStudentCourses,
        fetchStudentNotes,
        fetchStudentMoyenne,
        fetchStats,
        fetchFilieres,
        fetchSpecialites,
        searchStudents,
        setSelectedStudent,
        setFilters,
        setSearchTerm,
        applyFilters,
        resetFilters,
        resetErrors,
        setPagination,
        setSortConfig,
        toggleModal,
      },
    }),
    [
      state,
      fetchStudents,
      fetchStudentById,
      createStudent,
      updateStudent,
      deleteStudent,
      toggleStudentStatus,
      fetchStudentCourses,
      fetchStudentNotes,
      fetchStudentMoyenne,
      fetchStats,
      fetchFilieres,
      fetchSpecialites,
      searchStudents,
      setSelectedStudent,
      setFilters,
      setSearchTerm,
      applyFilters,
      resetFilters,
      resetErrors,
      setPagination,
      setSortConfig,
      toggleModal,
    ]
  );

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};

// ─────────────────────────── Hook ─────────────────────────────

export const useStudents = (): StudentContextType => {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudents doit être utilisé dans StudentProvider");
  }
  return context;
};