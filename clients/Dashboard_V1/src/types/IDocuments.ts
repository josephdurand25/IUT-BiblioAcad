// ==========================================
// DOCUMENTS
// ==========================================

import type { NiveauEtude, Semestre } from "./api";

export type TypeDocument = 'pv' | 'releve' | 'carte' | 'attestation';
export type StatutDocument = 'brouillon' | 'valide' | 'archive';

export interface IDocument {
  id?: number;
  etudiant_id: number;
  type: TypeDocument;
  fichier_url?: string;
  fichier_nom?: string;
  date_generation: Date;
  annee_academique: string;
  semestre?: Semestre;
  genere_par: number;               // user_id
  statut: StatutDocument;
  metadata?: any;                   // Données supplémentaires JSON
  created_at?: Date;
  updated_at?: Date;
}

// Template pour PV (Procès-Verbal)
export interface IPVData {
  etudiant: {
    nom: string;
    prenom: string;
    numero: string;
    filiere: string;
    niveau: NiveauEtude;
  };
  annee_academique: string;
  semestre: Semestre;
  date_deliberation: Date;
  notes: Array<{
    cours_code: string;
    cours_nom: string;
    credits: number;
    note_finale: number;
    validation: 'admis' | 'ajourne';
  }>;
  credits_obtenus: number;
  credits_totaux: number;
  moyenne_generale: number;
  decision: 'admis' | 'ajourne' | 'redouble';
  mention?: string;
  observations?: string;
  signature_president?: string;
  signature_secretaire?: string;
}

// Template pour Relevé de notes
export interface IReleveData {
  etudiant: {
    nom: string;
    prenom: string;
    numero: string;
    date_naissance: Date;
    lieu_naissance: string;
    filiere: string;
    niveau: NiveauEtude;
  };
  annee_academique: string;
  semestre: Semestre;
  date_edition: Date;
  notes: Array<{
    cours_code: string;
    cours_nom: string;
    credits: number;
    note_cc?: number;
    note_examen?: number;
    note_finale: number;
    resultat: string;
  }>;
  moyenne_generale: number;
  credits_obtenus: number;
  credits_totaux: number;
  rang_classe?: number;
  effectif_classe?: number;
}

// Template pour Carte d'étudiant
export interface ICarteData {
  etudiant: {
    nom: string;
    prenom: string;
    numero: string;
    date_naissance: Date;
    filiere: string;
    niveau: NiveauEtude;
    photo_url?: string;
  };
  annee_academique: string;
  date_emission: Date;
  date_expiration: Date;
  code_barre?: string;
  qr_code?: string;
}