# K2 WealthDesk Backend API & Role-Wise Specification

## Purpose

This document defines the backend needed to convert the current frontend-only K2 WealthDesk demo into a production-ready wealth RM platform.

The current app is a React/Vite client-side prototype. It uses mock data for tasks, client dossiers, CRM sync, audit logs, call-note synthesis, house views, and call-quality scoring. Production backend work should preserve the same user flows while replacing mock state with secure APIs, persistent storage, role-based access control, integrations, and append-only audit trails.

## Core Backend Goals

1. Persist clients, portfolios, tasks, CRM records, audit logs, house views, RM users, and role permissions.
2. Enforce strict role-wise access:
   - RM sees only assigned clients and permitted tasks.
   - Cluster Head sees team and branch data.
   - Central Ops sees operational tasks and compliance workflows.
   - Admin controls tenant, users, roles, and integrations.
3. Replace mock Auto-CRM with real call-note/audio processing, review workflow, CRM sync, and task creation.
4. Maintain SEBI-grade auditability: every client interaction, task change, CRM sync, suitability check, and reassignment must create an immutable log.
5. Keep backend multi-tenant so multiple wealth firms can use the platform safely.

## Recommended Stack

- API: Node.js with NestJS or Express/Fastify
- DB: PostgreSQL
- ORM: Prisma or Drizzle
- Auth: JWT access tokens + refresh tokens, or enterprise SSO later
- Background jobs: BullMQ + Redis
- File/audio storage: S3-compatible object storage
- Realtime updates: WebSocket or Server-Sent Events
- External CRM integrations: Salesforce FSC, Zoho CRM, LeadSquared
- Portfolio/back-office integrations: Miles WealthMaker, WealthSpectrum, CAMS/KFintech/BSE StAR MF/NSE NMF II as available

## Main Roles

| Role | Code | Access |
|---|---|---|
| Relationship Manager | `RM` | Own assigned clients, own tasks, ops tasks for own clients, own CRM drafts |
| Cluster Head / Manager | `MANAGER` | Team clients, team tasks, workload, audit logs, SLA matrix |
| Central Ops & Compliance | `OPS` | Ops queue, KYC/STP/LRS/compliance tasks, documents, audit logs |
| Admin | `ADMIN` | Tenant setup, users, role mapping, integrations, global config |

## Permission Matrix

| Feature | RM | Manager | Ops | Admin |
|---|---:|---:|---:|---:|
| View own client dossier | Yes | Yes | Limited | Yes |
| View peer RM clients | No | Yes | Limited by task | Yes |
| View portfolio diagnostics | Own clients | Team clients | Compliance fields only | Yes |
| Create call note / CRM draft | Own clients | Team clients | No | Yes |
| Sync CRM record | Own clients after confirmation | Team clients | No | Yes |
| Create ops task from CRM | Own clients | Team clients | Yes | Yes |
| Advance own task status | Yes | Yes | Yes | Yes |
| Reassign task to another RM | No | Yes | Ops queue only | Yes |
| Export audit report | No | Yes | Yes | Yes |
| Manage house views | No | Read | Read | Yes |
| Manage users/roles | No | No | No | Yes |

## Required Database Tables

### Tenancy & Users

- `tenants`
  - `id`, `name`, `status`, `created_at`
- `users`
  - `id`, `tenant_id`, `name`, `email`, `phone`, `role`, `status`, `created_at`
- `team_memberships`
  - `id`, `tenant_id`, `manager_user_id`, `member_user_id`

### Clients & Portfolio

- `clients`
  - `id`, `tenant_id`, `name`, `firm_or_family`, `tier`, `city`, `phone`, `assigned_rm_id`, `risk_category`, `kyc_status`, `aum_numeric`, `created_at`
- `client_context_notes`
  - `id`, `client_id`, `note`, `source`, `updated_at`
- `client_relationship_moments`
  - `id`, `client_id`, `date`, `label`
