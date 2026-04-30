// ==========================================
// ÉTUDIANTS

import type { Genre, RoleUtilisateur, StatutAcademique, StatutUtilisateur } from "./IGeneral";

// ==========================================
export interface IEtudiant {
  // Champs Utilisateur
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password_hash?: string;
  telephone?: string;
  role: RoleUtilisateur;
  statut: StatutUtilisateur;
  
  // Champs Etudiant
  numero_etudiant: string;
  date_naissance?: string;
  lieu_naissance?: string;
  genre?: 'M' | 'F' | 'AUTRE';
  nationalite?: string;
  adresse_complete?: string;
  region_origine?: string;
  pays?: string;
  
  specialite_code?: string;
  specialite_nom?: string;
  niveau?: string;
  statut_academique: StatutAcademique;
  photo_profil?: string;
  date_inscription?: string;
  age?: number;
  nom_complet?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IEtudiantFormRequest {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  telephone?: string;
  numero_etudiant?: string;
  date_naissance?: Date | string;
  lieu_naissance?: string;
  genre?: 'M' | 'F' | 'AUTRE';
  nationalite?: string;
  adresse_complete?: string;
  region_origine?: string;
  pays?: string;
  specialite_code?: string;
  niveau?: string;
  photo_profil?: string;
  date_inscription?: Date | string;
}

export interface IEtudiantUpdateRequest extends Partial<Omit<IEtudiantFormRequest, 'numero_etudiant'>> {
  statut?: StatutUtilisateur;
  statut_academique?: StatutAcademique;
}

export interface IEtudiantFilters {
  filiere?: string;
  niveau?: string;
  statut?: StatutUtilisateur;
  statut_academique?: StatutAcademique;
  search?: string;
}

export interface IEtudiantSearchCriteria {
  nom?: string;
  prenom?: string;
  email?: string;
  numero_etudiant?: string;
  filiere?: string;
  niveau?: string;
  statut?: StatutUtilisateur;
  statut_academique?: StatutAcademique;
  nationalite?: string;
  region_origine?: string;
  minAge?: number;
  maxAge?: number;
}

export interface IEtudiantStatistics {
  total: number;
  inscrits: number;
  non_inscrits: number;
  diplomes: number;
  abandons: number;
  exclus: number;
  parFiliere: Array<{
    filiere: string;
    total: number;
    inscrits: number;
    diplomes: number;
    abandons: number;
    age_moyen: number;
  }>;
}

export interface IEtudiantListItem {
  id: number;
  numero_etudiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  filiere?: string;
  niveau?: string;
  statut: StatutUtilisateur;
  statut_academique: StatutAcademique;
  photo_profil?: string;
}

export interface IEtudiantCours {
  code: string;
  nom: string;
  filiere_code?: string;
  niveau?: string;
  semestre: string;
  date_inscription: Date | string;
  statut_inscription: string;
}

export interface IEtudiantNote {
  id: number;
  matiere_nom: string;
  matiere_code: string;
  credits: number;
  note_cc?: number;
  note_examen?: number;
  note_tp?: number;
  note_finale?: number;
  validee: boolean;
  session: string;
  commentaire?: string;
}

export interface IEtudiantMoyenne {
  moyenne: number;
  nombre_matieres: number;
  credits_obtenus: number;
  credits_totaux: number;
}