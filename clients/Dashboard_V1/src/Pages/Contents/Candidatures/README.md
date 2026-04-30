# Gestion des Candidatures - Documentation Complète

## 🎯 Vue d'ensemble

Ce module gère le flux complet des candidatures en ligne pour les étudiants futurs. Les candidats soumettent un dossier de candidature qui est ensuite évalué par les administrateurs. Une fois validée, le compte étudiant et l'utilisateur sont créés automatiquement.

## 📂 Structure des fichiers

```
frontend/Gestionnaire/src/Pages/Contents/Candidatures/
├── CandidaturesList.tsx          # Liste avec statistiques et filtres
├── CandidatureDetail.tsx          # Détails d'une candidature
└── FormCandidature.tsx            # Formulaire de candidature

frontend/Gestionnaire/src/types/
└── ICandidature.ts                # Interfaces TypeScript

API/Students/
└── src/
    ├── routes/candidatures.ts    # Routes API
    └── controllers/              # Contrôleurs
```

## 🔄 Flux de processus

```
1. SOUMISSION (FormCandidature.tsx)
   ↓
   POST /api/candidatures
   ├─ Crée une entrée Candidature
   └─ Statut: EN_COURS
   
2. ÉVALUATION (CandidaturesList.tsx + CandidatureDetail.tsx)
   ↓
   Admin consulte les candidatures
   ├─ Peut voir les détails
   ├─ Peut changer le statut
   └─ Peut laisser des commentaires
   
3. VALIDATION (CandidatureDetail.tsx)
   ↓
   PUT /api/candidatures/{id}/validate
   ├─ Déclenche le trigger DB
   ├─ Crée Utilisateur + Etudiant
   ├─ Lie candidature à l'étudiant
   └─ Envoie email de confirmation
```

## 🎨 Interfaces créées

### 1. **CandidaturesList.tsx**
Page principale avec:
- **Statistiques**: Cards montrant le nombre de candidatures par statut
- **Filtres**: Par statut, filière, type
- **Recherche**: Par nom, prénom, email
- **Tableau**: Liste paginée des candidatures

**Composants utilisés:**
- Button (actions)
- Input (recherche)
- Select (filtres)
- StatCard personnalisé

### 2. **CandidatureDetail.tsx**
Détails complets avec:
- **En-tête**: Photo profil, nom, statut
- **Onglets**:
  - Info: Détails personnels et académiques
  - Documents: CV, lettre de motivation
  - Historique: Timeline des actions
- **Actions**: Valider, Rejeter (avec modal), Retour
- **Modal de rejet**: Raison du rejet requise

### 3. **FormCandidature.tsx**
Formulaire en ligne composé de:
- **Infos personnelles**: Nom, email, tel, DOB, address...
- **Infos académiques**: Filière, spécialité, niveau (chargés dynamiquement)
- **Documents**: Photo, CV, lettre (avec uploads)
- **Infos supplémentaires**: Texte libre

**Spécificités:**
- Pas d'authentification requise
- Les niveaux sont filtrés selon la spécialité sélectionnée
- Upload de fichiers (photos, CV, lettre)
- Message de succès post-soumission

## 🔌 Interfaces TypeScript

```typescript
// Types de statut
type StatutCandidature = 'EN_COURS' | 'COMPLET' | 'EN_EVALUATION' | 'VALIDE' | 'REJETO' | 'ANNULE';

// Interface principale
interface ICandidature {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  // ... autres champs personnels
  specialite_demandee: string;
  niveau_demande: string;
  statut: StatutCandidature;
  // ...
}
```

Voir `frontend/Gestionnaire/src/types/ICandidature.ts` pour la liste complète.

## 🗄️ Structure de la base de données

### Table `Candidature`
```sql
CREATE TABLE Candidature (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  -- ... infos personnelles
  specialite_demandee VARCHAR(20) NOT NULL,
  niveau_demande VARCHAR(50) NOT NULL,
  statut ENUM(...) DEFAULT 'EN_COURS',
  cv_url VARCHAR(255),
  lettre_motivation_url VARCHAR(255),
  photo_profil VARCHAR(255),
  -- ...
  etudiant_id INT UNIQUE NULL, -- Créé lors de la validation
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Trigger automatique
```sql
-- trigger_create_user_and_student_on_candidature_validation
-- Déclenché: AFTER UPDATE candidature.statut = 'VALIDE'
-- Crée automatiquement:
--   1. Utilisateur (avec password temporaire)
--   2. Etudiant (avec les infos du formulaire)
--   3. Lie la candidature à l'étudiant
```

## 🔌 Points d'intégration API

### Liste des endpoints à créer

#### GET /api/candidatures
Récupère toutes les candidatures avec filtrage

**Paramètres:**
```
?statut=EN_COURS
?specialite=ECO-GEST
?search=Dupont
?page=1&limit=20
```

**Réponse:**
```json
[
  {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "statut": "EN_EVALUATION",
    // ...
  }
]
```

#### POST /api/candidatures
Crée une nouvelle candidature (sans authentification)

**Body:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "specialite_demandee": "ECO-GEST",
  "niveau_demande": "L1",
  // ... autres champs
}
```