- `portfolio_allocations`
  - `id`, `client_id`, `equity_pct`, `debt_pct`, `alternates_pct`, `allocation_type`
  - `allocation_type` values: `TARGET`, `CURRENT`
- `portfolio_holdings`
  - `id`, `client_id`, `name`, `asset_type`, `value_numeric`, `value_display`, `return_display`, `source_system`
- `client_opportunities`
  - `id`, `client_id`, `type`, `title`, `description`, `severity`, `amount_numeric`, `status`

### Task Desk

- `tasks`
  - `id`, `tenant_id`, `client_id`, `title`, `details`, `category`, `priority`, `status`, `assigned_to_user_id`, `assigned_to_name`, `sla_due_at`, `sla_status`, `source`, `created_by_user_id`, `created_at`, `updated_at`
- `task_status_history`
  - `id`, `task_id`, `old_status`, `new_status`, `changed_by_user_id`, `changed_at`
- `task_assignments_history`
  - `id`, `task_id`, `old_assignee_id`, `new_assignee_id`, `changed_by_user_id`, `changed_at`

### Auto-CRM & Call Processing

- `call_notes`
  - `id`, `tenant_id`, `client_id`, `rm_user_id`, `raw_text`, `audio_file_id`, `status`, `created_at`
- `crm_drafts`
  - `id`, `call_note_id`, `summary`, `sentiment`, `suitability_guardrail`, `crm_stage_update`, `review_status`, `reviewed_by_user_id`, `reviewed_at`
- `crm_liquidity_signals`
  - `id`, `crm_draft_id`, `amount_numeric`, `amount_display`, `asset`, `status`, `expected_date`
- `crm_generated_tasks`
  - `id`, `crm_draft_id`, `task_id`, `status`
- `crm_sync_records`
  - `id`, `crm_draft_id`, `external_crm`, `external_record_id`, `sync_status`, `error_message`, `synced_at`
- `client_comm_drafts`
  - `id`, `crm_draft_id`, `channel`, `subject`, `body`, `copy_count`, `opened_external_at`

### Audit & Compliance

- `audit_logs`
  - `id`, `tenant_id`, `actor_user_id`, `event`, `client_id`, `task_id`, `crm_draft_id`, `detail`, `compliance_status`, `metadata_json`, `created_at`
  - Must be append-only. Do not update/delete in normal application paths.
- `suitability_checks`
  - `id`, `client_id`, `crm_draft_id`, `risk_category`, `recommendation_summary`, `result`, `flags_json`, `checked_at`

### House Views

- `house_views`
  - `id`, `tenant_id`, `title`, `summary`, `tags`, `approved_by`, `last_reviewed_at`, `status`, `version`, `created_at`
- `house_view_versions`
  - `id`, `house_view_id`, `summary`, `approved_by`, `version`, `effective_at`

## API Conventions

- Base path: `/api/v1`
- Auth header: `Authorization: Bearer <token>`
- Tenant scope: derive from authenticated user, not from client-supplied tenant ID.
- Date/time storage: UTC in DB.
- API display formatting: frontend may format to IST `dd-mm-yy`, but backend should return ISO timestamps.
- All write APIs should append an `audit_logs` record.

## Auth APIs

### `POST /api/v1/auth/login`

Request:
```json
{
  "email": "rahul@firm.com",
  "password": "password"
}
```

