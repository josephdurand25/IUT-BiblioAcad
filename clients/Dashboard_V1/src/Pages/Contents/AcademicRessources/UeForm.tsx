import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import clsx from 'clsx';
import type {  IUniteEnseignementCreate } from '../../../types/ICours';
import { Input } from '../../components/Input';
import { TextArea } from '../../components/Textarea';
import { useAcademicResources } from '../../../Contexts/AcademicResourcesContext';
import { Button } from '../../components/Button';
import type { TypeUE } from '../../../types/IGeneral';

const UEForm: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { state, actions } = useAcademicResources();
  const isEditMode = Boolean(code);

  const [formData, setFormData] = useState<Partial<IUniteEnseignementCreate>>({
    code: '',
    nom: '',
    type: 'OBLIGATOIRE',
    credits: 6,
    // coefficient: 1.0,
    volume_horaire_total: 50,
    description: '',
    // groupe_cours_code: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [groupesCours, setGroupesCours] = useState<any[]>([]);

  useEffect(() => {
    // Charger les groupes de cours
    loadGroupesCours();

    if (isEditMode && code) {
      actions.fetchUEByCode(code);
    }
  }, [code, isEditMode]);

  useEffect(() => {
    if (isEditMode && state.selectedUE !== null) {
      setFormData({
        ...state.selectedUE,
        description: state.selectedUE.description ?? undefined,
      });
    }
  }, [state.selectedUE, isEditMode]);

  const loadGroupesCours = async () => {
    // Simuler le chargement des groupes de cours
    // À remplacer par un vrai appel API
    setGroupesCours([
      { code: 'L1-INFO-S1', nom: 'L1 Informatique - Semestre 1' },
      { code: 'L1-INFO-S2', nom: 'L1 Informatique - Semestre 2' },
      { code: 'L2-INFO-S3', nom: 'L2 Informatique - Semestre 3' },
      { code: 'L2-INFO-S4', nom: 'L2 Informatique - Semestre 4' },
      { code: 'L3-INFO-S5', nom: 'L3 Informatique - Semestre 5' },
      { code: 'L3-INFO-S6', nom: 'L3 Informatique - Semestre 6' },
    ]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Conversion des types
    let finalValue: any = value;
    if (name === 'credits' || name === 'volume_horaire_total') {
      finalValue = value ? Number(value) : undefined;
    } else if (name === 'coefficient') {
      finalValue = value ? Number.parseFloat(value) : undefined;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Code UE
    if (!formData.code?.trim()) {
      newErrors.code = 'Le code de l\'UE est requis';
    } else if (!/^[A-Z0-9_]{2,20}$/i.test(formData.code)) {
      newErrors.code = 'Le code doit contenir entre 2 et 20 caractères alphanumériques';
    }

    // Nom
    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom de l\'UE est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    // Type
    if (!formData.type) {
      newErrors.type = 'Le type d\'UE est requis';
    }

    // Groupe de cours
    if (!formData.ue_groupe_code?.trim()) {
      newErrors.ue_groupe_code = 'Le groupe de cours est requis';
    }

    // Crédits
    if (!formData.credits || formData.credits < 1 || formData.credits > 30) {
      newErrors.credits = 'Les crédits doivent être entre 1 et 30';
    }

    // Volume horaire
    if (!formData.volume_horaire_total || formData.volume_horaire_total < 1) {
      newErrors.volume_horaire_total = 'Le volume horaire doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const ueData = {
      ...formData,} as IUniteEnseignementCreate;

    if (isEditMode && code) {
      await actions.updateUE(code, ueData);
    } else {
      await actions.createUE(ueData);
    }

    if (state.success) {
      navigate('/ue');
    }
  };

  const handleCancel = () => {
    navigate('/ue');
  };

  const typesUE: TypeUE[] = ['OBLIGATOIRE', 'OPTIONNEL', 'TRANSVERSAL'];

  const getTypeUELabel = (type: TypeUE) => {
    const labels: Record<TypeUE, string> = {
      'OBLIGATOIRE': 'Obligatoire',
      'OPTIONNEL': 'Optionnel',
      'TRANSVERSAL': 'Transversal'
    };
    return labels[type];
  };

  const getTypeUEDescription = (type: TypeUE) => {
    const descriptions: Record<TypeUE, string> = {
      'OBLIGATOIRE': 'UE que tous les étudiants doivent obligatoirement suivre',
      'OPTIONNEL': 'UE au choix parmi plusieurs options proposées',
      'TRANSVERSAL': 'UE commune à plusieurs parcours ou filières'
    };
    return descriptions[type];
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
            <Link to="/ue" className="text-gray-500 hover:text-gray-700">
              Unités d'Enseignement
            </Link>
          </li>
          <li>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </li>
          <li className="text-gray-900 font-medium">
            {isEditMode ? 'Modifier l\'UE' : 'Nouvelle UE'}
          </li>
        </ol>
      </nav>

      {/* En-tête */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <i className="ri-folder-line text-2xl text-indigo-600"></i>
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier l\'unité d\'enseignement' : 'Créer une nouvelle unité d\'enseignement'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? 'Modifiez les informations de l\'UE'
                : 'Remplissez les informations pour créer une nouvelle UE'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-information-line text-indigo-600 mr-2" /> Informations de base
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Code UE */}
            <Input 
              labelText="Code de l'UE"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: PROG"
              error={errors.code}
              inputStyle="px-3 py-3"
              required
              disabled={isEditMode}
            />

            {/* Nom */}
            <Input 
              labelText="Nom de l'UE"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Programmation"
              error={errors.nom}
              inputStyle="px-3 py-3"
              required
            />

            {/* Type UE */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-3">
                Type d'UE <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {typesUE.map(type => (
                  <div
                    key={type}
                    onClick={() => handleChange({ target: { name: 'type', value: type } } as any)}
                    className={clsx(
                      'relative rounded-lg border p-4 cursor-pointer transition-all',
                      formData.type === type
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    )}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            checked={formData.type === type}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-900">
                            {getTypeUELabel(type)}
                          </label>
                        </div>
                        <p className="ml-7 mt-1 text-xs text-gray-500">
                          {getTypeUEDescription(type)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Groupe de cours */}
            <div className="sm:col-span-2">
              <label htmlFor="groupe_cours_code" className="block text-sm font-medium text-gray-800 mb-1">
                Groupe de cours <span className="text-red-500">*</span>
              </label>
              <select
                name="groupe_cours_code"
                id="groupe_cours_code"
                value={formData.ue_groupe_code}
                onChange={handleChange}
                className={clsx(
                  'mt-1 block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500',
                  errors.groupe_cours_code ? 'border-red-300' : 'border-gray-300'
                )}
              >
                <option value="">Sélectionnez un groupe de cours</option>
                {groupesCours.map(groupe => (
                  <option key={groupe.code} value={groupe.code}>
                    {groupe.code} - {groupe.nom}
                  </option>
                ))}
              </select>
              {errors.groupe_cours_code && (
                <p className="mt-1 text-sm text-red-600">{errors.groupe_cours_code}</p>
              )}
            </div>
          </div>
        </div>

        {/* Crédits et Volume horaire */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-time-line text-indigo-600 mr-2"></i> Crédits et Volume horaire
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Crédits */}
            <Input 
              labelText="Crédits ECTS"
              name="credits"
              type="number"
              min="1"
              max="30"
              value={formData.credits?.toString()}
              onChange={handleChange}
              placeholder="Ex: 6"
              error={errors.credits}
              inputStyle="px-3 py-3"
              required
            />
            {/* Volume horaire */}
            <Input 
              labelText="Volume horaire total (heures)"
              name="volume_horaire_total"
              type="number"
              min="1"
              value={formData.volume_horaire_total?.toString()}
              onChange={handleChange}
              placeholder="Ex: 50"
              error={errors.volume_horaire_total}
              inputStyle="px-3 py-3"
              required
            />
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <i className="ri-information-line text-blue-400 text-xl"></i>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Volume horaire :</strong> Total des heures de CM, TD et TP pour cette UE.<br/>
                  <strong>Coefficient :</strong> Poids de cette UE dans le calcul de la moyenne générale.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <i className="ri-file-text-line text-indigo-600 mr-2"></i> Description
          </h2>
            <TextArea
              rows={4}
              name="description"
              labelText='Description'
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez les objectifs pédagogiques, le contenu et les compétences visées..."
              styleLabletext="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-1">
              Description de l'UE
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez les objectifs pédagogiques, le contenu et les compétences visées..."
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Cette description sera visible par les étudiants lors de l'inscription
            </p>
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
            icon={isEditMode ? 'ri-save-line' : 'ri-add-line'}
            iconPosition="left"
            isLoading={state.processing}
            disabled={state.processing}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer l\'UE'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UEForm;