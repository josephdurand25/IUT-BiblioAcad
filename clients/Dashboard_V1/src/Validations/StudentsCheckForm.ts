import * as Yup from 'yup';

export const studentsSchema = Yup.object().shape({
  prenom: Yup.string()
    .required('Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  
  nom: Yup.string()
    .required('Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  email: Yup.string()
    .email('L\'email doit être valide')
    .required('L\'email est requis')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  
  date_naissance: Yup.date()
    .required('La date de naissance est requise')
    .max(new Date(), 'La date de naissance doit être dans le passé')
    .typeError('La date de naissance doit être valide'),
  
  genre: Yup.string()
    .required('Le genre est requis')
    .oneOf(['M', 'F', 'AUTRE'], 'Le genre doit être M, F ou AUTRE'),
  
  telephone: Yup.string()
    .optional()
    .matches(/^[+]?[0-9\s\-()]{9,13}$/, 'Le numéro de téléphone est invalide'),
  
  lieu_naissance: Yup.string()
    .optional()
    .max(100, 'Le lieu de naissance ne peut pas dépasser 100 caractères'),
  
  nationalite: Yup.string()
    .optional()
    .max(100, 'La nationalité ne peut pas dépasser 100 caractères'),
  
  adresse_complete: Yup.string()
    .optional()
    .max(255, 'L\'adresse ne peut pas dépasser 255 caractères'),
  
  region_origine: Yup.string()
    .optional()
    .max(100, 'La région ne peut pas dépasser 100 caractères'),
  
  pays: Yup.string()
    .optional()
    .max(100, 'Le pays ne peut pas dépasser 100 caractères'),
  
  photo_profil: Yup.string()
    .optional()
    .url('La photo doit être une URL valide')
    .max(255, 'L\'URL de la photo ne peut pas dépasser 255 caractères'),
  
  date_inscription: Yup.date()
    .optional()
    .typeError('La date d\'inscription doit être valide'),
  
  specialite_code: Yup.string()
    .optional()
    .max(20, 'Le code de spécialité ne peut pas dépasser 20 caractères'),
  
  niveau: Yup.string()
    .required('Le niveau est requis')
    .oneOf(['L1', 'L2', 'L3', 'M1', 'M2'], 'Le niveau est invalide'),
  
  numero_etudiant: Yup.string()
    .optional()
    .max(50, 'Le numéro étudiant ne peut pas dépasser 50 caractères'),
});

// Schémas par étape pour le formulaire multi-étapes
export const studentsStepSchemas = [
  // Étape 1: Informations personnelles
  Yup.object().shape({
    prenom: Yup.string()
      .required('Le prénom est requis')
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    nom: Yup.string()
      .required('Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    date_naissance: Yup.date()
      .required('La date de naissance est requise')
      .typeError('La date de naissance doit être valide'),
    genre: Yup.string()
      .required('Le genre est requis')
      .oneOf(['M', 'F', 'AUTRE'], 'Le genre doit être M, F ou AUTRE'),
  }),
  
  // Étape 2: Contact et adresse
  Yup.object().shape({
    email: Yup.string()
      .email('L\'email doit être valide')
      .required('L\'email est requis'),
    telephone: Yup.string()
      .optional()
      .matches(/^[+]?[0-9\s\-\(\)]{10,20}$/, 'Le numéro de téléphone est invalide'),
    adresse_complete: Yup.string()
      .optional()
      .max(255, 'L\'adresse ne peut pas dépasser 255 caractères'),
    lieu_naissance: Yup.string()
      .optional(),
  }),
  
  // Étape 3: Informations complémentaires
  Yup.object().shape({
    nationalite: Yup.string()
      .optional(),
    region_origine: Yup.string()
      .optional(),
  }),
  
  // Étape 4: Informations académiques
  Yup.object().shape({
    niveau: Yup.string()
      .required('Le niveau est requis')
      .oneOf(['L1', 'L2', 'L3', 'M1', 'M2'], 'Le niveau est invalide'),
    specialite_code: Yup.string()
      .optional(),
    date_inscription: Yup.date()
      .optional()
      .typeError('La date d\'inscription doit être valide'),
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
