import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import type { IMatiere, IMatiereFilters } from '../../../types/ICours';
import type { JourSemaine, TypeCours } from '../../../types/IGeneral';
import { useMatieres } from '../../../Contexts/MatiereContext.tsx';
import { Input } from '../../components/Input.tsx';
import { Select } from '../../components/Select.tsx';

const CoursesList: React.FC = () => {
  const { state, actions } = useMatieres();
  const [filters, setFilters] = useState<IMatiereFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    actions.fetchMatieres(1, 10, filters);
  }, []);

  const handleFilterChange = (key: keyof IMatiereFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    actions.fetchMatieres(1, state.pagination.limit, filters);
  };

  const handleResetFilters = () => {
    setFilters({});
    actions.fetchMatieres(1, state.pagination.limit);
  };

  const handlePageChange = (newPage: number) => {
    actions.fetchMatieres(newPage, state.pagination.limit, filters);
  };

  const handleEdit = (matiere: IMatiere) => {
    navigate(`/matieres/${matiere.code}/edit`);
  };

  const handleDelete = (matiere: IMatiere) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la matière "${matiere.nom}" ?`)) {
      actions.deleteMatiere(matiere.code);
    }
  };

  const handleViewDetails = (matiere: IMatiere) => {
    navigate(`/matieres/${matiere.code}`);
  };

  const getTypeCoursColor = (type: TypeCours) => {
    switch (type) {
      case 'CM': return 'bg-blue-100 text-blue-800';
      case 'TD': return 'bg-green-100 text-green-800';
      case 'TP': return 'bg-purple-100 text-purple-800';
      case 'PROJET': return 'bg-orange-100 text-orange-800';
      case 'STAGE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeCoursLabel = (type: TypeCours) => {
    const labels: Record<TypeCours, string> = {
      'CM': 'Cours Magistral',
      'TD': 'Travaux Dirigés',
      'TP': 'Travaux Pratiques',
      'PROJET': 'Projet',
      'STAGE': 'Stage'
    };
    return labels[type] || type;
  };

  const formatHoraire = (jour?: JourSemaine, debut?: string, fin?: string) => {
    if (!jour || !debut || !fin) return '—';
    return `${jour} ${debut} - ${fin}`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Matières</h1>
          <p className="mt-1 text-sm text-gray-500">
            {state.pagination.total} matière(s) au total
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button
            variant='perso'
            action={() => setShowFilters(!showFilters)}
            supStyle="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <i className="ri-filter-line mr-2"></i>
            Filtres
            {showFilters && <i className="ri-arrow-up-s-line ml-2"></i>}
            {!showFilters && <i className="ri-arrow-down-s-line ml-2"></i>}
          </Button>
          <Button
            variant='perso'
            icon='ri-add-line mr-1 font-bold'
            iconPosition='left'
            action={() => {navigate('/matieres/create');}}
            supStyle="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Nouvelle matière
          </Button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Recherche */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label> */}
              <Input
                type="text"
                labelText="Recherche "
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nom ou code de la matière..."
                inputStyle="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Type de cours */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de cours
              </label> */}
              <Select
                title='type_cours'
                indication="Tous"
                labelText="Type de cours"
                value={filters.type_cours || ''}
                onChange={(e) => handleFilterChange('type_cours', e.target.value as TypeCours)}
                styleSelect="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              

                options={[
                  { id: 1, value: "CM", label: "Cours Magistral (CM)" },
                  { id: 2, value: "TD", label: "Travaux Dirigés (TD)" },
                  { id: 3, value: "TP", label: "Travaux Pratiques (TP)" },
                  { id: 4, value: "PROJET", label: "Projet" },
                  { id: 5, value: " STAGE", label: "Stage" }
                ]}
                
                
              />
            </div>

            {/* UE */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité d'Enseignement
              </label> */}
              <Input
                type="text"
                labelText="Unité d'Enseignement "
                value={filters.ue_code || ''}
                onChange={(e) => handleFilterChange('ue_code', e.target.value)}
                placeholder="Code UE..."
                inputStyle="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Enseignant */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Enseignant
              </label> */}
              <Input
                type="number"
                labelText="Enseignant"
                value={filters.enseignant_id || ''}
                onChange={(e) => handleFilterChange('enseignant_id', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="ID Enseignant..."
                inputStyle="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Jour */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Jour
              </label> */}
              <Select
                title='jour'
                labelText="Jour "
                indication="Tous"
                value={filters.jour_par_defaut || ''}
                onChange={(e) => handleFilterChange('jour_par_defaut', e.target.value as JourSemaine)}
                styleSelect="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              
                options={[
                  { id: 1, value: "LUNDI", label: "Lundi " },
                  { id: 2, value: "MARDI", label: "Mardi" },
                  { id: 3, value: "MERCREDI", label: "Mercredi" },
                  { id: 3, value: "JEUDI", label: "Jeudi" },
                  { id: 3, value: "VENDREDI", label: "Vendredi" },
                  { id: 3, value: "SAMEDI", label: "Samedi" }
                ]}
                
               
              />
            </div>

            {/* Salle */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Salle
              </label> */}
              <Input
                type="text"
                labelText="Salle"
                value={filters.salle_par_defaut || ''}
                onChange={(e) => handleFilterChange('salle_par_defaut', e.target.value)}
                placeholder="Code salle..."
                inputStyle="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Crédits min */}
            <div>
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Crédits min
              </label> */}
              <Input
                type="number"
                labelText="Crédits min"
                min="0"
                value={filters.credits_min || ''}
                onChange={(e) => handleFilterChange('credits_min', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                inputStyle="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Volume horaire min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume horaire min
              </label>
              <Input
                type="number"
                labelText="Crédits min"
                min="0"
                value={filters.volume_horaire_min || ''}
                onChange={(e) => handleFilterChange('volume_horaire_min', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                inputStyle="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              action={handleApplyFilters}
              variant='perso'
              supStyle="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <i className="ri-search-line mr-2"></i>
              Appliquer les filtres
            </Button>
            <Button
              action={handleResetFilters}
              variant='perso'
              supStyle="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <i className="ri-restart-line mr-2"></i>
              Réinitialiser
            </Button>
          </div>
        </div>
      )}

      {/* Liste des matières */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {state.processing && !state.matieres.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : state.matieres.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-book-open-line text-6xl text-gray-400"></i>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune matière trouvée</h3>
            <p className="mt-2 text-sm text-gray-500">
              Commencez par créer une nouvelle matière
            </p>
            <Button
              action={() => navigate('/matieres/create')}
              supStyle="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <i className="ri-add-line mr-2"></i>
              Créer une matière
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom de la matière
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crédits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume H.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.matieres.map((matiere: IMatiereWithDetails) => (
                    <tr 
                      key={matiere.code} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(matiere)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {matiere.code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {matiere.nom}
                        </div>
                        {matiere.ue_nom && (
                          <div className="text-sm text-gray-500">
                            {matiere.ue_nom}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                          getTypeCoursColor(matiere.type_cours)
                        )}>
                          {matiere.type_cours}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {matiere.ue_code}
                        </div>
                        {matiere.ue_type && (
                          <div className="text-xs text-gray-500">
                            {matiere.ue_type}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {matiere.enseignant_nom && matiere.enseignant_prenom
                            ? `${matiere.enseignant_prenom} ${matiere.enseignant_nom}`
                            : '—'}
                        </div>
                        {matiere.enseignant_matricule && (
                          <div className="text-xs text-gray-500">
                            {matiere.enseignant_matricule}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatHoraire(
                            matiere.jour_par_defaut,
                            matiere.heure_debut_par_defaut,
                            matiere.heure_fin_par_defaut
                          )}
                        </div>
                        {matiere.salle_nom && (
                          <div className="text-xs text-gray-500">
                            {matiere.salle_nom}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {matiere.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {matiere.volume_horaire}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(matiere);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Voir détails"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(matiere);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(matiere);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {state.pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    action={() => handlePageChange(state.pagination.page - 1)}
                    disabled={state.pagination.page === 1}
                    supStyle="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </Button>
                  <Button
                    action={() => handlePageChange(state.pagination.page + 1)}
                    disabled={state.pagination.page === state.pagination.totalPages}
                    supStyle="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{state.pagination.page}</span> sur{' '}
                      <span className="font-medium">{state.pagination.totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        action={() => handlePageChange(state.pagination.page - 1)}
                        disabled={state.pagination.page === 1}
                        supStyle="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </Button>
                      {[...Array(state.pagination.totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          action={() => handlePageChange(i + 1)}
                          supStyle={clsx(
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                            state.pagination.page === i + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        action={() => handlePageChange(state.pagination.page + 1)}
                        disabled={state.pagination.page === state.pagination.totalPages}
                        supStyle="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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

export default CoursesList;