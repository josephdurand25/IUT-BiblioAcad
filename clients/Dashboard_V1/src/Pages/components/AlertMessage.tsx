import React, { useState } from 'react';

interface AlertMessageProps {
  message: string;
  success?: boolean;
  details?: React.ReactNode;
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message, success = false, details, onClose }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleDetails = () => {
    setIsDetailsOpen((prev) => !prev);
  };

  return (
    <div
      className={`relative rounded-md p-4 ${
        success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        onClick={onClose}
        aria-label="Fermer"
      >
        <i className="ri-close-line text-lg"></i>
      </button>
      <div className="flex">
        <div className="flex-shrink-0">
          {success ? (
            <i className="h-5 w-5 text-green-400 ri-check-circle-line"></i>
          ) : (
            <i className="h-5 w-5 text-red-400 ri-alert-circle-line"></i>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${success ? 'text-green-800' : 'text-red-800'}`}>{message}</p>
          {details && (
            <div className="mt-2">
              <button
                type="button"
                className="text-xs text-gray-600 hover:text-gray-800 underline flex items-center focus:outline-none"
                onClick={toggleDetails}
                aria-expanded={isDetailsOpen}
                aria-controls="alert-details"
              >
                {isDetailsOpen ? (
                  <>
                    <i className="ri-arrow-up-s-line mr-1"></i> Voir moins
                  </>
                ) : (
                  <>
                    <i className="ri-arrow-down-s-line mr-1"></i> Voir plus
                  </>
                )}
              </button>
              <div
                id="alert-details"
                className={`mt-2 text-xs text-gray-700 bg-gray-100 rounded p-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  isDetailsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{ transitionProperty: 'max-height, opacity' }}
              >
                {details}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;