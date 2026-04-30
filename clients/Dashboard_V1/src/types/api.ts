import type { ICours } from "./ICours";
import type { ICarteData, IDocument, IPVData, IReleveData } from "./IDocuments";
import type { Genre, JourSemaine, NiveauEtude, Semestre, SessionExamen, StatutInscription } from "./IGeneral";
import type { IGradeStatistics, INote, INoteDetails } from "./INotes";

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// ==========================================
// API - RÉPONSES & REQUÊTES
// ==========================================

export type ApiErrorValidationResponse = {
  success: false;
  status_code: number;
  message: string;
  errors: Record<string, string>;
};

export type ApiErrorResponse = {
  success: false;
  status_code: number;
  message: string;
  error?: string;
};

export type ApiError = ApiErrorValidationResponse | ApiErrorResponse;

export type ApiResponseWithoutData = {
  success: true;
  status_code: number;
  message?: string;
};

export type ApiResponseOk<T> = {
  success: true;
  status_code: number;
  message?: string;
  data: T;
};

export type ApiResponseOptional<T> = {
  success: true;
  status_code: number;
  message?: string;
  data?: T | null;
};

export type ApiResponse<T> = ApiResponseOk<T> | ApiError;

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  from?: number;
  to?: number;
};

export type PaginatedResponse<T> = ApiResponseOk<{
  data: T[];
  pagination: PaginationMeta;
}>;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// Type guards
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponseOk<T> {
  return response.success === true;
}

export function isApiError(response: any): response is ApiError {
  return response.success === false;
}

export function isValidationError(error: ApiError): error is ApiErrorValidationResponse {
  return 'errors' in error && typeof error.errors === 'object';
}


export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginationResult<T> {
  data: T;
  pagination: IPagination;
}
// export interface IPaginationResult<T> {
//   data: T[];
//   pagination: IPagination;
// }

export function isApiErrorResponse(data: any): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data.success === undefined || typeof data.success === 'boolean') &&
    (data.message === undefined || typeof data.message === 'string') &&
    (data.status_code === undefined || typeof data.status_code === 'number') &&
    (data.error === undefined || typeof data.error === 'string')
  );
}

export function isApiErrorValidationResponse(data: any): data is ApiErrorValidationResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data.success === undefined || typeof data.success === 'boolean') &&
    (data.status_code === undefined || typeof data.status_code === 'number') &&
    (data.message === undefined || typeof data.message === 'string') &&
    (data.errors === undefined || (
      typeof data.errors === 'object' &&
      !Array.isArray(data.errors) &&
      Object.values(data.errors).every(val => typeof val === 'string')
    ))
  );
}

export type TokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
    permissions: string | string[];
}

// Interface for User
export interface User {
  id_user?: number;
  firstname?: string;
  lastname?: string;
  username?: string;
  sexe?: Genre ;
  email?: string;
  email_verified_at?: string;
  password?: string;
  phone_fixe?: string;
  // account_statut?: AcccountStatus;
  is_leader?: boolean;
  role_id?: number;
  // role?: Role;
  permissions?: string[] | string;
  team?: any;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: any;
}

// ==========================================
// PAGINATION ET FILTRES
// ==========================================


export interface ICoursFilters {
  filiere?: string;
  niveau?: NiveauEtude;
  semestre?: Semestre;
  professeur?: string;
  statut?: StatutCours;
  search?: string;
}

export interface IInscriptionFilters {
  etudiant_id?: number;
  cours_id?: number;
  statut?: StatutInscription;
  semestre?: Semestre;
  annee_academique?: string;
}

export interface INoteFilters {
  cours_id?: number;
  etudiant_id?: number;
  session?: SessionExamen;
  validee?: boolean;
  admis?: boolean;
}

// ==========================================
// ÉTATS DES CONTEXTES
// ==========================================

export interface ICoursesState {
  courses: ICours[];
  selectedCourse: ICours | null;
  // coursesWithStats: ICoursWithEnrollments[];
  processing: boolean;
  success: boolean;
  message: string | null;
  errors: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IEnrollmentsState {
  enrollments: IInscriptionDetails[];
  selectedEnrollment: IInscription | null;
  availableCourses: ICours[];
  processing: boolean;
  success: boolean;
  message: string | null;
  errors: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IGradesState {
  grades: INoteDetails[];
  selectedGrade: INote | null;
  gradeStatistics: IGradeStatistics | null;
  processing: boolean;
  success: boolean;
  message: string | null;
  errors: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IDocumentsState {
  documents: IDocument[];
  selectedDocument: IDocument | null;
  previewData: IPVData | IReleveData | ICarteData | null;
  processing: boolean;
  success: boolean;
  message: string | null;
  errors: any;
}

// ==========================================
// UTILITAIRES
// ==========================================

export interface ITimeSlot {
  jour: JourSemaine;
  heure_debut: string;
  heure_fin: string;
  salle: string;
}

export interface IConflictCheck {
  hasConflict: boolean;
  conflictingCourses?: ICours[];
  message?: string;
}

export interface IPrerequisiteCheck {
  satisfied: boolean;
  missingPrerequisites?: string[];
  message?: string;
}

// ==========================================
// CALCULS
// ==========================================

export interface IGradeCalculation {
  note_finale: number;
  admis: boolean;
  mention: string;
  credits_obtenus: number;
}

export const calculerNoteFinal = (
  note_cc?: number,
  note_examen?: number,
  note_tp?: number
): number => {
  const weights = {
    cc: 0.3,      // 30% CC
    examen: 0.6,  // 60% Examen
    tp: 0.1       // 10% TP
  };

  let total = 0;
  let weightSum = 0;

  if (note_cc !== undefined && note_cc !== null) {
    total += note_cc * weights.cc;
    weightSum += weights.cc;
  }

  if (note_examen !== undefined && note_examen !== null) {
    total += note_examen * weights.examen;
    weightSum += weights.examen;
  }

  if (note_tp !== undefined && note_tp !== null) {
    total += note_tp * weights.tp;
    weightSum += weights.tp;
  }

  return weightSum > 0 ? total / weightSum : 0;
};

export const obtenirMention = (note: number): string => {
  if (note < 10) return 'Ajourné';
  if (note < 12) return 'Passable';
  if (note < 14) return 'Assez Bien';
  if (note < 16) return 'Bien';
  return 'Très Bien';
};

// export const calculerMoyenneGenerale = (notes: INote[]): number => {
//   if (notes.length === 0) return 0;
  
//   const total = notes.reduce((sum, note) => sum + note.note_finale, 0);
//   return total / notes.length;
// };

// export const calculerCreditsObtenus = (notes: INoteDetails[]): number => {
//   return notes
//     .filter(note => (note.note_finale && note.note_finale >= 10))
//     .reduce((sum, note) => sum + note?.cours_credits, 0);
// };