# Tendrix

Application web/mobile de recommandation et de réponse aux appels d'offres publics
pour les artisans et TPE/PME du BTP.

- L'entreprise voit les **opportunités pertinentes** pour son métier (source BOAMP).
- Elle lance une **analyse IA** du marché (verdict Go / Go avec réserve, lots,
  prérequis, critères) à partir du DCE.
- Elle génère une **première version de réponse** (mémoire technique, pièces
  administratives) à partir de son profil et de sa librairie de documents.
- Un **chargé d'affaires** l'accompagne ; le robot récupère les DCE quand c'est
  possible, sinon reprise manuelle.

## Stack

- **Front** : React + Vite + TypeScript + Tailwind + shadcn/ui (React Router).
- **Back** : Supabase (Auth, Postgres, Storage, Edge Functions Deno).
- **IA** : API Anthropic (Claude).
- **Paiement** : Stripe (packs de crédits).
- **Robot DCE** : Trigger.dev + Playwright.
- **Déploiement** : Vercel (front) + Supabase (fonctions).

## Développement local

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Déploiement

- **Front** : push sur `main` → déploiement automatique Vercel.
- **Edge Functions** : `supabase functions deploy <nom> --project-ref <ref>`.
- **Robot** : `npx trigger.dev@latest deploy`.

## Variables d'environnement (secrets Supabase)

`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
`TRIGGER_SECRET_KEY`, `APP_URL` (URL publique de l'app, ex. https://tendrix.fr).
