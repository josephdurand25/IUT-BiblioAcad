import React, { useEffect } from 'react';
import { useStudents } from '../../Contexts/StudentsContext';
import clsx from 'clsx';

const Statistics: React.FC = () => {
  const { state, actions } = useStudents();

  useEffect(() => {
    actions.fetchStats();
  }, []);

  if (state.processing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = state.stats;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyse détaillée des données étudiantes
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-50 p-3">
                <i className="ri-user-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Total Étudiants
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-50 p-3">
                <i className="ri-checkbox-circle-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Actifs
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.actifs || 0}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    {stats?.total ? ((stats.actifs / stats.total) * 100).toFixed(1) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-orange-50 p-3">
                <i className="ri-close-circle-line text-2xl text-orange-600"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Inactifs
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.inactifs || 0}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    {stats?.total ? ((stats.inactifs / stats.total) * 100).toFixed(1) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-50 p-3">
                <i className="ri-medal-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Diplômés
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.diplomes || 0}
                  </dd>
                  <dd className="text-xs text-gray-500">
                    {stats?.total ? ((stats.diplomes / stats.total) * 100).toFixed(1) : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par filière */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Répartition par filière</h2>
        </div>
        <div className="p-6">
          {!stats?.parFiliere || stats.parFiliere.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-pie-chart-line text-5xl text-gray-400"></i>
              <p className="mt-2 text-sm text-gray-500">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Filière
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actifs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Diplômés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Abandons
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Âge moyen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Répartition
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stats.parFiliere.map((filiere, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {filiere.filiere}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {filiere.total}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {filiere.actifs}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          {filiere.diplomes}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          {filiere.abandons}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {parseInt(filiere.age_moyen.toString()).toFixed(0)} ans
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${(filiere.total / (stats.total || 1)) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {((filiere.total / (stats.total || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Graphiques visuels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribution par statut */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Distribution par statut</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Actifs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${stats?.total ? (stats.actifs / stats.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {stats?.actifs || 0}
                    <span className="text-xs text-gray-500 ml-1">
                      ({stats?.total ? ((stats.actifs / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Inactifs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${stats?.total ? (stats.inactifs / stats.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {stats?.inactifs || 0}
                    <span className="text-xs text-gray-500 ml-1">
                      ({stats?.total ? ((stats.inactifs / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Diplômés</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${stats?.total ? (stats.diplomes / stats.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {stats?.diplomes || 0}
                    <span className="text-xs text-gray-500 ml-1">
                      ({stats?.total ? ((stats.diplomes / stats.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top filières */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Top 5 filières</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.parFiliere
                ?.slice()
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map((filiere, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{filiere.filiere}</p>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{
                              width: `${(filiere.total / (stats.total || 1)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">{filiere.total}</p>
                      <p className="text-xs text-gray-500">étudiants</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;