import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../../../Contexts/StudentsContext';
import type { IEtudiant } from '../../../../server/src/types/Istudents';
import { Button } from '../../components/Button';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    data: IEtudiant | null;
};

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, data }) => {
  const navigate = useNavigate();
  const { state, actions } = useStudents();
  const student = data;

  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      actions.toggleModal('studentDelete', false);
    }
  };

  const handleConfirm = async () => {
    if (student?.id) {
      await actions.deleteStudent(student.id);
      
      // Si la suppression a réussi
      if (state.success) {
        handleClose();
        // Rediriger vers la liste des étudiants
        navigate('/students');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay - DOIT ÊTRE LE PREMIER */}
      <div
        className="fixed inset-0 bg-black/70 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={handleClose}
      ></div>

      {/* Container pour centrer le modal */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
        {/* Cet élément est nécessaire pour centrer verticalement */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Bouton de fermeture optionnel en haut à droite */}
          <Button
            title='close'
            action={handleClose}
            supStyle="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={state.processing}
          >
            <i className="ri-close-line text-xl"></i>
          </Button>

          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <i className="ri-alert-line text-xl text-red-600"></i>
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Suppression 
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer{' '}
                  <span className="font-semibold text-gray-900">
                    {student?.prenom} {student?.nom}
                  </span>{' '}
                  ?
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Cette action est <span className="font-semibold text-red-600">irréversible</span>.
                  Toutes les données associées à cet étudiant seront définitivement supprimées,
                  incluant :
                </p>
                <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Informations personnelles et académiques</li>
                  <li>Inscriptions aux cours</li>
                  <li>Notes et résultats</li>
                  <li>Historique de présence</li>
                </ul>
              </div>

              {/* Afficher les erreurs s'il y en a */}
              {state.message && !state.success && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="ri-error-warning-line text-red-400"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{state.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="button"
              action={handleConfirm}
              disabled={state.processing}
              supStyle="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <i className="ri-delete-bin-line mr-2"></i>
                  Supprimer définitivement
                </>
              )}
            </Button>
            <Button
              type="button"
              action={handleClose}
              disabled={state.processing}
              supStyle="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;