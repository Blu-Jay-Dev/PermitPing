-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Contractors table (one per user)
create table contractors (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  email text not null,
  phone text, -- E.164 format e.g. +15551234567
  company_name text,
  trade_type text check (trade_type in ('electrician','hvac','plumber','gc','other')),
  state text, -- 2-letter state code
  timezone text default 'America/New_York',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing'
    check (subscription_status in ('trialing','active','past_due','cancelled','inactive')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

-- Jobs table
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  contractor_id uuid references contractors(id) on delete cascade not null,
  name text not null,
  address text,
  client_name text,
  notes text,
  is_archived boolean default false,
  created_at timestamptz default now()
);

-- Permits table
create table permits (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  contractor_id uuid references contractors(id) on delete cascade not null,
  permit_number text not null,
  trade_type text check (trade_type in ('electrical','hvac','plumbing','building','other')) not null,
  issued_date date not null,
  expiration_date date not null,
  rough_in_required boolean default true,
  rough_in_due_date date,
  rough_in_called_at timestamptz,
  rough_in_passed_at timestamptz,
  final_called_at timestamptz,
  final_passed_at timestamptz,
  status text default 'open'
    check (status in ('open','rough_pending','rough_passed','final_pending','closed','expired')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reminders log (for deduplication and audit)
create table reminders (
  id uuid primary key default uuid_generate_v4(),
  permit_id uuid references permits(id) on delete cascade not null,
  contractor_id uuid references contractors(id) on delete cascade not null,
  type text check (type in (
    'rough_in_due',
    'rough_in_overdue',
    'expiration_30day',
    'expiration_7day',
    'expiration_1day',
    'final_overdue'
  )) not null,
  channel text check (channel in ('email','sms')) not null,
  scheduled_for date not null,
  sent_at timestamptz,
  acknowledged_at timestamptz,
  action_token text unique,
  created_at timestamptz default now()
);

-- Action tokens for no-login reminder links
create table action_tokens (
  id uuid primary key default uuid_generate_v4(),
  -- 8 bytes = 16 hex chars → URL fits in ~50 chars, keeping SMS under 160 GSM chars
  token text unique not null default encode(gen_random_bytes(8), 'hex'),
  permit_id uuid references permits(id) on delete cascade not null,
  contractor_id uuid references contractors(id) on delete cascade not null,
  action text check (action in ('mark_rough_called','mark_rough_passed','mark_final_called','mark_final_passed')) not null,
  used_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- Row Level Security
alter table contractors enable row level security;
alter table jobs enable row level security;
alter table permits enable row level security;
alter table reminders enable row level security;
alter table action_tokens enable row level security;

-- RLS Policies
create policy "contractors_own_data" on contractors
  for all using (clerk_user_id = auth.jwt()->>'sub');

create policy "jobs_own_data" on jobs
  for all using (
    contractor_id in (
      select id from contractors where clerk_user_id = auth.jwt()->>'sub'
    )
  );

create policy "permits_own_data" on permits
  for all using (
    contractor_id in (
      select id from contractors where clerk_user_id = auth.jwt()->>'sub'
    )
  );

create policy "reminders_own_data" on reminders
  for all using (
    contractor_id in (
      select id from contractors where clerk_user_id = auth.jwt()->>'sub'
    )
  );

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger permits_updated_at
  before update on permits
  for each row execute function update_updated_at();

-- Indexes
create index idx_permits_contractor_id on permits(contractor_id);
create index idx_permits_status on permits(status);
create index idx_permits_expiration_date on permits(expiration_date);
create index idx_jobs_contractor_id on jobs(contractor_id);
create index idx_reminders_permit_id on reminders(permit_id);
create index idx_reminders_scheduled_for on reminders(scheduled_for);
create index idx_action_tokens_token on action_tokens(token);
