import * as Yup from 'yup';

export const noteSchema = Yup.object().shape({
  etudiant_id: Yup.number()
    .required('L\'étudiant est requis')
    .positive('L\'ID étudiant doit être positif'),
  
  matiere_code: Yup.string()
    .required('La matière est requise')
    .max(20, 'Le code matière ne peut pas dépasser 20 caractères'),
  
  session_examen_id: Yup.number()
    .required('La session d\'examen est requise')
    .positive('L\'ID session doit être positif'),
  
  note_cc: Yup.number()
    .optional()
    .min(0, 'La note doit être between 0 et 20')
    .max(20, 'La note doit être entre 0 et 20')
    .typeError('La note doit être un nombre'),
  
  note_examen: Yup.number()
    .optional()
    .min(0, 'La note doit être entre 0 et 20')
    .max(20, 'La note doit être entre 0 et 20')
    .typeError('La note doit être un nombre'),
  
  note_tp: Yup.number()
    .optional()
    .min(0, 'La note doit être entre 0 et 20')
    .max(20, 'La note doit être entre 0 et 20')
    .typeError('La note doit être un nombre'),
  
  note_finale: Yup.number()
    .optional()
    .min(0, 'La note finale doit être entre 0 et 20')
    .max(20, 'La note finale ne doit pas dépasser 20')
    .typeError('La note doit être un nombre'),
  
  type_evaluation: Yup.string()
    .required('Le type d\'évaluation est requis')
    .oneOf(['CONTROLE_CONTINU', 'EXAMEN_FINAL', 'PROJET', 'ORAL'], 'Le type est invalide'),
  
  validee: Yup.boolean()
    .optional(),
  
  date_validation: Yup.date()
    .optional()
    .typeError('La date doit être valide'),
  
  commentaire: Yup.string()
    .optional()
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères'),
});

export const noteStepSchemas = [
  // Étape 1: Identification
  Yup.object().shape({
    etudiant_id: Yup.number()
      .required('L\'étudiant est requis'),
    matiere_code: Yup.string()
      .required('La matière est requise'),
    session_examen_id: Yup.number()
      .required('La session d\'examen est requise'),
  }),
  
  // Étape 2: Évaluations
  Yup.object().shape({
    note_cc: Yup.number()
      .optional()
      .min(0).max(20),
    note_examen: Yup.number()
      .optional()
      .min(0).max(20),
    note_tp: Yup.number()
      .optional()
      .min(0).max(20),
    type_evaluation: Yup.string()
      .required('Le type d\'évaluation est requis'),
  }),
  
  // Étape 3: Finalisation
  Yup.object().shape({
    note_finale: Yup.number()
      .optional()
      .min(0).max(20),
    validee: Yup.boolean()
      .optional(),
    commentaire: Yup.string()
      .optional(),
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
