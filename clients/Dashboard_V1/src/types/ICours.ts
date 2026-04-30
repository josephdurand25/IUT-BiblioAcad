// ==========================================
// INTERFACES MISES À JOUR - NOUVELLE STRUCTURE BDD POSTGRESQL
// Basé sur le script SQL fourni avec Specialite, GroupeUE, UniteEnseignement, Matiere
// ==========================================

import type { JourSemaine, Semestre, StatutGroupe, TypeCours, TypeUE, TypeSalle } from "./IGeneral";



// ==========================================
// GROUPE UE (Groupe d'Unités d'Enseignement)
// ==========================================

export interface IGroupeUE {
  code: string;                    // PK VARCHAR(20)
  nom: string;                     // VARCHAR(150)
  niveau: string;                  // VARCHAR(50)
  semestre: Semestre;              // 'S1' à 'S6'
  credits_total: number;           // INTEGER
  capacite_max: number;            // INTEGER
  statut: StatutGroupe;            // 'ACTIF', 'COMPLET', 'INACTIF'
  specialite_code: string;         // FK vers Specialite
  created_at?: Date | string;
}

export interface IGroupeUECreate extends Omit<IGroupeUE, 'created_at'> {}
export interface IGroupeUEUpdate extends Partial<Omit<IGroupeUE, 'code' | 'created_at'>> {}

export interface IGroupeUEWithDetails extends IGroupeUE {
  specialite_nom?: string;
  filiere_code?: string;
  filiere_nom?: string;
  nombre_inscrits?: number;
  places_disponibles?: number;
  taux_occupation?: number;
  unites_enseignement?: IUniteEnseignement[];
}

export interface IGroupeUEFilters {
  specialite_code?: string;
  filiere_code?: string;
  niveau?: string;
  semestre?: Semestre;
  statut?: StatutGroupe;
  search?: string;
  avec_ues?: boolean;              // Inclure les UE
  avec_etudiants?: boolean;        // Inclure nombre d'étudiants
  capacite_min?: number;
  capacite_max?: number;
}

// ==========================================
// UNITÉ D'ENSEIGNEMENT (UE)
// ==========================================

export interface IUniteEnseignement {
  code: string;                    // PK VARCHAR(20)
  nom: string;                     // VARCHAR(200)
  type: TypeUE;                    // 'OBLIGATOIRE', 'OPTIONNELLE', 'TRANSVERSALE', 'PROJET'
  credits: number;                 // INTEGER
  volume_horaire_total: number;    // INTEGER
  description?: string;            // TEXT
  created_at?: Date | string;
  ue_groupe?: Partial<IGroupeUE>;            // TEXT
  ue_groupe_code?: string;            // TEXT
  // Note: Pas de groupe_cours_code dans ta BDD - liaison via table intermédiaire ?
}

export interface IUniteEnseignementCreate extends Omit<IUniteEnseignement, 'created_at'> {}
export interface IUniteEnseignementUpdate extends Partial<Omit<IUniteEnseignement, 'code' | 'created_at'>> {}

export interface IUniteEnseignementWithDetails extends IUniteEnseignement {
  matieres?: IMatiere[];
  nombre_matieres?: number;
  volume_horaire_reel?: number;    // Somme des volumes horaires des matières
}

export interface IUniteEnseignementFilters {
  type?: TypeUE;
  credits_min?: number;
  credits_max?: number;
  volume_horaire_min?: number;
  volume_horaire_max?: number;
  search?: string;
  avec_matieres?: boolean;
}

// ==========================================
// MATIÈRE
// ==========================================

export interface IMatiere {
  code: string;                    // PK VARCHAR(20)
  nom: string;                     // VARCHAR(200)
  type_cours: TypeCours;           // 'CM', 'TD', 'TP', 'PROJET', 'STAGE'
  credits: number;                 // INTEGER
  coefficient: number;             // DECIMAL(3,2)
  volume_horaire: number;          // INTEGER
  salle_par_defaut?: string;       // FK vers Salle (code)
  jour_par_defaut?: JourSemaine;   // Jour de la semaine
  heure_debut_par_defaut?: string; // TIME
  heure_fin_par_defaut?: string;   // TIME
  ue_code: string;                 // FK vers UniteEnseignement
  enseignant_id?: number;          // FK vers Enseignant
  created_at?: Date | string;
}

export interface IMatiereCreate extends Omit<IMatiere, 'created_at'> {}
export interface IMatiereUpdate extends Partial<Omit<IMatiere, 'code' | 'created_at'>> {}

export interface IMatiereWithDetails extends IMatiere {
  salle_nom?: string;
  salle_capacite?: number;
  salle_type?: TypeSalle;
  enseignant_nom?: string;
  enseignant_prenom?: string;
  enseignant_matricule?: string;
  ue_nom?: string;
  ue_type?: TypeUE;
  ue_credits?: number;
}

