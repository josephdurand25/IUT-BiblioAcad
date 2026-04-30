import type { Genre, RoleUtilisateur, StatutUtilisateur } from "./IGeneral";


// types/IRBAC.ts

export interface IRole {
  id: number;
  nom: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  permissions?: IPermission[];
}

export interface IPermission {
  id: number;
  code: string; // ex: "view:students"
  libelle: string;
  description: string;
  module: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: RoleUtilisateur;
  statut: StatutUtilisateur;
  avatar_url?: string;
  departement?: string;
  genre: Genre;
  bureau?: string;
  matricule?: string;
  last_login?: string;
  token?: string;
  expiresIn?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}


export interface ILoginResponse extends IUser {
  roles?: IRole; 
  permissions?: string[] | string; 
}

export interface IRegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  role?: 'ETUDIANT' | 'ENSEIGNANT' | 'ADMINISTRATEUR';
}

export interface IAuthResponse {
  user: IUser;
  token: string;
  expires_in?: number;
}

export interface IAuthState {
  user: IUser | null;
  permissions: string[] | string | undefined;
  roles: IRole[] | undefined;
  token: string | undefined;
  isAuthenticated: boolean;
  success: boolean;
  isLoading: boolean;
  message: string | undefined;
  error: string | undefined;
  errors: Record<string, string>;
  cause?: string;
  errorType?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IPasswordResetRequest {
  email: string;
}

export interface IPasswordResetConfirm {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface IUpdateProfileRequest {
  nom?: string;
  prenom?: string;
  telephone?: string;
  photo_profil?: File | string;
}
