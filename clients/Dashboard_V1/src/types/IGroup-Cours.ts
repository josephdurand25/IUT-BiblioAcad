// ==========================================
// COURS (GroupeCours, UniteEnseignement, Matiere)
// ==========================================

import type { JourSemaine, Semestre, StatutGroupe, TypeCours, TypeUE } from "./IGeneral";

export interface IGroupeCours {
  code: string;
  nom: string;
  filiere_code?: string;
  niveau?: string;
  semestre: Semestre;
  annee_academique_code: string;
  credits_total?: number;
  capacite_max?: number;
  statut?: StatutGroupe;
  created_at?: Date | string;
}

export interface IGroupeCoursCreate extends IGroupeCours {}
export interface IGroupeCoursUpdate extends Partial<Omit<IGroupeCours, 'code'>> {}

export interface IGroupeCoursFilters {
  filiere_code?: string;
  niveau?: string;
  semestre?: Semestre;
  annee_academique_code?: string;
  statut?: StatutGroupe;
  search?: string;
}

export interface IUniteEnseignement {
  code: string;
  nom: string;
  type: TypeUE;
  credits: number;
  coefficient?: number;
  volume_horaire_total?: number;
  description?: string;
  groupe_cours_code: string;
}

export interface IUniteEnseignementCreate extends IUniteEnseignement {}
export interface IUniteEnseignementUpdate extends Partial<Omit<IUniteEnseignement, 'code'>> {}

export interface IMatiere {
  code: string;
  nom: string;
  type_cours: TypeCours;
  credits: number;
  coefficient?: number;
  volume_horaire?: number;
  salle_code?: string;
  jour?: JourSemaine;
  heure_debut?: string;
  heure_fin?: string;
  unite_enseignement_code: string;
  enseignant_id?: number;
}

export interface IMatiereCreate extends IMatiere {}
export interface IMatiereUpdate extends Partial<Omit<IMatiere, 'code'>> {}

export const SEMESTRES: Semestre[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
export const JOURS_SEMAINE: JourSemaine[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
export const TYPES_COURS: TypeCours[] = ['CM', 'TD', 'TP'];
export const TYPES_UE: TypeUE[] = ['OBLIGATOIRE', 'OPTIONNEL', 'TRANSVERSAL'];
