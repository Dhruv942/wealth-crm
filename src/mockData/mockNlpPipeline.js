// MOCK NLP PIPELINE — see CONTEXT.md "Dev Build Required" (Dev 2: AI Pipeline).
//
// This file is a heuristic, regex/keyword-based stand-in for real speech-to-text +
// LLM extraction. It exists so the demo produces *some* structured output when an RM
// types notes that don't match one of the 3 pre-written DEMO_CALL_SCENARIOS, instead of
// silently truncating the raw text. It is NOT AI — it is pattern matching, and it will
// visibly get things wrong on notes it wasn't tuned for. Replace this entire file with
// a real call to an LLM (see CONTEXT.md) before this ships to an actual RM.

const THEME_RULES = [
  { keywords: ['kyc', 're-kyc', 'rekyc', 'aadhaar'], theme: 'Compliance / KYC', taskTitle: 'Follow up on KYC / Re-KYC requirement', category: 'Compliance / KYC' },
  { keywords: ['stp', 'sip', 'systematic'], theme: 'Recurring Investment Setup (STP)', taskTitle: 'Set up systematic transfer/investment mandate', category: 'Operations / STP' },
  { keywords: ['arbitrage', 'rebalance', 'rebalancing', 'allocation'], theme: 'Portfolio Rebalancing', taskTitle: 'Execute portfolio rebalancing per discussion', category: 'Portfolio Rebalancing' },
  { keywords: ['lrs', 'remittance', 'tuition', 'abroad', 'foreign'], theme: 'Liquidity Event / LRS Remittance', taskTitle: 'Prepare LRS remittance documentation (Form A2 / 15CA-CB)', category: 'Banking / LRS' },
  { keywords: ['tax', 'harvest', 'stcg', 'ltcg', 'capital gain'], theme: 'Tax Optimization', taskTitle: 'Review tax-loss harvesting opportunity', category: 'Tax Optimization' },
];

const POSITIVE_WORDS = ['loved', 'delighted', 'happy', 'approved', 'great', 'thanks', 'satisfied'];
const NEGATIVE_WORDS = ['panic', 'worried', 'anxious', 'concerned', 'upset', 'frustrated', 'angry'];

function extractAmounts(text) {
  const matches = text.match(/₹\s?[\d,.]+\s?(cr|crore|l|lakh|lakhs)?/gi) || [];
  return [...new Set(matches.map(m => m.trim()))];
}

function detectThemes(text) {
  const lower = text.toLowerCase();
  return THEME_RULES.filter(rule => rule.keywords.some(k => lower.includes(k)));
}

function guessSentiment(text) {
  const lower = text.toLowerCase();
  const hasPositive = POSITIVE_WORDS.some(w => lower.includes(w));
  const hasNegative = NEGATIVE_WORDS.some(w => lower.includes(w));
  if (hasNegative && !hasPositive) return 'Anxious / needs reassurance (heuristic guess — verify against actual tone)';
  if (hasPositive && !hasNegative) return 'Positive / satisfied (heuristic guess — verify against actual tone)';
  return 'Neutral (heuristic guess — verify against actual tone)';
}

/**
 * Heuristic stand-in for a real NLP extraction pipeline. Takes raw call notes and
 * returns a parsedResult-shaped object, matching the structure the UI already expects
 * from DEMO_CALL_SCENARIOS[].parsedResult.
 */
export function mockExtractFromNotes(rawText, clientName) {
  const amounts = extractAmounts(rawText);
  const themes = detectThemes(rawText);
  const sentiment = guessSentiment(rawText);

  const themeList = themes.length > 0 ? themes.map(t => t.theme).join(', ') : 'No specific theme detected';

  const generatedOpsTasks = themes.slice(0, 2).map((t, i) => ({
    id: `heuristic-task-${Date.now()}-${i}`,
    title: t.taskTitle,
    assignedTo: 'ops-1',
    assignedToName: 'Central Ops & Compliance',
    clientName,
    clientAUM: '',
    clientTier: '',
    priority: 'Medium',
    slaCountdown: '1d',
    slaStatus: 'on_track',
    category: t.category,
    status: 'pending_ops'
  }));

  return {
    summary: `[Heuristic extraction — not a real NLP model] Detected themes: ${themeList}. Amounts mentioned: ${amounts.length > 0 ? amounts.join(', ') : 'none detected'}. Raw notes: ${rawText.slice(0, 300)}${rawText.length > 300 ? '...' : ''}`,
    sentiment,
    liquiditySignals: amounts.map(a => ({ amount: a, status: 'Mentioned in notes', asset: 'Unspecified — confirm with RM' })),
    suitabilityGuardrail: 'Not yet checked against client mandate — a real pipeline must run this against the client\'s actual risk profile before this record is synced.',
    generatedOpsTasks,
    whatsappDraft: `Hi, thank you for the call today. Summary of what we discussed: ${themeList !== 'No specific theme detected' ? themeList : 'please see attached notes'}. We'll follow up with next steps shortly.\n\n[This draft was generated heuristically — review before sending.]`,
    emailSubject: `Follow-up: Call Summary — ${clientName}`,
    emailBody: `Dear ${clientName},\n\nThank you for your time today. Here is a summary of what we discussed:\n\n${themeList}\n\n[This draft was generated heuristically from raw notes — please review and personalize before sending.]\n\nRegards,\nYour Relationship Manager`,
    crmStageUpdate: 'Stage: Pending Manual Review (heuristic extraction)'
  };
}
