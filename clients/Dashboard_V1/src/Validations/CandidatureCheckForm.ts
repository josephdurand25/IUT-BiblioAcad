import * as Yup from 'yup';

export const candidatureSchema = Yup.object().shape({
  etudiant_id: Yup.number()
    .required('L\'étudiant est requis')
    .positive('L\'ID étudiant doit être positif'),
  
  date_candidature: Yup.date()
    .optional()
    .typeError('La date de candidature doit être valide'),
  
  statut: Yup.string()
    .required('Le statut est requis')
    .oneOf(['EN_ATTENTE', 'EN_EVALUATION', 'COMPLET', 'VALIDE', 'REJETE', 'ANNULE'], 'Le statut est invalide'),
  
  type_candidature: Yup.string()
    .optional()
    .max(50, 'Le type de candidature ne peut pas dépasser 50 caractères'),
  
  frais_dossier: Yup.number()
    .optional()
    .min(0, 'Les frais doivent être positifs'),
  
  frais_payes: Yup.number()
    .optional()
    .min(0, 'Les frais payés doivent être positifs'),
  
  etape_actuelle: Yup.string()
    .optional()
    .max(100, 'L\'étape ne peut pas dépasser 100 caractères'),
  
  date_limite_complet: Yup.date()
    .optional()
    .typeError('La date limite doit être valide'),
  
  specialite_demandee: Yup.string()
    .optional()
    .max(20, 'Le code de spécialité ne peut pas dépasser 20 caractères'),
  
  niveau_demande: Yup.string()
    .optional()
    .max(50, 'Le niveau demandé ne peut pas dépasser 50 caractères'),
});

export const candidatureStepSchemas = [
  // Étape 1: Statut et dates
  Yup.object().shape({
    statut: Yup.string()
      .required('Le statut est requis')
      .oneOf(['EN_ATTENTE', 'EN_EVALUATION', 'COMPLET', 'VALIDE', 'REJETE', 'ANNULE'], 'Le statut est invalide'),
    date_candidature: Yup.date()
      .optional()
      .typeError('La date de candidature doit être valide'),
  }),
  
  // Étape 2: Informations de candidature
  Yup.object().shape({
    type_candidature: Yup.string()
      .optional(),
    specialite_demandee: Yup.string()
      .optional(),
    niveau_demande: Yup.string()
      .optional(),
  }),
  
  // Étape 3: Frais et paiement
  Yup.object().shape({
    frais_dossier: Yup.number()
      .optional()
      .min(0, 'Les frais doivent être positifs'),
    frais_payes: Yup.number()
      .optional()
      .min(0, 'Les frais payés doivent être positifs'),
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
