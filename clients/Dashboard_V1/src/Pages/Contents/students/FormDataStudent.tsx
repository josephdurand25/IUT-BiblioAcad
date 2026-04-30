import React, { useState, useEffect } from 'react';
import { useStudents } from '../../../Contexts/StudentsContext';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import type { Genre } from '../../../types/IGeneral';

interface StudentFormModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  studentId?: number;
}

const StudentForm: React.FC<StudentFormModalProps> = () => {
  const { state, actions } = useStudents();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id || !!state.selectedStudent;
  const [filiere, setFiliere] = useState('');
    // Fetch academic data on mount
    useEffect(() => {
      actions.fetchFilieres();
      actions.fetchSpecialites();
    }, []);

  const [formData, setFormData] = useState({
    numero_etudiant: '',
    prenom: '',
    nom: '',
    date_naissance: '',
    genre: 'M' as Genre,
    email: '',
    telephone: '',
    lieu_naissance: '',
    adresse_complete: '',
    region_origine: '',
    nationalite: '',
    pays: '',
    date_inscription: '',
    specialite_code: '',
    niveau: '',
  });

  useEffect(() => {
    if (isEdit && state.selectedStudent) {
      setFormData({
        numero_etudiant: state.selectedStudent.numero_etudiant || '',
        prenom: state.selectedStudent.prenom || '',
        nom: state.selectedStudent.nom || '',
        date_naissance: state.selectedStudent.date_naissance?.split('T')[0] || '',
        genre: state.selectedStudent.genre || 'M' as 'F' | 'M' | 'AUTRE',
        email: state.selectedStudent.email || '',
        telephone: state.selectedStudent.telephone || '',
        lieu_naissance: state.selectedStudent.lieu_naissance || '',
        adresse_complete: state.selectedStudent.adresse_complete || '',
        region_origine: state.selectedStudent.region_origine || '',
        nationalite: state.selectedStudent.nationalite || '',
        pays: state.selectedStudent.pays || '',
        date_inscription: state.selectedStudent.date_inscription?.split('T')[0] || '',
        specialite_code: state.selectedStudent.specialite_code || '',
        niveau: state.selectedStudent.niveau || '',
      });
      // Set filiere based on selected student's specialite
      const selectedSpecialite = state.specialites.find(s => s.code === state.selectedStudent?.specialite_code);
      if (selectedSpecialite) {
        setFiliere(selectedSpecialite.filiere_code || '');
      }
    } else {
      // Reset form for new student
      setFormData({
        numero_etudiant: '',
        prenom: '',
        nom: '',
        date_naissance: '',
        genre: 'M' as 'F' | 'M' | 'AUTRE',
        email: '',
        telephone: '',
        lieu_naissance: '',
        adresse_complete: '',
        region_origine: '',
        nationalite: '',
        pays: '',
        date_inscription: new Date().toISOString().split('T')[0],
        specialite_code: '',
        niveau: ''
      });
      setFiliere('');
    }
  }, [isEdit, state.selectedStudent, state.specialites]);

  // Reset specialite_code when filiere changes and current specialite is not in the new filiere
  useEffect(() => {
    if (filiere && formData.specialite_code) {
      const isValid = state.specialites.some(s => s.filiere_code === filiere && s.code === formData.specialite_code);
      if (!isValid) {
        setFormData(prev => ({ ...prev, specialite_code: '' }));
      }
    }
  }, [filiere, formData.specialite_code, state.specialites]);

  // Reset niveau when specialite_code changes and current niveau is not offered by the new specialite
  useEffect(() => {
    if (formData.specialite_code && formData.niveau) {
      const selectedSpecialite = state.specialites.find(s => s.code === formData.specialite_code);
      if (selectedSpecialite?.niveaux_offerts) {
        const niveauxOfferts = Array.isArray(selectedSpecialite.niveaux_offerts) ? selectedSpecialite.niveaux_offerts : JSON.parse(selectedSpecialite.niveaux_offerts);
        if (!niveauxOfferts.includes(formData.niveau)) {
          setFormData(prev => ({ ...prev, niveau: '' }));
        }
      }
    }
  }, [formData.specialite_code, formData.niveau, state.specialites]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
        numero_etudiant: '',
        prenom: '',
        nom: '',
        date_naissance: '',
        genre: 'M',
        email: '',
        telephone: '',
        lieu_naissance: '',
        adresse_complete: '',
        region_origine: '',
        nationalite: '',
        pays: '',
        date_inscription: new Date().toISOString().split('T')[0],
        specialite_code: '',
        niveau: ''
      });
      setFiliere('');
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit && state.selectedStudent) {
      await actions.updateStudent(state.selectedStudent.id, formData);
    } else {
      await actions.createStudent({
        ...formData,
        created_by: 1, // À remplacer par l'ID de l'utilisateur connecté
      } as any);
    }

    if (state.success) {
      // onClose();
    }
  };

  // Get niveaux options based on selected specialite
  const selectedSpecialite = state.specialites.find(s => s.code === formData.specialite_code);
  const niveauxOptions = selectedSpecialite?.niveaux_offerts ? (Array.isArray(selectedSpecialite.niveaux_offerts) ? selectedSpecialite.niveaux_offerts : JSON.parse(selectedSpecialite.niveaux_offerts)).map((niveau: string, i: number) => ({
    id: i,
    value: niveau,
    label: niveau
  })) : [];

  // if (!isOpen) return null;

  return (
    <div className="w-full">
    {/* <div className="fixed inset-0 z-50 overflow-y-auto"> */}
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
          </h1>

          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              action={() => {actions.setSelectedStudent(null); navigate('/students');}}
              supStyle="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              <i className="ri-list-view-line mr-2"></i>
              Liste des étudiants
            </Button>
          </div>
      </div>
      <div className="w-full rounded-lg  shadow-xl transition-all">

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4 mt-2">
            {/* Erreurs */}
            {state.message && state.errorType && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <i className="ri-error-warning-line text-red-400 mr-3"></i>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">{state.message}</h3>
                    {Object.keys(state.errors).length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                        {Object.entries(state.errors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Informations personnelles */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Informations personnelles</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                  <div>
                    <Select
                      title='genre'
                      labelText="Genre "
                      requis
                      indication=" Sélectionner"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    
                       options={[
                          { id: 1, value: "M", label: "Masculin" },
                          { id: 2, value: "F", label: "Féminin" },
                          { id: 3, value: "AUTRE", label: "Autre" },
                           
                        ]}
                    />
                  </div>

                  <div>
                    <Input
                      title='prenom'
                      labelText="Prénom "
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                    <Input
                      title='nom'
                      type="text"
                      labelText='Nom'
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                    <Input
                      title='date naissance'
                      type="date"
                      labelText='Date de naissance'
                      name="date_naissance"
                      value={formData.date_naissance}
                      onChange={handleChange}
                      required
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                    <Input
                      title='date inscription'
                      type="date"
                      labelText='Date inscription'
                      name="date_inscription"
                      value={formData.date_inscription}
                      onChange={handleChange}
                      required
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Contact</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Input
                      title='email'
                      type="email"
                      labelText='Email'
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                 
                    <Input
                      title='téléphone'
                      type="tel"
                      labelText='Téléphone'
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              {/* Informations géographiques et adresse */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Informations géographiques</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Input
                      title='lieu_naissance'
                      type="text"
                      labelText='Lieu de naissance'
                      name="lieu_naissance"
                      value={formData.lieu_naissance}
                      onChange={handleChange}
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                    <Input
                      title='region_origine'
                      type="text"
                      labelText="Région d'origine"
                      name="region_origine"
                      value={formData.region_origine}
                      onChange={handleChange}
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                    <Input
                      title='nationalite'
                      type="text"
                      labelText='Nationalité'
                      name="nationalite"
                      value={formData.nationalite}
                      onChange={handleChange}
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div>
                    <Input
                      title='pays'
                      labelText='Pays'
                      type="text"
                      name="pays"
                      value={formData.pays}
                      onChange={handleChange}
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      title='adresse_complete'
                      type="text"
                      labelText='Adresse complète'
                      name="adresse_complete"
                      value={formData.adresse_complete}
                      onChange={handleChange}
                      inputStyle="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              {/* Informations académiques */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Informations académiques</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Select
                      title='filiere'
                      labelText='filiere'
                      indication='-- Sélectionner une filière --'
                      name="filiere"
                      value={filiere}
                      onChange={(e) => setFiliere(e.target.value)}
                      styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      options={state.filieres.map((filiere, i)=> ({
                        id: i,
                        value: filiere.code,
                        label: filiere.nom
                      }))}
                    />
                  </div>

                  <div>
                    <Select
                      title='specialite_code'
                      name="specialite_code"
                      labelText='specialité'
                      indication='-- Sélectionner une spécialité --'
                      value={formData.specialite_code}
                      onChange={handleChange}
                      requis
                      styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      options={filiere ? state.specialites
                        .filter(specialite => specialite.filiere_code === filiere)
                        .map((specialite, i) => ({
                          id: i,
                          value: specialite.code,
                          label: specialite.nom
                        })) : []}
                    />
                  </div>
                  <div>
                    <Select
                      title='niveau'
                      name="niveau"
                      labelText='Niveau'
                      indication='Sélectionner'
                      value={formData.niveau}
                      onChange={handleChange}
                      requis
                      styleSelect="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      options={niveauxOptions}
                    />
                  </div>

                  {/* {isEdit && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut *
                      </label>
                      <select
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="suspendu">Suspendu</option>
                        <option value="diplome">Diplômé</option>
                      </select>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-end gap-3">
              <Button
                variant='perso'
                type="button"
                action={handleClear}
                supStyle="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
              Vider les champs
              </Button>
              <Button
                type="submit"
                variant='perso'
                disabled={state.processing}
                supStyle="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {state.processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line mr-2"></i>
                    {isEdit ? 'Mettre à jour' : 'Créer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;