import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import clsx from "clsx";
import { useCourses } from "../../../Contexts/CoursesContext";
import { Button } from "../../components/Button";

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, actions } = useCourses();
  const [activeTab, setActiveTab] = useState<"info" | "enrolled" | "schedule">(
    "info",
  );

  useEffect(() => {
    if (id) {
      actions.fetchCourseById(Number(id));
    }
  }, [id]);

  const course = state.selectedCourse;

  if (state.processing && !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <i className="ri-book-open-line text-6xl text-gray-400"></i>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Cours non trouvé
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Le cours demandé n'existe pas ou a été supprimé.
        </p>
        <Link
          to="/courses"
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
      case "actif":
        return "bg-green-100 text-green-800";
      case "archive":
        return "bg-gray-100 text-gray-800";
      case "brouillon":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = () => {
    navigate(`/courses/${course.id}/edit`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le cours "${course.nom}" ?`,
      )
    ) {
      await actions.deleteCourse(course.id!);
      if (state.success) {
        navigate("/courses");
      }
    }
  };

  const tauxRemplissage =
    course.capacite_actuelle && course.capacite_max
      ? (course.capacite_actuelle / course.capacite_max) * 100
      : 0;

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
            <Link to="/courses" className="text-gray-500 hover:text-gray-700">
              Cours
            </Link>
          </li>
          <li>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </li>
          <li className="text-gray-900 font-medium">{course.code}</li>
        </ol>
      </nav>

      {/* En-tête */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="sm:flex sm:items-center sm:space-x-5">
            <div className="flex justify-center sm:justify-start -mt-16">
              <div className="h-32 w-32 rounded-full ring-4 ring-white bg-white flex items-center justify-center">
                <i className="ri-book-open-line text-5xl text-indigo-600"></i>
              </div>
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.nom}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {course.code} • {course.filiere}
                </p>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="perso"
                  action={handleEdit}
                  supStyle="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                <i className="ri-edit-line mr-2"></i>
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="perso"
                  action={handleDelete}
                  supStyle="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.nom}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {course.code} • {course.filiere}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Button
            type="button"
            variant="perso"
            action={() => setActiveTab("info")}
            supStyle={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === "info"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <i className="ri-information-line mr-2"></i>
            Informations
          </Button>
          <Button
            type="submit"
            variant="perso"
            action={() => setActiveTab("enrolled")}
            supStyle={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === "enrolled"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <i className="ri-user-line mr-2"></i>
            Étudiants inscrits ({course.capacite_actuelle || 0})
          </Button>
          <Button
            type="button"
            variant="perso"
            action={() => setActiveTab("schedule")}
            supStyle={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === "schedule"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <i className="ri-calendar-line mr-2"></i>
            Planning
          </Button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {course.description && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            )}

            {/* Informations du cours */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informations du cours
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Code</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {course.code}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filière</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {course.filiere}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Crédits</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {course.credits}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Semestre
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {course.semestre}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Professeur
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {course.professeur}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="mt-1">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        getStatusColor(course.statut),
                      )}
                    >
                      {course.statut}
                    </span>
                  </dd>
                </div>
                {course.prerequis && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Prérequis
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {course.prerequis}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Planning */}
            {(course.jour || course.salle) && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Planning
                </h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {course.jour && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Jour
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {course.jour}
                      </dd>
                    </div>
                  )}
                  {course.heure_debut && course.heure_fin && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Horaires
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {course.heure_debut} - {course.heure_fin}
                      </dd>
                    </div>
                  )}
                  {course.salle && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Salle
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {course.salle}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capacité */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Capacité
              </h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600">
                    {course.capacite_actuelle || 0} / {course.capacite_max}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Étudiants inscrits
                  </div>
                </div>

                {/* Barre de progression */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Taux de remplissage</span>
                    <span>{tauxRemplissage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={clsx(
                        "h-2 rounded-full transition-all",
                        tauxRemplissage >= 100
                          ? "bg-red-600"
                          : tauxRemplissage >= 80
                            ? "bg-yellow-600"
                            : "bg-green-600",
                      )}
                      style={{ width: `${Math.min(tauxRemplissage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Places restantes</span>
                    <span className="font-medium text-gray-900">
                      {Math.max(
                        0,
                        course.capacite_max - (course.capacite_actuelle || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Actions rapides
              </h2>
              <div className="space-y-3">
                <Link
                  to={`/enrollments?course=${course.id}`}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    <i className="ri-user-add-line mr-2"></i>
                    Inscrire des étudiants
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </Link>
                <Link
                  to={`/grades?course=${course.id}`}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    <i className="ri-pencil-line mr-2"></i>
                    Saisir les notes
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "enrolled" && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <i className="ri-user-line text-4xl text-gray-400"></i>
            <p className="mt-2 text-sm text-gray-500">
              Liste des étudiants inscrits (à implémenter)
            </p>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <i className="ri-calendar-line text-4xl text-gray-400"></i>
            <p className="mt-2 text-sm text-gray-500">
              Planning détaillé (à implémenter)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
