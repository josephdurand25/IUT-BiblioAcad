import axios from "axios";
import type { ApiErrorValidationResponse, ApiErrorResponse } from '../types/api';

type ApiErrorType = ApiErrorResponse | ApiErrorValidationResponse;
export const handleApiError = (
  error: any,
  setErrors: (errors: Record<string, string>) => void,
  setMessage: (message: string | undefined) => void,
  setErrorType: (type: string | null) => void,
  setCause: (cause: string | undefined) => void
) => {
  console.log('handleApiError error: ', error);

  // Vérifier si l'erreur est une erreur personnalisée de l'intercepteur
  if (error && typeof error === 'object' && 'type' in error) {
    const errorType = (error as any).type;
    const errorData = (error as any).data as ApiErrorType | undefined;
    const errorCause = (error as any).cause;
    const errorStatus = (error as any).status;
    const errorErrors = (error as any).errors;

    if (errorType === 'validation' && errorErrors) {
      // Erreur de validation (422)
      const flattenedErrors: Record<string, string> = {};
      Object.entries(errorErrors).forEach(([field, messages]) => {
        flattenedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
      });
      setErrors(flattenedErrors);
      setMessage(error.message ?? "Veuillez corriger les erreurs dans le formulaire");
      setErrorType("server");
      setCause(errorCause ?? error.message);
    } else if (errorType === 'server' && errorData && 'error' in errorData) {
      // Erreur serveur de type ApiErrorResponse
      setErrors({});
      setMessage(errorData.message ?? "Un problème est survenu lors du traitement de la demande");
      setErrorType("server");
      setCause(errorData.error); // Utiliser data.error pour state.cause
    } else if (errorType === 'server') {
      // Autre erreur serveur
      setErrors({});
      setMessage(errorData?.message ?? "Un problème est survenu lors du traitement de la demande");
      setErrorType("server");
      setCause(errorCause ?? error.message ?? "Erreur serveur non précisée");
    } else if (errorType === 'network') {
      // Erreur réseau
      setErrors({});
      setMessage(error.message ?? "Aucune réponse du serveur");
      setErrorType("network");
      setCause(errorCause ?? "Erreur réseau");
    } else if (errorType === 'axios') {
      // Erreur de configuration Axios
      setErrors({});
      setMessage(error.message ?? "Erreur de configuration de la requête");
      setErrorType("unexpected");
      setCause(errorCause ?? error.message ?? "Erreur Axios");
    } else {
      // Erreur inconnue
      setErrors({});
      setMessage(error.message ?? "Erreur inconnue");
      setErrorType("unexpected");
      setCause(errorCause ?? error.message ?? "Cause non précisée");
    }
  } else if (axios.isAxiosError(error)) {
    // Gestion des erreurs Axios non interceptées (cas rare avec l'intercepteur actuel)
    if (error.response) {
      const responseData = error.response.data as ApiErrorType;

      if (error.response.status === 422 && "errors" in responseData && responseData.errors) {
        const validationErrors = responseData.errors;
        const flattenedErrors: Record<string, string> = {};
        Object.entries(validationErrors).forEach(([field, messages]) => {
          flattenedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(flattenedErrors);
        setMessage(responseData.message ?? "Veuillez corriger les erreurs dans le formulaire");
        setErrorType("server");
        setCause(responseData.message);
      } else if ("error" in responseData) {
        setErrors({});
        setMessage(responseData.message ?? "Un problème est survenu lors du traitement de la demande");
        setErrorType("server");
        setCause(responseData.error);
      } else {
        setErrors({});
        setMessage(responseData.message ?? "Un problème est survenu lors du traitement de la demande");
        setErrorType("server");
        setCause(responseData.message ?? "Erreur serveur non précisée");
      }
    } else if (error.request) {
      setErrors({});
      setMessage(error.message + ": la requête n'a pas atteint l'ordinateur cible");
      setErrorType("network");
      setCause(error.code || error.message);
    } else {
      setErrors({});
      setMessage(error.message ?? "Erreur inattendue");
      setErrorType("unexpected");
      setCause(error.message ?? "Erreur inattendue");
    }
  } else {
    // Erreurs non-Axios et non interceptées
    setErrors({});
    setMessage(error?.message ?? "Une erreur inattendue est survenue");
    setErrorType("unexpected");
    setCause(error?.message ?? "Cause non précisée");
  }
};