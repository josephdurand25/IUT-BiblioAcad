import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useCandidature } from '../../../Contexts/CandidatureContext';

const CandidatureSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { actions } = useCandidature();

  useEffect(() => {
    // clear any leftover state/errors after submission
    actions.resetErrors();
    actions.setSelectedCandidature(null);
  }, [actions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-md">
        {/* Icône de succès */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Candidature soumise avec succès !
        </h1>

        {/* Descripción */}
        <p className="text-lg text-gray-600 mb-4">
          Votre dossier de candidature a été enregistré avec succès.
        </p>

        {/* Détails */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <i className="ri-checkbox-circle-line text-green-600 mr-2"></i>
            Prochaines étapes
          </h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3 flex-shrink-0">
                1
              </span>
              <span>
                <strong>Confirmation par email</strong>
                <br />
                Consultez votre boîte de réception pour recevoir une copie de votre dossier.
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3 flex-shrink-0">
                2
              </span>
              <span>
                <strong>Évaluation</strong>
                <br />
                Votre candidature sera examinée par notre commission d'admission.
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3 flex-shrink-0">
                3
              </span>
              <span>
                <strong>Notification résultat</strong>
                <br />
                Vous serez notifié par email de la décision (généralement dans 2-4 semaines).
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mr-3 flex-shrink-0">
                4
              </span>
              <span>
                <strong>Ouverture du compte</strong>
                <br />
                Si accepté, vous recevrez vos identifiants de connexion par email.
              </span>
            </li>
          </ol>
        </div>

        {/* Infos importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <i className="ri-information-line mr-2"></i>
            Important
          </h3>
          <p className="text-sm text-blue-800">
            Veuillez vérifier votre dossier de fichiers indésirables/spam au cas où notre email terminerait là.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            action={() => navigate('/')}
            variant="perso"
            supStyle="w-full px-6 py-3 border border-transparent text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
          >
            <i className="ri-home-line mr-2"></i>
            Retour à l'accueil
          </Button>
          <Button
            action={() => navigate('/candidatures/form')}
            variant="perso"
            supStyle="w-full px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 font-medium"
          >
            <i className="ri-add-line mr-2"></i>
            Soumettre une autre candidature
          </Button>
        </div>

        {/* Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Vous avez des questions ?
          </p>
          <p className="text-sm">
            <a href="mailto:admissions@example.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contactez notre service d'admission
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidatureSuccess;
