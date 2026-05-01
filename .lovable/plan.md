
# Plan — Tendrix App v1, MVP fonctionnel (étapes 1→5)

Cette itération livre un MVP utilisable de bout en bout :
1. Corrections UI immédiates de l'écran Opportunités
2. Auth multi-rôles (entreprise / chargé d'affaires / admin) avec redirection
3. Onboarding parcours A : l'admin crée le compte, l'entreprise se connecte par magic link
4. Flux BOAMP nettoyé + matching par règles + bouton "Demander une réponse" qui crée un vrai dossier
5. Messagerie entreprise ↔ chargé d'affaires par dossier

Reportés à un sprint ultérieur (préparés au niveau schéma/architecture mais pas implémentés) :
- Onboarding parcours B autonome (questionnaire + Calendly)
- Stripe (abonnement, à l'AO, Connect, commissions)
- Notifications push (FCM / OneSignal)
- Backoffice admin web complet
- Espace chargé d'affaires complet (facturation, ranking)
- IA (analyse PDF, génération de réponse, matching ML)

Identité visuelle, bottom nav 3 onglets, et logo restent inchangés.

---

## 1. Corrections UI immédiates — `LastMinuteAO.tsx` & `TenderPreview.tsx`

Règle générale : **masquer la ligne** plutôt qu'afficher "Non spécifié" / "undefined".

- Organisme : si vide → afficher la collectivité ou la zone géo dispo, sinon masquer la ligne.
- Lieu : si vide → masquer la ligne.
- Budget : si vide → masquer la ligne.
- Deadline : si vide → masquer, et afficher un petit bouton `?` qui ouvre la vue détail AO (pas un texte "Non spécifié").
- Compatibilité : si non calculable (donnée source absente), masquer le bloc Progress + label, ne plus afficher "N/A" ni 0%.
- Résumé : si vide, masquer entièrement (déjà partiellement fait).

Vue détail AO (`/tender-details`) — ajouter / vérifier l'affichage de : objet complet, organisme, budget, deadline, lots, critères d'attribution, documents requis, lien BOAMP source. Si un champ manque, masquer.

Aucun changement de couleurs, typo, logo ou nav.

---

## 2. Auth multi-rôles + redirection

### Schéma base de données (migration)

```sql
-- enum des rôles
create type public.app_role as enum ('entreprise', 'charge_affaires', 'admin');

-- table user_roles séparée (jamais sur profiles, anti-escalade)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- security definer pour éviter récursion RLS
create function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- profiles entreprise (1 par compte entreprise)
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  siren text,
  sector text,
  zone text,
  assigned_charge_affaires uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- profiles chargé d'affaires
create table public.charge_affaires_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  email text,
  specialties text[],
  created_at timestamptz not null default now()
);
```

RLS : entreprise ne lit que sa propre `companies` ; chargé d'affaires lit les `companies` qui lui sont assignées ; admin lit tout via `has_role(auth.uid(),'admin')`.

### Auth flow

- Magic link prioritaire (`supabase.auth.signInWithOtp`), mot de passe en alternative.
- Page `/login` unique. À la connexion réussie, lecture de `user_roles` puis redirection :
  - `entreprise` → `/app` (mobile app existante, onglet Opportunités)
  - `charge_affaires` → `/charge-affaires` (nouveau, simple liste de dossiers assignés)
  - `admin` → `/admin` (placeholder web simple : liste des entreprises et bouton "créer compte entreprise")
- Hook `useAuth()` + composant `<RequireRole role="...">` pour protéger les routes.

---

## 3. Onboarding parcours A (création par admin)

Backoffice admin minimal sur `/admin` :
- Tableau des entreprises (nom, SIREN, secteur, zone, chargé d'affaires assigné, date création).
- Bouton "Créer un compte entreprise" → modale : email entreprise, nom, SIREN, secteur, zone, chargé d'affaires (select).
- À la soumission, edge function `admin-create-company` :
  - utilise `service_role` pour `auth.admin.inviteUserByEmail` (envoie magic link)
  - insère ligne `companies` + ligne `user_roles` (rôle `entreprise`)
- Bouton "Inviter un chargé d'affaires" : même mécanique, rôle `charge_affaires`.

À la première connexion entreprise, écran de bienvenue avec profil pré-rempli, bouton "Valider" ou "Compléter".

Parcours B autonome (questionnaire 6 étapes + Calendly + mode pré-onboarding flouté) : **reporté**, mais la table `companies` a déjà tous les champs nécessaires.

---

## 4. Flux BOAMP propre + matching + dossiers

### Schéma

```sql
create table public.tenders (
  id text primary key,                -- id BOAMP
  title text not null,
  summary text,
  organisme text,
  location text,
  budget text,
  date_publication timestamptz,
  deadline date,
  famille text,
  procedure text,
  cpv_codes text[],
  source_url text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table public.tender_requests (        -- "dossiers"
  id uuid primary key default gen_random_uuid(),
  tender_id text not null references public.tenders(id),
  company_id uuid not null references public.companies(id) on delete cascade,
  charge_affaires_id uuid references auth.users(id),
  status text not null default 'demande',   -- demande | en_cours | soumis | gagne | perdu
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tender_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id),
  body text not null,
  attachments jsonb default '[]',
  created_at timestamptz not null default now()
);
```

RLS messages/requests : l'entreprise propriétaire et le chargé d'affaires assigné peuvent lire/écrire ; admin a tout accès via `has_role`.

### Edge function existante `fetch-boamp-tenders`

- Adapter pour upsert dans la table `tenders` (au lieu de retourner un payload volatil).
- Le hook `useBoampTenders` lit en base avec un filtre par compatibilité côté client v1.
- Bouton refresh = relance l'edge function.

### Matching v1 (règles, côté hook)

Pondération simple (déjà ébauchée dans `useBoampTenders`) :
- 40% match secteur / CPV (à partir du profil entreprise courant)
- 40% proximité géographique (zone vs `location`)
- 20% fourchette budget (parsée)

Le `companies` du user courant est lu une fois, le score recalculé pour chaque tender. Si un input manque, ignorer la composante (pas de score artificiel).

### Bouton "Demander une réponse"

Remplace l'enregistrement local `useState` actuel par :
- Insert dans `tender_requests` (status `demande`, `company_id` du user, `charge_affaires_id` = celui assigné à la company)
- Toast confirmation "Votre chargé d'affaires reviendra vers vous sous 4h"
- Redirection vers l'onglet `Mes dossiers`

L'onglet "Mes demandes" est renommé **"Mes dossiers"** et lit `tender_requests` du user, groupé par statut (`Demandés / Soumis / Gagnés / Perdus`).

### Ajout manuel d'AO

Bouton `+` en haut de l'onglet Opportunités, modale avec :
- Onglet "URL" : champ URL + champs objet/budget/deadline/lieu manuels
- Onglet "PDF" : upload vers bucket Supabase Storage `tender-uploads` + champs manuels

Insertion dans `tenders` avec id `manual-{uuid}` et `source_url` = URL ou chemin storage. **Pas d'analyse IA** en v1 (placeholder pour Lot 2).

---

## 5. Messagerie par dossier

Écran détail dossier (clic sur une carte de "Mes dossiers") :
- Header : titre AO, statut, deadline, chargé d'affaires assigné
- Fil de messages (lecture `messages` filtré par `request_id`, ordre chronologique)
- Composeur : textarea + upload pièce jointe (bucket `message-attachments`)
- Realtime via `supabase.channel().on('postgres_changes', ...)` pour push live
- Indicateur "lu" : colonne `read_at` à ajouter (ou table `message_reads`) — version simple en v1 : timestamp `last_read_at` sur `tender_requests` par rôle

Côté chargé d'affaires : route `/charge-affaires` liste ses `tender_requests` assignés ; clic ouvre le même écran de dossier (même composant).

**Permissions strictes côté backend** : RLS vérifie que `company_id` appartient à l'utilisateur OU `charge_affaires_id = auth.uid()` OU rôle admin. Le chargé d'affaires ne voit aucun champ commercial de l'entreprise au-delà du nom (vue restreinte via une `view` ou colonnes filtrées dans l'API).

---

## 6. Données de seed (Supabase)

Migration `seed` séparée (idempotente, avec `on conflict do nothing`) :
- 5 entreprises mock (Pulsat Saint-Gilles, PME BTP, PME médicale, indépendant nettoyage, PME services)
- 3 chargés d'affaires mock (BTP, fournitures, services)
- 20 tenders mock avec scores variés (30→95%) + 4 last-minute (deadline < 7j)
- 5 dossiers mock (1 en attente, 2 en cours, 1 gagné, 1 perdu)
- 1 compte admin (les comptes auth doivent être créés à la main via dashboard ou seed script edge function — sera documenté)

---

## 7. Détails techniques

- Stack inchangée : React + Vite + Tailwind + Supabase (déjà connecté).
- Pas de Capacitor / React Native dans cette itération — la PWA actuelle reste responsive et installable.
- Hébergement : Supabase déjà en région par défaut, à valider en production.
- Validation : `zod` côté formulaires (création company, login, message).
- Edge functions à créer : `admin-create-company`, `admin-invite-charge-affaires`. La fonction `fetch-boamp-tenders` est étendue pour upsert.
- Storage buckets : `tender-uploads` (privé) et `message-attachments` (privé), policies par dossier.
- ⚠️ Auth doit être activée et l'URL de redirection (`Site URL` + `Redirect URLs`) configurée dans Supabase pour que les magic links fonctionnent — étape à confirmer après le build.

---

## 8. Critères de succès de cette itération

- Aucun "undefined" / "Non spécifié" sur l'écran Opportunités.
- Un admin peut créer un compte entreprise en moins de 2 min ; l'entreprise reçoit un magic link et atterrit sur `/app`.
- Un chargé d'affaires connecté ne voit que ses dossiers (test RLS).
- Le clic sur "Demander une réponse" crée bien une ligne en base et apparaît immédiatement dans "Mes dossiers".
- Un message envoyé apparaît en temps réel chez l'autre partie via Supabase Realtime.

---

## 9. Hors-périmètre explicite

- Pas de Stripe, pas de paiement, pas de commissions.
- Pas de notifications push mobiles (toast in-app uniquement).
- Pas de questionnaire autonome ni d'intégration Calendly.
- Pas d'IA (pas d'analyse PDF, pas de génération de réponse, pas de matching ML).
- Pas de backoffice admin riche (dashboard analytics, exports compta) — juste le strict nécessaire pour créer comptes et assigner.
- Pas de refonte design / nav / logo.

Une fois cette base validée, on enchaîne par sprints : (a) parcours B + Calendly, (b) Stripe + Connect, (c) push + RGPD avancée, (d) IA + ranking.
