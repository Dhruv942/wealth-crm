import React, { useState, useEffect } from 'react';
import {
  Sparkles, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown,
  HelpCircle, MessageSquare, PhoneCall, Copy, Check, ChevronDown,
  ChevronUp, PieChart, ArrowUpRight, Clock, User, Landmark,
  FileText, Shield, DollarSign, Lock, Gift, CalendarClock
} from 'lucide-react';
import { CLIENT_PROFILES as LOCAL_CLIENT_PROFILES, FIRM_METRICS as LOCAL_FIRM_METRICS } from '../mockData/wealthData';

export default function RMCopilotDossier({ 
  currentRM,
  clientProfiles = LOCAL_CLIENT_PROFILES,
  firmMetrics = LOCAL_FIRM_METRICS,
  selectedClientId, 
  onSelectClient, 
  onNavigateToAutoCRM 
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedObjection, setExpandedObjection] = useState(0);

  const isPartnerOrOps = currentRM.level === 'Manager' || currentRM.level === 'Operations';

  // Strict client book isolation:
  // Junior RMs only see clients assigned to them
  const accessibleClients = isPartnerOrOps 
    ? clientProfiles 
    : clientProfiles.filter(c => c.assignedRMId === currentRM.id);

  // If current selection is not accessible by this RM, fallback to first accessible client
  const client = accessibleClients.find(c => c.id === selectedClientId) || accessibleClients[0] || clientProfiles[0] || LOCAL_CLIENT_PROFILES[0];

  useEffect(() => {
    if (client && client.id !== selectedClientId) {
      onSelectClient(client.id);
    }
  }, [currentRM.id]);

  const handleCopyTalkingPoints = () => {
    const text = client.talkingPoints.map((tp, i) => `${i + 1}. ${tp}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex('all');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Client Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          Client Dossier:
        </div>

        <select
          value={client.id}
          onChange={(e) => onSelectClient(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-200 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option disabled>
            {isPartnerOrOps
              ? `— ${accessibleClients.length} of ${firmMetrics.activeClients} firm-wide (demo) —`
              : `— ${accessibleClients.length} of ${currentRM.clientsCount} in book (demo) —`}
          </option>
          {accessibleClients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.aumDisplay})
            </option>
          ))}
        </select>
      </div>

      {/* Main Client Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">{client.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {client.tier}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {client.city}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-900/50 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-emerald-400" /> Assigned to {currentRM.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {client.firmOrFamily} • Risk Category: <strong className="text-slate-200">{client.riskCategory}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right pr-4 border-r border-slate-800 hidden sm:block">
              <div className="text-xs text-slate-400 uppercase font-medium">Client AUM</div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">{client.aumDisplay}</div>
            </div>

            <button
              onClick={() => onNavigateToAutoCRM(client.id)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all hover:translate-y-[-1px]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Log This Call</span>
            </button>
          </div>
        </div>

        {/* Client Background Context Alert */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 text-xs">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px] block">
              Confidential Client Dossier Intel:
            </span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{client.clientContextNotes}</p>
          </div>
        </div>
      </div>

      {/* Grid: Portfolio Diagnostics & Co-Pilot Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Diagnostics & Holdings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Asset Allocation vs Mandate */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                Asset Allocation vs Target Mandate
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Risk Profile: {client.riskCategory}
              </span>
            </div>

            {/* Visual Bars Comparison */}
            <div className="space-y-3">
              {/* Equity Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">Equity Exposure</span>
                  <span className="font-semibold text-white">
                    {client.currentAllocation.equity}% <span className="text-slate-500 font-normal">(Target: {client.mandateAllocation.equity}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      client.currentAllocation.equity > client.mandateAllocation.equity 
                        ? 'bg-amber-500' 
                        : 'bg-cyan-500'
                    }`} 
                    style={{ width: `${client.currentAllocation.equity}%` }} 
                  />
                </div>
                {client.currentAllocation.equity > client.mandateAllocation.equity && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3" /> Overweight by +{client.currentAllocation.equity - client.mandateAllocation.equity}% (Trim & Rebalance recommended)
                  </p>
                )}
              </div>

              {/* Debt / Fixed Income Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">Fixed Income / Debt</span>
                  <span className="font-semibold text-white">
                    {client.currentAllocation.debt}% <span className="text-slate-500 font-normal">(Target: {client.mandateAllocation.debt}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all" 
                    style={{ width: `${client.currentAllocation.debt}%` }} 
                  />
                </div>
              </div>

              {/* Alternates Bar */}
              {client.mandateAllocation.alternates > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300">Alternates / Gold / PMS</span>
                    <span className="font-semibold text-white">
                      {client.currentAllocation.alternates}% <span className="text-slate-500 font-normal">(Target: {client.mandateAllocation.alternates}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                    <div 
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${client.currentAllocation.alternates}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Diagnostic Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Idle Bank Cash Drag</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 block">{client.idleSavings}</span>
                <span className="text-[10px] text-slate-500">{client.idleSavingsRate}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tax-Loss Harvesting</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{client.taxHarvestingOpportunity}</span>
                <span className="text-[10px] text-slate-500">Eligible to offset STCG</span>
              </div>
            </div>
          </div>

          {/* Holdings Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-cyan-400" />
              Client Investment Holdings
            </h3>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {client.portfolioHighlights.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{item.value}</div>
                    <div className={`text-[10px] font-semibold ${
                      item.returns.startsWith('+') ? 'text-emerald-400' :
                      item.returns.startsWith('-') ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {item.returns}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Co-Pilot Script & Objection Defense (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Co-Pilot Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Co-Pilot Alerts
              </h3>
            </div>

            <div className="space-y-2">
              {client.coPilotAlerts.map((alert, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border text-xs flex items-start gap-3 ${
                    alert.severity === 'critical' ? 'bg-rose-950/30 border-rose-800 text-rose-200' :
                    alert.severity === 'warning' ? 'bg-amber-950/30 border-amber-800 text-amber-200' :
                    alert.severity === 'opportunity' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200' :
                    'bg-sky-950/30 border-sky-800 text-sky-200'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-rose-400' :
                    alert.severity === 'warning' ? 'text-amber-400' :
                    alert.severity === 'opportunity' ? 'text-emerald-400' : 'text-sky-400'
                  }`} />
                  <div>
                    <div className="font-bold text-white text-xs">{alert.title}</div>
                    <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">{alert.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relationship Moments — distinct from severity-coded alerts; these are personal, not portfolio, cues */}
          {client.relationshipMoments && client.relationshipMoments.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-sky-400" />
                Relationship Moments
              </h3>
              <div className="space-y-2">
                {client.relationshipMoments.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg border border-sky-900/40 bg-sky-950/20 text-xs flex items-start gap-3">
                    <CalendarClock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sky-200">{m.date}</div>
                      <div className="text-[11px] mt-0.5 text-sky-100/80 leading-relaxed">{m.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Junior RM Talking Points Script */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Advisor Call Script & Talking Points
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recommended talking points for this call with {client.name}
                </p>
              </div>

              <button
                onClick={handleCopyTalkingPoints}
                className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors font-medium"
              >
                {copiedIndex === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 'all' ? 'Copied' : 'Copy Talking Points'}</span>
              </button>
            </div>

            {/* Talking Points List */}
            <div className="space-y-2.5">
              {client.talkingPoints.map((point, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 text-xs leading-relaxed group">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 group-hover:text-white transition-colors">{point}</span>
                </div>
              ))}
            </div>

            {/* SEBI Suitability Guardrail Guarantee */}
            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Aligned to Client Risk Mandate</span>
              </div>
              <span className="text-[10px] text-slate-400">Risk Profile: {client.riskCategory}</span>
            </div>
          </div>

          {/* Objection Defense Drawer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Objection Defense & Handling Scripts
            </h3>
            <p className="text-xs text-slate-400">
              Instant quantitative answers to pushbacks junior RMs typically stumble on
            </p>

            <div className="space-y-2 pt-1">
              {client.objectionDefense.map((item, index) => {
                const isOpen = expandedObjection === index;
                return (
                  <div key={index} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60">
                    <button
                      onClick={() => setExpandedObjection(isOpen ? null : index)}
                      className="w-full text-left p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Client Asks: "{item.question}"
                      </span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-3 bg-slate-900/80 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed pl-8">
                        <span className="text-cyan-400 font-semibold block mb-1 text-[11px] uppercase tracking-wider">
                          Recommended Advisor Response:
                        </span>
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
