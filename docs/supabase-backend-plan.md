# K2 WealthDesk Supabase Backend Plan

## Decision

Use Supabase as the backend data layer for the next version.

Current frontend mock data should move into Supabase Postgres tables. The React app should fetch data through APIs instead of importing hardcoded arrays from `src/mockData/wealthData.js`.

For the first backend build, keep business logic simple:
- Supabase Postgres stores the same demo data.
- Supabase Auth handles real users and roles.
- Supabase Row Level Security protects RM/Manager/Ops/Admin access.
- API routes fetch/insert/update Supabase data.
- No real CRM, AI, audio, CAMS, or portfolio integrations yet.

## Supabase Pieces Needed

1. Supabase project
2. Postgres database
3. Supabase Auth users
4. Database tables for current mock data
5. Row Level Security policies
6. Seed SQL for current frontend demo data
7. API layer
8. Frontend API client

## Environment Variables

Frontend:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

Backend API server:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
```

Important: `SUPABASE_SERVICE_ROLE_KEY` must never go to frontend.

## Auth Model

Use Supabase Auth for login.

Each auth user maps to an application profile:

Table: `profiles`

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id),
  name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('RM', 'MANAGER', 'OPS', 'ADMIN')),
  title text,
  level text,
  clients_count int default 0,
  total_aum_display text,
  sla_score text,
  avatar text,
  badge_color text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
```

Role source of truth:
- Frontend role selector is only for demo.
- Real app role comes from `profiles.role`.
- Backend and RLS must enforce access.

## Core Tables

### `tenants`

```sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
```

### `team_memberships`

Manager-to-RM mapping.

```sql
create table team_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  manager_id uuid not null references profiles(id),
  member_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  unique (manager_id, member_id)
);
```

### `clients`

Maps `CLIENT_PROFILES`.

```sql
create table clients (
  id text primary key,
  tenant_id uuid not null references tenants(id),
  name text not null,
  firm_or_family text,
  tier text,
  city text,
  phone text,
  assigned_rm_id uuid not null references profiles(id),
  aum_numeric bigint,
  aum_display text,
  risk_category text,
  kyc_status text,
  idle_savings_numeric numeric,
  idle_savings text,
  idle_savings_rate text,
  tax_harvesting_opportunity text,
  client_context_notes text,
  created_at timestamptz not null default now()
);
```

### `client_allocations`

Target and current allocation.

```sql
create table client_allocations (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  allocation_type text not null check (allocation_type in ('mandate', 'current')),
  equity numeric not null default 0,
  debt numeric not null default 0,
  alternates numeric not null default 0,
  unique (client_id, allocation_type)
);
```

### `client_holdings`

Maps `portfolioHighlights`.

```sql
create table client_holdings (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  name text not null,
  asset_type text,
  value_display text,
  returns_display text,
  sort_order int default 0
);
```

### `client_relationship_moments`

```sql
create table client_relationship_moments (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  event_date text not null,
  label text not null,
  sort_order int default 0
);
```

### `client_copilot_alerts`

Maps `coPilotAlerts`.

```sql
create table client_copilot_alerts (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  alert_type text,
  title text not null,
  severity text not null check (severity in ('critical', 'warning', 'opportunity', 'info')),
  description text not null,
  sort_order int default 0
);
```

### `client_talking_points`

```sql
create table client_talking_points (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  point text not null,
  sort_order int not null default 0
);
```

### `client_objection_defenses`

```sql
create table client_objection_defenses (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);
```

### `tasks`

Maps `INITIAL_TASKS` and generated Auto-CRM tasks.

