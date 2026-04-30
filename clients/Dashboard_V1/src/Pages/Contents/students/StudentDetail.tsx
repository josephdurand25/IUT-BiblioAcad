import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useStudents } from '../../../Contexts/StudentsContext';
import DeleteConfirmModal from '../Modals/DeleteConfirmModal';
import { Button } from '../../components/Button';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, actions } = useStudents();
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'grades'>('info');

  useEffect(() => {
    if (id) {
      actions.fetchStudentById(Number(id));
      actions.fetchStudentCourses(Number(id));
      actions.fetchStudentNotes(Number(id));
      actions.fetchStudentMoyenne(Number(id));
    }
  }, [id]);

  const student = state.selectedStudent;

  if (state.processing && !student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <i className="ri-user-line text-6xl text-gray-400"></i>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Étudiant non trouvé</h3>
        <p className="mt-2 text-sm text-gray-500">L'étudiant demandé n'existe pas ou a été supprimé.</p>
        <Link
          to="/students"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Retour à la liste
        </Link>
      </div>
    );
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-orange-100 text-orange-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      case 'diplome': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    actions.toggleModal('studentDelete', true);
  };

  const handleEdit = () => {
    actions.setSelectedStudent(student);
    navigate(`/students/edit/${student.id}`, { state: { studentData: student } });
    // actions.toggleModal('studentForm', true);
  };

  const handleToggleStatus = async () => {
    if (student.id) {
      if (student.statut_academique === 'inscrit') {
        await actions.toggleStudentStatus(student.id, 'non_inscrit');
        actions.fetchStudentById(Number(student.id));
      }else {
        await actions.toggleStudentStatus(student.id, 'inscrit');
        actions.fetchStudentById(Number(student.id));
      }
    }
  };

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
            <Link to="/students" className="text-gray-500 hover:text-gray-700">
              Étudiants
            </Link>
          </li>
          <li>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </li>
          <li className="text-gray-900 font-medium">
            {student.prenom} {student.nom} - {student.numero_etudiant}
          </li>
        </ol>
      </nav>

      {/* En-tête avec photo et infos principales */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="sm:flex sm:items-center sm:space-x-5">
            <div className="flex justify-center sm:justify-start -mt-16">
              {student.photo_profil ? (
                <img
                  className="h-32 w-32 rounded-full ring-4 ring-white object-cover bg-white"
                  src={`http://localhost:3002/public/images/${student.photo_profil}`}
                  alt={`${student.prenom} ${student.nom}`}
                />
              ) : (
                <div className="h-32 w-32 rounded-full ring-4 ring-white bg-indigo-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-600">
                    {student.prenom[0]}{student.nom[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {student.prenom} {student.nom}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {student.numero_etudiant}
                </p>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button
                  action={handleEdit}
                  variant='perso'
                  supStyle="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Modifier
                </Button>
                <Button
                  action={handleToggleStatus}
                  variant='perso'
                  supStyle="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Changer statut
                </Button>
                <Button
                  action={handleDelete}
                  variant='perso'
                  supStyle="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {student.prenom} {student.nom}
            </h1>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Button
            action={() => setActiveTab('info')}
            variant='perso'
            supStyle={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <i className="ri-information-line mr-2"></i>
            Informations
          </Button>
          <Button
            action={() => setActiveTab('courses')}
            variant='perso'
            supStyle={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'courses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <i className="ri-book-line mr-2"></i>
            Cours ({state.studentCourses.length})
          </Button>
          <Button
            action={() => setActiveTab('grades')}
            variant='perso'
            supStyle={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'grades'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <i className="ri-bar-chart-line mr-2"></i>
            Notes ({state.studentNotes.length})
          </Button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations académiques */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informations académiques
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filière</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.filiere_code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Niveau</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.niveau}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="mt-1">
                    <span className={clsx('inline-flex rounded-full px-2 py-1 text-xs font-semibold', getStatusColor(student.statut))}>
                      {student.statut}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-bold">
                    {student.date_inscription && new Date(student.date_inscription).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Informations personnelles */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informations personnelles
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.date_naissance && new Date(student.date_naissance).toLocaleDateString('fr-FR')}
                    {student.age && <span className="text-gray-500 ml-2">({student.age} ans)</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genre</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{student.genre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${student.email}`} className="text-indigo-600 hover:text-indigo-500">
                      {student.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.telephone ? (
                      <a href={`tel:${student.telephone}`} className="text-indigo-600 hover:text-indigo-500">
                        {student.telephone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Non renseigné</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Adresse */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Adresse
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rue</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.adresse_complete ?? <span className="text-gray-400">Non renseigné</span>}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ville</dt>
                    <dd className="mt-1 text-sm text-gray-900">{student.adresse_ville}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Code postal</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {student.adresse_postale || <span className="text-gray-400">-</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nationalité</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {student.adresse_pays || <span className="text-gray-400">-</span>}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Statistiques rapides */}
            {state.studentMoyenne && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Performance académique
                </h2>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-3xl font-bold text-indigo-600">
                      {state.studentMoyenne.moyenne ? Number(state.studentMoyenne.moyenne).toFixed(2) : '-'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Moyenne générale</div>
                  </div>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Nombre de cours</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {state.studentMoyenne.nombre_cours || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Crédits obtenus</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {state.studentMoyenne.credits_obtenus || 0} / {state.studentMoyenne.credits_totaux || 0}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <Button
                  action={() => setActiveTab('courses')}
                  variant='perso'
                  supStyle="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    <i className="ri-book-line mr-2"></i>
                    Voir les cours
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </Button>
                <Button
                  action={() => setActiveTab('grades')}
                  variant='perso'
                  supStyle="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    <i className="ri-bar-chart-line mr-2"></i>
                    Voir les notes
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Cours inscrits</h2>
          </div>
          {state.studentCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom du cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Professeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crédits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semestre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.studentCourses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.professeur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.semestre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                          course.statut_inscription === 'inscrit' && 'bg-green-100 text-green-800',
                          course.statut_inscription === 'abandon' && 'bg-red-100 text-red-800',
                          course.statut_inscription === 'termine' && 'bg-blue-100 text-blue-800'
                        )}>
                          {course.statut_inscription}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="ri-book-line text-4xl text-gray-400"></i>
              <p className="mt-2 text-sm text-gray-500">Aucun cours inscrit</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Notes et résultats</h2>
          </div>
          {state.studentNotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note CC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note Examen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note tp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note Finale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crédits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Résultat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.studentNotes.map((note: any) => (
                    <tr key={note.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{note.matiere_nom}</div>
                        <div className="text-sm text-gray-500">{note.matiere_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {note.note_cc ? Number(note.note_cc).toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {note.note_examen ? Number(note.note_examen).toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {note.note_tp ? Number(note.note_tp).toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'text-sm font-semibold',
                          note.note_finale >= 10 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {note.note_finale ? Number(note.note_finale).toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {note.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                          note.note_finale >= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}>
                          {note.note_finale >= 10 ? 'Admis' : 'Ajourné'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="ri-bar-chart-line text-4xl text-gray-400"></i>
              <p className="mt-2 text-sm text-gray-500">Aucune note disponible</p>
            </div>
          )}
        </div>
      )}
      <DeleteConfirmModal isOpen={state.modals.studentDelete} onClose={() => actions.toggleModal('studentDelete', false)} onConfirm={() => {}} data={state.selectedStudent} />
    </div>
  );
};

export default StudentDetails;