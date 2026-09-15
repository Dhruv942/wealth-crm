import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildClientViewModel,
  dedupeStrings,
  getAllocationDriftSeverity,
  getClientIdleSavingsLakhs,
  getIdleCashSeverity,
  getOpenTasks,
  getVisibleTasksForRole,
  renderAuditDetail
} from './frontendState.js';

const rahul = { id: 'rm-1', level: 'RM' };
const ops = { id: 'ops-1', level: 'Operations' };

const clients = [
  {
    id: 'cli-1',
    assignedRMId: 'rm-1',
    idleSavings: '₹45 Lakhs',
    currentAllocation: { equity: 78, debt: 14, alternates: 8 },
    mandateAllocation: { equity: 65, debt: 25, alternates: 10 }
  },
  {
    id: 'cli-2',
    assignedRMId: 'rm-1',
    idleSavingsNumeric: 35,
    currentAllocation: { equity: 42, debt: 48, alternates: 10 },
    mandateAllocation: { equity: 50, debt: 40, alternates: 10 }
  }
];

test('derives idle cash from numeric fields and display strings', () => {
  assert.equal(getClientIdleSavingsLakhs({ idleCash: { amountNumeric: 2200000 }, idleSavingsNumeric: 65 }), 22);
  assert.equal(getClientIdleSavingsLakhs({ idleCash: null, idleSavingsNumeric: 65 }), 0);
  assert.equal(getClientIdleSavingsLakhs(clients[0]), 45);
  assert.equal(getClientIdleSavingsLakhs(clients[1]), 35);
});

test('derives heatmap severity from frontend and backend allocation shapes', () => {
  assert.deepEqual(getAllocationDriftSeverity(clients[0]), { level: 'high', label: '13pt drift' });
  assert.deepEqual(
    getAllocationDriftSeverity({
      currentAllocation: { equityPct: 62, debtPct: 38, alternatesPct: 0 },
      targetAllocation: { equityPct: 80, debtPct: 20, alternatesPct: 0 }
    }),
    { level: 'high', label: '18pt drift' }
  );
  assert.deepEqual(getIdleCashSeverity(clients[0]), { level: 'high', label: '₹45 Lakhs' });
});

test('keeps RM task visibility to own work plus ops work for own clients only', () => {
  const tasks = [
    { id: 'own', clientId: 'cli-1', assignedTo: 'rm-1', status: 'pending_rm', assignedToName: 'Rahul Sharma' },
    { id: 'own-ops', clientId: 'cli-1', assignedTo: 'ops-1', status: 'pending_ops', assignedToName: 'Central Ops & Compliance' },
    { id: 'peer-on-own-client', clientId: 'cli-1', assignedTo: 'rm-2', status: 'pending_rm', assignedToName: 'Priya Nair' },
    { id: 'peer-client-ops', clientId: 'cli-3', assignedTo: 'ops-1', status: 'pending_ops', assignedToName: 'Central Ops & Compliance' }
  ];

  assert.deepEqual(getVisibleTasksForRole(tasks, clients, rahul).map(task => task.id), ['own', 'own-ops']);
});

test('shows ops all ops-addressed tasks even when category is not operations', () => {
  const tasks = [
    { id: 'tax', clientId: 'cli-2', assignedTo: 'ops-1', status: 'pending_ops', category: 'Tax Optimization', assignedToName: 'Central Ops & Compliance' },
    { id: 'rm', clientId: 'cli-2', assignedTo: 'rm-1', status: 'pending_rm', category: 'CRM Ops', assignedToName: 'Rahul Sharma' }
  ];

  assert.deepEqual(getVisibleTasksForRole(tasks, clients, ops).map(task => task.id), ['tax', 'rm']);
});

test('uses one open-task selector for every task count surface', () => {
  const tasks = [
    { id: 'pending', status: 'pending_rm' },
    { id: 'ops', status: 'pending_ops' },
    { id: 'processing', status: 'in_progress' },
    { id: 'done', status: 'completed' }
  ];

  assert.deepEqual(getOpenTasks(tasks).map(task => task.id), ['pending', 'ops', 'processing']);
});

