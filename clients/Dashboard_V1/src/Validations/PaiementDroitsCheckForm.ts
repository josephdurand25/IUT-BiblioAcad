import * as Yup from 'yup';

export const paiementDroitsSchema = Yup.object().shape({
  inscription_numero: Yup.string()
    .required('Le numéro d\'inscription est requis')
    .max(50, 'Le numéro d\'inscription ne peut pas dépasser 50 caractères'),
  
  montant_total: Yup.number()
    .required('Le montant total est requis')
    .positive('Le montant doit être positif')
    .typeError('Le montant doit être un nombre'),
  
  montant_paye: Yup.number()
    .required('Le montant payé est requis')
    .min(0, 'Le montant payé doit être positif ou zéro')
    .typeError('Le montant doit être un nombre')
    .test('max-total', 'Le montant payé ne doit pas dépasser le montant total', function(value) {
      const total = this.parent.montant_total;
      return !value || !total || value <= total;
    }),
  
  statut_paiement: Yup.string()
    .required('Le statut de paiement est requis')
    .oneOf(['IMPAYE', 'PARTIEL', 'COMPLET', 'EXONERE'], 'Le statut est invalide'),
  
  date_dernier_paiement: Yup.date()
    .optional()
    .typeError('La date doit être valide'),
  
  mode_paiement: Yup.string()
    .optional()
    .oneOf(['ESPECES', 'CHEQUE', 'VIREMENT', 'CARTE', 'EN_LIGNE'], 'Le mode de paiement est invalide'),
  
  reference: Yup.string()
    .optional()
    .max(100, 'La référence ne peut pas dépasser 100 caractères'),
});

export const paiementDroitsStepSchemas = [
  // Étape 1: Montants
  Yup.object().shape({
    montant_total: Yup.number()
      .required('Le montant total est requis')
      .positive('Le montant doit être positif'),
    montant_paye: Yup.number()
      .required('Le montant payé est requis')
      .min(0, 'Le montant doit être zéro ou positif'),
  }),
  
  // Étape 2: Statut et modes
  Yup.object().shape({
    statut_paiement: Yup.string()
      .required('Le statut de paiement est requis')
      .oneOf(['IMPAYE', 'PARTIEL', 'COMPLET', 'EXONERE'], 'Le statut est invalide'),
    mode_paiement: Yup.string()
      .optional(),
  }),
  
  // Étape 3: Références
  Yup.object().shape({
    reference: Yup.string()
      .optional(),
    date_dernier_paiement: Yup.date()
      .optional()
      .typeError('La date doit être valide'),
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