export interface IMatiereFilters {
  ue_code?: string;
  type_cours?: TypeCours;
  enseignant_id?: number;
  jour_par_defaut?: JourSemaine;
  search?: string;
  credits_min?: number;
  credits_max?: number;
  volume_horaire_min?: number;
  volume_horaire_max?: number;
  salle_par_defaut?: string;
  avec_details?: boolean;
}

// ==========================================
// SÉANCE (Cours programmés)
// ==========================================

export interface ISeance {
  id: number;                      // SERIAL
  matiere_code: string;            // FK vers Matiere
  salle_code: string;              // FK vers Salle
  date_seance: Date | string;      // DATE
  heure_debut: string;             // TIME
  heure_fin: string;               // TIME
  type_seance: 'CM' | 'TD' | 'TP' | 'EXAMEN' | 'RATTRAPAGE';
  enseignant_id?: number;          // FK vers Enseignant
  created_at?: Date | string;
}

export interface ISeanceCreate extends Omit<ISeance, 'id' | 'created_at'> {}
export interface ISeanceUpdate extends Partial<Omit<ISeance, 'id' | 'created_at'>> {}

export interface ISeanceWithDetails extends ISeance {
  matiere_nom?: string;
  salle_nom?: string;
  salle_capacite?: number;
  enseignant_nom?: string;
  enseignant_prenom?: string;
}

// ==========================================
// SALLE
// ==========================================

export interface ISalle {
  code: string;                    // PK VARCHAR(20)
  nom: string;                     // VARCHAR(100)
  capacite: number;                // INTEGER
  type: TypeSalle;                 // VARCHAR(50)
  equipements?: string[];          // TEXT[] - Tableau de strings
  created_at?: Date | string;
}

export interface ISalleCreate extends Omit<ISalle, 'created_at'> {}
export interface ISalleUpdate extends Partial<Omit<ISalle, 'code' | 'created_at'>> {}

export interface ISalleWithDetails extends ISalle {
  nombre_seances?: number;         // Nombre de séances programmées
  taux_occupation?: number;        // Pourcentage d'occupation
}

export interface ISalleFilters {
  type?: TypeSalle;
  capacite_min?: number;
  capacite_max?: number;
  search?: string;
  equipements_recherches?: string[];
  disponible_horaire?: {
    date?: Date | string;
    heure_debut?: string;
    heure_fin?: string;
  };
}

// ==========================================
// FILIÈRE (Table indépendante)
// ==========================================

export interface IFiliere {
  code: string;                    // PK VARCHAR(20)
  nom: string;                     // VARCHAR(150)
  departement: string;             // VARCHAR(100)
  responsable_id?: number;         // FK vers Enseignant
  date_creation?: Date | string;   // DATE
  statut?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IFiliereCreate extends Omit<IFiliere, 'created_at' | 'updated_at'> {}
export interface IFiliereUpdate extends Partial<Omit<IFiliere, 'code' | 'created_at' | 'updated_at'>> {}

export interface IFiliereWithDetails extends IFiliere {
  responsable_nom?: string;
  responsable_prenom?: string;
  nombre_specialites?: number;
  nombre_etudiants?: number;
}

export interface IFiliereFilters {
  departement?: string;
  responsable_id?: number;
  statut?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  search?: string;
}

// ==========================================
// ANNÉE ACADÉMIQUE
// ==========================================

export interface IAnneeAcademique {
  annee: string;                   // PK VARCHAR(9) - Format: "2023-2024"
  date_debut: Date | string;       // DATE
  date_fin: Date | string;         // DATE
  statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ARCHIVEE';
  created_at?: Date | string;
}

export interface IAnneeAcademiqueCreate extends Omit<IAnneeAcademique, 'created_at'> {}
export interface IAnneeAcademiqueUpdate extends Partial<Omit<IAnneeAcademique, 'annee' | 'created_at'>> {}

// ==========================================
// SESSION EXAMEN
// ==========================================

export interface ISessionExamen {
  id: number;                      // SERIAL
  libelle: string;                 // VARCHAR(50) - Ex: "06-2026"
  type: 'NORMALE' | 'RATTRAPAGE' | 'SPECIALE';
  date_debut: Date | string;       // DATE
  date_fin: Date | string;         // DATE
  annee_academique: string;        // FK vers AnneeAcademique
  statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'CLOTUREE';
  created_at?: Date | string;
}

export interface ISessionExamenCreate extends Omit<ISessionExamen, 'id' | 'created_at'> {}
export interface ISessionExamenUpdate extends Partial<Omit<ISessionExamen, 'id' | 'created_at'>> {}

// ==========================================
// INSCRIPTION
// ==========================================

export interface IInscription {
  numero_inscription: string;      // PK VARCHAR(50)
  etudiant_id: number;             // FK vers Etudiant
  annee_academique: string;        // FK vers AnneeAcademique
  date_inscription?: Date | string;
  date_validation?: Date | string;
  dossier_inscription_url?: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETEE' | 'ANNULEE';
  created_at?: Date | string;
}

export interface IInscriptionCreate extends Omit<IInscription, 'created_at'> {}
export interface IInscriptionUpdate extends Partial<Omit<IInscription, 'numero_inscription' | 'created_at'>> {}

// Table de liaison Inscription - GroupeUE
export interface IInscriptionGroupeUE {
  id: number;                      // SERIAL
  inscription_numero: string;      // FK vers Inscription
  groupeue_code: string;           // FK vers GroupeUE
  date_inscription?: Date | string;
  statut: 'INSCRIT' | 'VALIDEE' | 'ANNULEE';
  created_at?: Date | string;
}

export interface IInscriptionGroupeUECreate extends Omit<IInscriptionGroupeUE, 'id' | 'created_at'> {}

// ==========================================
// STATISTIQUES
// ==========================================

export interface IGroupeUEStatistics {
  total_groupes: number;
  groupes_actifs: number;
  groupes_complets: number;
  groupes_inactifs: number;
  capacite_totale: number;
  nombre_inscrits_total: number;
  taux_occupation_moyen: number;
  par_specialite: Array<{
    specialite_code: string;
    specialite_nom: string;
    nombre_groupes: number;
    nombre_inscrits: number;
  }>;
  par_niveau: Array<{
    niveau: string;
    nombre_groupes: number;
    nombre_inscrits: number;
  }>;
  par_semestre: Array<{
    semestre: Semestre;
    nombre_groupes: number;
    nombre_inscrits: number;
  }>;
}

export interface IUniteEnseignementStatistics {
  total_ues: number;
  par_type: {
    OBLIGATOIRE: number;
    OPTIONNELLE: number;
    TRANSVERSALE: number;
    PROJET: number;
  };
  credits_total: number;
  volume_horaire_total: number;
  ues_avec_matieres: number;
  ues_sans_matieres: number;
}

export interface IMatiereStatistics {
  total_matieres: number;
  par_type: {
    CM: number;
    TD: number;
    TP: number;
    PROJET: number;
    STAGE: number;
  };
  volume_horaire_total: number;
  credits_total: number;
  par_ue: Array<{
    ue_code: string;
    ue_nom: string;
    nombre_matieres: number;
    volume_horaire: number;
  }>;
  par_enseignant: Array<{
    enseignant_id: number;
    enseignant_nom: string;
    nombre_matieres: number;
    volume_horaire: number;
  }>;
}

// ==========================================
// COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
// ==========================================

// Alias pour compatibilité
export type ICours = IMatiere;
export type ICoursCreate = IMatiereCreate;
export type ICoursUpdate = IMatiereUpdate;
export type ICoursFilters = IMatiereFilters;

// Interface étendue pour inclure les anciens champs
export interface ICoursCompat extends IMatiere {
  // Mapping vers nouvelle structure
  filiere?: string;                // Via GroupeUE → Specialite → Filiere
  niveau?: string;                 // Via GroupeUE
  semestre?: Semestre;             // Via GroupeUE
  professeur?: string;             // enseignant_nom + prenom
  statut?: string;                 // À gérer selon la logique métier
  annee_academique?: string;       // Via Inscription
  description_cours?: string;      // description de l'UE
  prerequis?: string;              // À gérer dans logique métier
}

// ==========================================
// CONSTANTES
// ==========================================

export const TYPES_SEANCE = ['CM', 'TD', 'TP', 'EXAMEN', 'RATTRAPAGE'] as const;
export const STATUTS_GROUPE: StatutGroupe[] = ['OUVERT', 'COMPLET', 'FERME', 'ANNULE'];
export const STATUTS_INSCRIPTION = ['EN_ATTENTE', 'VALIDE', 'REJETEE', 'ANNULEE'] as const;
export const STATUTS_SESSION = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'CLOTUREE'] as const;
export const STATUTS_ANNEE = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ARCHIVEE'] as const;
export const TYPES_SESSION: Array<'NORMALE' | 'RATTRAPAGE' | 'SPECIALE'> = ['NORMALE', 'RATTRAPAGE', 'SPECIALE'];

// ==========================================
// HELPERS
// ==========================================

/**
 * Génère le code d'une matière selon le pattern UE_TYPE
 * Ex: PROG_CM, PROG_TD, PROG_TP
 */
export function genererCodeMatiere(ue_code: string, type_cours: TypeCours): string {
  return `${ue_code}_${type_cours}`;
}

/**
 * Vérifie si une salle est disponible pour un horaire donné
 */
export interface IDisponibiliteSalle {
  disponible: boolean;
  seances_conflits?: ISeance[];
}

/**
 * Calcule le taux d'occupation d'un groupe
 */
export function calculerTauxOccupation(nombre_inscrits: number, capacite_max: number): number {
  if (capacite_max === 0) return 0;
  return Math.round((nombre_inscrits / capacite_max) * 100);
}