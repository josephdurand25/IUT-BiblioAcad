import React, { useState, useEffect } from 'react';

import type { IMatiereCreate, IMatiereUpdate } from '../types/IMatiere';
import { useAcademicResources } from '../../../Contexts/AcademicResourcesContext';
import { useMatieres } from '../../../Contexts/MatiereContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Input } from '../../components/Input';
import { Spinner } from '../../components/Spinner';
import type { IUniteEnseignement } from '../../../types/ICours';
import type { IFiliere } from '../../../types/IFiliere';
import Modal from '../../components/Modal';
import { Select } from '../../components/Select';

// ─────────────────────────── Dashboard Principal ─────────────────────────────

const AcademicResourcesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ues' | 'filieres' | 'groupes' | 'annees' | 'salles' | 'matieres'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewResourceModal, setShowNewResourceModal] = useState(false);
  
  const academicResources = useAcademicResources();
  const matieresContext = useMatieres();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      switch (activeTab) {
        case 'ues':
          academicResources.setSearchTerm(searchTerm);
          academicResources.fetchUEs();
          break;
        case 'filieres':
          academicResources.setSearchTerm(searchTerm);
          academicResources.fetchFilieres();
          break;
        case 'groupes':
          academicResources.setSearchTerm(searchTerm);
          academicResources.fetchGroupesUE();
          break;
        case 'matieres':
          matieresContext.actions.setSearchTerm(searchTerm);
          matieresContext.actions.fetchMatieres();
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Ressources Académiques</h1>
        <p className="text-gray-600">Administrez les UE, filières, groupes, années académiques et salles</p>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Navigation par onglets */}
          <div className="flex flex-wrap gap-2">
            <TabButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon="ri-dashboard-line"
            >
              Vue d'ensemble
            </TabButton>
            <TabButton 
              active={activeTab === 'ues'} 
              onClick={() => setActiveTab('ues')}
              icon="ri-book-line"
            >
              Unités d'Enseignement
            </TabButton>
            <TabButton 
              active={activeTab === 'filieres'} 
              onClick={() => setActiveTab('filieres')}
              icon="ri-graduation-cap-line"
            >
              Filières
            </TabButton>
            <TabButton 
              active={activeTab === 'groupes'} 
              onClick={() => setActiveTab('groupes')}
              icon="ri-group-line"
            >
              Groupes UE
            </TabButton>
            <TabButton 
              active={activeTab === 'matieres'} 
              onClick={() => setActiveTab('matieres')}
              icon="ri-book-mark-line"
            >
              Matières
            </TabButton>
            <TabButton 
              active={activeTab === 'annees'} 
              onClick={() => setActiveTab('annees')}
              icon="ri-calendar-line"
            >
              Années Académiques
            </TabButton>
            <TabButton 
              active={activeTab === 'salles'} 
              onClick={() => setActiveTab('salles')}
              icon="ri-building-line"
            >
              Salles
            </TabButton>
          </div>

          {/* Barre de recherche et bouton d'ajout */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                labelText=''
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
                inputStyle="pl-10"
              />
              <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
            </div>
            <Button
              variant="accent" 
              icon="ri-search-line"
              action={handleSearch}
            >
              Rechercher
            </Button>
            <Button 
              variant="success" 
              icon="ri-add-line"
              action={() => setShowNewResourceModal(true)}
            >
              Nouvelle ressource
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {academicResources.state.processing ? (
          <div className="flex justify-center py-12">
            <Spinner size="large" variant="primary" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'ues' && <UESTab />}
            {activeTab === 'filieres' && <FilieresTab />}
            {activeTab === 'groupues' && <GroupesUETab />}
            {activeTab === 'matieres' && <MatieresTab />}
            {activeTab === 'annees' && <AnneesTab />}
            {activeTab === 'salles' && <SallesTab />}
          </>
        )}
      </div>

      {/* Modal pour créer une nouvelle ressource */}
      {showNewResourceModal && (
        <NewResourceModal 
          activeTab={activeTab}
          onClose={() => setShowNewResourceModal(false)}
        />
      )}
    </div>
  );
};

// ─────────────────────────── Composants d'onglets ─────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <i className={icon}></i>
      <span className="font-medium">{children}</span>
    </button>
  );
};

// ─────────────────────────── Vue d'ensemble ─────────────────────────────

