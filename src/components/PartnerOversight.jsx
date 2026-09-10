import React from 'react';
import {
  ShieldCheck, AlertTriangle, TrendingUp, Users, Building,
  Clock, CheckCircle2, ArrowRight, ShieldAlert, Zap, BarChart2,
  FileCheck, ExternalLink, HelpCircle, GraduationCap, FlaskConical
} from 'lucide-react';

function getAllocationDriftSeverity(client) {
  const dims = ['equity', 'debt', 'alternates'];
  const current = client.currentAllocation;
  const mandate = client.mandateAllocation;
  if (!current || !mandate) return { level: 'low', label: 'Not loaded' };
  const maxDrift = Math.max(...dims.map(d => Math.abs((current[d] || 0) - (mandate[d] || 0))));
  if (maxDrift >= 12) return { level: 'high', label: `${maxDrift}pt drift` };
  if (maxDrift >= 5) return { level: 'medium', label: `${maxDrift}pt drift` };
  return { level: 'low', label: `${maxDrift}pt drift` };
}

function getIdleCashSeverity(client) {
  const amount = client.idleCashAmountNumeric || 0;
  const label = client.idleSavings || client.idleCashLabel || 'Not loaded';
  const lakhs = amount ? amount / 100000 : parseFloat((label.match(/([\d.]+)\s*Lakhs?/i) || [])[1] || '0');
  if (lakhs >= 40) return { level: 'high', label };
  if (lakhs >= 20) return { level: 'medium', label };
  return { level: 'low', label };
}

function getKycSeverity(client) {
  if ((client.kycStatus || '').startsWith('Action Required')) {
    return { level: 'high', label: 'Action Required' };
  }
  return { level: 'low', label: 'Verified' };
}

const HEATMAP_COLORS = {
  high: 'bg-rose-950/50 text-rose-300 border-rose-800',
  medium: 'bg-amber-950/50 text-amber-300 border-amber-800',
  low: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
};

