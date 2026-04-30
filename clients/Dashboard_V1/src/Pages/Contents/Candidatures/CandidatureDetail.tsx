import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import { useCandidatures } from '../../../Contexts/CandidatureContext';
import { useToast } from '../../../Contexts/TaostContainer';
import { downloadFile, utils_getImageUrl } from '../../../Utils/utils_fuctions';

const CandidatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, actions } = useCandidatures();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'historique'>('info');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);

  const { selectedCandidature: candidature, processing } = state;
  const loading = !candidature && processing;

  useEffect(() => {
    if (id) {
      actions.fetchCandidatureById(Number(id));
    }
  }, [id]);

  const handleValidate = async () => {
    if (!candidature) return;
    
    setValidationLoading(true);
    try {
      await actions.validerCandidature(candidature.id, {
        candidature_id: candidature.id,
        statut: 'VALIDE',
        notes: 'Validée via interface'
      });
      
      // Recharger après validation
      await actions.fetchCandidatureById(candidature.id);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.message || 'Erreur lors de la validation'
      });
    } finally {
      setValidationLoading(false);
    }

  };


  const handleDownloadCV = () => {
    if (!candidature?.cv_url) return;
    const filename = `CV_${candidature?.nom}_${candidature?.prenom}.pdf`;
    downloadFile(candidature?.cv_url, filename);
  };

  const handleDownloadLettre = () => {
  if (!candidature?.lettre_motivation_url) return;
  const filename = `LM_${candidature?.nom}_${candidature?.prenom}.pdf`;
  downloadFile(candidature?.lettre_motivation_url, filename);
};


  const handleReject = async () => {
    if (!candidature || !rejectReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Attention',
        message: 'Veuillez entrer une raison de rejet'
      });
      return;
    }

    setValidationLoading(true);
    try {
      await actions.validerCandidature(candidature.id,{
        candidature_id: candidature.id,
        statut: 'REJETE',
        motif_rejet: rejectReason,
        notes: 'Rejetée via interface'
      });
      setShowRejectModal(false);
      setRejectReason('');
      
      // Recharger après rejet
      await actions.fetchCandidatureById(candidature.id);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.message || 'Erreur lors du rejet'
      });
    } finally {
      setValidationLoading(false);
    }
  };


  const getStatutInfo = (statut: string) => {
    const infos: Record<string, { color: string; label: string; icon: string }> = {
      EN_COURS: { color: 'bg-blue-100 text-blue-800', label: 'En cours', icon: 'ri-time-line' },
      COMPLET: { color: 'bg-cyan-100 text-cyan-800', label: 'Complet', icon: 'ri-checkbox-circle-line' },
      EN_EVALUATION: { color: 'bg-yellow-100 text-yellow-800', label: 'En évaluation', icon: 'ri-eye-line' },
      VALIDE: { color: 'bg-green-100 text-green-800', label: 'Validé', icon: 'ri-check-double-line' },
      REJETE: { color: 'bg-red-100 text-red-800', label: 'Rejeté', icon: 'ri-close-circle-line' },
      ANNULE: { color: 'bg-gray-100 text-gray-800', label: 'Annulé', icon: 'ri-forbid-line' }
    };
    return infos[statut] || { color: 'bg-gray-100 text-gray-800', label: statut, icon: 'ri-question-line' };
  };

  const formatDate = (date: string | null | undefined, format: 'short' | 'long' = 'short') => {
    if (!date) return '-';
    const options: Intl.DateTimeFormatOptions = format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la candidature...</p>
        </div>
      </div>
    );
  }

  if (!candidature) {
    return (
      <div className="text-center py-12">
        <i className="ri-file-line text-6xl text-gray-400"></i>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Candidature non trouvée</h3>
        <p className="mt-2 text-sm text-gray-500">La candidature demandée n'existe pas ou a été supprimée.</p>
        <Button variant='perso' icon='ri-arrow-left-line mr-2'  baseUrl="/candidatures" supStyle="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
         Retour aux candidatures
        </Button>
      </div>
    );
  }

  const statutInfo = getStatutInfo(candidature.statut);

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
            <Link to="/candidatures" className="text-gray-500 hover:text-gray-700">
              Candidatures
            </Link>
          </li>
          <li>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
          </li>
          <li className="text-gray-900 font-medium">
            {candidature.prenom} {candidature.nom}
          </li>
        </ol>
      </nav>

      {/* En-tête avec photo et infos principales */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="sm:flex sm:items-center sm:space-x-5">
            <div className="flex justify-center sm:justify-start -mt-16">
              {/* {candidature.photo_profil ? ( */}
                <img
                  className="h-32 w-32 rounded-full ring-4 ring-white object-cover bg-white"
                  src={utils_getImageUrl(candidature.photo_profil, candidature.genre)}
                  alt={`${candidature.prenom} ${candidature.nom}`}
                  onError={(e) => {
                     // Remplacer par l'image locale par défaut selon le genre
                    if (candidature?.genre === 'M') {
                      e.currentTarget.src = '/app/images/default-avatar-male.png';
                    } else if (candidature?.genre === 'F') {
                      e.currentTarget.src = '/app/images/default-avatar-female.png';
                    } else {
                      e.currentTarget.src = '/app/images/default-avatar.png';
                    }
                    e.currentTarget.onerror = null;
                    console.log('Fallback vers image locale:', e.currentTarget.src);
                  }}
                />
              {/* ) : (
              //   <div className="h-32 w-32 rounded-full ring-4 ring-white bg-indigo-100 flex items-center justify-center">
              //     <span className="text-4xl font-bold text-indigo-600">
              //       {candidature.prenom?.[0] || ''}{candidature.nom?.[0] || ''}
              //     </span>
              //   </div>
              // )}*/}
            </div>
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {candidature.prenom} {candidature.nom}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {candidature.email}
                </p>
              </div>
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {candidature.statut !== 'VALIDE' && candidature.statut !== 'REJETE' && (
                  <>
                    <Button action={handleValidate} variant="perso" isLoading={validationLoading} icon='ri-check-line mr-2' iconPosition='left' supStyle="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={validationLoading}>
                        Valider
                    </Button>
                    <Button action={() => setShowRejectModal(true)} variant="perso" icon='ri-close-line mr-2' iconPosition='left' supStyle="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={validationLoading}>
                        Rejeter
                    </Button>
                  </>
                )}
                <Button icon='ri-arrow-left-line mr-2' iconPosition='left' baseUrl='/app/candidatures' variant="perso" supStyle="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Retour
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {candidature.prenom} {candidature.nom}
            </h1>
          </div>
        </div>
      </div>

      {/* Statut */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Statut</p>
            <div className="flex items-center mt-2">
              <span className={clsx('inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold', statutInfo.color)}>
                <i className={`${statutInfo.icon} mr-2`}></i>
                {statutInfo.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Date de candidature</p>
            <p className="text-sm text-gray-900 mt-2">
              {formatDate(candidature.date_candidature)}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Button
            action={() => setActiveTab('info')}
            variant="perso"
            supStyle={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <i className="ri-information-line mr-2" /> Informations
          </Button>
          <Button
            action={() => setActiveTab('documents')}
            variant="perso"
            supStyle={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'documents'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <i className="ri-file-text-line mr-2"></i> Documents
          </Button>
          <Button
            action={() => setActiveTab('historique')}
            variant="perso"
            supStyle={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'historique'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <i className="ri-history-line mr-2"></i> Historique
          </Button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informations personnelles
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Prénom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.prenom}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.nom}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${candidature.email}`} className="text-indigo-600 hover:text-indigo-900">
                      {candidature.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {candidature.telephone ? (
                      <a href={`tel:${candidature.telephone}`} className="text-indigo-600 hover:text-indigo-900">
                        {candidature.telephone}
                      </a>
                    ) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(candidature.date_naissance)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Lieu de naissance</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.lieu_naissance || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genre</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {candidature.genre === 'M' && 'Masculin'}
                    {candidature.genre === 'F' && 'Féminin'}
                    {candidature.genre === 'AUTRE' && 'Autre'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nationalité</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.nationalite}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.adresse_complete}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Région d'origine</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.region_origine || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pays</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.pays}</dd>
                </div>
              </dl>
            </div>

            {/* Informations académiques */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informations académiques
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Spécialité demandée</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.specialite_demandee}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Niveau demandé</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidature.niveau_demande || '-'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Type de candidature</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {candidature.type_candidature?.replace(/_/g, ' ')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Informations supplémentaires */}
            {candidature.informations_supplementaires && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Informations supplémentaires
                </h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {candidature.informations_supplementaires}
                </p>
              </div>
            )}

            {/* Motif de rejet */}
            {candidature.motif_rejet && (
              <div className="bg-red-50 shadow rounded-lg p-6 border-l-4 border-red-500">
                <h2 className="text-lg font-medium text-red-900 mb-4">
                  Motif de rejet
                </h2>
                <p className="text-sm text-red-800 whitespace-pre-wrap">{candidature.motif_rejet}</p>
              </div>
            )}
          </div>

          {/* Colonne latérale - Résumé */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Résumé</h3>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Créée le</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(candidature.created_at)}
                  </dd>
                </div>
                {candidature.date_validation && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Validée le</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(candidature.date_validation)}
                    </dd>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-900 mb-2">Documents</dt>
                  <dd className="space-y-2">
                    {candidature.cv_url && (
                      <Button baseUrl={utils_getImageUrl(candidature.cv_url)} variant='perso' iconPosition='left' icon='ri-file-pdf-line mr-2 text-red-500' disabled={!candidature.cv_url} 
                        supStyle="flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                        cv
                      </Button>
                    )}
                    {candidature.lettre_motivation_url && (
                      <Button baseUrl={utils_getImageUrl(candidature.cv_url)} variant='perso' iconPosition='left' icon='ri-file-text-line mr-2 text-blue-500' disabled={!candidature.cv_url} 
                        supStyle="flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                        Lettre de motivation
                      </Button>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Documents fournis</h2>
          {candidature.cv_url || candidature.lettre_motivation_url ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {candidature.cv_url && (
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <i className="ri-file-pdf-line text-xl text-red-600"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Curriculum Vitae</h3>
                      <p className="text-xs text-gray-500">PDF</p>
                    </div>
                  </div>
                  <Button baseUrl={utils_getImageUrl(candidature.cv_url)} variant='perso' iconPosition='left' icon='ri-eye-line mr-1' disabled={!candidature.cv_url} supStyle="iinline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                    voir
                  </Button>
                  <span className="mx-2 text-gray-300">|</span>
                  <Button download action={handleDownloadCV} variant='perso' iconPosition='left' icon='ri-download-line' disabled={!candidature.cv_url} supStyle="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                    télécharger
                  </Button>
                </div>
              )}
              {candidature.lettre_motivation_url && (
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <i className="ri-file-text-line text-xl text-blue-600"></i>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Lettre de motivation</h3>
                      <p className="text-xs text-gray-500">PDF</p>
                    </div>
                  </div>
                  <Button baseUrl={utils_getImageUrl(candidature.lettre_motivation_url)} variant='perso' iconPosition='left' icon='ri-eye-line' disabled={!candidature.cv_url} supStyle="iinline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                    voir
                  </Button>
                  <span className="mx-2 text-gray-300">|</span>
                  <Button download action={handleDownloadLettre} variant='perso' iconPosition='left' icon='ri-download-line' disabled={!candidature.cv_url} supStyle="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                    télécharger
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="ri-inbox-line text-4xl text-gray-400"></i>
              <p className="mt-4 text-gray-500">Aucun document fourni</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'historique' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Historique</h2>
          <div className="flow-root">
            <ul className="-mb-8">
              <li className="relative pb-8">
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                      <i className="ri-file-add-line text-indigo-600"></i>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">Candidature créée</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={candidature.created_at}>{formatDate(candidature.created_at, 'long')}</time>
                    </div>
                  </div>
                </div>
              </li>

              {candidature.statut === 'VALIDE' && candidature.date_validation && (
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                        <i className="ri-check-line text-green-600"></i>
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">Candidature validée</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime={candidature.date_validation}>{formatDate(candidature.date_validation, 'long')}</time>
                      </div>
                    </div>
                  </div>
                </li>
              )}

              {candidature.statut === 'REJETE' && candidature.motif_rejet && (
                <li>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
                        <i className="ri-close-line text-red-600"></i>
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">Candidature rejetée</p>
                        <p className="mt-1 text-sm text-gray-600">{candidature.motif_rejet}</p>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rejeter la candidature
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Veuillez entrer une raison pour le rejet de cette candidature.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Raison du rejet..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                autoFocus
              />
              <div className="mt-6 flex gap-3">
                <Button
                  action={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  variant="perso"
                  supStyle="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Annuler
                </Button>
                <Button
                  action={handleReject}
                  variant="perso"
                  supStyle="flex-1 px-4 py-2 border border-transparent text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={validationLoading || !rejectReason.trim()}
                >
                  {validationLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Traitement...
                    </div>
                  ) : (
                    'Rejeter'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatureDetail;