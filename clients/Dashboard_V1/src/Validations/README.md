# Guide d'utilisation des validations de formulaire

## Vue d'ensemble

Ce dossier contient tous les schémas de validation Yup pour les formulaires de l'application. Chaque table de la base de données a un fichier de validation correspondant.

## Structure des fichiers

```
Validations/
├── StudentsCheckForm.ts          # Validation des étudiants
├── CandidatureCheckForm.ts       # Validation des candidatures
├── PresenceCheckForm.ts          # Validation des présences
├── PaiementDroitsCheckForm.ts    # Validation des paiements
├── NoteCheckForm.ts              # Validation des notes
├── InscriptionCheckForm.ts       # Validation des inscriptions
├── MatiereCheckForm.ts           # Validation des matières
├── ValidationUtils.ts            # Utilitaires de validation
└── index.ts                      # Exports centralisés
```

## Fichiers de validation disponibles

### 1. StudentsCheckForm.ts
Validation pour les données d'étudiant.

```typescript
import { studentsSchema, studentsStepSchemas, yupToFormErrors } from '@/Validations';

// Pour une validation complète
const errors = await studentsSchema.validate(formData);

// Pour une validation par étape
const stepErrors = await studentsStepSchemas[currentStep].validate(stepData);
```

**Champs validés:**
- `prenom` (requis, 2-100 caractères)
- `nom` (requis, 2-100 caractères)
- `email` (requis, email valide)
- `date_naissance` (requis, date dans le passé)
- `genre` (requis, homme/femme/autre)
- `telephone` (optionnel, format valide)
- `niveau` (requis, L1/L2/L3/M1/M2)

### 2. CandidatureCheckForm.ts
Validation pour les candidatures.

```typescript
import { candidatureSchema } from '@/Validations';

await candidatureSchema.validate(candidatureData);
```

**Champs validés:**
- `statut` (requis, EN_ATTENTE/EN_EVALUATION/COMPLET/VALIDE/REJETE/ANNULE)
- `frais_dossier` (optionnel, positif)
- `frais_payes` (optionnel, positif)

### 3. PresenceCheckForm.ts
Validation pour les présences.

```typescript
import { presenceSchema } from '@/Validations';

await presenceSchema.validate(presenceData);
```

**Champs validés:**
- `etudiant_id` (requis, positif)
- `seance_id` (requis, positif)
- `present` (requis, booléen)
- `justification` (requis si absent)

### 4. PaiementDroitsCheckForm.ts
Validation pour les paiements de droits.

```typescript
import { paiementDroitsSchema } from '@/Validations';

await paiementDroitsSchema.validate(paymentData);
```

**Champs validés:**
- `montant_total` (requis, positif)
- `montant_paye` (requis, ≤ montant_total)
- `statut_paiement` (requis, IMPAYE/PARTIEL/COMPLET/EXONERE)

### 5. NoteCheckForm.ts
Validation pour les notes.

```typescript
import { noteSchema } from '@/Validations';

await noteSchema.validate(noteData);
```

**Champs validés:**
- `note_cc` (optionnel, 0-20)
- `note_examen` (optionnel, 0-20)
- `note_tp` (optionnel, 0-20)
- `note_finale` (optionnel, 0-20)

### 6. InscriptionCheckForm.ts
Validation pour les inscriptions.

```typescript
import { inscriptionSchema } from '@/Validations';

await inscriptionSchema.validate(inscriptionData);
```

### 7. MatiereCheckForm.ts
Validation pour les matières.

```typescript
import { matiereSchema } from '@/Validations';

await matiereSchema.validate(matiereData);
```

## Utilisation dans les Context

Exemple d'intégration dans un contexte React:

```typescript
import { studentsSchema, yupToFormErrors } from '@/Validations';

const createStudent = useCallback(async (data: IEtudiantFormRequest) => {
  try {
    // Validation
    await studentsSchema.validate(data, { abortEarly: false });
    
    // Si valide, envoyer à l'API
    const response = await api.post('/api/students', data);
    
  } catch (error: any) {
    // Traiter les erreurs de validation
    if (error.inner) {
      const validationErrors = yupToFormErrors(error);
      dispatch({ type: "SET_ERRORS", payload: validationErrors });
    }
  }
}, []);
```

## Utilisation dans les composants formulaire

### Avec Formik

```typescript
import { Formik, Form, Field } from 'formik';
import { studentsSchema } from '@/Validations';

<Formik
  initialValues={initialData}
  validationSchema={studentsSchema}
  onSubmit={onSubmit}
>
  {({ errors, touched, values, setFieldValue }) => (
    <Form>
      <Field name="prenom" />
      {errors.prenom && touched.prenom && (
        <span>{errors.prenom}</span>
      )}
    </Form>
  )}
</Formik>
```

### Avec React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { studentsSchema } from '@/Validations';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(studentsSchema)
});
```

## Validations personnalisées

Utilisez `commonValidations` pour créer rapidement vos schémas:

```typescript
import { commonValidations } from '@/Validations';

const mySchema = Yup.object().shape({
  email: commonValidations.email,
  phone: commonValidations.phone,
  birthDate: commonValidations.pastDate,
  score: commonValidations.grade,
});
```

## Tests de validation

```typescript
import { validateSchema } from '@/Validations';
import { studentsSchema } from '@/Validations';

const testData = {
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean@example.com',
  // ...
};

const { valid, errors } = await validateSchema(studentsSchema, testData);

if (!valid) {
  console.log('Erreurs:', errors);
}
```

## Ajouter une nouvelle validation

1. Créer un nouveau fichier: `NomTableCheckForm.ts`
2. Importer et utiliser Yup
3. Créer le schéma principal et les schémas par étape
4. Ajouter une fonction `yupToFormErrors`
5. Exporter dans `index.ts`

Exemple:

```typescript
import * as Yup from 'yup';

export const mySchema = Yup.object().shape({
  field1: Yup.string().required('Field1 est requis'),
  field2: Yup.number().positive('Field2 doit être positif'),
});

export const myStepSchemas = [
  Yup.object().shape({
    field1: Yup.string().required('Field1 est requis'),
  }),
  // ...
];

export const yupToFormErrors = (error: Yup.ValidationError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.inner.forEach((err) => {
    if (err.path) {
      errors[err.path] = err.message;
    }
  });
  return errors;
};
```

## Recommandations

- Toujours utiliser `abortEarly: false` pour récupérer tous les erreurs à la fois
- Personnaliser les messages d'erreur en français si nécessaire
- Créer des validations réutilisables dans `ValidationUtils.ts`
- Faire valider côté client ET côté serveur
- Tester les schémas avant de les utiliser en production

## Ressources

- [Documentation Yup](https://github.com/jquense/yup)
- [Formik + Yup](https://formik.org/docs/guides/validation)
- [React Hook Form + Yup](https://react-hook-form.com/form-builder)
