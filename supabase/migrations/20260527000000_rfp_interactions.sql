-- ============================================================
-- rfp_interactions
-- Enregistre chaque interaction utilisateur avec un AO :
--   view          → AO affiché à l'utilisateur
--   read_summary  → "Lire le résumé" cliqué
--   accept        → "Demander une réponse" confirmé
--   reject        → "Refuser" cliqué
--
-- Ces données alimentent l'algorithme de recommandation (RAG)
-- et permettent de personnaliser le scoring futur des AO.
-- ============================================================

CREATE TABLE IF NOT EXISTS rfp_interactions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      uuid        REFERENCES companies(id) ON DELETE SET NULL,
  tender_id       text        NOT NULL,
  action_type     text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Snapshot des caractéristiques de l'AO au moment de l'interaction.
  -- Stocké en JSONB pour ne pas dépendre de la table tenders (données BOAMP éphémères).
  -- Champs attendus : title, sector, market_type, budget_estimate, cpv_codes,
  --                   deadline, organisme, location, compatibility_score
  tender_metadata jsonb       NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT rfp_interactions_action_type_check
    CHECK (action_type IN ('view', 'read_summary', 'accept', 'reject'))
);

-- Commentaires métier pour la lisibilité côté admin/data
COMMENT ON TABLE  rfp_interactions IS 'Historique des interactions entreprises avec les AO — source de vérité pour la personalisation IA';
COMMENT ON COLUMN rfp_interactions.tender_metadata IS 'Snapshot JSONB de l''AO : title, sector, budget_estimate, cpv_codes, compatibility_score, etc.';
COMMENT ON COLUMN rfp_interactions.action_type     IS 'view | read_summary | accept | reject';

-- Index optimisés pour les requêtes de l'algo de reco
CREATE INDEX idx_rfp_interactions_user_id    ON rfp_interactions(user_id);
CREATE INDEX idx_rfp_interactions_company_id ON rfp_interactions(company_id);
CREATE INDEX idx_rfp_interactions_action     ON rfp_interactions(action_type);
CREATE INDEX idx_rfp_interactions_created    ON rfp_interactions(created_at DESC);
-- Index composite pour "quels AO a rejeté/accepté cette entreprise ?" (requête algo)
CREATE INDEX idx_rfp_interactions_company_action ON rfp_interactions(company_id, action_type);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE rfp_interactions ENABLE ROW LEVEL SECURITY;

-- Entreprise : peut insérer et lire ses propres interactions
CREATE POLICY "entreprise_insert_own_interactions" ON rfp_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entreprise_read_own_interactions" ON rfp_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Chargé d'affaires : lecture des interactions des sociétés qui lui sont assignées
CREATE POLICY "ca_read_assigned_company_interactions" ON rfp_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = rfp_interactions.company_id
        AND c.assigned_charge_affaires = auth.uid()
    )
  );

-- Admin : accès total en lecture
CREATE POLICY "admin_read_all_interactions" ON rfp_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
