-- ============================================================
-- INZIRA INSIGHTS — Seed Data
-- Auth users are created separately via admin API (see seed_auth.sh)
-- This file seeds public.users, businesses, and demo data
-- ============================================================

-- Users (supabase_uid filled in by seed_auth.sh after auth users are created)
INSERT INTO public.users (email, name, role, business_name) VALUES
  ('owner@inzira.rw',      'Demo Owner',       'sme_owner',          'Demo Business Ltd'),
  ('admin@inzira.rw',      'Platform Admin',   'pulse_admin',        NULL),
  ('manager@inzira.rw',    'Demo Manager',     'manager',            'Demo Business Ltd'),
  ('cashier@inzira.rw',    'Demo Cashier',     'cashier',            'Demo Business Ltd'),
  ('accountant@inzira.rw', 'Demo Accountant',  'accountant',         'Demo Business Ltd'),
  ('lender@inzira.rw',     'BK Finance',       'lender',             NULL),
  ('advisor@inzira.rw',    'DataBridge Advisor','databridge_advisor', NULL)
ON CONFLICT (email) DO NOTHING;

-- Business owned by owner@inzira.rw
INSERT INTO public.businesses (owner_id, name, type, phone, address)
SELECT u.id, 'Demo Business Ltd', 'retail', '+250788000001', 'KG 1 Ave, Kigali'
FROM public.users u WHERE u.email = 'owner@inzira.rw'
ON CONFLICT DO NOTHING;

-- Link employees to the business
UPDATE public.users SET business_id = (
  SELECT b.id FROM public.businesses b
  JOIN public.users o ON b.owner_id = o.id
  WHERE o.email = 'owner@inzira.rw'
)
WHERE email IN ('manager@inzira.rw','cashier@inzira.rw','accountant@inzira.rw');

-- Stock items
INSERT INTO public.stock_items (owner_id, business_id, name, sku, category, selling_price, cost_price, quantity, reorder_level)
SELECT
  u.id,
  b.id,
  item.name,
  item.sku,
  item.category,
  item.sell,
  item.cost,
  item.qty,
  item.reorder
FROM public.users u
JOIN public.businesses b ON b.owner_id = u.id
CROSS JOIN (VALUES
  ('Fanta 500ml',    'FT-001', 'Beverages',  500,  350,  48, 10),
  ('Primus 650ml',   'PR-001', 'Beverages',  800,  600,  36, 10),
  ('Bread Loaf',     'BR-001', 'Bakery',     600,  400,  20,  5),
  ('Mineral Water',  'MW-001', 'Beverages',  300,  200,  60, 15),
  ('Rice 1kg',       'RC-001', 'Groceries', 1200,  900,  30, 10),
  ('Sugar 1kg',      'SG-001', 'Groceries',  900,  700,  25,  8),
  ('Cooking Oil 1L', 'CO-001', 'Groceries', 1800, 1400,  15,  5),
  ('Soap Bar',       'SP-001', 'Household',  400,  280,  40, 10)
) AS item(name, sku, category, sell, cost, qty, reorder)
WHERE u.email = 'owner@inzira.rw';

-- Customers
INSERT INTO public.customers (owner_id, business_id, name, phone, credit_limit, balance)
SELECT
  u.id, b.id, c.name, c.phone, c.limit, c.bal
FROM public.users u
JOIN public.businesses b ON b.owner_id = u.id
CROSS JOIN (VALUES
  ('Jean Bosco',     '+250788111001', 50000,  5000),
  ('Alice Uwase',    '+250788111002', 30000,     0),
  ('Patrick Nkusi',  '+250788111003', 20000, 12000),
  ('Claudine Uwera', '+250788111004', 10000,     0)
) AS c(name, phone, limit, bal)
WHERE u.email = 'owner@inzira.rw';

-- Suppliers
INSERT INTO public.suppliers (owner_id, business_id, name, phone, email)
SELECT
  u.id, b.id, s.name, s.phone, s.email
FROM public.users u
JOIN public.businesses b ON b.owner_id = u.id
CROSS JOIN (VALUES
  ('Bralirwa Distributors', '+250788200001', 'orders@bralirwa.rw'),
  ('Inyange Industries',    '+250788200002', 'supply@inyange.rw'),
  ('Rwanda Grain',          '+250788200003', 'sales@rwandagrain.rw')
) AS s(name, phone, email)
WHERE u.email = 'owner@inzira.rw';

-- A few sales (past 7 days)
DO $$
DECLARE
  v_owner_id  INTEGER;
  v_biz_id    INTEGER;
  v_item1_id  INTEGER;
  v_item2_id  INTEGER;
  v_sale_id   INTEGER;
BEGIN
  SELECT id INTO v_owner_id FROM public.users WHERE email = 'owner@inzira.rw';
  SELECT id INTO v_biz_id   FROM public.businesses WHERE owner_id = v_owner_id;
  SELECT id INTO v_item1_id FROM public.stock_items WHERE sku = 'FT-001' AND business_id = v_biz_id;
  SELECT id INTO v_item2_id FROM public.stock_items WHERE sku = 'RC-001' AND business_id = v_biz_id;

  -- Sale 1
  INSERT INTO public.sales (owner_id, business_id, cashier_id, total_amount, payment_method, created_at)
  VALUES (v_owner_id, v_biz_id, v_owner_id, 3500, 'cash', NOW() - INTERVAL '2 days')
  RETURNING id INTO v_sale_id;

  INSERT INTO public.sale_items (sale_id, stock_item_id, name, quantity, unit_price, total)
  VALUES (v_sale_id, v_item1_id, 'Fanta 500ml', 4, 500, 2000),
         (v_sale_id, v_item2_id, 'Rice 1kg',    1, 1200, 1200);

  -- Sale 2
  INSERT INTO public.sales (owner_id, business_id, cashier_id, total_amount, payment_method, created_at)
  VALUES (v_owner_id, v_biz_id, v_owner_id, 5400, 'momo', NOW() - INTERVAL '1 day')
  RETURNING id INTO v_sale_id;

  INSERT INTO public.sale_items (sale_id, stock_item_id, name, quantity, unit_price, total)
  VALUES (v_sale_id, v_item1_id, 'Fanta 500ml', 6, 500, 3000),
         (v_sale_id, v_item2_id, 'Rice 1kg',    2, 1200, 2400);
END $$;

-- Expenses
INSERT INTO public.expenses (owner_id, business_id, category, description, amount, date)
SELECT u.id, b.id, e.cat, e.desc, e.amt, CURRENT_DATE - e.days
FROM public.users u
JOIN public.businesses b ON b.owner_id = u.id
CROSS JOIN (VALUES
  ('Rent',        'Monthly shop rent',   80000, 15),
  ('Utilities',   'Electricity bill',    12000,  7),
  ('Transport',   'Stock delivery',       5000,  3),
  ('Salary',      'Staff wages',        150000, 30)
) AS e(cat, desc, amt, days)
WHERE u.email = 'owner@inzira.rw';

-- Health score
INSERT INTO public.health_scores (business_id, score, revenue_score, stock_score, customer_score, notes)
SELECT b.id, 72.5, 75.0, 68.0, 74.5, 'Healthy growth. Watch stock reorder levels.'
FROM public.businesses b
JOIN public.users u ON b.owner_id = u.id
WHERE u.email = 'owner@inzira.rw';
