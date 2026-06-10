# CLAUDE.md — Tendrix (webapp de production)

> **But de ce fichier** : permettre à une nouvelle session Claude Code de reprendre le travail
> immédiatement, sans relire l'historique. **À tenir à jour à chaque décision technique
> structurante** (nouvelle table, nouvelle fonction Edge, changement d'archi, convention, etc.) —
> ajoute une ligne datée dans le **Journal des décisions** en bas.

---

## 1. Le projet

**Tendrix** est un SaaS qui aide les **TPE/PME (BTP en priorité)** à **détecter, analyser et
remporter des marchés publics**. Promesse : voir les appels d'offres (AO) pertinents, obtenir un
verdict **Go / Go-avec-réserve** en ~90 s, et générer une **première version de réponse**
(mémoire technique + pièces). Un **chargé d'affaires (CA)** humain accompagne l'entreprise.

**Tunnel de vente** : Landing (`/`) → questionnaire d'onboarding (`/questionnaire-pme`) →
app cliente (`/app`) → analyse d'un AO (1 crédit) → fiche analyse → « Répondre » (5 crédits) →
brouillon de réponse IA → achat de crédits (Stripe).

Fondateur : **Julien Malherbe** — non-dev, comprend la logique/archi, pilote le produit.
Préférences : avancer par étapes, être prévenu avant les modifs larges multi-fichiers, honnêteté
sur les données factices/approches imparfaites, **ne jamais inventer de données**.

---

## 2. Stack technique

| Couche | Techno |
|---|---|
| **Front** | React 18 + **Vite** + TypeScript + **Tailwind** + **shadcn/ui** (Radix) + **React Router v6** |
| **State serveur** | `@tanstack/react-query` + `@supabase/supabase-js` |
| **Formulaires** | `react-hook-form` + `zod` |
| **Icônes** | `lucide-react` (jamais de CDN/UMD) |
| **Graphes** | `recharts` ; carte : `mapbox-gl` |
| **Back** | **Supabase** : Auth, Postgres (RLS), Storage, **Edge Functions** (Deno) |
| **IA** | API **Anthropic Claude** — modèle `claude-sonnet-4-5` |
| **Paiement** | **Stripe** (packs de crédits one-shot, pas d'abonnement) |
| **Robot DCE** | **Trigger.dev v4** + **Playwright** (+ Stagehand pour scraping générique) ; projet `tendrix-scraper` |
| **Hébergement** | Front : **Vercel** (auto-deploy depuis `main`). Fonctions : Supabase. Robot : Trigger.dev cloud |

Polices : **Plus Jakarta Sans** (UI) + **Spline Sans Mono** (chiffres `.tnum`/`.mono`), chargées via
`<link>` dans `index.html`. Police app legacy : Inter.

---

## 3. Architecture des dossiers

```
src/
  App.tsx                 # routes (BrowserRouter) + providers (Auth, QueryClient)
  main.tsx                # entrée ; importe index.css + styles/tendrix-design.css
  pages/
    Index.tsx             # LANDING (/) — design handoff, scopé .tdx-landing
    ClientApp.tsx         # /app — aiguillage responsive : useIsMobile() ? MobileApp : DesktopApp
    DesktopApp.tsx        # shell desktop (sidebar + topbar + écrans), design .tdx-app
    MobileApp.tsx         # app mobile (bottom nav)
    AnalysisDetail.tsx    # fiche analyse — variante mobile + variante desktop (prop onBack/embedded)
    ResponseDetail.tsx    # dossier de réponse — idem (mobile + desktop 2 colonnes)
    QuestionnairePME.tsx  # entrée du tunnel (onboarding)
    Login / LoginCA / InscriptionCA / ResetPassword
    AdminDashboard / ChargeAffaires   # back-offices (rôles admin / CA)
    Dashboard / BetaOffer / TenderDetails / MentionsLegales / NotFound
  components/
    ui/                   # shadcn/ui (Button, Dialog, Tabs, Accordion, …)
    desktop/DesignKit.tsx # composants design partagés : MatchRing, MatchBar, VChip, Deadline, Avatar, useCountUp
    mobile/               # écrans/briques mobile (CompanyProfile, Tarification, DemoChat, AddTenderDialog, …)
    onboarding/ ca/       # briques onboarding & espace CA
    (racine)              # composants legacy de l'ANCIENNE landing (Hero, Header, Pricing…) — plus importés
  hooks/
    use-mobile.tsx        # useIsMobile() — breakpoint 768px (window.innerWidth)
    useAuth.tsx           # auth + rôles + defaultRouteForRole
    useCurrentCompany.tsx / useCredits.tsx / useCAProfile.ts / useDossiers.tsx
    useBoampTenders.tsx   # fetch + reco BOAMP (dictionnaire métiers, filtrage)
  lib/
    dce-classify.ts       # classification déterministe des documents DCE (type, lots, lots ouverts)
    credit-packs.ts       # offres + grille de coûts (miroir de _shared/credit-packs.ts)
    library.ts            # catégories de documents de la librairie entreprise
    device.ts / utils.ts
  styles/
    tendrix-design.css    # design system app desktop, scopé .tdx-app (tokens :root globaux)
    landing.css           # design system landing, scopé .tdx-landing
  integrations/supabase/  # client supabase + types générés
  trigger/                # tasks Trigger.dev (scrape-dce.ts) + adapters/ (aws, place, emarchespublics, stagehand) + lib/
supabase/
  functions/              # Edge Functions Deno (voir §5) + _shared/ (code partagé Deno)
  migrations/             # 27+ migrations SQL (schéma, RPC, RLS, buckets)
  config.toml             # ⚠️ project_id OBSOLÈTE (voir §6)
design/                   # (si présent) maquettes de référence du handoff, NON compilées
```

---

## 4. Décisions techniques importantes (déjà prises)

- **Responsive par composant racine** : `/app` rend `ClientApp` qui choisit `MobileApp` ou
  `DesktopApp` via `useIsMobile()` (< 768 px = mobile). Les écrans de détail partagés
  (`AnalysisDetail`, `ResponseDetail`, `DemoChat`) ont une **variante desktop intégrée** activée
  par les props `onBack`/`embedded`/`desktop`. **Ne jamais casser la branche mobile** en touchant
  ces fichiers.
- **Design system scopé**, pas global : `tendrix-design.css` sous `.tdx-app`, `landing.css` sous
  `.tdx-landing`. Choix délibéré pour ne pas affecter le reste de l'app/marketing. Les tokens de
  marque (`--navy #0c1c98`, `--yellow #f9bd43`, neutres, verdicts) sont en `:root` (inoffensifs).
- **Icônes** : `lucide-react` en composants. Les classes `.ico-sm/.ico-md` dimensionnent le `<svg>`
  (règle `.tdx-app svg.ico-sm`), mais le plus fiable est de passer `size={…}` directement.
- **Moteur d'analyse** (`analyze-tender`) :
  - PDF envoyés à Claude via **URL signées** (`source.type:"url"`), **jamais en base64**
    (l'encodage de gros PDF dépasse la limite CPU ~2 s de l'Edge → kill `WORKER_LIMIT` HTTP 546).
  - Office (.docx/.xlsx) : texte extrait via `_shared/office-extract.ts` (fflate).
  - `AbortController` timeout 110 s + statut `failed` propre + **remboursement crédit** si échec.
  - Sortie JSON Claude (prefill `{`) → `report` aligné Iziao : `avis, attention, description,
    lots, calendrier, jugement, lieu, duree, visites, qualifications`, **+ `compatibilite` (0-100)
    + `budget_estime`** (estimation honnête/à la louche).
  - **Verdicts** : seulement `go` / `go_with_reserve`. Tout `no_go` est clampé en
    `go_with_reserve` (règle produit : pas d'avis négatif). La compatibilité (%) reste honnête.
- **Recommandations BOAMP** (`useBoampTenders`) : dictionnaire de métiers BTP (detect/target/cpv),
  score = métier 60 % + zone 40 %. `isPresentable` n'exclut **que les AO périmés** (ne plus exclure
  les publiés le jour même — ça vidait le feed). Fallback fetch BOAMP direct si < 10 AO présentables.
- **Crédits / paiement** : packs Stripe via `price_data` inline (pas de produits Stripe). Webhook
  `--no-verify-jwt`, `constructEventAsync` + `createSubtleCryptoProvider` (Deno). Créditation
  idempotente via RPC `grant_credits_for_session` (update du pending → paid puis crédit).
  **Valeur du crédit = 0,10 € HT** (`CREDIT_UNIT_CENTS=10`). Coûts ALIGNÉS sur la grille
  (`lib/credit-packs.ts`) : **analyse = 50 crédits** (RPC `spend_credit_and_start_analysis`,
  déduit 50 ; `refund_credit` rembourse 50 ; UI `ANALYSIS_COST=50`), **réponse = 3500**
  (RPC `spend_credits`, `RESPONSE_CREDIT_COST=3500`). Mémoire 2500 / Dépôt 2000 / Lot 1000.
  **Crédits offerts à l'inscription = 50** (`companies.credits default 50` = 1 analyse gratuite).
- **Robot DCE** : le DCE n'est pas dans le BOAMP → on extrait le lien du profil acheteur
  (`resolve-dce`/`dce-resolver`), puis Trigger.dev + Playwright télécharge selon la plateforme.
  Réf. consultation = `cac:CallForTendersDocumentReference > cbc:ID` (eForms), **pas**
  `ContractFolderID` (UUID). achatpublic = automatisable (anonyme) ; marches-publics.info (AW) &
  e-marchespublics = compte/captcha → manuel / partenariat.
- **Lovable supprimé** : le repo a été initié via Lovable, toute référence retirée (plugin
  `lovable-tagger`, méta, redirections `*.lovable.app` → `APP_URL`). Ne pas réintroduire.

---

## 5. Edge Functions (Supabase, Deno)

| Fonction | Rôle |
|---|---|
| `analyze-tender` | Analyse IA d'un AO (PDF+Office → Claude) → `report` + verdict + compat + budget |
| `generate-response` | Génère le brouillon de réponse (synthèse, mémoire, pièces, à compléter) |
| `generate-tender-summary` | Résumé court d'un AO |
| `fetch-boamp-tenders` | Peuple la table `tenders` depuis le BOAMP |
| `resolve-dce` | Extrait le lien profil acheteur / réf. consultation depuis l'annonce |
| `start-scrape` | Déclenche le robot Trigger.dev de récupération du DCE |
| `notify-ca` / `notify-manual` | Emails au CA (nouvelle analyse / DCE à récupérer manuellement) |
| `stripe-checkout` / `stripe-webhook` | Achat de crédits (recalcul prix serveur) + créditation |
| `admin-create-company` / `admin-invite-charge-affaires` | Back-office admin (invitations) |

Code Deno partagé : `supabase/functions/_shared/` (`dce-classify`, `dce-resolver`,
`office-extract`, `credit-packs`).

---

## 6. Commandes & déploiement

```sh
npm run dev      # dev local (Vite)
npm run build    # build prod (esbuild via Vite — ignore les erreurs TS périmées ; sert de check)
npm run lint     # eslint
```

- **Front** : commit/push sur `main` → **Vercel déploie automatiquement**. Remote :
  `github.com/juliendetendrix/tendrix-tender-simplify`.
- **Edge Functions** : `supabase functions deploy <nom> --project-ref sibdcdjgpjbfxhemlfkh`
- **Robot** : `npx trigger.dev@latest deploy` (projet `tendrix-scraper`).

### ⚠️ Référence Supabase
Le **vrai** project ref est **`sibdcdjgpjbfxhemlfkh`**. Le `project_id` dans
`supabase/config.toml` (`jtpydtjgjnvzmjaynlal`) est **OBSOLÈTE/FAUX** — toujours passer
`--project-ref sibdcdjgpjbfxhemlfkh` explicitement (deploy, SQL via Management API, secrets).

---

## 7. Conventions de code

- **Commits** : style Conventional Commits en français (`feat(scope): …`, `fix(...)`, `chore(...)`,
  `style(...)`, `revert(...)`). Terminer le message par :
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Build avant push** : lancer `npm run build` pour valider, puis `git pull --rebase origin main`
  avant `git push` (le remote peut avoir avancé).
- **TS** : composants fonctionnels, hooks `useXxx`. Données serveur via react-query / supabase.
- **Style** : Tailwind + classes shadcn pour l'app legacy ; **design system** (`.tdx-app` /
  `.tdx-landing`) pour les écrans redesignés (classes `.card`, `.btn`, `.v-chip`, `.page`, …).
- **Variantes mobile/desktop** : un seul composant, branche conditionnelle (`if (embedded)` /
  `if (desktop)`) ; le contenu data/handlers est partagé (source unique), seul le layout diffère.
- **Honnêteté données** : ne pas afficher de valeurs inventées (ex. KPI dérivés du réel ; budget =
  « non précisé » si rien ; pas de delta sans historique).

---

## 8. Points d'attention spécifiques

### Sécurité — RÈGLES STRICTES (ne jamais enfreindre)
- **Ne jamais demander, saisir ou afficher** de secret : `sk_…` (Stripe secret),
  `whsec_…` (webhook), `service_role`, `ANTHROPIC_API_KEY`, etc. → **Julien les saisit lui-même**
  dans les dashboards Supabase/Stripe. On ne manipule que les clés **publiques** (`pk_…`).
- Webhook Stripe : sélectionner **uniquement** l'event `checkout.session.completed`.
- **Ne jamais** recréer/régénérer le logo Tendrix ; ne pas toucher aux DNS MX/mail.
- **Ne jamais** créer de compte automatiquement, saisir de mot de passe, ni résoudre de CAPTCHA
  (plateformes de dématérialisation) — c'est hors limites.
- Déployer **uniquement** sur `--project-ref sibdcdjgpjbfxhemlfkh`.

### Pièges techniques
- **HTTP 546 WORKER_LIMIT** sur Edge : provient d'un dépassement CPU (~2 s), souvent l'encodage
  base64 de gros fichiers. Préférer URL signées / streaming.
- **Date machine = 2026** : le filtrage des AO se base sur la date réelle du navigateur.
- `supabase/config.toml` project_id faux (voir §6).
- L'app n'est **pas** publiée sur les stores : les badges App Store / Google Play de la landing
  sont décoratifs et pointent vers le tunnel.

### Variables d'environnement (secrets Supabase — NE PAS committer)
`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
`TRIGGER_SECRET_KEY`, `APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### Outils de vérif visuelle
Aperçu live via les outils `preview_*` (serveur `tendrix-preview`, port 3001). L'app bascule en
mobile sous 768 px : **forcer une largeur ≥ 1280** (`preview_resize`) pour voir le desktop.

---

## 9. Journal des décisions (à compléter)

- **2026-06-08** — Création de ce CLAUDE.md.
- **2026-06-08** — Design system officiel (handoff Claude Design) implémenté : webapp desktop
  (`.tdx-app`) + landing (`.tdx-landing`), composants `DesignKit`. Variantes desktop 2 colonnes
  pour fiche analyse & dossier de réponse + espace Messages desktop.
- **2026-06-08** — `analyze-tender` produit `compatibilite` (0-100) + `budget_estime` ; affichés
  en anneau (`MatchRing`) + ligne budget sur la fiche desktop.
- **2026-06-08** — Fix feed reco : `isPresentable` n'exclut plus les AO publiés le jour même ; le
  fetch BOAMP direct s'enclenche dès < 10 AO *présentables*.
- **2026-06-08** — Suppression complète de Lovable du repo.
- **2026-06-08** — Landing : largeur étendue (`--maxw` 1560px) + badges App Store/Google Play.
- **2026-06-08** — Pop-up « chargé d'affaires assigné » (`ChargeAffairesWelcome`) à la 1re arrivée
  sur DesktopApp ; flag `tendrix_ca_welcome_seen` posé **à la fermeture** (survit au double-montage
  StrictMode).
- **2026-06-08** — Aperçu marché desktop (`TenderPreviewDesktop`) : clic sur une ligne Marchés →
  infos réelles + compatibilité estimée + résumé IA (`useTenderSummary`) + fiche analyse floutée
  sous CTA « Lancer l'analyse ». Géré via `previewTender` dans DesktopApp.
