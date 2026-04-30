import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudents } from '../../../Contexts/StudentsContext';
import clsx from 'clsx';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import type { IEtudiant } from '../../../types/IStudent';
import type { StatutAcademique, StatutUtilisateur } from '../../../types/IGeneral';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';

const StudentsList: React.FC = () => {
  const { state, actions } = useStudents();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    actions.fetchStudents(0, 7);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: string) => {
    actions.setFilters({
      ...state.filters,
      [key]: value || undefined
    });
  };
  const handleEditStudent = (data: IEtudiant) => {
    actions.setSelectedStudent(data);
    navigate(`/students/edit/${data.id}`);
    // navigate(`/students/edit/${data.id}`, { state: { studentData: data } });
  };

  const handlePageChange = (page: number) => {
    actions.setPagination({ page });
    actions.fetchStudents(page);
  };

  const getStatusBadge = (statut: string) => {
    const classes = clsx(
      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
      statut === 'actif' && 'bg-green-100 text-green-800',
      statut === 'inactif' && 'bg-orange-100 text-orange-800',
      statut === 'suspendu' && 'bg-red-100 text-red-800',
      statut === 'diplome' && 'bg-purple-100 text-purple-800'
    );
    return <span className={classes}>{statut}</span>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Étudiants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez tous les étudiants de l'établissement
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/students/create')}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <i className="ri-add-line mr-2"></i>
            Nouvel étudiant
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Recherche */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
                <Input
                  type="text"
                  labelText=''
                  value={state.searchTerm}
                  onChange={handleSearch}
                  onKeyPress={(e) => e.key === 'Enter' && actions.applyFilters()}
                  placeholder="Rechercher un étudiant..."
                  inputStyle="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                action={() => setShowFilters(!showFilters)}
                variant='perso'
                supStyle={clsx(
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                  showFilters
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                )}
              >
                <i className="ri-filter-line mr-2"></i>
                Filtres
              </Button>
              <Button
                action={actions.applyFilters}
                variant='perso'
                supStyle="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                <i className="ri-search-line mr-2"></i>
                Rechercher
              </Button>
            </div>
          </div>

          {/* Panneau des filtres */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-3">
              <div>
                
                <Select
                  title='filiere'
                  labelText='Filière'
                  indication='Toutes les filières'
                  value={state.filters.filiere || ''}
                  onChange={(e) => handleFilterChange('filiere', e.target.value)}
                  styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                
                  options={[
                        { id: 1, value: "Informatique", label: "Informatique" },
                        { id: 2, value: "Mathématiques", label: "Mathématiques " },
                        { id: 3, value: "Physique", label: "Physique " },
                        { id: 4, value: "Chimie", label: "Chimie " },
                        { id: 5, value: "Biologie", label: "Biologie " }  
                      ]}
                />
              </div>

              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label> */}
                <Select
                  title='niveau'
                  labelText='Niveau'
                  indication='Toutes les niveaux'
                  value={state.filters.niveau || ''}
                  onChange={(e) => handleFilterChange('niveau', e.target.value)}
                  styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                
                  options={[
                        { id: 1, value: "L1", label: "Licence 1" },
                        { id: 2, value: "L2", label: "Licence 2" },
                        { id: 3, value: "L3", label: "Licence 3" },
                        { id: 4, value: "M1", label: "Master 1" },
                        { id: 5, value: "M2", label: "Master 2" }  
                      ]}
                  
                  
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Select
                  title='statut'
                  labelText='Niveau'
                  indication='Toutes les Statut'
                  value={state.filters.statut || ''}
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                  styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                
                  options={[
                        { id: 1, value: "actif", label: "Actif " },
                        { id: 2, value: "inactif", label: "Inactif " },
                        { id: 3, value: "suspendu", label: "Suspendu" },
                        { id: 4, value: "diplome", label: "Diplômé" },
                      ]}
                />
              </div>
            </div>
          )}

          {/* Filtres actifs */}
          {(state.filters.filiere || state.filters.niveau || state.filters.statut || state.searchTerm) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              {state.searchTerm && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Recherche: {state.searchTerm}
                  <Button
                    title='Rechercher'
                    variant='perso'
                    action={() => actions.setSearchTerm('')}
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.filiere && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Filière: {state.filters.filiere}
                  <Button
                    title='filiere'
                    variant='perso'   
                    action={() => handleFilterChange('filiere', '')}
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.niveau && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Niveau: {state.filters.niveau}
                  <Button
                    title='niveau-filtre'
                    variant='perso' 
                    action={() => handleFilterChange('niveau', '')}
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.statut && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Statut: {state.filters.statut}
                  <Button
                    title='statut'
                    variant='perso' 
                    action={() => handleFilterChange('statut', '')}
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              <Button
                action={actions.resetFilters}
                variant='perso' 
                supStyle="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="rounded-lg bg-white shadow">
        {state.processing ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : !state.students || state.students.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <i className="ri-user-line text-5xl text-gray-400"></i>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun étudiant</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par ajouter un nouvel étudiant.
            </p>
            <div className="mt-6">
              <Button
                action={() => navigate('/students/create')}
                variant='perso' 
                supStyle="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <i className="ri-add-line mr-2"></i>
                Nouvel étudiant
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      N° Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Filière
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {state.students.map((student: IEtudiant) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {student.photo_profil ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.photo_profil}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {student.prenom[0]}{student.nom[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.prenom} {student.nom}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {student.numero_etudiant}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.filiere_nom}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.niveau}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(student.statut)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/students/${student.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Voir détails"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                          <Button
                            action={() => handleEditStudent(student)}
                            variant='perso'
                            supStyle="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </Button>
                          <Button
                            action={() => {
                              actions.setSelectedStudent(student);
                              actions.toggleModal('studentDelete', true);
                            }}
                            variant='perso'
                            supStyle="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  action={() => handlePageChange(state.pagination.page - 1)}
                  variant='perso'
                  disabled={state.pagination.page === 1}
                  supStyle="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </Button>
                <Button
                  action={() => handlePageChange(state.pagination.page + 1)}
                  variant='perso'
                  disabled={state.pagination.page === state.pagination.totalPages}
                  supStyle="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de{' '}
                    <span className="font-medium">
                      {(state.pagination.page - 1) * state.pagination.limit + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-medium">
                      {Math.min(
                        state.pagination.page * state.pagination.limit,
                        state.pagination.total
                      )}
                    </span>{' '}
                    sur{' '}
                    <span className="font-medium">{state.pagination.total}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <Button
                      title='prev'
                      action={() => handlePageChange(state.pagination.page - 1)}
                      variant='perso'
                      disabled={state.pagination.page === 0}
                      supStyle="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </Button>
                    {Array.from({ length: state.pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return (
                          page === 1 ||
                          page === state.pagination.totalPages ||
                          Math.abs(page - state.pagination.page) <= 2
                        );
                      })
                      .map((page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                ...
                              </span>
                              <Button
                                action={() => handlePageChange(page)}
                                variant='perso'
                                supStyle={clsx(
                                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
                                  page === state.pagination.page
                                    ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                )}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          );
                        }
                        return (
                          <Button
                            key={page}
                            action={() => handlePageChange(page)}
                            variant='perso'
                            supStyle={clsx(
                              'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
                              page === state.pagination.page
                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            )}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    <Button
                      title='next'
                      action={() => handlePageChange(state.pagination.page + 1)}
                      variant='perso'
                      disabled={state.pagination.page === state.pagination.totalPages}
                      supStyle="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <DeleteConfirmModal isOpen={state.modals.studentDelete} onClose={() => actions.toggleModal('studentDelete', false)} data={state.selectedStudent} />
      {/* <StudentFormModal isOpen={state.modals.studentForm} onClose={() => actions.toggleModal('studentForm', false)} /> */}
    </div>
  );
};

const StudentsListV2: React.FC = () => {
  const { state, actions } = useStudents();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    actions.fetchStudents(0, 7);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: string) => {
    actions.setFilters({
      ...state.filters,
      [key]: value || undefined
    });
  };

  const handleEditStudent = (data: IEtudiant) => {
    actions.setSelectedStudent(data);
    navigate(`/students/edit/${data.id}`);
  };

  const handlePageChange = (page: number) => {
    actions.setPagination({ page });
    actions.fetchStudents(page);
  };

  // Fonction corrigée pour StatutUtilisateur
  const getStatusBadge = (statut: StatutUtilisateur) => {
    const classes = clsx(
      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
      statut === 'actif' && 'bg-green-100 text-green-800',
      statut === 'inactif' && 'bg-orange-100 text-orange-800',
      statut === 'suspendu' && 'bg-red-100 text-red-800'
    );
    return <span className={classes}>{statut}</span>;
  };

  // Fonction pour StatutAcademique (si besoin)
  const getAcademicStatusBadge = (statutAcademique: StatutAcademique) => {
    const classes = clsx(
      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
      statutAcademique === 'inscrit' && 'bg-blue-100 text-blue-800',
      statutAcademique === 'non_inscrit' && 'bg-gray-100 text-gray-800',
      statutAcademique === 'diplome' && 'bg-purple-100 text-purple-800',
      statutAcademique === 'abandon' && 'bg-red-100 text-red-800',
      statutAcademique === 'exclu' && 'bg-red-100 text-red-800'
    );
    return <span className={classes}>{statutAcademique}</span>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Étudiants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez tous les étudiants de l'établissement
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            action={() => navigate('/students/create')}
            variant='perso'
            supStyle="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <i className="ri-add-line mr-2"></i>
            Nouvel étudiant
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Recherche */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
                <Input
                  type="text"
                  labelText=''
                  value={state.searchTerm}
                  onChange={handleSearch}
                  onKeyPress={(e) => e.key === 'Enter' && actions.applyFilters()}
                  placeholder="Rechercher un étudiant..."
                  inputStyle="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                action={() => setShowFilters(!showFilters)}
                variant='perso'
                supStyle={clsx(
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                  showFilters
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                )}
              >
                <i className="ri-filter-line mr-2"></i>
                Filtres
              </Button>
              <Button
                action={actions.applyFilters}
                variant='perso'
                supStyle="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                <i className="ri-search-line mr-2"></i>
                Rechercher
              </Button>
            </div>
          </div>

          {/* Panneau des filtres */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filière
                </label>
                <select
                  title='filiere'
                  value={state.filters.filiere || ''}
                  onChange={(e) => handleFilterChange('filiere', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Toutes les filières</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Chimie">Chimie</option>
                  <option value="Biologie">Biologie</option>
                </select>
              </div>

              <div>
               
                <Select
                  title='niveau'
                  labelText='Niveau'
                  indication='Tous les niveaux'
                  value={state.filters.niveau || ''}
                  onChange={(e) => handleFilterChange('niveau', e.target.value)}
                  styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                
                  options={[
                        { id: 1, value: "L1", label: "Licence 1" },
                        { id: 2, value: "L2", label: "Licence 2" },
                        { id: 3, value: "L3", label: "Licence 3" },
                        { id: 4, value: "M1", label: "Master 1" },
                        { id: 5, value: "M2", label: "Master 2" }  
                      ]}
                 
                />
              </div>

              <div>
                
                <Select
                  title='statut-utilisateur'
                  labelText='Statut utilisateur'
                  indication='Tous les statuts'
                  value={state.filters.statut || ''}
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                
                  options={[
                        { id: 1, value: "actif", label: "Actif " },
                        { id: 2, value: "inactif", label: "Inactif " },
                        { id: 3, value: "suspendu", label: "Suspendu " }  
                      ]}
                />
              </div>

              <div>
                
                <Select
                  title='statut-academique'
                  labelText='Statut académique'
                  indication='Tous les statuts'
                  value={state.filters.statut_academique || ''}
                  onChange={(e) => handleFilterChange('statut_academique', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                
                   options={[
                        { id: 1, value: "inscrit", label: "Inscrit " },
                        { id: 2, value: "non_inscrit", label: "Non inscrit" },
                        { id: 3, value: "diplome", label: "Diplômé " }  ,
                        { id: 4, value: "abandon", label: "Abandon " },  
                        { id: 5, value: "exclu", label: "Exclu " }  
                      ]}
                 
                />
              </div>
            </div>
          )}

          {/* Filtres actifs */}
          {(state.filters.filiere || state.filters.niveau || state.filters.statut || state.filters.statut_academique || state.searchTerm) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Filtres actifs:</span>
              {state.searchTerm && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Recherche: {state.searchTerm}
                  <Button
                    title='Rechercher'
                    action={() => actions.setSearchTerm('')}
                    variant='perso'
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.filiere && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Filière: {state.filters.filiere}
                  <Button
                    title='filiere'
                    action={() => handleFilterChange('filiere', '')}
                    variant='perso'
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.niveau && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Niveau: {state.filters.niveau}
                  <Button
                    title='niveau-filtre'
                    action={() => handleFilterChange('niveau', '')}
                    variant='perso'
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.statut && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Statut: {state.filters.statut}
                  <Button
                    title='statut-utilisateur'
                    action={() => handleFilterChange('statut', '')}
                    variant='perso'
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              {state.filters.statut_academique && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Statut académique: {state.filters.statut_academique}
                  <Button
                    title='statut-academique'
                    action={() => handleFilterChange('statut_academique', '')}
                    variant='perso'
                    supStyle="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-indigo-200"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </Button>
                </span>
              )}
              <Button
                action={actions.resetFilters}
                variant='perso'
                supStyle="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="rounded-lg bg-white shadow">
        {state.processing ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : !state.students || state.students.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <i className="ri-user-line text-5xl text-gray-400"></i>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun étudiant</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par ajouter un nouvel étudiant.
            </p>
            <div className="mt-6">
              <Button
                action={() => navigate('/students/create')}
                variant='perso'
                supStyle="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <i className="ri-add-line mr-2"></i>
                Nouvel étudiant
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      N° Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Filière
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Statut Académique
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {state.students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {student.photo_profil ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.photo_profil}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {student.prenom[0]}{student.nom[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.prenom} {student.nom}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {student.numero_etudiant}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.filiere}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.niveau}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(student.statut as StatutUtilisateur)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getAcademicStatusBadge(student.statut_academique)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/students/${student.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Voir détails"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </Link>
                          <Button
                            action={() => handleEditStudent(student)}
                            variant='perso'
                            supStyle="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </Button>
                          <Button
                            action={() => {
                              actions.setSelectedStudent(student);
                              actions.toggleModal('studentDelete', true);
                            }}
                            variant='perso'
                            supStyle="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - reste identique */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  action={() => handlePageChange(state.pagination.page - 1)}
                  variant='perso'
                  disabled={state.pagination.page === 1}
                  supStyle="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </Button>
                <Button
                  action={() => handlePageChange(state.pagination.page + 1)}
                  variant='perso'
                  disabled={state.pagination.page === state.pagination.totalPages}
                  supStyle="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de{' '}
                    <span className="font-medium">
                      {(state.pagination.page - 1) * state.pagination.limit + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-medium">
                      {Math.min(
                        state.pagination.page * state.pagination.limit,
                        state.pagination.total
                      )}
                    </span>{' '}
                    sur{' '}
                    <span className="font-medium">{state.pagination.total}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <Button
                      title='prev'
                      action={() => handlePageChange(state.pagination.page - 1)}
                      variant='perso'
                      disabled={state.pagination.page === 0}
                      supStyle="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </Button>
                    {Array.from({ length: state.pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return (
                          page === 1 ||
                          page === state.pagination.totalPages ||
                          Math.abs(page - state.pagination.page) <= 2
                        );
                      })
                      .map((page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                ...
                              </span>
                              <Button
                                action={() => handlePageChange(page)}
                                varinat='perso'
                                supStyle={clsx(
                                  'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
                                  page === state.pagination.page
                                    ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                )}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          );
                        }
                        return (
                          <Button
                            key={page}
                            action={() => handlePageChange(page)}
                            variant='perso'
                            supStyle={clsx(
                              'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
                              page === state.pagination.page
                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            )}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    <Button
                      title='next'
                      action={() => handlePageChange(state.pagination.page + 1)}
                      variant='perso'
                      disabled={state.pagination.page === state.pagination.totalPages}
                      supStyle="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <DeleteConfirmModal 
        isOpen={state.modals.studentDelete} 
        onClose={() => actions.toggleModal('studentDelete', false)} 
        data={state.selectedStudent} 
      />
    </div>
  );
};

export default StudentsList;