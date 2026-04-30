// ==========================================
// NOTES
// ==========================================

import type { SessionExamen, TypeEvaluation } from "./IGeneral";

export interface INote {
  id?: number;
  etudiant_id: number;
  matiere_code: string;
  note_cc?: number;
  note_examen?: number;
  note_tp?: number;
  note_finale?: number;
  type_evaluation?: TypeEvaluation;
  validee?: boolean;
  date_validation?: Date | string;
  commentaire?: string;
  session?: SessionExamen;
  saisie_par_enseignant_id?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface INoteCreate extends Omit<INote, 'id' | 'note_finale' | 'validee' | 'created_at' | 'updated_at'> {}

export interface INoteUpdate extends Partial<Omit<INote, 'id' | 'etudiant_id' | 'matiere_code' | 'created_at' | 'updated_at'>> {}

export interface INoteDetails extends INote {
  numero_etudiant: string;
  nom_etudiant: string;
  prenom_etudiant: string;
  nom_matiere: string;
  unite_enseignement_code: string;
  nom_ue: string;
  coefficient_ue: number;
  nom_enseignant?: string;
  prenom_enseignant?: string;
  admis?: boolean;
  mention?: string;
}

export interface IGradeEntry {
  etudiant_id: number;
  note_cc?: number;
  note_examen?: number;
  note_tp?: number;
  commentaire?: string;
}

export interface IGradeBatch {
  matiere_code: string;
  session: SessionExamen;
  notes: IGradeEntry[];
}

export interface IGradeStatistics {
  matiere_code: string;
  moyenne_classe: number;
  note_min: number;
  note_max: number;
  nb_admis: number;
  nb_ajournes: number;
  taux_reussite: number;
  repartition_mentions: {
    passable: number;
    assez_bien: number;
    bien: number;
    tres_bien: number;
  };
  nombre_notes: number;
}

export interface INoteFilters {
  etudiant_id?: number;
  matiere_code?: string;
  unite_enseignement_code?: string;
  session?: SessionExamen;
  type_evaluation?: TypeEvaluation;
  validee?: boolean;
  admis?: boolean;
  note_min?: number;
  note_max?: number;
  saisie_par_enseignant_id?: number;
}

export const TYPES_EVALUATION: TypeEvaluation[] = ['CONTINUE', 'EXAMEN', 'RATTRAPAGE'];
export const SESSIONS_EXAMEN: SessionExamen[] = ['NORMALE', 'RATTRAPAGE', 'SPECIALE'];

// Fonctions utilitaires pour les notes
export const calculerNoteFinal = (
  note_cc?: number,
  note_examen?: number,
  note_tp?: number
): number => {
  try {
    const cc = note_cc || 0;
    const exam = note_examen || 0;
    const tp = note_tp || 0;
    
    let total = 0;
    let weightSum = 0;
    
    if (note_cc !== undefined) {
      const weight = (note_tp !== undefined) ? 0.3 : 0.4;
      total += cc * weight;
      weightSum += weight;
    }
    
    if (note_examen !== undefined) {
      const weight = (note_tp !== undefined) ? 0.5 : 0.6;
      total += exam * weight;
      weightSum += weight;
    }
    
    if (note_tp !== undefined) {
      const weight = 0.2;
      total += tp * weight;
      weightSum += weight;
    }
    
    if (weightSum === 0) return 0;
    
    const finalNote = weightSum === 1 ? total : total / weightSum;
    return Number(finalNote.toFixed(2));
  } catch (error) {
    console.error('Erreur dans calculerNoteFinal:', error);
    return 0;
  }
};

export const obtenirMention = (note: number): string => {
  if (note < 10) return 'Ajourné';
  if (note < 12) return 'Passable';
  if (note < 14) return 'Assez Bien';
  if (note < 16) return 'Bien';
  return 'Très Bien';
};