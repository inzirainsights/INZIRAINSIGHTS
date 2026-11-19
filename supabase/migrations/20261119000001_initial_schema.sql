-- ============================================================
-- INZIRA INSIGHTS — Full Schema
-- ============================================================

-- ── users (profile table, linked to auth.users) ──────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  supabase_uid  UUID UNIQUE,
  avatar_url    TEXT,
  business_name TEXT,
  business_id   INTEGER  -- FK added after businesses table
);

-- ── businesses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id          SERIAL PRIMARY KEY,
  owner_id    INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  type        TEXT DEFAULT 'retail',
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users
  ADD CONSTRAINT fk_users_business
  FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL;

-- ── stock_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_items (
  id             SERIAL PRIMARY KEY,
  owner_id       INTEGER REFERENCES public.users(id),
  business_id    INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  sku            TEXT,
  category       TEXT DEFAULT 'General',
  selling_price  NUMERIC(12,2) DEFAULT 0,
  cost_price     NUMERIC(12,2) DEFAULT 0,
  quantity       INTEGER DEFAULT 0,
  reorder_level  INTEGER DEFAULT 5,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── customers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER REFERENCES public.users(id),
  business_id   INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  credit_limit  NUMERIC(12,2) DEFAULT 0,
  balance       NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── suppliers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppliers (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER REFERENCES public.users(id),
  business_id   INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── sales ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales (
  id              SERIAL PRIMARY KEY,
  owner_id        INTEGER REFERENCES public.users(id),
  business_id     INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  cashier_id      INTEGER REFERENCES public.users(id),
  customer_id     INTEGER REFERENCES public.customers(id) ON DELETE SET NULL,
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method  TEXT DEFAULT 'cash',
  is_voided       BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id             SERIAL PRIMARY KEY,
  sale_id        INTEGER REFERENCES public.sales(id) ON DELETE CASCADE,
  stock_item_id  INTEGER REFERENCES public.stock_items(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  quantity       INTEGER NOT NULL,
  unit_price     NUMERIC(12,2) NOT NULL,
  total          NUMERIC(12,2) NOT NULL
);

-- ── expenses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER REFERENCES public.users(id),
  business_id   INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  category      TEXT NOT NULL DEFAULT 'General',
  description   TEXT,
  amount        NUMERIC(12,2) NOT NULL,
  date          DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── invoices ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id            SERIAL PRIMARY KEY,
  owner_id      INTEGER REFERENCES public.users(id),
  business_id   INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id   INTEGER REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_no    TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  paid_amount   NUMERIC(12,2) DEFAULT 0,
  status        TEXT DEFAULT 'pending',
  due_date      DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── health_scores ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.health_scores (
  id              SERIAL PRIMARY KEY,
  business_id     INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  score           NUMERIC(5,2),
  revenue_score   NUMERIC(5,2),
  stock_score     NUMERIC(5,2),
  customer_score  NUMERIC(5,2),
  notes           TEXT,
  computed_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── loan_applications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id            SERIAL PRIMARY KEY,
  business_id   INTEGER REFERENCES public.businesses(id) ON DELETE CASCADE,
  lender_id     INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  amount        NUMERIC(12,2) NOT NULL,
  purpose       TEXT,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER so RLS can call them)
-- ============================================================

CREATE OR REPLACE FUNCTION public.my_user_id()
RETURNS INTEGER LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT id FROM public.users WHERE supabase_uid = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.users WHERE supabase_uid = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.my_business_id()
RETURNS INTEGER LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT business_id FROM public.users WHERE supabase_uid = auth.uid() AND role <> 'sme_owner'),
    (SELECT id FROM public.businesses WHERE owner_id = (SELECT id FROM public.users WHERE supabase_uid = auth.uid()))
  )
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ── users ────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile"   ON public.users FOR SELECT  USING (supabase_uid = auth.uid());
CREATE POLICY "users_own_update"    ON public.users FOR UPDATE  USING (supabase_uid = auth.uid());
CREATE POLICY "admin_users_all"     ON public.users FOR ALL     USING (public.my_role() = 'pulse_admin');

-- ── businesses ───────────────────────────────────────────────
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_biz_all"       ON public.businesses FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "owner_own_biz"       ON public.businesses FOR ALL    USING (owner_id = public.my_user_id());
CREATE POLICY "employee_read_biz"   ON public.businesses FOR SELECT USING (id = public.my_business_id());
CREATE POLICY "lender_read_biz"     ON public.businesses FOR SELECT USING (public.my_role() IN ('lender','databridge_advisor'));

-- ── stock_items ───────────────────────────────────────────────
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_stock_all"     ON public.stock_items FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_stock"           ON public.stock_items FOR ALL    USING (business_id = public.my_business_id());

-- ── customers ─────────────────────────────────────────────────
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_cust_all"      ON public.customers FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_cust"            ON public.customers FOR ALL    USING (business_id = public.my_business_id());

-- ── suppliers ─────────────────────────────────────────────────
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_supp_all"      ON public.suppliers FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_supp"            ON public.suppliers FOR ALL    USING (business_id = public.my_business_id());

-- ── sales ─────────────────────────────────────────────────────
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_sales_all"     ON public.sales FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_sales"           ON public.sales FOR ALL    USING (business_id = public.my_business_id());

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_si_all"        ON public.sale_items FOR ALL
  USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_si"              ON public.sale_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.business_id = public.my_business_id()));

-- ── expenses ──────────────────────────────────────────────────
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_exp_all"       ON public.expenses FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_exp"             ON public.expenses FOR ALL    USING (business_id = public.my_business_id());

-- ── invoices ──────────────────────────────────────────────────
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_inv_all"       ON public.invoices FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "biz_inv"             ON public.invoices FOR ALL    USING (business_id = public.my_business_id());

-- ── health_scores ─────────────────────────────────────────────
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_hs_all"        ON public.health_scores FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "owner_hs"            ON public.health_scores FOR SELECT USING (business_id = public.my_business_id());
CREATE POLICY "lender_hs"           ON public.health_scores FOR SELECT USING (public.my_role() IN ('lender','databridge_advisor'));

-- ── loan_applications ─────────────────────────────────────────
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_loan_all"      ON public.loan_applications FOR ALL    USING (public.my_role() = 'pulse_admin');
CREATE POLICY "owner_loan"          ON public.loan_applications FOR ALL    USING (business_id = public.my_business_id());
CREATE POLICY "lender_loan"         ON public.loan_applications FOR ALL    USING (lender_id = public.my_user_id() OR public.my_role() = 'lender');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Deduct stock when a sale_item is inserted
CREATE OR REPLACE FUNCTION public.deduct_stock_on_sale()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stock_item_id IS NOT NULL THEN
    UPDATE public.stock_items SET quantity = quantity - NEW.quantity WHERE id = NEW.stock_item_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deduct_stock
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_stock_on_sale();

-- Restore stock when a sale is voided
CREATE OR REPLACE FUNCTION public.restore_stock_on_void()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_voided = TRUE AND OLD.is_voided = FALSE THEN
    UPDATE public.stock_items s
    SET quantity = s.quantity + si.quantity
    FROM public.sale_items si
    WHERE si.sale_id = NEW.id AND si.stock_item_id = s.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_restore_stock
  AFTER UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_void();
