import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useCandidatures } from '../../../Contexts/CandidatureContext';
import type { ICandidatureFormRequest } from '../../../types/ICandidature';
import type { NiveauEtude, SelectedFiles } from '../../../types/IGeneral';
import { TextArea } from '../../components/Textarea';

const FormCandidature: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useCandidatures();
  const { processing, success, message, errors, filieres, specialites } = state;

  // États locaux pour la gestion des dépendances
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [niveauxDisponibles, setNiveauxDisponibles] = useState<NiveauEtude[]>([]);

  // État du formulaire
  const [formData, setFormData] = useState<ICandidatureFormRequest>({
    nom: 'ADJI BAKETEK',
    prenom: 'Durand Jackson',
    email: 'durandjosephadji25@gmail.com',
    telephone: '691799325',
    date_naissance: '2000-10-01',
    lieu_naissance: 'Mbalmayo',
    genre: 'M' as const,
    nationalite: 'Camerounaise',
    adresse_complete: 'Odza borne 10 13468',
    region_origine: 'Littoral',
    pays: 'Cameroun',
    photo_profil: undefined,
    specialite_demandee: 'INF-SI',
    niveau_demande: 'M1' as NiveauEtude,
    type_candidature: 'PREMIERE_INSCRIPTION',
    cv_url: undefined,
    lettre_motivation_url: undefined,
    autres_documents: undefined, 
    informations_supplementaires: '',

  });

  // Charger les données académiques au montage
  useEffect(() => {
    actions.resetErrors();
    actions.fetchFilieres();
    actions.fetchSpecialites();
  }, []);

  // Mettre à jour les niveaux disponibles quand la spécialité change
  useEffect(() => {
    if (formData.specialite_demandee) {
      const selectedSpecialite = specialites.find(s => s.code === formData.specialite_demandee);
      if (selectedSpecialite?.niveaux_offerts) {
        try {
          const niveaux = typeof selectedSpecialite.niveaux_offerts === 'string'
            ? JSON.parse(selectedSpecialite.niveaux_offerts)
            : selectedSpecialite.niveaux_offerts;
          setNiveauxDisponibles(Array.isArray(niveaux) ? niveaux : []);
        } catch {
          setNiveauxDisponibles([]);
        }
      }
    } else {
      setNiveauxDisponibles([]);
    }
  }, [formData.specialite_demandee, specialites]);

  // Réinitialiser la spécialité si la filière change
  useEffect(() => {
    if (selectedFiliere && formData.specialite_demandee) {
      const isValid = specialites.some(
        s => s.filiere_code === selectedFiliere && s.code === formData.specialite_demandee
      );
      if (!isValid) {
        setFormData(prev => ({ ...prev, specialite_demandee: '' }));
        setNiveauxDisponibles([]);
      }
    }
  }, [selectedFiliere, formData.specialite_demandee, specialites]);

  const selectedSpecialite = state.specialites.find(s => s.code === formData.specialite_demandee);
  const niveauxOptions = selectedSpecialite?.niveaux_offerts ? (Array.isArray(selectedSpecialite.niveaux_offerts) ? selectedSpecialite.niveaux_offerts : JSON.parse(selectedSpecialite.niveaux_offerts)).map((niveau: string, i: number) => ({
    id: i,
    value: niveau,
    label: niveau
  })) : [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFiliereChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFiliere(value);
    // Réinitialiser la spécialité et le niveau
    setFormData(prev => ({
      ...prev,
      specialite_demandee: '',
      niveau_demande: '' as NiveauEtude
    }));
  };

  const handleSpecialiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      specialite_demandee: value,
      niveau_demande: '' as NiveauEtude // Réinitialiser le niveau
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      console.log(`Fichier sélectionné pour ${name}:`, files[0].name);
    }
  };
  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setFormData(prev => ({ 
        ...prev, 
        autres_documents: filesArray // ou traiter pour upload
      }));
      console.log(`${filesArray.length} fichier(s) sélectionné(s)`, filesArray.map(f => f.name).join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await actions.createCandidature(formData);
  };

  // Filtrer les spécialités par filière sélectionnée
  const specialitesFiltrees = selectedFiliere
    ? specialites.filter(s => s.filiere_code === selectedFiliere)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Formulaire de candidature</h1>
          <p className="mt-4 text-lg text-gray-600">
            Remplissez tous les champs pour soumettre votre candidature
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data"> 
          {/* Messages d'erreur */}
          {message && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <i className="ri-error-warning-line text-red-400 mr-3"></i>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">{message}</h3>
                  {Object.keys(errors).length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Informations personnelles */}
          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="ri-user-line mr-2"></i>
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                type="text"
                labelText="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Input
                type="text"
                labelText="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Input
                type="email"
                labelText="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Input
                type="tel"
                labelText="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Input
                type="date"
                labelText="Date de naissance"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleInputChange}
                required
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Input
                type="text"
                labelText="Lieu de naissance"
                name="lieu_naissance"
                value={formData.lieu_naissance}
                onChange={handleInputChange}
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Select
                title='genre'
                labelText="Genre "
                requis
                indication="-- Sélectionner -- "
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                options={[
                  { id: 1, value: "M", label: "Masculin" },
                  { id: 2, value: "F", label: "Féminin" },
                  { id: 3, value: "AUTRE", label: "Autre" },
                ]}
              />
              <Input
                type="text"
                labelText="Nationalité"
                name="nationalite"
                value={formData.nationalite}
                onChange={handleInputChange}
                required
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète
                </label>
                <TextArea
                  name="adresse_complete"
                  requis
                  value={formData.adresse_complete}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <Input
                type="text"
                labelText="Région d'origine"
                name="region_origine"
                value={formData.region_origine}
                onChange={handleInputChange}
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <Input
                type="text"
                labelText="Pays"
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
                required
                inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Section 2: Informations académiques */}
          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="ri-book-line mr-2"></i>
              Informations académiques
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Filière */}
              <Select
                title="Filiere souhaitée"
                name="filiere"
                labelText="Filière souhaitée"
                value={selectedFiliere}
                indication='-- Selectionnez une filière'
                onChange={handleFiliereChange}
                required
                options={filieres.map((f, i) => ({ id: i , value: f.code, label: f.nom }))}
              />

              {/* Spécialité */}
              <Select
                title='specialite demandee'
                name="specialite_demandee"
                labelText='specialité souhaitée'
                indication='-- Sélectionner une spécialité --'
                value={formData.specialite_demandee}
                onChange={handleInputChange}
                requis
                styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                options={filieres ? state.specialites
                  .filter(specialite => specialite.filiere_code === selectedFiliere)
                  .map((specialite, i) => ({
                    id: i,
                    value: specialite.code,
                    label: specialite.nom
                  })) : []}
              />

              {/* Niveau demandé */}
              <Select
                labelText="Niveau demandé"
                name="niveau_demande"
                indication='Sélectionner'
                value={formData.niveau_demande}
                onChange={handleInputChange}
                required
                styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                options={niveauxOptions}
              />

              {/* Type de candidature */}
              <Select
                labelText="Type de candidature"
                name="type_candidature"
                indication="-- Seclectionner le type d'inscription --"
                value={formData.type_candidature}
                onChange={handleInputChange}
                required
                options={[{id:1, value:"PREMIERE_INSCRIPTION", label:"Première inscription"}, 
                  {id:2, value:"REINSCRIPTION", label:"Réinscription"}, 
                  {id:3, value:"CHANGEMENT_FILIERE", label:"Changement de filière"}]}
              />
            </div>
          </div>

          {/* Section 3: Documents */}
          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="ri-file-line mr-2"></i>
              Documents
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="photo_profil" className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil
                </label>
                <input
                  id="photo_profil"
                  type="file"
                  name="photo_profil"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="cv_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Curriculum Vitae (CV) *
                </label>
                <input
                  id="cv_url"
                  type="file"
                  name="cv_url"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-2 text-xs text-gray-500">PDF, DOC ou DOCX. Taille max: 5MB</p>
              </div>
              <div>
                <label htmlFor="lettre_motivation_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Lettre de motivation *
                </label>
                <input
                  id="lettre_motivation_url"
                  type="file"
                  name="lettre_motivation_url"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-2 text-xs text-gray-500">PDF, DOC ou DOCX. Taille max: 5MB</p>
              </div>
            </div>
          </div>
          {/* Section pour documents supplémentaires */}
          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="ri-file-copy-line mr-2"></i>
              Documents supplémentaires
            </h2>
            <div>
              <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-2">
                Autres documents (diplômes, certificats, etc.)
              </label>
              <input
                title="autres documents"
                id="autres_documents"
                type="file"
                name="autres_documents"
                onChange={handleMultipleFilesChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Vous pouvez sélectionner plusieurs fichiers. Formats acceptés: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
          </div>

          {/* Section 4: Informations supplémentaires */}
          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="ri-message-line mr-2"></i>
              Informations supplémentaires
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires ou informations supplémentaires
            </label>
            <textarea
              name="informations_supplementaires"
              value={formData.informations_supplementaires}
              onChange={handleInputChange}
              rows={5}
              placeholder="Dites-nous en plus sur vous, vos motivations, vos projets académiques..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 justify-end">
            <Button
              action={() => navigate('/')}
              variant="perso"
              supStyle="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="perso"
              supStyle={`px-6 py-2 border border-transparent text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 ${processing ? 'cursor-not-allowed' : ''}`}
              disabled={processing}
            >
              {processing ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Soumission en cours...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-2"></i>
                  Soumettre la candidature
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCandidature;