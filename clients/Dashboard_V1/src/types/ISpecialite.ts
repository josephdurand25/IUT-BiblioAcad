// ==========================================
// SPÉCIALITÉ (remplace Filière dans certains contextes)
// ==========================================

export interface ISpecialite {
  code: string;                    // PK VARCHAR(20)
  nom: string;                     // VARCHAR(150)
  niveaux_offerts?: string[];      // VARCHAR(50)[] - Tableau de niveaux
  responsable_id?: number;         // FK vers Enseignant
  filiere_code?: string;           // FK vers Filiere
  created_at?: Date | string;
}

export interface ISpecialiteCreate extends Omit<ISpecialite, 'created_at'> {}
export interface ISpecialiteUpdate extends Partial<Omit<ISpecialite, 'code' | 'created_at'>> {}

export interface ISpecialiteWithDetails extends ISpecialite {
  responsable_nom?: string;
  responsable_prenom?: string;
  filiere_nom?: string;
  nombre_groupes?: number;
  nombre_etudiants?: number;
}

export interface ISpecialiteFilters {
  filiere_code?: string;
  responsable_id?: number;
  niveau?: string;               // Recherche dans niveaux_offerts
  search?: string;
}