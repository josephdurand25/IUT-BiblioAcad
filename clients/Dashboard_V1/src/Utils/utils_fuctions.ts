import type { Genre } from "../types/IGeneral";

const utils_getImageUrl = (filename: string | null | undefined,  gender?: Genre) => {
  
  // Fonction pour les images par défaut locales
  const getLocalDefaultAvatar = () => {
    // Les images dans /public sont accessibles directement depuis la racine
    if (gender === 'M') {
      return '/images/default-avatar-male.png';
    }
    if (gender === 'F') {
      return '/images/default-avatar-female.png';
    }
    return '/images/default-avatar.png';
  };
  
  // Si pas de chemin, retourner l'image locale par défaut
  if (!filename) {
    return getLocalDefaultAvatar();
  }
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL || 'http://sigif-cm.com/uploads/candidatures';

  // filename stocké en BDD = 'photos/photo-...jpg'
  // → URL finale = 'http://sigif-cm.com/uploads/candidatures/photos/photo-...jpg'
  return `${uploadsBase}/${filename}`;
};

/**
 * Télécharge un fichier depuis le serveur.
 * @param filePath - chemin stocké en BDD ex: "cvs/cv-adjibaketek-...pdf"
 * @param filename - nom affiché lors du téléchargement ex: "CV_Durand_Jackson.pdf"
 */
export const downloadFile = (filePath: string, filename: string): void => {
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL || 'http://sigif-cm.com/uploads/candidatures';
  const url = `${uploadsBase}/${filePath}`;

  // Créer un lien temporaire et cliquer dessus
  const link = document.createElement('a');
  link.href = url;
  link.download = filename; // force le téléchargement au lieu d'ouvrir dans le navigateur
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


const formatAmount = (amount: number, currency: string = 'FCFA'): string => {
  return new Intl.NumberFormat('fr-CM').format(amount) + ` ${currency}`;
};

 const generateTransactionReference = (type: 'versement' | 'depense'): string => {
  const prefix = type === 'versement' ? 'VRS' : 'DEP';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

 const validatePhoneNumber = (phone: string, operator: 'orange' | 'mtn'): boolean => {
  const orangePattern = /^\+237(69|65)\d{7}$/;
  const mtnPattern = /^\+237(67|68)\d{7}$/;
  
  if (operator === 'orange') return orangePattern.test(phone);
  if (operator === 'mtn') return mtnPattern.test(phone);
  
  return orangePattern.test(phone) || mtnPattern.test(phone);
};

 const getPaymentMethodFromPhone = (phone: string): 'orange_money' | 'mtn_momo' | null => {
  if (/^\+237(69|65)\d{7}$/.test(phone)) return 'orange_money';
  if (/^\+237(67|68)\d{7}$/.test(phone)) return 'mtn_momo';
  return null;
};

 const calculateTransactionFees = (amount: number, method: string): number => {
  // Calcul des frais selon la méthode de paiement
  const feeRates = {
    orange_money: 0.02, // 2%
    mtn_momo: 0.025,    // 2.5%
    express_union: 0.03, // 3%
    virement: 0.01,     // 1%
    especes: 0,         // 0%
  };
  
  return Math.round(amount * (feeRates[method as keyof typeof feeRates] || 0));
};


 const calculateAge = (birthDateString: string): number => {
  if (!birthDateString) return 0;

  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Convertit un objet JavaScript (ex: DriverFormType) en FormData,
 * en gérant automatiquement les fichiers et tableaux.
 */
 function toFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Si la valeur est un tableau
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v instanceof File) {
          formData.append(`${key}[${i}]`, v);
        } else {
          formData.append(`${key}[${i}]`, String(v));
        }
      });
    }

    // Si c’est un fichier unique
    else if (value instanceof File) {
      formData.append(key, value);
    }

    // Si c’est un objet simple (non fichier)
    else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    }

    // Valeurs primitives (string, number, boolean, date, etc.)
    else {
      formData.append(key, String(value));
    }
  });

  return formData;
};


  export { utils_getImageUrl, formatAmount, generateTransactionReference, validatePhoneNumber, getPaymentMethodFromPhone, calculateTransactionFees, calculateAge, toFormData };