test('dedupes generated talking points and falls back to client dossier copy', () => {
  assert.deepEqual(dedupeStrings(['Deploy into arbitrage fund via STP.', 'Deploy into arbitrage fund via STP.', 'Review allocation.']), [
    'Deploy into arbitrage fund via STP.',
    'Review allocation.'
  ]);

  const localFallbackView = buildClientViewModel({
    baseClient: {
      name: 'Kabir Malhotra',
      idleSavings: '₹65 Lakhs',
      idleSavingsRate: '4.0% p.a.',
      taxHarvestingOpportunity: '₹4.5 Lakhs',
      talkingPoints: ['Discuss private credit allocation.'],
      objectionDefense: [{ question: 'Why AIF?', answer: 'Diversifies concentrated public-market exposure.' }],
      currentAllocation: { equity: 71, debt: 16, alternates: 13 },
      mandateAllocation: { equity: 70, debt: 15, alternates: 15 }
    },
    normalizedAlerts: []
  });

  assert.equal(localFallbackView.idleSavings, '₹65 Lakhs');
  assert.equal(localFallbackView.taxHarvestingOpportunity, '₹4.5 Lakhs');
  assert.equal(localFallbackView.talkingPoints[0], 'Discuss private credit allocation.');
  assert.equal(localFallbackView.objectionDefense[0].answer, 'Diversifies concentrated public-market exposure.');

  const apiNullView = buildClientViewModel({
    baseClient: {
      name: 'Goenka',
      idleSavings: '₹35 Lakhs',
      taxHarvestingOpportunity: '₹1.8 Lakhs',
      currentAllocation: { equity: 42, debt: 48, alternates: 10 },
      mandateAllocation: { equity: 50, debt: 40, alternates: 10 }
    },
    portfolio: { idleCash: null, taxHarvestingOpportunity: null }
  });

  assert.equal(apiNullView.idleSavings, '-');
  assert.equal(apiNullView.taxHarvestingOpportunity, '-');

  const bootstrapOpportunityView = buildClientViewModel({
    baseClient: {
      name: 'Goenka',
      idleCash: {
        title: '₹35L Idle in HDFC Classic Savings',
        description: 'Review deployment after Re-KYC.',
        amountNumeric: 3500000
      },
      taxHarvestingOpportunity: {
        title: '₹1.8 Lakhs Tax-Loss Harvest Window',
        description: 'Review loss-making tranches.'
      },
      currentAllocation: { equity: 42, debt: 48, alternates: 10 },
      mandateAllocation: { equity: 50, debt: 40, alternates: 10 }
    }
  });

  assert.equal(bootstrapOpportunityView.idleSavings, '₹35L Idle in HDFC Classic Savings');
  assert.equal(bootstrapOpportunityView.taxHarvestingOpportunity, '₹1.8 Lakhs Tax-Loss Harvest Window');
});

test('renders call note synthesis audit copy from event metadata instead of stored prose', () => {
  const oldDetails = [
    'Synthesized CRM draft from call note',
    'Synthesized CRM draft from call note with gemini',
    'Synthesized CRM draft from call note using Gemini'
  ];

  assert.deepEqual(
    oldDetails.map(detail => renderAuditDetail({
      event: 'callnote.synthesized',
      detail,
      metadataJson: { provider: 'gemini' }
    })),
    [
      'Synthesized CRM draft from call note using deterministic backend extraction',
      'Synthesized CRM draft from call note using deterministic backend extraction',
      'Synthesized CRM draft from call note using deterministic backend extraction'
    ]
  );

  assert.equal(
    renderAuditDetail({
      event: 'callnote.synthesized',
      detail: 'callnote.synthesized',
      metadataJson: { provider: 'gemini', geminiCalled: true, model: 'gemini-2.5-flash' }
    }),
    'Synthesized CRM draft from call note using Gemini'
  );

  assert.equal(
    renderAuditDetail({
      event: 'callnote.synthesized',
      detail: 'Synthesized CRM draft from call note with gemini',
      metadataJson: { provider: 'backend_deterministic' }
    }),
    'Synthesized CRM draft from call note using deterministic backend extraction'
  );
});