Response:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "usr_1",
    "name": "Rahul Sharma",
    "role": "RM"
  }
}
```

### `POST /api/v1/auth/refresh`

Refreshes access token.

### `GET /api/v1/me`

Returns logged-in user, role, tenant, manager/team membership, and permissions.

## User & Role APIs

### `GET /api/v1/users/team`

Role access:
- RM: self only
- Manager: own team
- Ops: ops users + RM names needed for tasks
- Admin: all tenant users

### `POST /api/v1/users`

Admin only. Creates user.

### `PATCH /api/v1/users/:userId/role`

Admin only. Changes role.

## Client APIs

### `GET /api/v1/clients`

Role behavior:
- RM: assigned clients only
- Manager: clients assigned to team members
- Ops: clients linked to ops tasks
- Admin: all tenant clients

Query params:
- `search`
- `assignedRmId`
- `kycStatus`
- `tier`

### `GET /api/v1/clients/:clientId`

Returns dossier header, context notes, risk category, AUM, KYC status, relationship moments.

### `GET /api/v1/clients/:clientId/portfolio`

Returns target allocation, current allocation, holdings, idle cash, tax harvesting opportunity.

### `GET /api/v1/clients/:clientId/copilot-alerts`

Returns backend-generated or rules-generated advisory alerts.

### `PATCH /api/v1/clients/:clientId/assigned-rm`

Manager/Admin only. Reassigns client book ownership. Must create audit log.

## Task Allocation Desk APIs

### `GET /api/v1/tasks`

Role behavior:
- RM: own assigned tasks + ops tasks linked to own clients
- Manager: team tasks
- Ops: ops queue + compliance tasks
- Admin: all tenant tasks

Query params:
- `status`
- `priority`
- `category`
- `assignedTo`
- `clientId`
- `slaStatus`

### `POST /api/v1/tasks`

Creates task manually or from Auto-CRM.

Request:
```json
{
  "clientId": "cli_1",
  "title": "Execute ₹25L Arbitrage Purchase",
  "details": "Client approved deployment after call.",
  "category": "Operations / Execution",
  "priority": "High",
  "assignedToUserId": "ops_1",
  "slaDueAt": "2026-09-09T10:30:00.000Z",
  "source": "Auto-CRM Synthesizer"
}
```

### `PATCH /api/v1/tasks/:taskId/status`

Allowed:
- Current assignee can advance status.
- Manager/Admin can advance any visible task.
- Ops can advance ops-owned tasks.

Request:
```json
{
  "status": "in_progress"
}
```

Must create:
- `task_status_history`
- `audit_logs`

### `PATCH /api/v1/tasks/:taskId/assign`

Allowed:
- Manager/Admin can reassign across team.
- RM can only hand off to Ops.
- Ops can reassign within Ops queue if permitted.

Request:
```json
{
  "assignedToUserId": "ops_1"
}
```

Must create:
- `task_assignments_history`
- `audit_logs`

### `POST /api/v1/tasks/bulk`

Used by Auto-CRM to create multiple generated ops tasks after RM confirmation.

Important:
- Must be idempotent using `idempotencyKey`.
- Prevent duplicate task creation if frontend retries.

## Auto-CRM APIs

### `POST /api/v1/call-notes`

Creates raw post-call note.

Request:
```json
{
  "clientId": "cli_1",
  "rawText": "Had a 12 min call...",
  "source": "typed_notes"
}
```

### `POST /api/v1/call-notes/:callNoteId/synthesize`

Runs AI/NLP extraction. In production this becomes Dev 2's protocol tier.

Response:
```json
{
  "crmDraftId": "draft_1",
  "summary": "Client confirmed receipt of ₹75 Lakhs...",
  "sentiment": "Tactically cautious",
  "liquiditySignals": [
    {
      "amountDisplay": "₹75 Lakhs",
      "asset": "Commercial Property Advance",
      "status": "Received today"
    }
  ],
  "suitabilityGuardrail": "Arbitrage + STP aligns with mandate.",
  "generatedOpsTasks": [
    {
      "title": "Execute ₹25L Arbitrage Purchase",
      "priority": "High",
      "category": "Operations / Execution",
      "assignedToUserId": "ops_1"
    }
  ],
  "whatsappDraft": "...",
  "emailSubject": "...",
  "emailBody": "...",
  "crmStageUpdate": "Stage: Liquidity Deployment"
}
```

### `PATCH /api/v1/crm-drafts/:draftId`

RM edits generated summary before confirmation.

### `POST /api/v1/crm-drafts/:draftId/confirm`

Locks RM-reviewed draft. Required before CRM sync or task dispatch.

### `POST /api/v1/crm-drafts/:draftId/sync`

Syncs to external CRM.

Request:
```json
{
  "crmProvider": "salesforce_fsc"
}
```

Response:
```json
{
  "syncStatus": "success",
  "externalRecordId": "00Txx000009abcEAA"
}
```

Must create:
- `crm_sync_records`
- `audit_logs`

### `POST /api/v1/crm-drafts/:draftId/dispatch-tasks`

Creates generated ops tasks from confirmed draft.

Request:
```json
{
  "idempotencyKey": "draft_1_dispatch_v1"
}
```

Response:
```json
{
  "createdTaskIds": ["task_201", "task_202"],
  "skippedDuplicateTaskIds": []
}
```

## Audio / Voice APIs

### `POST /api/v1/audio/uploads/presign`

Returns signed upload URL for browser audio upload.

### `POST /api/v1/call-notes/audio`

Creates call note from uploaded audio file.

### `POST /api/v1/call-notes/:callNoteId/transcribe`

Runs speech-to-text and stores transcript.

### `GET /api/v1/call-notes/:callNoteId/transcription-status`

Used for polling if transcription is async.

## Client Communication APIs

These APIs should not send WhatsApp/email automatically unless compliance approves that workflow. Initial production should stay "copy/open manually".

### `POST /api/v1/comm-drafts/:draftId/copy-event`

Logs that RM copied WhatsApp/email draft.

### `POST /api/v1/comm-drafts/:draftId/open-whatsapp`

Logs that WhatsApp prefill link was opened.

Optional later:
- `POST /api/v1/comm-drafts/:draftId/send-email`
- `POST /api/v1/comm-drafts/:draftId/send-whatsapp`

## Governance & Audit APIs

### `GET /api/v1/audit-logs`

Role behavior:
- RM: own-client audit logs only if allowed by policy
- Manager: team audit logs
- Ops: compliance/ops audit logs
- Admin: all tenant logs

Query params:
- `clientId`
- `actorUserId`
- `event`
- `from`
- `to`

### `GET /api/v1/audit-logs/export`

Returns CSV or XLSX.

### `GET /api/v1/governance/branch-summary`

Manager/Admin/Ops.

Returns:
- total managed AUM
- unallocated cash
- CRM hygiene score
- tax-loss harvesting window
- near-breach SLA count
- branch status

### `GET /api/v1/governance/capacity-matrix`

Returns RM-wise active tasks, SLA score, workload status.

### `GET /api/v1/governance/risk-heatmap`

Returns client-wise allocation drift, idle cash drag, KYC status.

### `GET /api/v1/governance/call-quality`

Returns call-quality scores after real AI scoring is implemented.

## House View APIs

### `GET /api/v1/house-views`

All authenticated roles can read approved house views.

Query params:
- `search`
- `tag`

### `GET /api/v1/house-views/:id`

Returns approved summary and version history metadata.

### `POST /api/v1/house-views`

Admin or Research Admin only.

### `PATCH /api/v1/house-views/:id/approve`

Admin/Compliance role only. Creates new approved version.

## Realtime APIs

Use WebSocket/SSE for:
- Task status changes
- Task reassignment
- SLA countdown updates
- New audit log entries
- CRM sync status
- Transcription/synthesis job completion

Suggested endpoint:

### `GET /api/v1/realtime/stream`

Server-Sent Events scoped by authenticated user permissions.

Events:
- `task.created`
- `task.updated`
- `audit.created`
- `crm.synced`
- `callnote.synthesized`

## Integration APIs / Workers

These are backend-to-backend jobs, not public frontend APIs.

### CRM Connector Worker

Responsibilities:
- Map `crm_drafts` to Salesforce/Zoho/LeadSquared schema.
- Retry failed syncs.
- Store external record IDs.
- Never show local mock IDs in production.

### Portfolio Feed Worker

Responsibilities:
- Nightly portfolio valuation import.
- Update holdings, AUM, current allocation, idle cash.
- Preserve source system and import timestamp.

### Compliance/KYC Worker

Responsibilities:
- Pull CAMS/KFintech/KRA KYC status where available.
- Create KYC blocker tasks.
- Update SLA status.

### AI Processing Worker

Responsibilities:
- Speech-to-text.
- CRM summary extraction.
- Liquidity signal extraction.
- Suitability/risk mandate check.
- Call-quality scoring.

## Security Requirements

1. Never trust client-supplied tenant IDs.
2. Enforce row-level authorization in every service method.
3. Store audit logs append-only.
4. Encrypt sensitive client data at rest where possible.
5. Mask phone/email fields in logs unless operationally required.
6. Use idempotency keys for CRM sync and generated task dispatch.
7. Add rate limits to auth, synthesis, CRM sync, and export APIs.
8. Add structured API logs without leaking portfolio details.
9. Keep external API credentials in a secrets manager.
10. Build data retention policies for audio transcripts and call recordings.

## Backend Build Phases

### Phase 1: Core API & Persistence

- Auth/login
- Users/roles
- Clients
- Tasks
- Audit logs
- Governance read APIs
- Replace frontend mock task/audit/client reads with backend reads

### Phase 2: Auto-CRM Workflow

- Call notes
- CRM draft generation using existing mock/heuristic first
- RM confirmation workflow
- Generated task dispatch with idempotency
- CRM sync table with mock connector adapter

### Phase 3: Real Integrations

- Salesforce/Zoho/LeadSquared write integration
- Portfolio import worker
- CAMS/KFintech/KRA status import
- S3 audio upload
- Speech-to-text

### Phase 4: Compliance Hardening

- Append-only audit controls
- Export approvals
- Suitability rule engine
- Admin dashboards
- Tenant isolation review
- Security testing

## Minimum API Set To Start

If building one lean MVP backend first, start with only these:

1. `POST /auth/login`
2. `GET /me`
3. `GET /clients`
4. `GET /clients/:id`
5. `GET /clients/:id/portfolio`
6. `GET /tasks`
7. `POST /tasks`
8. `PATCH /tasks/:id/status`
9. `PATCH /tasks/:id/assign`
10. `POST /call-notes`
11. `POST /call-notes/:id/synthesize`
12. `PATCH /crm-drafts/:id`
13. `POST /crm-drafts/:id/confirm`
14. `POST /crm-drafts/:id/sync`
15. `POST /crm-drafts/:id/dispatch-tasks`
16. `GET /audit-logs`
17. `GET /audit-logs/export`
18. `GET /governance/branch-summary`
19. `GET /governance/capacity-matrix`
20. `GET /house-views`

## Frontend Mapping

| Current Frontend Area | Backend APIs Needed |
|---|---|
| Role selector | `GET /me`, `GET /users/team` |
| Task Allocation Desk | `GET /tasks`, `PATCH /tasks/:id/status`, `PATCH /tasks/:id/assign` |
| RM Co-Pilot Dossier | `GET /clients`, `GET /clients/:id`, `GET /clients/:id/portfolio`, `GET /clients/:id/copilot-alerts` |
| Auto-CRM | `POST /call-notes`, `POST /call-notes/:id/synthesize`, `PATCH /crm-drafts/:id`, `POST /crm-drafts/:id/confirm`, `POST /crm-drafts/:id/sync`, `POST /crm-drafts/:id/dispatch-tasks` |
| WhatsApp/Email copy | `POST /comm-drafts/:id/copy-event`, optional send APIs later |
| Governance | `GET /governance/*`, `GET /audit-logs`, `GET /audit-logs/export` |
| House View | `GET /house-views`, admin write APIs later |

## Important Product Decisions

1. Do not auto-send WhatsApp/email in MVP. Keep RM manual approval.
2. Do not allow RMs to view peer books.
3. Do not allow generated tasks or CRM sync without RM confirmation.
4. Do not use open-ended chatbot answers for house views. Use approved research corpus only.
5. Do not update audit logs after creation. Add correction events instead.
6. Do not expose real CRM/back-office errors directly to clients; show operational retry state to staff.