#### GET /api/candidatures/:id
Récupère les détails d'une candidature

#### PUT /api/candidatures/:id/validate
Valide une candidature (Admin only)

**Déclencheurs:**
- Trigger: crée User + Etudiant
- Email: confirmation au candidat avec identifiants

#### PUT /api/candidatures/:id/reject
Rejette une candidature

**Body:**
```json
{
  "motif_rejet": "Raison du rejet..."
}
```

#### PUT /api/candidatures/:id
Met à jour une candidature

#### DELETE /api/candidatures/:id
Supprime une candidature

### Endpoints de support

#### GET /api/filieres
```json
[
  {
    "code": "ECO",
    "nom": "Économie",
    "departement": "Sciences Économiques"
  }
]
```

#### GET /api/specialites?filiere=ECO
```json
[
  {
    "code": "ECO-GEST",
    "nom": "Gestion d'Entreprise",
    "filiere_code": "ECO",
    "niveaux_offerts": "[\"L1\",\"L2\",\"L3\",\"M1\"]"
  }
]
```

## 🚀 Intégration dans le routing

Ajoutez ces routes dans votre configuration de routing:

```typescript
// App.tsx ou Router.tsx
import CandidaturesList from './Pages/Contents/Candidatures/CandidaturesList';
import CandidatureDetail from './Pages/Contents/Candidatures/CandidatureDetail';
import FormCandidature from './Pages/Contents/Candidatures/FormCandidature';

// Routes protégées (Admin)
<Route path="/candidatures" element={<CandidaturesList />} />
<Route path="/candidatures/:id" element={<CandidatureDetail />} />

// Route publique
<Route path="/candidatures/form" element={<FormCandidature />} />
<Route path="/candidatures/success" element={<SuccessPage />} />
```

## 📊 État et contexte

Optionnel: Créer un contexte similaire à `StudentsContext`

```typescript
// CandidaturesContext.tsx
interface CandidaturesContextState {
  candidatures: ICandidature[];
  selectedCandidature: ICandidature | null;
  filters: ICandidatureFilters;
  stats: ICandidatureStats;
  loading: boolean;
}

const useCandidatures = () => {
  // fetchCandidatures()
  // validateCandidature()
  // rejectCandidature()
  // setFilters()
  // ...
};
```

## 📝 Notes de développement

### Points TODO dans le code
Tous les appels API sont marqués: `// TODO: Remplacer par le vrai endpoint API`

### Authentification
- **Formulaire public**: Aucune authentification requise
- **Liste/détails**: Authentification admin requise
- **Validation/rejet**: Authentification admin requise

### Upload fichiers
- Photos: `photo_profil` - max 5MB, image/* uniquement
- CV: `cv_url` - max 5MB, PDF/DOC/DOCX
- Lettre: `lettre_motivation_url` - max 5MB, PDF/DOC/DOCX

Les chemins doivent être stockés dans la DB (via une API d'upload)

### Envois d'emails
À implémenter après validation:
- Email de confirmation au candidat
- Email aux admins (optional)
- Rapport d'activité hebdomadaire

## 🎨 Cohérence visuelle

Les interfaces utilisent:
- **Couleurs**: 
  - EN_COURS: Blue
  - COMPLET: Cyan
  - EN_EVALUATION: Yellow
  - VALIDE: Green
  - REJETO: Red
  - ANNULE: Gray
- **Icônes**: Remixicon (ri-*)
- **Composants**: Input, Select, Button personnalisés
- **Layout**: Tailwind CSS (identique à StudentsList)

## ✅ Checklist d'intégration

- [ ] Créer les routes API pour candidatures
- [ ] Implémenter les contrôleurs/services
- [ ] Configurer l'upload fichiers
- [ ] Ajouter l'authentification admin
- [ ] Configurer les envois d'email
- [ ] Tester le trigger DB
- [ ] Ajouter les routes de navigation
- [ ] Mettre à jour le menu latéral
- [ ] Tests end-to-end
- [ ] Documentation API

## 📞 Support

Pour toute question ou amélioration:
1. Vérifier les TODO dans les fichiers
2. Consulter les types dans `ICandidature.ts`
3. Aligner avec le pattern existant de StudentsList
