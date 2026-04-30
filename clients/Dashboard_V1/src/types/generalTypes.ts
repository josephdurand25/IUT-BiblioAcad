// ==========================================
// TYPES CENTRALISÉS - APPLICATION REACT
// Fichier unique regroupant tous les types
// ==========================================

import type { JourSemaine, RoleUtilisateur, StatutUtilisateur } from "./IGeneral";
import type { IMatiere } from "./IMatiere";
import type { ISalle } from "./ISalle";

// ─────────────────────────── UI / UX ───────────────────────────

/**
 * Types pour les toasts/notifications
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';


export interface Toast {
  id?: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Types pour les modales
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Types pour les boutons
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Types pour les inputs/formulaires
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'datetime-local' | 'url' | 'search';

export interface InputProps {
  type?: InputType;
  name: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
  icon?: React.ReactNode;
  hint?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  multiple?: boolean;
}

/**
 * Types pour les tableaux
 */
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selected: Set<string | number>) => void;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

/**
 * Types pour la pagination
 */
export interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  onItemsPerPageChange?: (limit: number) => void;
  showItemsPerPage?: boolean;
  disabled?: boolean;
}

/**
 * Types pour les cartes/cards
 */
export interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  children?: React.ReactNode;
}

/**
 * Types pour les badges
 */
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
}

// ─────────────────────────── NAVIGATION ───────────────────────────

/**
 * Types pour le menu/navigation
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  onClick?: () => void;
  children?: MenuItem[];
  badge?: number | string;
  disabled?: boolean;
  divider?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

// ─────────────────────────── CONTEXTES ───────────────────────────

/**
 * Types pour le contexte d'authentification
 */
export interface AuthUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: RoleUtilisateur;
  statut: StatutUtilisateur;
  photo_profil?: string;
  permissions?: string[];
}

export interface RegisterRequest extends Omit<AuthUser , 'id' > {
}

export interface AuthenticatedUser extends AuthUser {
  token: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

/**
 * Types pour le contexte de thème
 */
export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'orange';

export interface ThemeState {
  theme: Theme;
  colorScheme: ColorScheme;
  fontSize: number;
}

export interface ThemeContextType {
  state: ThemeState;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: number) => void;
  toggleTheme: () => void;
}

// ─────────────────────────── FILTRES ───────────────────────────

/**
 * Types pour les filtres génériques
 */

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
export interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'multiselect';
  options?: SelectOption[];
  placeholder?: string;
  defaultValue?: any;
}

export interface ActiveFilter {
  field: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
}

// ─────────────────────────── STATISTIQUES ───────────────────────────

/**
 * Types pour les graphiques
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  title?: string;
  width?: number;
  height?: number;
  showLegend?: boolean;
  showValues?: boolean;
  animate?: boolean;
}

/**
 * Types pour les statistiques de dashboard
 */
export interface StatCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
  description?: string;
}

// ─────────────────────────── UPLOAD / FICHIERS ───────────────────────────

/**
 * Types pour l'upload de fichiers
 */
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onUpload: (files: FileList) => Promise<void>;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  existingFiles?: string[];
}

// ─────────────────────────── RECHERCHE ───────────────────────────

/**
 * Types pour la recherche
 */
export interface SearchResult<T = any> {
  items: T[];
  total: number;
  query: string;
  filters: ActiveFilter[];
  timestamp: number;
}

export interface SearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  minChars?: number;
  disabled?: boolean;
  loading?: boolean;
  suggestions?: string[];
  showSuggestions?: boolean;
}

// ─────────────────────────── EXPORT / IMPORT ───────────────────────────

/**
 * Types pour l'export de données
 */
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  columns?: string[];
  filters?: Record<string, any>;
  includeHeaders?: boolean;
}

export interface ImportResult<T = any> {
  success: number;
  errors: number;
  data: T[];
  errorDetails?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// ─────────────────────────── CALENDRIER / EMPLOI DU TEMPS ───────────────────────────

/**
 * Types pour le calendrier
 */
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date | string;
  end: Date | string;
  description?: string;
  color?: string;
  allDay?: boolean;
  location?: string;
  participants?: string[];
}

export interface CalendarProps {
  events: CalendarEvent[];
  view?: 'month' | 'week' | 'day' | 'agenda';
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onViewChange?: (view: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Types pour l'emploi du temps
 */
export interface TimeSlot {
  jour: JourSemaine;
  heure_debut: string;
  heure_fin: string;
  matiere?: IMatiere;
  salle?: ISalle;
  enseignant?: string;
  groupe?: string;
}

export interface EmploiDuTempsProps {
  timeSlots: TimeSlot[];
  startHour?: number;
  endHour?: number;
  showWeekend?: boolean;
  editable?: boolean;
  onSlotClick?: (slot: TimeSlot) => void;
}

// ─────────────────────────── VALIDATION ───────────────────────────

/**
 * Types pour la validation de formulaires
 */
export type ValidationRule = 
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom';

export interface FieldValidation {
  rule: ValidationRule;
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FormValidation {
  [field: string]: FieldValidation[];
}

export interface ValidationErrors {
  [field: string]: string;
}

// ─────────────────────────── UTILITAIRES ───────────────────────────

/**
 * Types utilitaires
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

// ─────────────────────────── HOOKS PERSONNALISÉS ───────────────────────────

/**
 * Types pour useDebounce
 */
export interface DebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Types pour useAsync
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Types pour useLocalStorage
 */
export type StorageValue<T> = T | null;

/**
 * Types pour usePagination
 */
export interface UsePaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

// ─────────────────────────── CONSTANTES ───────────────────────────

/**
 * Routes de l'application
 */
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students/create',
    EDIT: '/students/:id/edit',
    DETAILS: '/students/:id',
  },
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses/create',
    EDIT: '/courses/:id/edit',
    DETAILS: '/courses/:id',
  },
  GRADES: {
    LIST: '/grades',
    ENTRY: '/grades/entry',
  },
  SCHEDULE: '/schedule',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

/**
 * Permissions
 */
export const PERMISSIONS = {
  STUDENTS: {
    VIEW: 'students.view',
    CREATE: 'students.create',
    UPDATE: 'students.update',
    DELETE: 'students.delete',
  },
  COURSES: {
    VIEW: 'courses.view',
    CREATE: 'courses.create',
    UPDATE: 'courses.update',
    DELETE: 'courses.delete',
  },
  GRADES: {
    VIEW: 'grades.view',
    ENTRY: 'grades.entry',
    VALIDATE: 'grades.validate',
  },
} as const;

/**
 * Clés de stockage local
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
} as const;