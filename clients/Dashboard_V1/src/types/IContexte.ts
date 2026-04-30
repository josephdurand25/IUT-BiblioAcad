// ==========================================
// CONTEXTES
// ==========================================

import type { RoleUtilisateur, StatutUtilisateur } from "./IGeneral";

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

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'orange';

export interface ThemeState {
  theme: Theme;
  colorScheme: ColorScheme;
  fontSize: number;
}