export default function PartnerOversight({
  tasks,
  teamMembers = [],
  clientProfiles = [],
  demoCallScenarios = [],
  firmMetrics = {},
  auditLogs = []
}) {
  // Derive branch status from the same data shown in the capacity matrix
  // and SLA counts below, rather than a fixed "always healthy" label
  const hasNearBreachSLA = tasks.some(t => t.slaStatus === 'near_breach');
  const hasCapacityIssue = teamMembers.some(
    m => tasks.filter(t => t.assignedTo === m.id).length >= 5
  );
  const branchNeedsAttention = hasNearBreachSLA || hasCapacityIssue;

  const handleExportAuditReport = () => {
    const headers = ['Timestamp', 'Event', 'Client', 'Advisor', 'Detail', 'Compliance Status'];
    const rows = auditLogs.map(log => [log.timestamp, log.event, log.client, log.advisor, log.detail, log.complianceStatus]);
    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k2-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Cluster Head Oversight Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Cluster Head & Executive Governance Desk
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Managerial visibility across RM execution, pipeline velocity, team SLA adherence, and SEBI compliance audit trails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border ${
              branchNeedsAttention
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${branchNeedsAttention ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              Branch Status: {branchNeedsAttention ? 'Needs Attention' : 'On Track'}
            </span>
          </div>
        </div>

        {/* 4 Pillar Executive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Total Managed AUM</span>
            <span className="text-2xl font-black text-white mt-1 block">{firmMetrics.totalAUM}</span>
            <span className="text-xs text-emerald-400 mt-1 block font-medium">+14.2% YoY Inflows</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Unallocated Client Cash</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{firmMetrics.unallocatedCashAcrossClients}</span>
            <span className="text-xs text-slate-400 mt-1 block">Immediate fee expansion pool</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">CRM Log Adherence</span>
            <span className="text-2xl font-black text-sky-400 mt-1 block">{firmMetrics.crmHygieneScore}</span>
            <span className="text-xs text-slate-400 mt-1 block">Auto-logged from RM call notes</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Tax Loss Harvest Window</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{firmMetrics.taxLossHarvestableWindow}</span>
            <span className="text-xs text-slate-400 mt-1 block">Active across 4 HNWI portfolios</span>
          </div>
        </div>
      </div>

      {/* RM Team Quality & Capacity Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              RM Advisory Capacity, SLA & Compliance Quality Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identify advisors facing operational bottlenecks and reassign tasks across the team
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Workload Pulse</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Advisor / Desk</th>
                <th className="py-3 px-4">Role / Level</th>
                <th className="py-3 px-4">Book AUM</th>
                <th className="py-3 px-4">Clients</th>
                <th className="py-3 px-4">Active Tasks</th>
                <th className="py-3 px-4">SLA Score</th>
                <th className="py-3 px-4">Workload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teamMembers.map(member => {
                const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.status !== 'completed');
                return (
                  <tr key={member.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{member.name}</div>
                      <div className="text-[11px] text-slate-400">{member.role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${member.badgeColor}`}>
                        {member.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{member.totalAUM}</td>
                    <td className="py-3 px-4 text-slate-300">{member.clientsCount} Accounts</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-cyan-300">{memberTasks.length} tasks</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400">{member.slaScore}</span>
                    </td>
                    <td className="py-3 px-4">
                      {memberTasks.length >= 5 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Capacity Near Limit
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Optimal Capacity
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book-Wide Risk Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Book-Wide Risk Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Where the fires are: allocation drift, idle-cash drag, and KYC status across every client
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Advisor</th>
                <th className="py-2.5 px-3">Allocation Drift</th>
                <th className="py-2.5 px-3">Idle Cash Drag</th>
                <th className="py-2.5 px-3">KYC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clientProfiles.map(c => {
                const drift = getAllocationDriftSeverity(c);
                const idle = getIdleCashSeverity(c);
                const kyc = getKycSeverity(c);
                const rm = teamMembers.find(m => m.id === c.assignedRMId);
                return (
                  <tr key={c.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{rm ? rm.name : '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${HEATMAP_COLORS[drift.level]}`}>
                        {drift.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${HEATMAP_COLORS[idle.level]}`}>
                        {idle.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${HEATMAP_COLORS[kyc.level]}`}>
                        {kyc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Quality & Coaching — MOCK, see CONTEXT.md "Dev Build Required" */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              Call Quality &amp; Coaching
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scored without a manager needing to review the call themselves
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
            <FlaskConical className="w-3 h-3" /> Mock scoring — see CONTEXT.md
          </span>
        </div>
        <div className="space-y-2.5">
          {demoCallScenarios.map(sc => {
            const client = clientProfiles.find(c => c.id === sc.clientId);
            const rm = client ? teamMembers.find(m => m.id === client.assignedRMId) : null;
            const cq = sc.callQuality;
            if (!cq) return null;
            return (
              <div key={sc.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-white">{sc.clientName} <span className="text-slate-500 font-normal">— {rm ? rm.name : 'Unassigned'}</span></div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{cq.coachingNote}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className={cq.complianceMentioned ? 'text-emerald-400' : 'text-amber-400'}>
                      {cq.complianceMentioned ? '✓ Compliance addressed' : '△ Compliance not mentioned'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Tone: {cq.tone}</span>
                  </div>
                </div>
                <span className={`text-sm font-black shrink-0 ${cq.score >= 8.5 ? 'text-emerald-400' : cq.score >= 7 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {cq.score.toFixed(1)}/10
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance & SEBI Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Automated SEBI Compliance & Activity Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every client interaction, suitability check, and task dispatch generates a timestamped compliance log entry
            </p>
          </div>
          <button
            onClick={handleExportAuditReport}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Export Audit Report
          </button>
        </div>

        <div className="space-y-2.5">
          {auditLogs.length === 0 ? (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500">
              No backend audit events are available for this manager scope yet.
            </div>
          ) : auditLogs.map((log, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{log.timestamp}</span>
                  <span className="font-bold text-white">{log.event}</span>
                  <span className="text-cyan-400 font-semibold">• {log.client}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {log.detail}
                </p>
                <div className="text-[10px] text-slate-400">
                  Advisor: <span className="text-slate-200 font-medium">{log.advisor}</span>
                </div>
              </div>

              <div className="shrink-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                  log.complianceStatus.includes('URGENT') 
                    ? 'bg-rose-950 text-rose-300 border-rose-800' 
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                }`}>
                  {log.complianceStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
