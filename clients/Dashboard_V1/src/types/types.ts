// ==========================================
// TYPES AUTONOMES - APPLICATION REACT
// Tous les types nécessaires sans dépendance au serveur
// ==========================================











// ==========================================
// UI/UX - COMPOSANTS FRONTEND
// ==========================================

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

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children?: React.ReactNode;
}

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

// ==========================================
// NAVIGATION
// ==========================================

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



// ==========================================
// FILTRES & RECHERCHE
// ==========================================

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

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  query: string;
  filters: ActiveFilter[];
  timestamp: number;
}

// ==========================================
// STATISTIQUES
// ==========================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

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

// ==========================================
// UPLOAD DE FICHIERS
// ==========================================

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// ==========================================
// CALENDRIER & EMPLOI DU TEMPS
// ==========================================

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

export interface TimeSlot {
  jour: JourSemaine;
  heure_debut: string;
  heure_fin: string;
  matiere?: IMatiere;
  salle?: ISalle;
  enseignant?: string;
  groupe?: string;
}

// ==========================================
// VALIDATION
// ==========================================

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

// ==========================================
// TYPES UTILITAIRES
// ==========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ==========================================
// HOOKS PERSONNALISÉS
// ==========================================

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

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

// ==========================================
// CONSTANTES
// ==========================================

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

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
} as const;