```sql
create table tasks (
  id text primary key,
  tenant_id uuid not null references tenants(id),
  client_id text references clients(id),
  title text not null,
  details text,
  client_name text,
  client_aum text,
  client_tier text,
  assigned_to uuid references profiles(id),
  assigned_to_name text,
  category text,
  priority text not null check (priority in ('Critical', 'Urgent', 'High', 'Medium', 'Low')),
  sla_countdown text,
  sla_status text not null default 'on_track',
  due_date text,
  status text not null check (status in ('pending_rm', 'in_progress', 'pending_ops', 'completed')),
  source text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `demo_call_scenarios`

For now, store current canned scenarios in DB.

```sql
create table demo_call_scenarios (
  id text primary key,
  tenant_id uuid not null references tenants(id),
  client_id text not null references clients(id),
  client_name text not null,
  moment_type text not null,
  title text not null,
  raw_notes text not null,
  parsed_result jsonb not null,
  call_quality jsonb,
  sort_order int default 0
);
```

This avoids over-normalizing the canned Auto-CRM mock. Later, real call notes and CRM drafts should use normalized production tables.

### `audit_logs`

Live Governance audit trail.

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  actor_id uuid references profiles(id),
  event text not null,
  client_id text references clients(id),
  task_id text references tasks(id),
  detail text not null,
  compliance_status text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

Production rule: append only. Do not update/delete audit rows from app APIs.

### `house_views`

Maps `HOUSE_VIEWS`.

```sql
create table house_views (
  id text primary key,
  tenant_id uuid not null references tenants(id),
  title text not null,
  summary text not null,
  tags text[] not null default '{}',
  approved_by text,
  last_reviewed text,
  status text not null default 'approved',
  version int not null default 1,
  created_at timestamptz not null default now()
);
```

### `playbook_library`

Maps `PLAYBOOK_LIBRARY`.

```sql
create table playbook_library (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  moment_type text not null,
  status text not null,
  scenario_id text references demo_call_scenarios(id),
  sort_order int default 0
);
```

## RLS Policy Rules

Enable RLS on all tenant tables.

Basic helper:

```sql
create or replace function current_profile_role()
returns text
language sql
security definer
as $$
  select role from profiles where id = auth.uid()
$$;
```

Basic tenant helper:

```sql
create or replace function current_tenant_id()
returns uuid
language sql
security definer
as $$
  select tenant_id from profiles where id = auth.uid()
$$;
```

Client read policy:

```sql
create policy "role based client read"
on clients
for select
using (
  tenant_id = current_tenant_id()
  and (
    current_profile_role() in ('ADMIN', 'OPS')
    or assigned_rm_id = auth.uid()
    or exists (
      select 1
      from team_memberships tm
      where tm.manager_id = auth.uid()
      and tm.member_id = clients.assigned_rm_id
    )
  )
);
```

Task read policy:

```sql
create policy "role based task read"
on tasks
for select
using (
  tenant_id = current_tenant_id()
  and (
    current_profile_role() in ('ADMIN', 'OPS')
    or assigned_to = auth.uid()
    or exists (
      select 1
      from clients c
      where c.id = tasks.client_id
      and c.assigned_rm_id = auth.uid()
    )
    or exists (
      select 1
      from team_memberships tm
      join clients c on c.assigned_rm_id = tm.member_id
      where tm.manager_id = auth.uid()
      and c.id = tasks.client_id
    )
  )
);
```

Audit read policy:

```sql
create policy "role based audit read"
on audit_logs
for select
using (
  tenant_id = current_tenant_id()
  and current_profile_role() in ('MANAGER', 'OPS', 'ADMIN')
);
```

For writes, prefer backend API with service-role key. That keeps complex permission checks in server code and still lets RLS protect direct reads.

## API Layer With Supabase

Recommended API server:
- `server/index.js`
- Uses `@supabase/supabase-js`
- Uses service role key
- Verifies frontend JWT with Supabase
- Applies role checks before every write

Do not call Supabase directly from frontend for write-heavy flows in MVP. Use backend APIs so audit logging and idempotency stay controlled.

## Minimum APIs For Current Frontend

### Bootstrap API

`GET /api/v1/bootstrap`

Returns everything the current frontend needs on first load:

```json
{
  "teamMembers": [],
  "clientProfiles": [],
  "tasks": [],
  "demoCallScenarios": [],
  "firmMetrics": {},
  "houseViews": [],
  "playbookLibrary": [],
  "auditLogs": []
}
```

Use this first to migrate fast from hardcoded frontend imports.

### Role APIs

`GET /api/v1/me`

Returns current user and role.

`GET /api/v1/team-members`

Returns visible team members.

### Client APIs

`GET /api/v1/clients`

Role-wise:
- RM: own clients only
- Manager: team clients
- Ops/Admin: all allowed tenant clients

`GET /api/v1/clients/:clientId`

Returns single dossier.

### Task APIs

`GET /api/v1/tasks`

`POST /api/v1/tasks`

`PATCH /api/v1/tasks/:taskId/status`

`PATCH /api/v1/tasks/:taskId/assign`

Every write inserts one `audit_logs` row.

### Auto-CRM APIs

For current demo, keep scenario synthesis canned:

`GET /api/v1/demo-call-scenarios`

`POST /api/v1/demo-call-scenarios/:scenarioId/synthesize`

Returns `parsed_result`.

`POST /api/v1/crm/sync`

For now:
- Creates `MOCK-CRM-*` ID server-side.
- Inserts audit log.
- Returns mock external record ID.

`POST /api/v1/crm/dispatch-tasks`

For now:
- Reads generated tasks from parsed result.
- Inserts into `tasks`.
- Prevents duplicate task IDs.
- Inserts audit log.

### Governance APIs

`GET /api/v1/audit-logs`

`GET /api/v1/audit-logs/export`

`GET /api/v1/governance/summary`

### House View APIs

`GET /api/v1/house-views`

## Backend File Structure

Recommended simple structure:

```text
server/
  index.js
  supabaseClient.js
  auth.js
  routes/
    bootstrap.js
    auth.js
    clients.js
    tasks.js
    crm.js
    governance.js
    houseViews.js
  services/
    accessControl.js
    auditLog.js
    taskService.js
    crmMockService.js
