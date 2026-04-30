import * as Yup from 'yup';

export const presenceSchema = Yup.object().shape({
  etudiant_id: Yup.number()
    .required('L\'étudiant est requis')
    .positive('L\'ID étudiant doit être positif'),
  
  seance_id: Yup.number()
    .required('La séance est requise')
    .positive('L\'ID séance doit être positif'),
  
  date_seance: Yup.date()
    .required('La date de la séance est requise')
    .typeError('La date doit être valide'),
  
  type_seance: Yup.string()
    .required('Le type de séance est requis')
    .max(50, 'Le type ne peut pas dépasser 50 caractères'),
  
  present: Yup.boolean()
    .required('L\'indication de présence est requise'),
  
  justification: Yup.string()
    .optional()
    .max(255, 'La justification ne peut pas dépasser 255 caractères'),
  
  signature: Yup.string()
    .optional()
    .max(100, 'La signature ne peut pas dépasser 100 caractères'),
});

export const presenceStepSchemas = [
  // Étape 1: Identification
  Yup.object().shape({
    etudiant_id: Yup.number()
      .required('L\'étudiant est requis')
      .positive('L\'ID étudiant doit être positif'),
    seance_id: Yup.number()
      .required('La séance est requise'),
    date_seance: Yup.date()
      .required('La date de la séance est requise'),
  }),
  
  // Étape 2: Présence et justification
  Yup.object().shape({
    present: Yup.boolean()
      .required('L\'indication de présence est requise'),
    justification: Yup.string()
      .optional()
      .when('present', {
        is: false,
        then: (schema) => schema.required('Une justification est requise en cas d\'absence'),
        otherwise: (schema) => schema.optional(),
      }),
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
