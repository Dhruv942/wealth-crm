export function getClientIdleSavingsLakhs(client) {
  if (typeof client?.idleCash?.amountNumeric === 'number') return client.idleCash.amountNumeric / 100000;
  if (Object.prototype.hasOwnProperty.call(client || {}, 'idleCash')) return 0;
  if (typeof client?.idleCashAmountNumeric === 'number') return client.idleCashAmountNumeric / 100000;
  if (typeof client?.idleSavingsNumeric === 'number') return client.idleSavingsNumeric;
  if (typeof client?.amountNumeric === 'number') return client.amountNumeric / 100000;
  const match = (client?.idleSavings || '').match(/([\d.]+)\s*Lakhs?/i);
  return match ? Number.parseFloat(match[1]) : 0;
}

export function formatLakhsAsIndianCurrency(lakhs) {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs.toFixed(1)} Lakhs`;
}

export function formatIdleCashFromClients(clients) {
  const totalLakhs = clients.reduce((sum, client) => sum + getClientIdleSavingsLakhs(client), 0);
  return formatLakhsAsIndianCurrency(totalLakhs);
}

export function dedupeStrings(items) {
  const seen = new Set();
  return items
    .filter(Boolean)
    .map(item => String(item).trim())
    .filter(item => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function toUiAllocation(allocation) {
  return {
    equity: allocation?.equity ?? allocation?.equityPct ?? 0,
    debt: allocation?.debt ?? allocation?.debtPct ?? 0,
    alternates: allocation?.alternates ?? allocation?.alternatesPct ?? 0
  };
}

export function getAllocationDriftSeverity(client) {
  const current = toUiAllocation(client?.currentAllocation);
  const mandate = toUiAllocation(client?.mandateAllocation || client?.targetAllocation);
  const hasAllocation = ['equity', 'debt', 'alternates'].some(key => current[key] || mandate[key]);
  if (!hasAllocation) return { level: 'low', label: 'No allocation data' };
  const maxDrift = Math.max(...['equity', 'debt', 'alternates'].map(key => Math.abs(current[key] - mandate[key])));
  if (maxDrift >= 12) return { level: 'high', label: `${maxDrift}pt drift` };
  if (maxDrift >= 5) return { level: 'medium', label: `${maxDrift}pt drift` };
  return { level: 'low', label: `${maxDrift}pt drift` };
}

export function getIdleCashSeverity(client) {
  const lakhs = getClientIdleSavingsLakhs(client);
  const label = client?.idleCash?.title || (Object.prototype.hasOwnProperty.call(client || {}, 'idleCash') ? '-' : client?.idleSavings || client?.idleCashLabel || formatLakhsAsIndianCurrency(lakhs));
  if (lakhs >= 40) return { level: 'high', label };
  if (lakhs >= 20) return { level: 'medium', label };
  return { level: 'low', label };
}

export function getVisibleTasksForRole(tasks, clientProfiles, currentRM) {
  const isManager = currentRM?.level === 'Manager';
  const isOps = currentRM?.level === 'Operations';
  const ownClientIds = new Set(
    clientProfiles
      .filter(client => (client.assignedRMId || client.assignedRmId) === currentRM?.id)
      .map(client => client.id)
  );

  return tasks.filter(task => {
    const assignedTo = task.assignedTo || task.assignedToUserId;
    if (isManager) return true;
    if (isOps) {
      return assignedTo === currentRM.id || (task.assignedToName || '').toLowerCase().includes('ops') || (task.category || '').toLowerCase().includes('ops');
    }
    return assignedTo === currentRM.id || (ownClientIds.has(task.clientId) && assignedTo === 'ops-1');
  });
}

export function getOpenTasks(tasks) {
  return tasks.filter(task => task.status !== 'completed');
}

function opportunityTitle(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.title === 'string') return value.title;
  return null;
}

function opportunityDescription(value) {
  if (!value) return null;
  if (typeof value === 'string') return null;
  if (typeof value.description === 'string') return value.description;
  return null;
}

export function renderAuditDetail(log) {
  if (log?.event !== 'callnote.synthesized') return log?.detail || '';

  const metadata = log.metadataJson || log.metadata || {};
  const provider = metadata.provider || 'backend_deterministic';
  const model = typeof metadata.model === 'string' ? metadata.model : '';
  const verifiedGemini = metadata.geminiCalled === true || model.toLowerCase().startsWith('gemini');
  if (verifiedGemini) {
    return 'Synthesized CRM draft from call note using Gemini';
  }
  if (provider === 'backend_deterministic_after_gemini_error') {
    return 'Synthesized CRM draft from call note using deterministic backend extraction after Gemini error';
  }
  return 'Synthesized CRM draft from call note using deterministic backend extraction';
}

export function buildClientViewModel({
  baseClient,
  clientDetail = null,
  portfolio = null,
  normalizedAlerts = []
}) {
  if (!baseClient) return null;
  const hasPortfolioResponse = portfolio !== null && portfolio !== undefined;
  const idleCashOpportunity = hasPortfolioResponse ? portfolio?.idleCash : baseClient.idleCash;
  const taxHarvestingOpportunity = hasPortfolioResponse ? portfolio?.taxHarvestingOpportunity : baseClient.taxHarvestingOpportunity;
  const currentAllocation = toUiAllocation(portfolio?.currentAllocation || baseClient.currentAllocation);
  const mandateAllocation = toUiAllocation(portfolio?.targetAllocation || baseClient.mandateAllocation);
  const portfolioHighlights = portfolio?.holdings?.length
    ? portfolio.holdings.map(holding => ({
      name: holding.name,
      type: holding.assetType,
      value: holding.valueDisplay,
      returns: holding.returnDisplay || ''
    }))
    : (baseClient.portfolioHighlights || []);
  const clientContextNotes = clientDetail?.contextNotes?.length
    ? clientDetail.contextNotes.map(note => note.note).join(' ')
    : baseClient.clientContextNotes || '';

  const generatedTalkingPoints = [
    opportunityDescription(idleCashOpportunity),
    opportunityDescription(taxHarvestingOpportunity),
    (portfolio?.currentAllocation || baseClient.currentAllocation) && (portfolio?.targetAllocation || baseClient.mandateAllocation)
      ? `Review allocation: equity ${currentAllocation.equity}% vs target ${mandateAllocation.equity}%, debt ${currentAllocation.debt}% vs target ${mandateAllocation.debt}%.`
      : null,
    ...normalizedAlerts.map(alert => alert.description)
  ];
  const talkingPoints = dedupeStrings([
    ...(baseClient.talkingPoints || []),
    ...generatedTalkingPoints
  ]).slice(0, 4);

  const fallbackObjections = [
    {
      question: 'Why are you recommending this next step?',
      answer: talkingPoints[0] || 'Review the portfolio snapshot and approved house view before making a recommendation.'
    },
    {
      question: 'Is this aligned to my risk profile?',
      answer: `The client risk profile is ${baseClient.riskCategory || 'not available'}; verify any execution against the recorded mandate before placing orders.`
    }
  ];

  return {
    ...baseClient,
    ...(clientDetail || {}),
    assignedRMId: baseClient.assignedRMId || baseClient.assignedRmId,
    aumDisplay: baseClient.aumDisplay || (baseClient.aumNumeric ? `₹${(baseClient.aumNumeric / 10000000).toFixed(2)} Cr` : '-'),
    currentAllocation,
    mandateAllocation,
    portfolioHighlights,
    clientContextNotes,
    coPilotAlerts: normalizedAlerts.length ? normalizedAlerts : (baseClient.coPilotAlerts || []),
    relationshipMoments: clientDetail?.relationshipMoments || baseClient.relationshipMoments || [],
    idleSavings: opportunityTitle(idleCashOpportunity) || (hasPortfolioResponse ? '-' : opportunityTitle(baseClient.idleSavings) || 'Not available'),
    idleSavingsRate: opportunityDescription(idleCashOpportunity) || (hasPortfolioResponse ? 'No API idle-cash opportunity' : baseClient.idleSavingsRate || 'Awaiting portfolio feed'),
    taxHarvestingOpportunity: opportunityTitle(taxHarvestingOpportunity) || (hasPortfolioResponse ? '-' : 'Not available'),
    talkingPoints,
    objectionDefense: baseClient.objectionDefense?.length ? baseClient.objectionDefense : fallbackObjections
  };
}

export function addGeneratedTasksOnce(existingTasks, newTasks) {
  const existingIds = new Set(existingTasks.map(task => task.id));
  return [...newTasks.filter(task => !existingIds.has(task.id)), ...existingTasks];
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.top = '-1000px';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
