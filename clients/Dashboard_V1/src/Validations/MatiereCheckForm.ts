import * as Yup from 'yup';

export const matiereSchema = Yup.object().shape({
  code: Yup.string()
    .required('Le code est requis')
    .max(20, 'Le code ne peut pas dépasser 20 caractères'),
  
  nom: Yup.string()
    .required('Le nom est requis')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  
  type_cours: Yup.string()
    .required('Le type de cours est requis')
    .oneOf(['CM', 'TD', 'TP', 'PROJET', 'STAGE'], 'Le type est invalide'),
  
  credits: Yup.number()
    .required('Les crédits sont requis')
    .positive('Les crédits doivent être positifs')
    .typeError('Les crédits doivent être un nombre'),
  
  coefficient: Yup.number()
    .required('Le coefficient est requis')
    .min(0, 'Le coefficient doit être entre 0 et 1')
    .max(1, 'Le coefficient doit être entre 0 et 1')
    .typeError('Le coefficient doit être un nombre'),
  
  volume_horaire: Yup.number()
    .required('Le volume horaire est requis')
    .positive('Le volume doit être positif')
    .typeError('Le volume doit être un nombre'),
  
  ue_code: Yup.string()
    .required('L\'UE est requise')
    .max(20, 'Le code UE ne peut pas dépasser 20 caractères'),
  
  enseignant_id: Yup.number()
    .optional()
    .positive('L\'ID enseignant doit être positif'),
  
  salle: Yup.string()
    .optional()
    .max(20, 'Le code salle ne peut pas dépasser 20 caractères'),
  
  jour: Yup.string()
    .optional()
    .max(10, 'Le jour ne peut pas dépasser 10 caractères'),
  
  heure_debut: Yup.string()
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format: HH:mm'),
  
  heure_fin: Yup.string()
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format: HH:mm'),
});

export const matiereStepSchemas = [
  // Étape 1: Identification
  Yup.object().shape({
    code: Yup.string()
      .required('Le code est requis'),
    nom: Yup.string()
      .required('Le nom est requis'),
    ue_code: Yup.string()
      .required('L\'UE est requise'),
  }),
  
  // Étape 2: Caractéristiques
  Yup.object().shape({
    type_cours: Yup.string()
      .required('Le type de cours est requis'),
    credits: Yup.number()
      .required('Les crédits sont requis'),
    coefficient: Yup.number()
      .required('Le coefficient est requis'),
    volume_horaire: Yup.number()
      .required('Le volume horaire est requis'),
  }),
  
  // Étape 3: Horaires et localisation
  Yup.object().shape({
    enseignant_id: Yup.number()
      .optional(),
    salle: Yup.string()
      .optional(),
    jour: Yup.string()
      .optional(),
    heure_debut: Yup.string()
      .optional(),
    heure_fin: Yup.string()
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