supabase/
  schema.sql
  seed.sql
```

## Seed Strategy

Move current files into Supabase:

| Frontend Export | Supabase Tables |
|---|---|
| `TEAM_MEMBERS` | `profiles` |
| `CLIENT_PROFILES` | `clients`, `client_allocations`, `client_holdings`, `client_relationship_moments`, `client_copilot_alerts`, `client_talking_points`, `client_objection_defenses` |
| `INITIAL_TASKS` | `tasks` |
| `DEMO_CALL_SCENARIOS` | `demo_call_scenarios` |
| `FIRM_METRICS` | Can stay computed in API first, or table `firm_metrics` |
| `HOUSE_VIEWS` | `house_views` |
| `PLAYBOOK_LIBRARY` | `playbook_library` |
| Audit seed logs | `audit_logs` |

## Frontend Change Plan

Step 1:
- Add `src/services/api.js`
- Fetch `/api/v1/bootstrap` on app load
- Store returned data in `App.jsx`
- Pass data into components as props

Step 2:
- Remove direct component imports from `wealthData.js`
- Components become data-rendering components only

Step 3:
- Wire task actions:
  - `PATCH /tasks/:id/status`
  - `PATCH /tasks/:id/assign`
  - `POST /crm/dispatch-tasks`
  - `POST /crm/sync`

Step 4:
- Keep `src/mockData/wealthData.js` only as seed source or delete after Supabase seed is stable.

## MVP Build Order

1. Create Supabase project.
2. Run `supabase/schema.sql`.
3. Create Supabase Auth demo users:
   - Rahul Sharma: `RM`
   - Priya Nair: `RM`
   - Vikram Mehta: `MANAGER`
   - Central Ops: `OPS`
   - Admin: `ADMIN`
4. Insert matching rows in `profiles`.
5. Run `supabase/seed.sql` for clients/tasks/scenarios/house views.
6. Build `GET /api/v1/bootstrap`.
7. Point frontend to API.
8. Build task update/reassign APIs.
9. Build CRM mock sync/dispatch APIs.
10. Build Governance audit APIs.

## What Remains Mocked After Supabase

Even after moving to Supabase, these are still mocked until later:

- AI call-note synthesis
- Speech-to-text
- Real CRM sync
- CAMS/KFintech KYC integration
- BSE StAR MF/NSE NMF II execution
- Portfolio back-office nightly feed
- Call-quality scoring

But they will be backend mocks, not frontend hardcoded state.

