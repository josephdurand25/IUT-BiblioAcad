import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import clsx from "clsx";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useMatieres } from "../../../Contexts/MatiereContext";
import type { IMatiereCreate } from "../../../types/IMatiere";
import type { JourSemaine, TypeCours } from "../../../types/IGeneral";
import { Select } from "../../components/Select";

const MatiereForm: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { state, actions } = useMatieres();
  const isEditMode = Boolean(code);

  const [formData, setFormData] = useState<Partial<IMatiereCreate>>({
    code: "",
    nom: "",
    type_cours: "CM",
    credits: 3,
    coefficient: 1.0,
    volume_horaire: 30,
    salle: "",
    jour: undefined,
    heure_debut: "",
    heure_fin: "",
    ue_code: "",
    enseignant_id: undefined,
  });

  const [errors, setErrors] = useState<any>({});
  // const [uniteEnseignements, setUniteEnseignements] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [salles, setSalles] = useState<any[]>([]);

  useEffect(() => {
    // Charger les données de référence
    loadReferenceData();

    if (isEditMode && code) {
      actions.fetchMatiereByCode(code);
    }
  }, [code, isEditMode]);

  useEffect(() => {
    if (isEditMode && state.selectedMatiere) {
      setFormData(state.selectedMatiere);
    }
  }, [state.selectedMatiere, isEditMode]);

  const loadReferenceData = async () => {
    // Simuler le chargement des UE, enseignants et salles
    // À remplacer par de vrais appels API
    // setUniteEnseignements([
    //   { code: "PROG", nom: "Programmation" },
    //   { code: "MATH", nom: "Mathématiques" },
    //   { code: "ALGO", nom: "Algorithmique" },
    //   { code: "BDD", nom: "Bases de Données" },
    //   { code: "RESEAU", nom: "Réseaux" },
    // ]);

    setEnseignants([
      { id: 1, nom: "Dupont", prenom: "Jean" },
      { id: 2, nom: "Martin", prenom: "Marie" },
      { id: 3, nom: "Bernard", prenom: "Paul" },
    ]);

    setSalles([
      { code: "AMPHI-A", nom: "Amphithéâtre A" },
      { code: "TD-B12", nom: "Salle TD B12" },
      { code: "TP-INF1", nom: "Labo Informatique 1" },
      { code: "TP-INF2", nom: "Labo Informatique 2" },
    ]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Conversion des types
    let finalValue: any = value;
    if (name === "credits" || name === "volume_horaire") {
      finalValue = value ? Number(value) : undefined;
    } else if (name === "coefficient") {
      finalValue = value ? parseFloat(value) : undefined;
    } else if (name === "enseignant_id") {
      finalValue = value ? Number(value) : undefined;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Code matière
    if (!formData.code?.trim()) {
      newErrors.code = "Le code de la matière est requis";
    } else if (!/^[A-Z0-9_]{3,20}$/i.test(formData.code)) {
      newErrors.code =
        "Le code doit contenir entre 3 et 20 caractères alphanumériques";
    }

    // Nom
    if (!formData.nom?.trim()) {
      newErrors.nom = "Le nom de la matière est requis";
    } else if (formData.nom.length < 3) {
      newErrors.nom = "Le nom doit contenir au moins 3 caractères";
    }

    // Type de cours
    if (!formData.type_cours) {
      newErrors.type_cours = "Le type de cours est requis";
    }

    // UE
    if (!formData.ue_code?.trim()) {
      newErrors.ue_code = "L'unité d'enseignement est requise";
    }

    // Crédits
    if (!formData.credits || formData.credits < 1 || formData.credits > 12) {
      newErrors.credits = "Les crédits doivent être entre 1 et 12";
    }

    // Coefficient
    if (
      !formData.coefficient ||
      formData.coefficient < 0 ||
      formData.coefficient > 1
    ) {
      newErrors.coefficient = "Le coefficient doit être entre 0 et 1";
    }

    // Volume horaire
    if (!formData.volume_horaire || formData.volume_horaire < 1) {
      newErrors.volume_horaire = "Le volume horaire doit être supérieur à 0";
    }

    // Validation horaires
    if (formData.heure_debut && formData.heure_fin) {
      if (formData.heure_debut >= formData.heure_fin) {
        newErrors.heure_fin_par_defaut =
          "L'heure de fin doit être après l'heure de début";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const matiereData = {
      ...formData,
      jour_par_defaut: formData.jour || undefined,
      heure_debut_par_defaut: formData.heure_debut || undefined,
      heure_fin_par_defaut: formData.heure_fin || undefined,
      salle_par_defaut: formData.salle || undefined,
      enseignant_id: formData.enseignant_id || undefined,
    } as IMatiereCreate;

    if (isEditMode && code) {
      await actions.updateMatiere(code, matiereData);
    } else {
      await actions.createMatiere(matiereData);
    }

    if (state.success) {
      navigate("/matieres");
    }
  };

  const handleCancel = () => {
    navigate("/matieres");
  };

  const jours: JourSemaine[] = [
    "LUNDI",
    "MARDI",
    "MERCREDI",
    "JEUDI",
    "VENDREDI",
    "SAMEDI",
  ];
  // const typesCours: TypeCours[] = ['CM', 'TD', 'TP'];

  // const getTypeCoursLabel = (type: TypeCours) => {
  //   const labels: Record<TypeCours, string> = {
  //     'CM': 'Cours Magistral',
  //     'TD': 'Travaux Dirigés',
  //     'TP': 'Travaux Pratiques',
  //   };
  //   return labels[type];
  // };

  const getJourLabel = (jour: JourSemaine) => {
    const labels: Record<JourSemaine, string> = {
      LUNDI: "Lundi",
      MARDI: "Mardi",
      MERCREDI: "Mercredi",
      JEUDI: "Jeudi",
      VENDREDI: "Vendredi",
      SAMEDI: "Samedi",
    };
    return labels[jour];
  };

  return (
    <div className="mx-auto space-y-6">
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
            {isEditMode ? "Modifier la matière" : "Nouvelle matière"}
          </li>
        </ol>
      </nav>

      {/* En-tête */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <i className="ri-book-2-line text-2xl text-indigo-600"></i>
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Modifier la matière"
                : "Créer une nouvelle matière"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? "Modifiez les informations de la matière"
                : "Remplissez les informations pour créer une nouvelle matière"}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-information-line text-indigo-600 mr-2"></i>
            Informations de base
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Code matière */}
            <Input
              labelText="Code de la matière"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: PROG_CM"
              error={errors.code}
              inputStyle="px-3 py-3"
              required
              disabled={isEditMode}
            />

            {/* Nom */}
            <Input
              labelText="Nom de la matière"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Programmation - Cours Magistral"
              error={errors.nom}
              inputStyle="px-3 py-3"
              required
            />

            {/* Type de cours */}
            <div>
              <Select
                labelText="Type de cours "
                requis
                indication="choisissez"
                name="type_cours"
                id="type_cours"
                value={formData.type_cours}
                onChange={handleChange}
                styleSelect={clsx(
                  "mt-1 block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                  errors.type_cours ? "border-red-300" : "border-gray-300",
                )}
                options={[
                  { id: 1, value: "CM", label: "Cours Magistral" },
                  { id: 2, value: "TD", label: "Travaux Dirigés" },
                  { id: 3, value: "TP", label: "Travaux Pratiques" },
                ]}
              />
              {/* {typesCours.map(type => (
                  <option key={type} value={type}>
                    {getTypeCoursLabel(type)}
                  </option>
                ))}
              </Select> */}
              {errors.type_cours && (
                <p className="mt-1 text-sm text-red-600">{errors.type_cours}</p>
              )}
            </div>

            {/* Unité d'Enseignement */}
            <div>
              {/* <label
                htmlFor="ue_code"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Unité d'Enseignement <span className="text-red-500">*</span>
              </label> */}
              <Select
                labelText="Type de cours "
                requis
                indication="Selectionnez une UE"
                name="ue_code"
                id="ue_code"
                value={formData.ue_code}
                onChange={handleChange}
                styleSelect={clsx(
                  "mt-1 block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
                  errors.ue_code ? "border-red-300" : "border-gray-300",
                )}
                options={[
                  { id: 1, value: "PROG", label: "Programmation" },
                  { id: 2, value: "MATH", label: "Mathématiques" },
                  { id: 3, value: "ALGO", label: "Algorithmique" },
                  { id: 4, value: "BDD", label: "Bases de Données" },
                  { id: 5, value: "RESEAU", label: "Réseaux" }  
                ]}
              />
              {/* <option value="">Sélectionnez une UE</option>
                {uniteEnseignements.map(ue => (
                  <option key={ue.code} value={ue.code}>
                    {ue.code} - {ue.nom}
                  </option>
                ))}
              </select> */}
              {errors.ue_code && (
                <p className="mt-1 text-sm text-red-600">{errors.ue_code}</p>
              )}
            </div>
          </div>
        </div>

        {/* Crédits et Volume horaire */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-time-line text-indigo-600 mr-2"></i>
            Crédits et Volume horaire
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Crédits */}
            <Input
              labelText="Crédits ECTS"
              name="credits"
              type="number"
              min="1"
              max="12"
              value={formData.credits?.toString()}
              onChange={handleChange}
              placeholder="Ex: 3"
              error={errors.credits}
              inputStyle="px-3 py-3"
              required
            />

            {/* Coefficient */}
            <Input
              labelText="Coefficient"
              name="coefficient"
              type="number"
              min="0"
              max="1"
              value={formData.coefficient?.toString()}
              onChange={handleChange}
              placeholder="Ex: 1.0"
              error={errors.coefficient}
              inputStyle="px-3 py-3"
              required
            />

            {/* Volume horaire */}
            <Input
              labelText="Volume horaire (heures)"
              name="volume_horaire"
              type="number"
              min="1"
              value={formData.volume_horaire?.toString()}
              onChange={handleChange}
              placeholder="Ex: 30"
              error={errors.volume_horaire}
              inputStyle="px-3 py-3"
              required
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <i className="ri-information-line text-blue-400 text-xl"></i>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Coefficient :</strong> Valeur entre 0 et 1
                  représentant le poids de cette matière dans l'UE.
                  <br />
                  <strong>Exemple :</strong> CM = 0.5, TD = 0.3, TP = 0.2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enseignant */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-user-line text-indigo-600 mr-2"></i>
            Enseignant
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="enseignant_id"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Enseignant responsable
              </label>
              <select
                name="enseignant_id"
                id="enseignant_id"
                value={formData.enseignant_id || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Aucun enseignant assigné</option>
                {enseignants.map((ens) => (
                  <option key={ens.id} value={ens.id}>
                    {ens.prenom} {ens.nom}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                L'enseignant peut être assigné ultérieurement
              </p>
            </div>
          </div>
        </div>

        {/* Planning par défaut */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-calendar-line text-indigo-600 mr-2"></i>
            Planning par défaut (optionnel)
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Jour */}
            <div>
              
              <Select
                labelText="Jour de la semaine "
                indication="Non défini"
                name="jour"
                id="jour"
                value={formData.jour || ""}
                onChange={handleChange}
                styleSelect="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              
                //  <option value="">Non défini</option>
                // {jours.map((j) => (
                //   <option key={j} value={j}>
                //     {getJourLabel(j)}
                //   </option>
                // ))} 
                  options={[
                  { id: 1, value: "LUN", label: "LUNDI" },
                  { id: 2, value: "MAR", label: "MARDI" },
                  { id: 3, value: "MER", label: "MERCREDI" },
                  { id: 4, value: "JEU", label: "JEUDI" },
                  { id: 5, value: "VEN", label: "VENDREDI" } , 
                  { id: 6, value: "SAM", label: "SAMEDI" }  
                ]}
              />
            </div>

            {/* Salle */}
            <div>
              <label
                htmlFor="salle_par_defaut"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Salle par défaut
              </label>
              <select
                name="salle_par_defaut"
                id="salle_par_defaut"
                value={formData.salle || ""}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Aucune salle</option>
                {salles.map((salle) => (
                  <option key={salle.code} value={salle.code}>
                    {salle.code} - {salle.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Heure début */}
            <Input
              labelText="Heure de début"
              name="heure_debut"
              type="time"
              value={formData.heure_debut}
              onChange={handleChange}
              inputStyle="px-3 py-3"
            />

            {/* Heure fin */}
            <Input
              labelText="Heure de fin"
              name="heure_fin"
              type="time"
              value={formData.heure_fin}
              onChange={handleChange}
              error={errors.heure_fin}
              inputStyle="px-3 py-3"
            />
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-md">
            <div className="flex">
              <i className="ri-information-line text-yellow-400 text-xl"></i>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Ces informations sont des valeurs par défaut. Les séances
                  réelles seront planifiées séparément dans le module "Emploi du
                  temps".
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur globaux */}
        {state.message && !state.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <i className="ri-error-warning-line text-red-400 text-xl"></i>
              <div className="ml-3">
                <p className="text-sm text-red-800">{state.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 pb-6">
          <Button
            type="button"
            variant="outline"
            size="medium"
            action={handleCancel}
            disabled={state.processing}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            variant="accent"
            size="medium"
            icon={isEditMode ? "ri-save-line" : "ri-add-line"}
            iconPosition="left"
            isLoading={state.processing}
            disabled={state.processing}
          >
            {isEditMode ? "Mettre à jour" : "Créer la matière"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MatiereForm;
