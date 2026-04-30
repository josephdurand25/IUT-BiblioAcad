import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../Contexts/StudentsContext';
import clsx from 'clsx';
import { Button } from '../components/Button';

const Dashboard: React.FC = () => {
  const { state, actions } = useStudents();
  const { fetchStudents, fetchStats } = actions;

  useEffect(() => {
    fetchStats();
    fetchStudents(1, 5);
  }, []);
  
  // console.log('stat frontend', state.stats);
  
  const cardData = [
    {
      name: 'Total Étudiants',
      value: state.stats?.total || 0,
      icon: 'ri-user-line',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Actifs',
      value: state.stats?.actifs || 0,
      icon: 'ri-checkbox-circle-line',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Inactifs',
      value: state.stats?.inactifs || 0,
      icon: 'ri-close-circle-line',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Diplômés',
      value: state.stats?.diplomes || 0,
      icon: 'ri-medal-line',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de la gestion des étudiants
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={clsx('flex-shrink-0 rounded-md p-3', stat.bgColor)}>
                  <i className={clsx(stat.icon, 'text-2xl', stat.textColor)}></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Étudiants récents */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Étudiants récents
              </h2>
              <Link
                to="/students"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Voir tout
                <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {state.processing ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : !state.students || state.students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <i className="ri-user-line text-4xl text-gray-400"></i>
                <p className="mt-2 text-sm text-gray-500">Aucun étudiant trouvé</p>
              </div>
            ) : (
              state.students.slice(0, 5).map((student) => (
                <Link
                  key={student.id}
                  to={`/students/${student.id}`}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {student.photo_profil ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={student.photo_profil}
                        alt={`${student.prenom} ${student.nom}`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {student.prenom[0]}{student.nom[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {student.prenom} {student.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.filiere} - {student.niveau}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                        student.statut === 'actif' && 'bg-green-100 text-green-800',
                        student.statut === 'inactif' && 'bg-orange-100 text-orange-800',
                        student.statut === 'suspendu' && 'bg-red-100 text-red-800',
                        student.statut === 'diplome' && 'bg-purple-100 text-purple-800'
                      )}
                    >
                      {student.statut}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Répartition par filière */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">
              Répartition par filière
            </h2>
          </div>
          <div className="p-6">
            {state.stats?.parFiliere && state.stats.parFiliere.length > 0 ? (
              <div className="space-y-4">
                {state.stats.parFiliere.map((filiere: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {filiere.filiere}
                      </span>
                      <span className="text-sm text-gray-500">
                        {filiere.total} étudiants
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(filiere.total / (state.stats?.total || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <i className="ri-checkbox-circle-line mr-1 text-green-500"></i>
                        {filiere.actifs} actifs
                      </span>
                      <span className="flex items-center">
                        <i className="ri-medal-line mr-1 text-purple-500"></i>
                        {filiere.diplomes} diplômés
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-pie-chart-line text-4xl text-gray-400"></i>
                <p className="mt-2 text-sm text-gray-500">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <Link
            to="/students/create"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="text-center">
              <i className="ri-user-add-line text-3xl text-indigo-600"></i>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Nouvel étudiant
              </p>
            </div>
          </Link>
          <Link
            to="/students"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="text-center">
              <i className="ri-group-line text-3xl text-indigo-600"></i>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Liste complète
              </p>
            </div>
          </Link>

          <Link
            to="/statistics"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="text-center">
              <i className="ri-bar-chart-box-line text-3xl text-indigo-600"></i>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Statistiques
              </p>
            </div>
          </Link>

          <Button
            variant='perso'
            supStyle="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="text-center">
              <i className="ri-download-line text-3xl text-indigo-600"></i>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Exporter données
              </p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;