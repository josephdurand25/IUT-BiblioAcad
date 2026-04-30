// ==========================================
// SALLES
// ==========================================

import type { TypeSalle } from "./IGeneral";


export interface ISalle {
  code: string;
  nom: string;
  capacite: number;
  type: TypeSalle;
  equipements?: any;
}

export interface ISalleCreate extends ISalle {}
export interface ISalleUpdate extends Partial<Omit<ISalle, 'code'>> {}

export interface ISalleFilters {
  type?: TypeSalle;
  capacite_min?: number;
  capacite_max?: number;
  search?: string;
}

export interface IEquipements {
  projecteur?: boolean;
  tableau_blanc?: boolean;
  tableau_interactif?: boolean;
  ordinateurs?: number;
  climatisation?: boolean;
  internet?: boolean;
  micro?: boolean;
  sono?: boolean;
  webcam?: boolean;
  imprimante?: boolean;
  scanner?: boolean;
  materiel_labo?: string[];
  logiciels?: string[];
}
