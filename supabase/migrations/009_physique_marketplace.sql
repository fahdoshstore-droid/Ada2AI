-- ════════════════════════════════════════════════════════════════════
-- Migration 009: Ada2Physique — Coach Marketplace (offers + subscriptions)
-- Refs: spec §11 (offers), §12 (subscription architecture),
--       §22 (RLS boundaries), §24 (payment honesty)
--
-- Principles:
--   * Additive only — no drops, no reseed, no renumbering.
--   * Sport ID system (sport_identities) is untouched.
--   * Subscription is the purchase mechanism; the coach↔athlete
--     relationship (physique_coach_athletes) becomes the RESULT of an
--     ACTIVE subscription, never a manual/email assignment.
--   * Activation is server-side only (service_role / payment webhook) —
--     a frontend button can never flip a subscription to 'active'.
-- ════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────
-- A1. physique_coach_offers — a coach's purchasable packages
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.physique_coach_offers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id         uuid NOT NULL REFERENCES public.physique_coaches(coach_id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  price_amount     numeric NOT NULL CHECK (price_amount >= 0),
  currency         text NOT NULL DEFAULT 'SAR',
  billing_interval text NOT NULL DEFAULT 'month'
                   CHECK (billing_interval IN ('month','quarter','year')),
  is_active        boolean NOT NULL DEFAULT true,
  sort_order       int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_coach_offers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_coach_offers_coach
  ON public.physique_coach_offers(coach_id, is_active, sort_order);
DROP TRIGGER IF EXISTS trg_physique_coach_offers_updated_at ON public.physique_coach_offers;
CREATE TRIGGER trg_physique_coach_offers_updated_at BEFORE UPDATE ON public.physique_coach_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ────────────────────────────────────────────────────────────────────
-- A2. physique_subscriptions — the athlete→offer→coach purchase record
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.physique_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  coach_id    uuid NOT NULL REFERENCES public.physique_coaches(coach_id) ON DELETE CASCADE,
  offer_id    uuid REFERENCES public.physique_coach_offers(id) ON DELETE SET NULL,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','active','paused','cancelled','expired')),
  started_at  timestamptz,
  ended_at    timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_id, coach_id)
);
ALTER TABLE public.physique_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_subscriptions_athlete
  ON public.physique_subscriptions(athlete_id, status);
CREATE INDEX IF NOT EXISTS idx_physique_subscriptions_coach
  ON public.physique_subscriptions(coach_id, status);
DROP TRIGGER IF EXISTS trg_physique_subscriptions_updated_at ON public.physique_subscriptions;
CREATE TRIGGER trg_physique_subscriptions_updated_at BEFORE UPDATE ON public.physique_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ────────────────────────────────────────────────────────────────────
-- B. Activation helper (SECURITY DEFINER, server-side only)
--    Flips a subscription to 'active' AND creates/keeps the
--    coach↔athlete roster relationship. Callable ONLY by service_role
--    (the payment provider webhook / backend enforcer). The frontend
--    (anon/authenticated) can NEVER invoke it.
-- ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.physique_activate_subscription(p_subscription_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_athlete_id uuid;
  v_coach_id   uuid;
BEGIN
  -- Only the service role (payment webhook / trusted backend) may activate.
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'subscription activation is server-side only' USING ERRCODE = '42501';
  END IF;

  SELECT athlete_id, coach_id INTO v_athlete_id, v_coach_id
  FROM public.physique_subscriptions
  WHERE id = p_subscription_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.physique_subscriptions
  SET status = 'active', started_at = COALESCE(started_at, now()), updated_at = now()
  WHERE id = p_subscription_id;

  -- Establish (or preserve) the roster relationship as the RESULT of an
  -- active subscription. Upsert idempotently.
  INSERT INTO public.physique_coach_athletes (coach_id, athlete_id, status, started_at)
  VALUES (v_coach_id, v_athlete_id, 'active', now())
  ON CONFLICT (coach_id, athlete_id)
  DO UPDATE SET status = 'active', updated_at = now();
END;
$$;

-- Lock down: service_role only. Never grant to anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.physique_activate_subscription(uuid) FROM PUBLIC, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- C. RLS POLICIES
-- ════════════════════════════════════════════════════════════════════

-- ── physique_coaches (marketplace public read) ──
--   Coach marketing profiles are public for discovery. Sensitive identity
--   (email, in profiles) is never exposed here; stripe_account_id is an
--   internal Connect reference and is never selected by the frontend.
DROP POLICY IF EXISTS "physique_coaches_select_public" ON public.physique_coaches;
CREATE POLICY "physique_coaches_select_public" ON public.physique_coaches
  FOR SELECT USING (true);

-- ── physique_coach_offers ──
--   Public read (marketplace is public); coach owns their own offers.
DROP POLICY IF EXISTS "physique_coach_offers_select_public" ON public.physique_coach_offers;
CREATE POLICY "physique_coach_offers_select_public" ON public.physique_coach_offers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "physique_coach_offers_insert_own" ON public.physique_coach_offers;
CREATE POLICY "physique_coach_offers_insert_own" ON public.physique_coach_offers
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "physique_coach_offers_update_own" ON public.physique_coach_offers;
CREATE POLICY "physique_coach_offers_update_own" ON public.physique_coach_offers
  FOR UPDATE USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "physique_coach_offers_delete_own" ON public.physique_coach_offers;
CREATE POLICY "physique_coach_offers_delete_own" ON public.physique_coach_offers
  FOR DELETE USING (auth.uid() = coach_id);

-- ── physique_subscriptions ──
--   Athlete reads own; coach reads subscriptions of athletes on their roster;
--   admin/service read all. NO manual 'active' insert by the frontend — an
--   athlete may only INSERT a 'pending' subscription for themselves.
DROP POLICY IF EXISTS "physique_subscriptions_select" ON public.physique_subscriptions;
CREATE POLICY "physique_subscriptions_select" ON public.physique_subscriptions
  FOR SELECT USING (
    auth.uid() = athlete_id
    OR auth.uid() = coach_id
    OR public.physique_is_admin()
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "physique_subscriptions_insert_own_pending" ON public.physique_subscriptions;
CREATE POLICY "physique_subscriptions_insert_own_pending" ON public.physique_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = athlete_id AND status = 'pending'
  );

DROP POLICY IF EXISTS "physique_subscriptions_update_athlete" ON public.physique_subscriptions;
CREATE POLICY "physique_subscriptions_update_athlete" ON public.physique_subscriptions
  FOR UPDATE USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id AND status IN ('pending','cancelled'));

DROP POLICY IF EXISTS "physique_subscriptions_delete_athlete" ON public.physique_subscriptions;
CREATE POLICY "physique_subscriptions_delete_athlete" ON public.physique_subscriptions
  FOR DELETE USING (auth.uid() = athlete_id AND status = 'pending');

COMMIT;

-- ════════════════════════════════════════════════════════════════════
-- VERIFICATION CHECKLIST
--   [ ] physique_coach_offers + physique_subscriptions exist, RLS on
--   [ ] Offers are public-read; coach owns insert/update/delete of own
--   [ ] Athlete can only insert a 'pending' subscription for self
--   [ ] No frontend path can set status='active' (service_role only via
--       physique_activate_subscription)
--   [ ] Active subscription idempotently creates coach↔athlete relationship
--   [ ] sport_identities untouched; no renumbering; no drops
-- ════════════════════════════════════════════════════════════════════
