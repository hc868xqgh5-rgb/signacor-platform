-- =============================================================================
-- SIGNACORE GROUP PLATFORM — Full PostgreSQL Master Schema (Safe-Merge)
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMERATIONS (Wrapped in existence checks)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_role') THEN
        CREATE TYPE company_role AS ENUM ('holding', 'supplier', 'franchise', 'subcontractor');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('lead', 'brief', 'design', 'quote_sent', 'quote_approved', 'deposit_received', 'in_production', 'installation', 'completed', 'invoiced', 'paid', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cost_category') THEN
        CREATE TYPE cost_category AS ENUM ('materials', 'labour', 'machine_time', 'design', 'delivery', 'franchise_royalty');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'surface_type') THEN
        CREATE TYPE surface_type AS ENUM ('flat', 'curved', 'contour');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wrap_type') THEN
        CREATE TYPE wrap_type AS ENUM ('full', 'partial', 'roof_only', 'bonnet_only', 'doors_only', 'custom');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('invoice', 'payment', 'transfer', 'adjustment', 'intercompany_charge');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
        CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'approved', 'declined', 'expired');
    END IF;
END $$;

-- 3. CORE TABLES
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(200) NOT NULL,
  short_name      VARCHAR(50)  NOT NULL UNIQUE,
  registration_no VARCHAR(50),
  vat_no          VARCHAR(30),
  role            company_role NOT NULL,
  address         TEXT,
  city            VARCHAR(100),
  province        VARCHAR(50),
  postal_code     VARCHAR(10),
  phone           VARCHAR(30),
  email           VARCHAR(100),
  website         VARCHAR(200),
  logo_url        VARCHAR(500),
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(30),
  bank_branch     VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed companies (Conflict protected)
INSERT INTO companies (name, short_name, registration_no, role, city, province) VALUES
  ('Uniontech Holdings SA', 'Uniontech', '2010/012345/07', 'holding', 'George', 'Western Cape'),
  ('Signacore National Supply Group', 'Signacore', '2015/023456/07', 'supplier', 'George', 'Western Cape'),
  ('Signarama Garden Route', 'Signarama GR', '2018/034567/07', 'franchise', 'George', 'Western Cape'),
  ('Cover X Transform', 'Cover X', '2020/045678/07', 'subcontractor', 'George', 'Western Cape')