const OverviewTab: React.FC = () => {
  const academicResources = useAcademicResources();
  const matieresContext = useMatieres();

  useEffect(() => {
    academicResources.fetchAcademicStats();
    matieresContext.actions.fetchMatiereStatistics();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vue d'ensemble</h2>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Unités d'Enseignement"
          value={academicResources.state.academicStats?.totalUEs || 0}
          icon="ri-book-line"
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Filières"
          value={academicResources.state.academicStats?.totalFilieres || 0}
          icon="ri-graduation-cap-line"
          color="green"
          trend="+5%"
        />
        <StatCard
          title="Groupes UE"
          value={academicResources.state.academicStats?.totalGroupesUE || 0}
          icon="ri-group-line"
          color="purple"
          trend="+8%"
        />
        <StatCard
          title="Matières"
          value={matieresContext.state.statistics?.total_matieres || 0}
          icon="ri-book-mark-line"
          color="orange"
          trend="+15%"
        />
      </div>

      {/* Graphiques ou liste rapide des ressources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières UE ajoutées */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Dernières UE ajoutées</h3>
          {academicResources.state.ues.slice(0, 5).map((ue) => (
            <ResourceItem key={ue.code} item={ue} type="ue" />
          ))}
        </div>

        {/* Dernières filières ajoutées */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Dernières filières ajoutées</h3>
          {academicResources.state.filieres.slice(0, 5).map((filiere) => (
            <ResourceItem key={filiere.code} item={filiere} type="filiere" />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <i className={`${icon} text-2xl`}></i>
        </div>
        <span className={`text-sm font-medium ${
          trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </div>
  );
};

interface ResourceItemProps {
  item: IUniteEnseignement | IFiliere;
  type: 'ue' | 'filiere';
}

const ResourceItem: React.FC<ResourceItemProps> = ({ item, type }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors">
      <div>
        <h4 className="font-medium text-gray-900">{item.nom}</h4>
        <p className="text-sm text-gray-500">
          {type === 'ue' ? `Code: ${item.code}` : `Département: ${(item as IFiliere).departement}`}
        </p>
      </div>
      <i className="ri-arrow-right-s-line text-gray-400"></i>
    </div>
  );
};

// ─────────────────────────── Onglet Unités d'Enseignement ─────────────────────────────

const UESTab: React.FC = () => {
  const [showUEModal, setShowUEModal] = useState(false);
  const [selectedUE, setSelectedUE] = useState<IUniteEnseignement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const academicResources = useAcademicResources();

  useEffect(() => {
    academicResources.fetchUEs();
  }, []);

  const handleEdit = (ue: IUniteEnseignement) => {
    setSelectedUE(ue);
    setShowUEModal(true);
  };

  const handleDelete = async (code: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette UE ?')) {
      await academicResources.deleteUE(code);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Unités d'Enseignement</h2>
        <Button 
          variant="accent" 
          icon="ri-add-line"
          action={() => {
            setSelectedUE(null);
            setShowUEModal(true);
          }}
        >
          Nouvelle UE
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Code</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Crédits</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Volume Horaire</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Semestre</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {academicResources.state.ues.map((ue) => (
              <tr key={ue.code} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{ue.code}</td>
                <td className="p-3">{ue.nom}</td>
                <td className="p-3">{ue.credits_ects}</td>
                <td className="p-3">{ue.volume_horaire}h</td>
                <td className="p-3">S{ue.semestre}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="small"
                      icon="ri-edit-line"
                      action={() => handleEdit(ue)}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small"
                      icon="ri-delete-bin-line"
                      action={() => handleDelete(ue.code)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUEModal && (
        <UEModal 
          ue={selectedUE}
          onClose={() => setShowUEModal(false)}
          onSubmit={selectedUE ? 
            (data) => academicResources.updateUE(selectedUE.code!, data) : 
            (data) => academicResources.createUE(data)
          }
        />
      )}
    </div>
  );
};

// ─────────────────────────── Modal UE ─────────────────────────────

interface UEModalProps {
  ue: IUniteEnseignement | null;
  onClose: () => void;
  onSubmit: (data: Partial<IUniteEnseignement>) => Promise<void>;
}

const UEModal: React.FC<UEModalProps> = ({ ue, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<IUniteEnseignement>>({
    code: '',
    nom: '',
    description: '',
    credits_ects: 0,
    volume_horaire: 0,
    semestre: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ue) {
      setFormData(ue);
    }
  }, [ue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={ue ? 'Modifier UE' : 'Nouvelle UE'}
      onConfirm={handleSubmit}
      onCancel={onClose}
      confirmText={ue ? 'Mettre à jour' : 'Créer'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          labelText="Code UE"
          name="code"
          value={formData.code}
          onChange={(e) => setFormData({...formData, code: e.target.value})}
          required
          disabled={!!ue}
        />
        <Input
          labelText="Nom"
          name="nom"
          value={formData.nom}
          onChange={(e) => setFormData({...formData, nom: e.target.value})}
          required
        />
        <Input
          labelText="Description"
          name="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            labelText="Crédits ECTS"
            name="credits_ects"
            type="number"
            min="1"
            max="30"
            value={formData.credits_ects}
            onChange={(e) => setFormData({...formData, credits_ects: parseInt(e.target.value)})}
            required
          />
          <Input
            labelText="Volume Horaire (h)"
            name="volume_horaire"
            type="number"
            min="1"
            value={formData.volume_horaire}
            onChange={(e) => setFormData({...formData, volume_horaire: parseInt(e.target.value)})}
            required
          />
        </div>
        <Input
          labelText="Semestre"
          name="semestre"
          type="number"
          min="1"
          max="10"
          value={formData.semestre}
          onChange={(e) => setFormData({...formData, semestre: parseInt(e.target.value)})}
          required
        />
      </form>
    </Modal>
  );
};

// ─────────────────────────── Onglet Filières ─────────────────────────────

const FilieresTab: React.FC = () => {
  const [showFiliereModal, setShowFiliereModal] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState<IFiliere | null>(null);
  const academicResources = useAcademicResources();

  useEffect(() => {
    academicResources.fetchFilieres();
  }, []);

  const handleEdit = (filiere: IFiliere) => {
    setSelectedFiliere(filiere);
    setShowFiliereModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Filières</h2>
        <Button 
          variant="accent" 
          icon="ri-add-line"
          action={() => {
            setSelectedFiliere(null);
            setShowFiliereModal(true);
          }}
        >
          Nouvelle filière
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicResources.state.filieres.map((filiere) => (
          <FiliereCard 
            key={filiere.code} 
            filiere={filiere}
            onEdit={() => handleEdit(filiere)}
            onDelete={() => academicResources.deleteFiliere(filiere.code!)}
          />
        ))}
      </div>

      {showFiliereModal && (
        <FiliereModal 
          filiere={selectedFiliere}
          onClose={() => setShowFiliereModal(false)}
          onSubmit={selectedFiliere ? 
            (data) => academicResources.updateFiliere(selectedFiliere.code!, data) : 
            (data) => academicResources.createFiliere(data)
          }
        />
      )}
    </div>
  );
};

interface FiliereCardProps {
  filiere: IFiliere;
  onEdit: () => void;
  onDelete: () => void;
}

const FiliereCard: React.FC<FiliereCardProps> = ({ filiere, onEdit, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{filiere.nom}</h3>
          <p className="text-sm text-gray-500">Code: {filiere.code}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          filiere.statut === 'actif' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {filiere.statuit === 'actif' ? 'Actif' : 'Inactif'}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{filiere.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <i className="ri-building-line"></i>
          {filiere.departement}
        </span>
        <span className="flex items-center gap-1">
          <i className="ri-group-line"></i>
          {filiere.nombre_etudiants || 0} étudiants
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="small"
          icon="ri-edit-line"
          action={onEdit}
          className="flex-1"
        >
          Modifier
        </Button>
        <Button 
          variant="danger" 
          size="small"
          icon="ri-delete-bin-line"
          action={onDelete}
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
};

// ─────────────────────────── Modal Filière ─────────────────────────────

interface FiliereModalProps {
  filiere: IFiliere | null;
  onClose: () => void;
  onSubmit: (data: Partial<IFiliere>) => Promise<void>;
}

const FiliereModal: React.FC<FiliereModalProps> = ({ filiere, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<IFiliere>>({
    code: '',
    nom: '',
    description: '',
    departement: '',
    statut: 'actif',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filiere) {
      setFormData(filiere);
    }
  }, [filiere]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={filiere ? 'Modifier filière' : 'Nouvelle filière'}
      onConfirm={handleSubmit}
      onCancel={onClose}
      confirmText={filiere ? 'Mettre à jour' : 'Créer'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            labelText="Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            required
            disabled={!!filiere}
          />
          <Input
            labelText="Nom"
            name="nom"
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            required
          />
        </div>
        <Input
          labelText="Département"
          name="departement"
          value={formData.departement}
          onChange={(e) => setFormData({...formData, departement: e.target.value})}
          required
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Niveaux offerts</label>
          <div className="flex flex-wrap gap-2">
            {['L1', 'L2', 'L3', 'M1', 'M2'].map((niveau) => (
              <label key={niveau} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.niveaux_offerts || []).includes(niveau)}
                  onChange={(e) => {
                    const niveaux = Array.isArray(formData.niveaux_offerts) 
                      ? [...formData.niveaux_offerts] 
                      : [];
                    if (e.target.checked) {
                      niveaux.push(niveau);
                    } else {
                      const index = niveaux.indexOf(niveau);
                      if (index > -1) niveaux.splice(index, 1);
                    }
                    setFormData({...formData, niveaux_offerts: niveaux});
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{niveau}</span>
              </label>
            ))}
          </div>
        </div>
        <Select
          labelText="Statut"
          name="statut"
          value={formData.statut}
          onChange={(e) => setFormData({...formData, statut: e.target.value as 'actif' | 'inactif'})}
          options={[
            { id: 1, value: 'actif', label: 'Actif' },
            { id: 2, value: 'inactif', label: 'Inactif' },
          ]}
          requis
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        </div>
      </form>
    </Modal>
  );
};

// ─────────────────────────── Onglet Matières ─────────────────────────────

const MatieresTab: React.FC = () => {
  const [showMatiereModal, setShowMatiereModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState<IMatiere | null>(null);
  const matieresContext = useMatieres();

  useEffect(() => {
    matieresContext.actions.fetchMatieres();
  }, []);

  const handleEdit = (matiere: IMatiere) => {
    setSelectedMatiere(matiere);
    setShowMatiereModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Matières</h2>
        <div className="flex gap-3">
          <Select
            labelText=""
            name="filterUE"
            onChange={(e) => matieresContext.actions.setFilters({ ue_code: e.target.value })}
            options={[]}
            styleContainer="w-48"
          />
          <Button 
            variant="accent" 
            icon="ri-add-line"
            action={() => {
              setSelectedMatiere(null);
              setShowMatiereModal(true);
            }}
          >
            Nouvelle matière
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Code</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Nom</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Crédits</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Volume H.</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">UE</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matieresContext.state.matieres.map((matiere) => (
              <tr key={matiere.code} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{matiere.code}</td>
                <td className="p-3">{matiere.nom}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    matiere.type_cours === 'CM' ? 'bg-blue-100 text-blue-800' :
                    matiere.type_cours === 'TD' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {matiere.type_cours}
                  </span>
                </td>
                <td className="p-3">{matiere.credits}</td>
                <td className="p-3">{matiere.volume_horaire}h</td>
                <td className="p-3">{matiere.ue_code}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="small"
                      icon="ri-edit-line"
                      action={() => handleEdit(matiere)}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small"
                      icon="ri-delete-bin-line"
                      action={() => matieresContext.actions.deleteMatiere(matiere.code)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMatiereModal && (
        <MatiereModal 
          matiere={selectedMatiere}
          onClose={() => setShowMatiereModal(false)}
          onSubmit={selectedMatiere ? 
            (data) => matieresContext.actions.updateMatiere(selectedMatiere.code, data) : 
            (data) => matieresContext.actions.createMatiere(data as IMatiereCreate)
          }
        />
      )}
    </div>
  );
};

// ─────────────────────────── Modal Matière ─────────────────────────────

interface MatiereModalProps {
  matiere: IMatiere | null;
  onClose: () => void;
  onSubmit: (data: IMatiereUpdate | IMatiereCreate) => Promise<void>;
}

const MatiereModal: React.FC<MatiereModalProps> = ({ matiere, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<IMatiereUpdate | IMatiereCreate>({
    code: '',
    nom: '',
    type_cours: 'CM',
    credits: 0,
    coefficient: 1.0,
    volume_horaire: 0,
    ue_code: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matiere) {
      setFormData(matiere);
    }
  }, [matiere]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={matiere ? 'Modifier matière' : 'Nouvelle matière'}
      onConfirm={handleSubmit}
      onCancel={onClose}
      confirmText={matiere ? 'Mettre à jour' : 'Créer'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            labelText="Code"
            name="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            required
            disabled={!!matiere}
          />
          <Input
            labelText="Nom"
            name="nom"
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            required
          />
        </div>
        
        <Select
          labelText="Type de cours"
          name="type_cours"
          value={formData.type_cours}
          onChange={(e) => setFormData({...formData, type_cours: e.target.value})}
          options={[
            { id: 1, value: 'CM', label: 'Cours Magistral (CM)' },
            { id: 2, value: 'TD', label: 'Travaux Dirigés (TD)' },
            { id: 3, value: 'TP', label: 'Travaux Pratiques (TP)' },
            { id: 4, value: 'PROJET', label: 'Projet' },
            { id: 5, value: 'STAGE', label: 'Stage' },
          ]}
          requis
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            labelText="Crédits"
            name="credits"
            type="number"
            min="1"
            value={formData.credits}
            onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
            required
          />
          <Input
            labelText="Coefficient"
            name="coefficient"
            type="number"
            step="0.1"
            min="0.1"
            max="1"
            value={formData.coefficient}
            onChange={(e) => setFormData({...formData, coefficient: parseFloat(e.target.value)})}
            required
          />
          <Input
            labelText="Volume Horaire"
            name="volume_horaire"
            type="number"
            min="1"
            value={formData.volume_horaire}
            onChange={(e) => setFormData({...formData, volume_horaire: parseInt(e.target.value)})}
            required
          />
        </div>

        <Input
          labelText="Code UE"
          name="ue_code"
          value={formData.ue_code}
          onChange={(e) => setFormData({...formData, ue_code: e.target.value})}
          required
        />
      </form>
    </Modal>
  );
};

// ─────────────────────────── Onglet Années Académiques ─────────────────────────────

const AnneesTab: