import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { ICours } from '../types/ICours';
import type { ICoursesState, ICoursFilters, IPaginationResult } from '../types/api';
import api from '../ConfigApp/apiConfigCommunication';

// ==========================================
// TYPES DU CONTEXT
// ==========================================

type CoursesAction =
  | { type: 'SET_COURSES'; payload: ICours[] }
  // | { type: 'SET_COURSES_WITH_STATS'; payload: ICoursWithEnrollments[] }
  | { type: 'SET_SELECTED_COURSE'; payload: ICours | null }
  | { type: 'SET_PAGINATION'; payload: any }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'SET_MESSAGE'; payload: string | null }
  | { type: 'SET_ERRORS'; payload: any }
  | { type: 'RESET_STATE' };

interface ICoursesContext {
  state: ICoursesState;
  actions: {
    // CRUD
    fetchCourses: (page?: number, limit?: number, filters?: ICoursFilters) => Promise<void>;
    fetchCourseById: (id: number) => Promise<void>;
    createCourse: (course: Partial<ICours>) => Promise<void>;
    updateCourse: (id: number, course: Partial<ICours>) => Promise<void>;
    deleteCourse: (id: number) => Promise<void>;
    
    // Statistiques
    // fetchCoursesWithStats: () => Promise<void>;
    
    // Utilitaires
    setSelectedCourse: (course: ICours | null) => void;
    resetState: () => void;
  };
}

// ==========================================
// ÉTAT INITIAL
// ==========================================

