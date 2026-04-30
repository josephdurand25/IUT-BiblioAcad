// ==========================================
// INSCRIPTIONS
// ==========================================

import type { ModePaiement, Semestre, StatutInscription, StatutPaiement } from "./IGeneral";



export interface IInscriptionGroupe {
  id?: number;
  numero_inscription: string;
  etudiant_id: number;
  groupe_cours_code: string;
  annee_academique: string;
  semestre: Semestre;
  statut?: StatutInscription;
  date_inscription: Date | string;
  date_validation?: Date | string;
  fiche_url?: string;
  valide_par_admin_id?: number;
  created_at?: Date | string;
}

export interface IPaiementDroits {
  id?: number;
  inscription_groupe_id: number;
  montant_total: number;
  montant_paye: number;
  statut_paiement?: StatutPaiement;
  mode_paiement: ModePaiement;
  reference_paiement?: string;
  date_paiement?: Date | string;
  date_echeance?: Date | string;
}