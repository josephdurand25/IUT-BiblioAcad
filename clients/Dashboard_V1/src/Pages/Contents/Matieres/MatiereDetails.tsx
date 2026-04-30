import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { useMatieres } from '../../../Contexts/MatiereContext';
import type { IMatiereWithDetails } from '../../../types/IMatiere';
import type { JourSemaine, TypeCours } from '../../../types/IGeneral';

const MatiereDetails: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { state, actions } = useMatieres();
  const [activeTab, setActiveTab] = useState<'infos' | 'etudiants' | 'seances' | 'stats'>('infos');

  useEffect(() => {
    if (code) {
      actions.fetchMatiereByCode(code);
    }
  }, [code]);

  const matiere = state.selectedMatiere as IMatiereWithDetails;

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la matière "${matiere?.nom}" ?`)) {
      await actions.deleteMatiere(code!);
      if (state.success) {
        navigate('/matieres');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/matieres/${code}/edit`);
  };

  const getTypeCoursColor = (type: TypeCours) => {
    switch (type) {
      case 'CM': return 'bg-blue-100 text-blue-800';
      case 'TD': return 'bg-green-100 text-green-800';
      case 'TP': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeCoursLabel = (type: TypeCours) => {
    const labels: Record<TypeCours, string> = {
      'CM': 'Cours Magistral',
      'TD': 'Travaux Dirigés',
      'TP': 'Travaux Pratiques'
    };
    return labels[type];
  };

  const getJourLabel = (jour?: JourSemaine) => {
    if (!jour) return '—';
    const labels: Record<JourSemaine, string> = {
      'LUNDI': 'Lundi',
      'MARDI': 'Mardi',
      'MERCREDI': 'Mercredi',
      'JEUDI': 'Jeudi',
      'VENDREDI': 'Vendredi',
      'SAMEDI': 'Samedi'
    };
    return labels[jour];
  };

  if (state.processing && !matiere) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" variant="primary" />
      </div>
    );
  }

  if (!matiere && !state.processing) {
    return (
      <div className="text-center py-12">
        <i className="ri-error-warning-line text-6xl text-gray-400"></i>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Matière non trouvée</h3>
        <p className="mt-2 text-sm text-gray-500">
          La matière que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Button
          variant="accent"
          size="medium"
          action={() => navigate('/matieres')}
          supStyle="mt-6"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              Tableau de bord
            </Link>
          </li>
          <li>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </li>
          <li>
            <Link to="/matieres" className="text-gray-500 hover:text-gray-700">
              Matières
            </Link>
          </li>
          <li>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </li>
          <li className="text-gray-900 font-medium">
            {matiere?.code}
          </li>
        </ol>
      </nav>

      {/* En-tête */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                <i className="ri-book-2-line text-3xl text-indigo-600"></i>
              </div>
            </div>
            <div className="ml-6 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {matiere?.nom}
                </h1>
                <span className={clsx(
                  'px-3 py-1 text-sm font-semibold rounded-full',
                  getTypeCoursColor(matiere?.type_cours as TypeCours)
                )}>
                  {matiere?.type_cours}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Code: {matiere?.code}
              </p>
              {matiere?.ue_nom && (
                <p className="text-sm text-gray-600 mt-1">
                  <i className="ri-folder-line mr-1"></i>
                  UE: {matiere.ue_nom} ({matiere.ue_code})
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="medium"
              icon="ri-edit-line"
              iconPosition="left"
              action={handleEdit}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              size="medium"
              icon="ri-delete-bin-line"
              iconPosition="left"
              action={handleDelete}
              disabled={state.processing}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <Button
              variant="perso"
              action={() => setActiveTab('infos')}
              supStyle={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'infos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <i className="ri-information-line mr-2"></i>
              Informations
            </Button>
            <Button
              variant="perso"
              action={() => setActiveTab('etudiants')}
              supStyle={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'etudiants'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <i className="ri-user-line mr-2"></i>
              Étudiants
            </Button>
            <Button
              variant="perso"
              action={() => setActiveTab('seances')}
              supStyle={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'seances'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <i className="ri-calendar-line mr-2"></i>
              Séances
            </Button>
            <Button
              variant="perso"
              action={() => setActiveTab('stats')}
              supStyle={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'stats'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <i className="ri-bar-chart-line mr-2"></i>
              Statistiques
            </Button>
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Informations */}
          {activeTab === 'infos' && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informations générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Type de cours
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getTypeCoursLabel(matiere?.type_cours as TypeCours)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Unité d'Enseignement
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.ue_nom || '—'}
                      {matiere?.ue_code && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({matiere.ue_code})
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Crédits ECTS
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.credits}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Coefficient
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.coefficient}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Volume horaire
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.volume_horaire}h
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Enseignant
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.enseignant_nom && matiere?.enseignant_prenom
                        ? `${matiere.enseignant_prenom} ${matiere.enseignant_nom}`
                        : 'Non assigné'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Planning par défaut
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Jour
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getJourLabel(matiere?.jour as JourSemaine)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Salle
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.salle_nom || 'Non définie'}
                      {matiere?.salle_capacite && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Capacité: {matiere.salle_capacite})
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Horaire
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {matiere?.heure_debut && matiere?.heure_fin
                        ? `${matiere.heure_debut} - ${matiere.heure_fin}`
                        : 'Non défini'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Étudiants */}
          {activeTab === 'etudiants' && (
            <div className="text-center py-12">
              <i className="ri-user-line text-6xl text-gray-400"></i>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Liste des étudiants
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Fonctionnalité en cours de développement
              </p>
            </div>
          )}

          {/* Onglet Séances */}
          {activeTab === 'seances' && (
            <div className="text-center py-12">
              <i className="ri-calendar-line text-6xl text-gray-400"></i>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Planning des séances
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Fonctionnalité en cours de développement
              </p>
            </div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === 'stats' && (
            <div className="text-center py-12">
              <i className="ri-bar-chart-line text-6xl text-gray-400"></i>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Statistiques
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Fonctionnalité en cours de développement
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {state.message && !state.success && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="ri-error-warning-line text-red-400 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{state.message}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatiereDetails;