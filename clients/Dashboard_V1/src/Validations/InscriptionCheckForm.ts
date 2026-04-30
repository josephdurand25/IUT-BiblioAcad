import * as Yup from 'yup';

export const inscriptionSchema = Yup.object().shape({
  etudiant_id: Yup.number()
    .required('L\'étudiant est requis')
    .positive('L\'ID étudiant doit être positif'),
  
  annee_academique: Yup.string()
    .required('L\'année académique est requise')
    .matches(/^\d{4}-\d{4}$/, 'Format: 2023-2024'),
  
  date_inscription: Yup.date()
    .optional()
    .typeError('La date doit être valide'),
  
  date_validation: Yup.date()
    .optional()
    .typeError('La date doit être valide'),
  
  statut: Yup.string()
    .required('Le statut est requis')
    .oneOf(['EN_ATTENTE', 'VALIDE', 'REJETEE', 'ANNULEE'], 'Le statut est invalide'),
  
  dossier_inscription_url: Yup.string()
    .optional()
    .url('Doit être une URL valide')
    .max(255, 'L\'URL ne peut pas dépasser 255 caractères'),
});

export const inscriptionStepSchemas = [
  // Étape 1: Identification
  Yup.object().shape({
    etudiant_id: Yup.number()
      .required('L\'étudiant est requis'),
    annee_academique: Yup.string()
      .required('L\'année académique est requise'),
  }),
  
  // Étape 2: Dates et statut
  Yup.object().shape({
    date_inscription: Yup.date()
      .optional()
      .typeError('La date doit être valide'),
    statut: Yup.string()
      .required('Le statut est requis')
      .oneOf(['EN_ATTENTE', 'VALIDE', 'REJETEE', 'ANNULEE'], 'Le statut est invalide'),
  }),
];

export const yupToFormErrors = (error: Yup.ValidationError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  return errors;
};