const initialState: ICoursesState = {
  courses: [],
  selectedCourse: null,
  // coursesWithStats: [],
  processing: false,
  success: false,
  message: null,
  errors: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// ==========================================
// REDUCER
// ==========================================

const coursesReducer = (state: ICoursesState, action: CoursesAction): ICoursesState => {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    
    // case 'SET_COURSES_WITH_STATS':
    //   return { ...state, coursesWithStats: action.payload };
    
    case 'SET_SELECTED_COURSE':
      return { ...state, selectedCourse: action.payload };
    
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    
    case 'SET_PROCESSING':
      return { ...state, processing: action.payload };
    
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
    
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// ==========================================
// CONTEXT
// ==========================================

const CoursesContext = createContext<ICoursesContext | undefined>(undefined);

// ==========================================
// PROVIDER
// ==========================================

export const CoursesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(coursesReducer, initialState);

  // ==========================================
  // GESTION DES ERREURS
  // ==========================================

  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);

    if (error.response) {
      const { status, data } = error.response;

      dispatch({ type: 'SET_SUCCESS', payload: false });

      if (status === 400) {
        dispatch({ type: 'SET_ERRORS', payload: data.errors || {} });
        dispatch({ type: 'SET_MESSAGE', payload: data.message || 'Données invalides' });
      } else if (status === 404) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Cours non trouvé' });
      } else if (status === 409) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Un cours avec ce code existe déjà' });
      } else if (status === 500) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Erreur serveur. Veuillez réessayer.' });
      } else {
        dispatch({ type: 'SET_MESSAGE', payload: data.message || 'Une erreur est survenue' });
      }
    } else if (error.request) {
      dispatch({ type: 'SET_MESSAGE', payload: 'Pas de réponse du serveur' });
      dispatch({ type: 'SET_SUCCESS', payload: false });
    } else {
      dispatch({ type: 'SET_MESSAGE', payload: error.message || 'Erreur inconnue' });
      dispatch({ type: 'SET_SUCCESS', payload: false });
    }
  }, []);

  // ==========================================
  // ACTIONS
  // ==========================================

  const fetchCourses = useCallback(async (
    page: number = 1,
    limit: number = 10,
    filters?: ICoursFilters
  ) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERRORS', payload: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.filiere && { filiere: filters.filiere }),
        ...(filters?.niveau && { niveau: filters.niveau }),
        ...(filters?.semestre && { semestre: filters.semestre }),
        ...(filters?.professeur && { professeur: filters.professeur }),
        ...(filters?.statut && { statut: filters.statut }),
        ...(filters?.search && { search: filters.search })
      });

      const response = await api.get<IPaginationResult<ICours>>(`/api/courses?${params}`);
      
      dispatch({ type: 'SET_COURSES', payload: response.data.data });
      dispatch({ type: 'SET_PAGINATION', payload: response.data.pagination });
      dispatch({ type: 'SET_SUCCESS', payload: true });
    } catch (error: any) {
      handleApiError(error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [handleApiError]);

  const fetchCourseById = useCallback(async (id: number) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERRORS', payload: null });

    try {
      const response = await api.get<ICours>(`/api/courses/${id}`);
      dispatch({ type: 'SET_SELECTED_COURSE', payload: response.data });
      dispatch({ type: 'SET_SUCCESS', payload: true });
    } catch (error: any) {
      handleApiError(error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [handleApiError]);

  const createCourse = useCallback(async (course: Partial<ICours>) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERRORS', payload: null });

    try {
      const response = await api.post<ICours>('/api/courses', course);
      
      dispatch({ type: 'SET_SUCCESS', payload: true });
      dispatch({ type: 'SET_MESSAGE', payload: 'Cours créé avec succès' });
      
      // Rafraîchir la liste
      await fetchCourses(state.pagination.page, state.pagination.limit);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.pagination, fetchCourses, handleApiError]);

  const updateCourse = useCallback(async (id: number, course: Partial<ICours>) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERRORS', payload: null });

    try {
      const response = await api.put<ICours>(`/api/courses/${id}`, course);
      
      dispatch({ type: 'SET_SELECTED_COURSE', payload: response.data });
      dispatch({ type: 'SET_SUCCESS', payload: true });
      dispatch({ type: 'SET_MESSAGE', payload: 'Cours mis à jour avec succès' });
      
      // Rafraîchir la liste
      await fetchCourses(state.pagination.page, state.pagination.limit);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.pagination, fetchCourses, handleApiError]);

  const deleteCourse = useCallback(async (id: number) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'SET_ERRORS', payload: null });

    try {
      await api.delete(`/api/courses/${id}`);
      
      dispatch({ type: 'SET_SUCCESS', payload: true });
      dispatch({ type: 'SET_MESSAGE', payload: 'Cours supprimé avec succès' });
      
      // Rafraîchir la liste
      await fetchCourses(state.pagination.page, state.pagination.limit);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.pagination, fetchCourses, handleApiError]);

  // const fetchCoursesWithStats = useCallback(async () => {
  //   dispatch({ type: 'SET_PROCESSING', payload: true });
  //   dispatch({ type: 'SET_ERRORS', payload: null });

  //   try {
  //     const response = await api.get<ICoursWithEnrollments[]>('/api/courses/stats');
  //     dispatch({ type: 'SET_COURSES_WITH_STATS', payload: response.data });
  //     dispatch({ type: 'SET_SUCCESS', payload: true });
  //   } catch (error: any) {
  //     handleApiError(error);
  //   } finally {
  //     dispatch({ type: 'SET_PROCESSING', payload: false });
  //   }
  // }, [handleApiError]);

  const setSelectedCourse = useCallback((course: ICours | null) => {
    dispatch({ type: 'SET_SELECTED_COURSE', payload: course });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // ==========================================
  // VALEUR DU CONTEXT
  // ==========================================

  const value: ICoursesContext = {
    state,
    actions: {
      fetchCourses,
      fetchCourseById,
      createCourse,
      updateCourse,
      deleteCourse,
      setSelectedCourse,
      resetState
    }
  };

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useCourses = (): ICoursesContext => {
  const context = useContext(CoursesContext);
  
  if (!context) {
    throw new Error('useCourses doit être utilisé dans un CoursesProvider');
  }
  
  return context;
};

export default CoursesContext;