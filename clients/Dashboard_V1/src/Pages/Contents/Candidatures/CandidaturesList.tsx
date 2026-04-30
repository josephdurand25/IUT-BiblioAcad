import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useCandidatures } from '../../../Contexts/CandidatureContext';
import type { StatutCandidature } from '../../../types/IGeneral';

// small card component for statistics
const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={clsx('rounded-lg p-3', color)}>
        <i className={`${icon} text-xl text-white`}></i>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const CandidaturesList: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions: {fetchCandidatures, setSearchTerm, setFilters, resetFilters, resetErrors, deleteCandidature} } = useCandidatures();
  const [showFilters, setShowFilters] = useState(false);

  const { candidatures, searchTerm, processing } = state;
  const statusFilter = state.filters.statut || '';

  // Statistiques
  const stats = {
    total: candidatures.length,
    enCours: candidatures.filter(c => c.statut === 'EN_COURS').length,
    complet: candidatures.filter(c => c.statut === 'COMPLET').length,
    enEvaluation: candidatures.filter(c => c.statut === 'EN_EVALUATION').length,
    valide: candidatures.filter(c => c.statut === 'VALIDE').length,
    rejete: candidatures.filter(c => c.statut === 'REJETE').length,
  };

  useEffect(() => {
    resetErrors();
    fetchCandidatures();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as StatutCandidature;
    if (value) {
      setFilters({ statut: value });
    } else {
      resetFilters();
    }
  };

  const filteredCandidatures = candidatures.filter(c => {
    const matchesSearch = `${c.nom} ${c.prenom} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || c.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatutBadge = (statut: string) => {
    const classes = clsx(
      'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
      statut === 'EN_COURS' && 'bg-blue-100 text-blue-800',
      statut === 'COMPLET' && 'bg-cyan-100 text-cyan-800',
      statut === 'EN_EVALUATION' && 'bg-yellow-100 text-yellow-800',
      statut === 'VALIDE' && 'bg-green-100 text-green-800',
      statut === 'REJETE' && 'bg-red-100 text-red-800',
      statut === 'ANNULE' && 'bg-gray-100 text-gray-800'
    );
    return <span className={classes}>{statut}</span>;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les dossiers de candidature des futurs étudiants
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total" value={stats.total} icon="ri-file-list-line" color="bg-indigo-500" />
        <StatCard label="En cours" value={stats.enCours} icon="ri-time-line" color="bg-blue-500" />
        <StatCard label="Complet" value={stats.complet} icon="ri-checkbox-circle-line" color="bg-cyan-500" />
        <StatCard label="Évaluation" value={stats.enEvaluation} icon="ri-eye-line" color="bg-yellow-500" />
        <StatCard label="Validé" value={stats.valide} icon="ri-check-double-line" color="bg-green-500" />
        <StatCard label="Rejeté" value={stats.rejete} icon="ri-close-circle-line" color="bg-red-500" />
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
                  labelText=""
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Rechercher par nom, prénom ou email..."
                  inputStyle="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                action={() => setShowFilters(!showFilters)}
                variant="perso"
                supStyle="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <i className="ri-filter-line mr-2"></i>
                Filtres
              </Button>
            </div>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  title="statut de la candidature"
                  name='status'
                  labelText="Statut"
                  indication='-- Sélectionnez un statut de candidature --'
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  options={[
                  { id: 1, value: '', label: 'Toutes les candidatures' },
                  { id: 2, value: 'EN_COURS', label: 'En cours' },
                  { id: 3, value: 'COMPLET', label: 'Complet' },
                  { id: 4, value: 'EN_EVALUATION', label: 'En évaluation' },
                  { id: 5, value: 'VALIDE', label: 'Validé' },
                  { id: 6, value: 'REJETE', label: 'Rejeté' },
                  { id: 7, value: 'ANNULE', label: 'Annulé' },
                ]}
                />
              </div>
            
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialité demandée
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de candidature
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processing ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidatures.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <i className="ri-inbox-line text-4xl text-gray-400"></i>
                      <p className="mt-4 text-gray-500">Aucune candidature trouvée</p>
                    </td>
                  </tr>
                ) : (
                filteredCandidatures.map((candidature) => (
                  <tr key={candidature.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {candidature.prenom[0]}{candidature.nom[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidature.prenom} {candidature.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{candidature.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{candidature.specialite_demandee}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{candidature.niveau_demande}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatutBadge(candidature.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button action={() => navigate(`/Candidatures/${candidature.id}`)} variant="perso" icon='ri-eye-line mr-1' supStyle="text-indigo-600 hover:text-indigo-900 font-semibold" />
                      <Button isLoading={state.processing} action={() => deleteCandidature(candidature.id)} variant="perso" icon='ri-delete-bin-line mr-1' supStyle="text-red-600 hover:text-red-900 font-semibold" />
                      <Button action={() => navigate(`/Candidatures/${candidature.id}`)} variant="perso" icon='ri-edit-line mr-1' supStyle="text-indigo-600 hover:text-indigo-900 font-semibold" />
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidaturesList;
