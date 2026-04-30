import React, { useEffect } from 'react';

interface ToastProps {
  type: 'success' | 'error' | 'warning'; 
  message: string;
  // cause: string | null;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Définir les couleurs et icônes en fonction du type de toast
  const toastConfig = {
    success: {
      icon: 'ri-checkbox-circle-fill', // Icône de succès
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
    },
    error: {
      icon: 'ri-close-circle-fill', // Icône d'erreur
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: 'ri-error-warning-fill', // Icône d'avertissement
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-500',
    },
  };

  const { icon, bgColor, borderColor, iconColor } = toastConfig[type];

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center px-4 py-2 border-l-4 rounded-lg shadow-lg ${bgColor} ${borderColor}`}
      role="alert"
    >
      {/* Icône */}
      <i className={`${icon} ${iconColor} text-2xl mr-3`}></i>

      {/* Message */}
      {/* {cause !== null && 
        <p className="text-sm text-gray-800 first-letter:uppercase">{cause}</p>
      } */}
      <p className="text-sm text-gray-800 first-letter:uppercase">{message}</p>

      {/* Bouton de fermeture */}
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Fermer le toast"
      >
        <i className="ri-close-line text-xl"></i>
      </button>
    </div>
  );
};