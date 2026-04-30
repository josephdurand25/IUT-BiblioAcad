/**
 * Centralized export file for all form validations
 * Cette fichier centralise l'import de tous les schémas de validation
 */

// Students validation
export {
  studentsSchema,
  studentsStepSchemas,
  yupToFormErrors as studentsYupToFormErrors
} from './StudentsCheckForm';

// Candidature validation
export {
  candidatureSchema,
  candidatureStepSchemas,
  yupToFormErrors as candidatureYupToFormErrors
} from './CandidatureCheckForm';

// Presence validation
export {
  presenceSchema,
  presenceStepSchemas,
  yupToFormErrors as presenceYupToFormErrors
} from './PresenceCheckForm';

// Paiement Droits validation
export {
  paiementDroitsSchema,
  paiementDroitsStepSchemas,
  yupToFormErrors as paiementDroitsYupToFormErrors
} from './PaiementDroitsCheckForm';

// Note validation
export {
  noteSchema,
  noteStepSchemas,
  yupToFormErrors as noteYupToFormErrors
} from './NoteCheckForm';

// Inscription validation
export {
  inscriptionSchema,
  inscriptionStepSchemas,
  yupToFormErrors as inscriptionYupToFormErrors
} from './InscriptionCheckForm';

// Matiere validation
export {
  matiereSchema,
  matiereStepSchemas,
  yupToFormErrors as matiereYupToFormErrors
} from './MatiereCheckForm';

// Validation Utilities
export {
  validateSchema,
  validateStep,
  yupToFormErrors,
  validateFormData,
  commonValidations
} from './ValidationUtils';

// Type for validation error handling
export type { Yup } from 'yup';