ON CONFLICT (short_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID NOT NULL REFERENCES companies(id),
  email        VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  role         VARCHAR(50) NOT NULL DEFAULT 'staff',
  phone        VARCHAR(30),
  avatar_url   VARCHAR(500),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name     VARCHAR(200) NOT NULL,
  trading_name     VARCHAR(200),
  contact_person   VARCHAR(150),
  email            VARCHAR(200),
  phone            VARCHAR(30),
  mobile           VARCHAR(30),
  address          TEXT,
  city             VARCHAR(100),
  province         VARCHAR(50),
  postal_code      VARCHAR(10),
  vat_no           VARCHAR(30),
  credit_limit     NUMERIC(12,2) DEFAULT 0,
  payment_terms    INTEGER DEFAULT 30,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  notes            TEXT,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id     UUID NOT NULL REFERENCES companies(id),
  sku             VARCHAR(50) UNIQUE,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  unit            VARCHAR(20) NOT NULL DEFAULT 'm2',
  cost_price      NUMERIC(12,4) NOT NULL DEFAULT 0,
  sell_price      NUMERIC(12,4) NOT NULL DEFAULT 0,
  roll_width_m    NUMERIC(6,4),
  category        VARCHAR(100),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  machine_type    VARCHAR(100),
  hourly_rate     NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. JOB LIFECYCLE
CREATE TABLE IF NOT EXISTS jobs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number           VARCHAR(30) NOT NULL UNIQUE,
  title                VARCHAR(300) NOT NULL,
  client_id            UUID NOT NULL REFERENCES clients(id),
  primary_company_id   UUID NOT NULL REFERENCES companies(id),
  assigned_to          UUID REFERENCES users(id),
  status               job_status NOT NULL DEFAULT 'lead',
  quote_amount         NUMERIC(14,2) NOT NULL DEFAULT 0,
  deposit_amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
  deposit_received     NUMERIC(14,2) NOT NULL DEFAULT 0,
  invoice_amount       NUMERIC(14,2) NOT NULL DEFAULT 0,
  amount_paid          NUMERIC(14,2) NOT NULL DEFAULT 0,
  royalty_rate         NUMERIC(5,4) NOT NULL DEFAULT 0.06,
  description          TEXT,
  created_by           UUID REFERENCES users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_stage_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  from_status  job_status,
  to_status    job_status NOT NULL,
  changed_by   UUID REFERENCES users(id),
  notes        TEXT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_costs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  category        cost_category NOT NULL,
  supplier_id     UUID REFERENCES companies(id),
  material_id     UUID REFERENCES materials(id),
  machine_id      UUID REFERENCES machines(id),
  description     VARCHAR(500) NOT NULL,
  quantity        NUMERIC(12,4) NOT NULL DEFAULT 1,
  unit            VARCHAR(20) NOT NULL DEFAULT 'each',
  unit_cost       NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost      NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  is_actual       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. QUOTES & INVOICES
CREATE TABLE IF NOT EXISTS quotes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id           UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  quote_number     VARCHAR(30) NOT NULL UNIQUE,
  version          INTEGER NOT NULL DEFAULT 1,
  status           quote_status NOT NULL DEFAULT 'draft',
  subtotal         NUMERIC(14,2) NOT NULL DEFAULT 0,
  vat_rate         NUMERIC(5,4) NOT NULL DEFAULT 0.15,
  total            NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_line_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id        UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description     VARCHAR(500) NOT NULL,
  quantity        NUMERIC(12,4) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_price     NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS invoices (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id           UUID NOT NULL REFERENCES jobs(id),
  invoice_number   VARCHAR(30) NOT NULL UNIQUE,
  issued_by        UUID NOT NULL REFERENCES companies(id),
  issued_to        UUID NOT NULL REFERENCES clients(id),
  total            NUMERIC(14,2) NOT NULL DEFAULT 0,
  status           payment_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INTERCOMPANY & CALCULATORS
CREATE TABLE IF NOT EXISTS intercompany_transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_no    VARCHAR(30) NOT NULL UNIQUE,
  from_company_id   UUID NOT NULL REFERENCES companies(id),
  to_company_id     UUID NOT NULL REFERENCES companies(id),
  amount            NUMERIC(14,2) NOT NULL,
  transaction_type  transaction_type NOT NULL,
  status            payment_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_transaction CHECK (from_company_id != to_company_id)
);

CREATE TABLE IF NOT EXISTS vinyl_calculations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            UUID REFERENCES jobs(id),
  surface_type      surface_type NOT NULL DEFAULT 'flat',
  width_mm          NUMERIC(10,2) NOT NULL,
  height_mm         NUMERIC(10,2) NOT NULL,
  area_m2           NUMERIC(10,4),
  total_material_cost NUMERIC(12,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_calculations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            UUID REFERENCES jobs(id),
  vehicle_make      VARCHAR(100),
  vehicle_model     VARCHAR(100),
  wrap_type         wrap_type NOT NULL DEFAULT 'full',
  total_cost        NUMERIC(12,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. VIEWS (Always Use CREATE OR REPLACE)
CREATE OR REPLACE VIEW job_profit_summary AS
SELECT
  j.id, j.job_number, j.title, j.status,
  c.company_name AS client_name,
  j.invoice_amount AS revenue,
  COALESCE(SUM(jc.total_cost), 0) AS total_cost,
  j.invoice_amount - COALESCE(SUM(jc.total_cost), 0) AS gross_profit
FROM jobs j
JOIN clients c ON c.id = j.client_id
LEFT JOIN job_costs jc ON jc.job_id = j.id
GROUP BY j.id, c.company_name;

-- 8. INDEXES & AUTOMATION
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_costs_job ON job_costs(job_id);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- Resetting triggers to ensure they are current
DROP TRIGGER IF EXISTS trg_jobs_updated ON jobs;
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();