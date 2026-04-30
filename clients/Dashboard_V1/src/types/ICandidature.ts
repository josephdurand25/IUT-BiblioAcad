/**
 * Types et interfaces pour la gestion des candidatures
 * Version alignée avec la base de données et le contexte React
 */

import type { Genre, NiveauEtude, StatutCandidature, TypeCandidature } from "./IGeneral";

// ─────────────────────────── Interface Principale ─────────────────────────────

export interface ICandidature {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  date_naissance: string;
  lieu_naissance?: string | null;
  genre: Genre;
  nationalite: string;
  adresse_complete: string;
  region_origine?: string | null;
  pays: string;
  photo_profil?: string | null;
  cv_url?: string | null;
  lettre_motivation_url?: string | null;
  documents_url?: string | null; // JSON string
  informations_supplementaires?: string | null; // JSON string
  specialite_demandee: string;
  niveau_demande?: NiveauEtude | null;
  type_candidature: TypeCandidature;
  statut: StatutCandidature;
  motif_rejet?: string | null;
  date_candidature: string;
  date_validation?: string | null;
  validee_par?: number | null;
  etudiant_id?: number | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────── Création de Candidature ─────────────────────────────

export interface ICandidatureFormRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_naissance: string;
  lieu_naissance?: string;
  genre: Genre;
  nationalite: string;
  adresse_complete: string;
  region_origine?: string;
  pays: string;
  photo_profil?: File;
  cv_url?: File;
  lettre_motivation_url?: File;
  informations_supplementaires?: string;
  specialite_demandee: string;
  niveau_demande?: NiveauEtude;
  type_candidature: TypeCandidature;
  autres_documents?: File | File[];
}

// Alias pour compatibilité avec le code existant
export interface ICandidatureCreate extends ICandidatureFormRequest {
  statut?: StatutCandidature;
}

// ─────────────────────────── Mise à jour de Candidature ─────────────────────────────

export interface ICandidatureUpdateRequest {
  statut?: StatutCandidature;
  motif_rejet?: string | null;
  validee_par?: number | null;
  date_validation?: string | null;
  niveau_demande?: NiveauEtude | null;
  informations_supplementaires?: string | null;
  documents_url?: string | null;
  photo_profil?: string | null;
  cv_url?: string | null;
  lettre_motivation_url?: string | null;
}

// Alias pour compatibilité
export interface ICandidatureUpdate extends ICandidatureUpdateRequest {}

// ─────────────────────────── Validation de Candidature ─────────────────────────────

export interface ICandidatureValidation {
  candidature_id: number;
  statut: 'VALIDE' | 'REJETE';
  motif_rejet?: string; // Requis si statut = 'REJETE'
  validee_par?: number;
  notes?: string; // Pour informations_supplementaires
}

// ─────────────────────────── Filtres et Recherche ─────────────────────────────

export interface ICandidatureFilters {
  statut?: StatutCandidature | StatutCandidature[];
  specialite_demandee?: string | string[];
  niveau_demande?: NiveauEtude | NiveauEtude[];
  type_candidature?: TypeCandidature | TypeCandidature[];
  date_candidature_debut?: string;
  date_candidature_fin?: string;
  date_validation_debut?: string;
  date_validation_fin?: string;
  search?: string; // Recherche sur nom, prenom, email
  validee_par?: number;
  etudiant_id?: number;
  
  // Pagination
  page?: number;
  limit?: number;
  sort_by?: 'date_candidature' | 'nom' | 'statut' | 'date_validation';
  sort_order?: 'ASC' | 'DESC';
}

// Pour compatibilité avec le code existant
export interface ICandidatureFiltersLegacy {
  statut?: StatutCandidature;
  specialite_demandee?: string;
  type_candidature?: TypeCandidature;
  searchTerm?: string;
  niveau_demande?: string;
}

// ─────────────────────────── Statistiques ─────────────────────────────

export interface ICandidatureStats {
  total: number;
  en_cours: number;
  complet: number;
  en_evaluation: number;
  valide: number;
  rejete: number;
  annule: number;
  converties_en_etudiant: number;
  nb_specialites: number;
  premiere_candidature: string;
  derniere_candidature: string;
  delai_moyen_traitement_jours: number;
  par_specialite: Array<{
    specialite_demandee: string;
    total: number;
    validees: number;
  }>;
  par_mois: Array<{
    mois: string;
    count: number;
  }>;
}

// Pour compatibilité avec le code existant
export interface ICandidatureStatsLegacy {
  total: number;
  enCours: number;
  complet: number;
  enEvaluation: number;
  valide: number;
  rejeto: number;
}

// ─────────────────────────── Réponses API ─────────────────────────────

export interface ICandidatureResponse {
  success: boolean;
  message: string;
  candidature?: ICandidature;
  error?: string;
  errors?: Record<string, string[]>;
}

// ─────────────────────────── Documents et Pièces jointes ─────────────────────────────

export interface ICandidatureDocument {
  id?: number;
  candidature_id: number;
  type_document: 'CV' | 'LETTRE_MOTIVATION' | 'DIPLOME' | 'RELEVE_NOTES' | 'PHOTO' | 'AUTRE';
  url: string;
  nom_fichier: string;
  taille: number;
  mime_type: string;
  date_upload: string;
}

// ─────────────────────────── État du contexte (pour useCandidatures) ─────────────────────────────

export interface CandidaturePaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CandidatureSortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CandidatureModalStates {
  candidatureDetails: boolean;
  candidatureForm: boolean;
  candidatureDelete: boolean;
  candidatureValidation: boolean;
  candidatureDocuments: boolean;
}

export interface CandidatureContextState {
  // Données principales
  candidatures: ICandidature[];
  selectedCandidature: ICandidature | null;
  
  // Filtres et recherche
  filters: ICandidatureFilters;
  searchTerm: string;
  
  // État des opérations
  processing: boolean;
  success: boolean;
  message: string | undefined;
  errors: Record<string, string>;
  errorType: string | null;
  cause: string | undefined;
  
  // Pagination et tri
  pagination: CandidaturePaginationState;
  sortConfig: CandidatureSortConfig;
  
  // États des modals
  modals: CandidatureModalStates;
  
  // Statistiques
  stats: ICandidatureStats | null;
  
  // Données associées
  candidatureDocuments: string[];
  specialitesDisponibles: Array<{ code: string; nom: string }>;
}
