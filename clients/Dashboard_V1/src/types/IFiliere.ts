// ==========================================
// FILIÈRES
// ==========================================

export interface IFiliere {
  code: string;
  nom: string;
  departement: string;
  niveaux_offerts?: any;
  responsable_id?: number;
}

export interface IFiliereCreate extends IFiliere {}
export interface IFiliereUpdate extends Partial<Omit<IFiliere, 'code'>> {}

export interface IFiliereWithDetails extends IFiliere {
  responsable_nom?: string;
  responsable_prenom?: string;
  responsable_email?: string;
  nombre_groupes?: number;
  nombre_etudiants?: number;
  nombre_enseignants?: number;
}

export interface IFiliereFilters {
  departement?: string;
  responsable_id?: number;
  search?: string;
}