import * as Yup from 'yup';

/**
 * Utility functions for form validation
 * Provides common validation patterns used across the application
 */

/**
 * Validate a Yup schema and return errors in object format
 */
export const validateSchema = async <T>(
  schema: Yup.ObjectSchema<any>,
  data: T
): Promise<{ valid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return { valid: false, errors: yupToFormErrors(error) };
    }
    return { valid: false, errors: { general: 'Une erreur est survenue' } };
  }
};

/**
 * Validate a specific step in a multi-step schema
 */
export const validateStep = async <T>(
  stepSchema: Yup.ObjectSchema<any>,
  data: T
): Promise<{ valid: boolean; errors: Record<string, string> }> => {
  return validateSchema(stepSchema, data);
};

/**
 * Convert Yup validation error to form errors object
 */
export const yupToFormErrors = (error: Yup.ValidationError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  return errors;
};

/**
 * Validate all data against a schema
 */
export const validateFormData = async <T>(
  data: T,
  schema: Yup.ObjectSchema<any>
): Promise<Record<string, string>> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return {};
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return yupToFormErrors(error);
    }
    return { general: 'Une erreur de validation est survenue' };
  }
};

/**
 * Get validation rules for common field types
 */
export const commonValidations = {
  // Champs texte
  requiredString: (fieldName: string, minLength = 2, maxLength = 100) =>
    Yup.string()
      .required(`${fieldName} est requis`)
      .min(minLength, `${fieldName} doit contenir au moins ${minLength} caractères`)
      .max(maxLength, `${fieldName} ne peut pas dépasser ${maxLength} caractères`),

  optionalString: (fieldName: string, maxLength = 255) =>
    Yup.string()
      .optional()
      .max(maxLength, `${fieldName} ne peut pas dépasser ${maxLength} caractères`),

  // Email
  email: Yup.string()
    .email('L\'email doit être valide')
    .required('L\'email est requis')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),

  optionalEmail: Yup.string()
    .optional()
    .email('L\'email doit être valide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),

  // Téléphone
  phone: Yup.string()
    .matches(/^[+]?[0-9\s\-\(\)]{10,20}$/, 'Le numéro de téléphone est invalide')
    .required('Le téléphone est requis'),

  optionalPhone: Yup.string()
    .optional()
    .matches(/^[+]?[0-9\s\-\(\)]{10,20}$/, 'Le numéro de téléphone est invalide'),

  // Date
  date: Yup.date()
    .required('La date est requise')
    .typeError('La date doit être valide'),

  optionalDate: Yup.date()
    .optional()
    .typeError('La date doit être valide'),

  pastDate: Yup.date()
    .required('La date est requise')
    .max(new Date(), 'La date doit être dans le passé')
    .typeError('La date doit être valide'),

  optionalPastDate: Yup.date()
    .optional()
    .max(new Date(), 'La date doit être dans le passé')
    .typeError('La date doit être valide'),

  // Nombre
  positiveNumber: (fieldName: string) =>
    Yup.number()
      .required(`${fieldName} est requis`)
      .positive(`${fieldName} doit être positif`)
      .typeError(`${fieldName} doit être un nombre`),

  optionalPositiveNumber: (fieldName: string) =>
    Yup.number()
      .optional()
      .positive(`${fieldName} doit être positif`)
      .typeError(`${fieldName} doit être un nombre`),

  // Entre 0 et 20 (notes)
  grade: Yup.number()
    .optional()
    .min(0, 'La note doit être entre 0 et 20')
    .max(20, 'La note doit être entre 0 et 20')
    .typeError('La note doit être un nombre'),

  requiredGrade: Yup.number()
    .required('La note est requise')
    .min(0, 'La note doit être entre 0 et 20')
    .max(20, 'La note doit être entre 0 et 20')
    .typeError('La note doit être un nombre'),

  // URL
  url: Yup.string()
    .url('Doit être une URL valide')
    .required('L\'URL est requise'),

  optionalUrl: Yup.string()
    .optional()
    .url('Doit être une URL valide'),

  // Sélection (enum)
  select: (fieldName: string, options: string[]) =>
    Yup.string()
      .required(`${fieldName} est requis`)
      .oneOf(options, `${fieldName} est invalide`),

  optionalSelect: (fieldName: string, options: string[]) =>
    Yup.string()
      .optional()
      .oneOf(options, `${fieldName} est invalide`),
};
