import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, User, 
  Filter, Plus, RefreshCw, ChevronRight, Layers, ExternalLink,
  ShieldAlert, Sparkles, Building, ArrowUpRight, Lock, Send
} from 'lucide-react';
import { TEAM_MEMBERS as LOCAL_TEAM_MEMBERS, FIRM_METRICS as LOCAL_FIRM_METRICS, CLIENT_PROFILES as LOCAL_CLIENT_PROFILES } from '../mockData/wealthData';

const ALERT_SEVERITY_RANK = { critical: 4, warning: 3, opportunity: 2, info: 1 };

export default function TaskAllocationDesk({ 
  tasks, 
  teamMembers = LOCAL_TEAM_MEMBERS,
  clientProfiles = LOCAL_CLIENT_PROFILES,
  firmMetrics = LOCAL_FIRM_METRICS,
  currentRM,
  onUpdateTaskStatus, 
  onReassignTask, 
  onSelectClientForCopilot,
  onNavigateToCopilot 
}) {
  const isManagerOrOps = currentRM.level === 'Manager' || currentRM.level === 'Operations';
  const [selectedRM, setSelectedRM] = useState(isManagerOrOps ? 'all' : currentRM.id);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [handoffModalTask, setHandoffModalTask] = useState(null);

  // Strict role-based task visibility:
  // RMs only see tasks assigned to them OR tasks for their clients with Ops
  const visibleTasks = tasks.filter(task => {
    if (isManagerOrOps) return true;
    return task.assignedTo === currentRM.id || (task.assignedTo.startsWith('ops') && task.assignedToName?.includes('Ops'));
  });

  const filteredTasks = visibleTasks.filter(task => {
    if (isManagerOrOps && selectedRM !== 'all' && task.assignedTo !== selectedRM) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    return true;
  });

  // Next Best Action: rank accessible clients by their most severe open alert,
  // so the RM/manager sees who to call today instead of opening each dossier one by one
  const nbaAccessibleClients = isManagerOrOps
    ? clientProfiles
    : clientProfiles.filter(c => c.assignedRMId === currentRM.id);

  const nextBestActions = nbaAccessibleClients
    .map(c => {
      const topAlert = (c.coPilotAlerts || [])
        .slice()
        .sort((a, b) => (ALERT_SEVERITY_RANK[b.severity] || 0) - (ALERT_SEVERITY_RANK[a.severity] || 0))[0];
      return topAlert ? { client: c, alert: topAlert } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (ALERT_SEVERITY_RANK[b.alert.severity] || 0) - (ALERT_SEVERITY_RANK[a.alert.severity] || 0))
    .slice(0, 3);

  const columns = [
    { id: 'pending_rm', title: isManagerOrOps ? 'Action Required (RM)' : 'My Action Items', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'in_progress', title: 'In Progress / Processing', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'pending_ops', title: 'With Central Ops & KYC', badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
    { id: 'completed', title: 'Completed & Dispatched', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Urgent':
      case 'High':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSlaBadge = (slaStatus, countdown) => {
    if (slaStatus === 'near_breach') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          SLA: {countdown}
        </span>
      );
    }
    if (slaStatus === 'urgent') {
      return (
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
          <Clock className="w-3 h-3 text-amber-400" />
          SLA: {countdown}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
        <Clock className="w-3 h-3 text-slate-500" />
        {countdown}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Context-Aware Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isManagerOrOps ? (
          <>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>Branch Managed AUM</span>
                <Building className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white tracking-tight">{firmMetrics.totalAUM}</span>
                <span className="text-xs text-emerald-400 ml-2 font-medium">{firmMetrics.activeClients} HNWI Accounts</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>Team Tasks Due Today</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400 tracking-tight">{firmMetrics.tasksDueToday}</span>
                <span className="text-xs text-rose-400 font-semibold">({firmMetrics.nearBreachSLAs} Near Breach)</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>My Book AUM</span>
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white tracking-tight">{currentRM.totalAUM}</span>
                <span className="text-xs text-cyan-400 ml-2 font-medium">{currentRM.clientsCount} Assigned Clients</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>My Open Tasks</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400 tracking-tight">
                  {visibleTasks.filter(t => t.assignedTo === currentRM.id).length}
                </span>
                <span className="text-xs text-emerald-400 font-medium">SLA Adherence: {currentRM.slaScore}</span>
              </div>
            </div>
          </>
        )}

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Unallocated Idle Cash</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {isManagerOrOps ? firmMetrics.unallocatedCashAcrossClients : '₹45.0 Lakhs'}
            </span>
            <span className="text-xs text-slate-400 ml-2">Arbitrage Harvest Ready</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Access Tier</span>
            <Lock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-sky-300 tracking-tight block">
              {isManagerOrOps ? 'Cluster Head Mode' : 'RM Book Isolation'}
            </span>
            <span className="text-xs text-slate-400">
              {isManagerOrOps ? 'Full team rebalancing enabled' : 'Peer tasks & clients isolated'}
            </span>
          </div>
        </div>
      </div>

      {/* Next Best Action: ranked by most severe open client alert */}
      {nextBestActions.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Next Best Actions — Who to Call Today
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextBestActions.map(({ client: c, alert }) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg border text-xs space-y-2 ${
                  alert.severity === 'critical' ? 'bg-rose-950/30 border-rose-800' :
                  alert.severity === 'warning' ? 'bg-amber-950/30 border-amber-800' :
                  alert.severity === 'opportunity' ? 'bg-emerald-950/30 border-emerald-800' :
                  'bg-sky-950/30 border-sky-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-[10px] text-slate-400">{c.aumDisplay}</span>
                </div>
                <div className={`font-semibold ${
                  alert.severity === 'critical' ? 'text-rose-300' :
                  alert.severity === 'warning' ? 'text-amber-300' :
                  alert.severity === 'opportunity' ? 'text-emerald-300' : 'text-sky-300'
                }`}>
                  {alert.title}
                </div>
                <p className="text-slate-400 leading-relaxed line-clamp-2">{alert.description}</p>
                <button
                  onClick={() => { onSelectClientForCopilot(c.id); onNavigateToCopilot(); }}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Open Co-Pilot</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Team Filters (Manager only) or Personal Status */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {isManagerOrOps ? (
            <>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" /> Team Workload:
              </span>

              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedRM('all')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    selectedRM === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Team ({tasks.length})
                </button>
                {teamMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedRM(member.id)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                      selectedRM === member.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{member.name.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-70 bg-slate-800 px-1.5 py-0.2 rounded-full">
                      {tasks.filter(t => t.assignedTo === member.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" /> My Tasks
            </span>
          )}

          {/* Priority Filter */}
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category Filter */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="Portfolio Rebalancing">Portfolio Rebalancing</option>
            <option value="Compliance / KYC">Compliance / KYC</option>
            <option value="Compliance / LRS">Compliance / LRS</option>
            <option value="Banking / LRS">Banking / LRS</option>
            <option value="Tax Optimization">Tax Optimization</option>
            <option value="Client Review">Client Review</option>
            <option value="Mandate Execution">Mandate Execution</option>
            <option value="Operations / Execution">Operations / Execution</option>
            <option value="Operations / STP">Operations / STP</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredTasks.length}</strong> tasks in queue
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex flex-col min-h-[560px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'pending_rm' ? 'bg-amber-400' :
                    col.id === 'in_progress' ? 'bg-blue-400' :
                    col.id === 'pending_ops' ? 'bg-fuchsia-400' : 'bg-emerald-400'
                  }`} />
                  {col.title}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-40 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-600">
                    No tasks in queue
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 shadow-sm transition-all hover:shadow-md space-y-3 group"
                    >
                      {/* Priority + SLA Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        {getSlaBadge(task.slaStatus, task.slaCountdown)}
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.details}
                        </p>
                      </div>

                      {/* Client Badge with Click-to-Copilot */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-md p-2 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200">{task.clientName}</span>
                            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/70 border border-cyan-900/50 px-1 rounded">
                              {task.clientAUM}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                            {task.clientTier}
                          </span>
                        </div>

                        {task.clientId && (
                          <button
                            onClick={() => {
                              onSelectClientForCopilot(task.clientId);
                              onNavigateToCopilot();
                            }}
                            title="Open in RM Co-Pilot"
                            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Co-Pilot</span>
                          </button>
                        )}
                      </div>

                      {/* Footer: Assignee & Action Controls */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium text-slate-300 truncate max-w-[120px]">
                            {task.assignedToName || 'Unassigned'}
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1">
                          {isManagerOrOps ? (
                            <button
                              onClick={() => setHandoffModalTask(task)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                              title="Reallocate across team"
                            >
                              Reallocate
                            </button>
                          ) : (
                            task.assignedTo !== 'ops-1' && (
                              <button
                                onClick={() => onReassignTask(task.id, 'ops-1', 'Central Ops & Compliance')}
                                className="text-[11px] text-fuchsia-300 hover:text-fuchsia-200 bg-fuchsia-950/60 hover:bg-fuchsia-900/60 border border-fuchsia-800/60 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                                title="Hand off execution to Central Ops"
                              >
                                <Send className="w-3 h-3" />
                                <span>To Ops</span>
                              </button>
                            )
                          )}

                          {task.status !== 'completed' ? (
                            <button
                              onClick={() => {
                                const nextStatus = 
                                  task.status === 'pending_rm' ? 'in_progress' :
                                  task.status === 'in_progress' ? 'pending_ops' : 'completed';
                                onUpdateTaskStatus(task.id, nextStatus);
                              }}
                              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/50 px-2 py-0.5 rounded flex items-center gap-0.5 transition-colors"
                              title="Advance Status"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cluster Head Reassign Modal */}
      {handoffModalTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                Reallocate Task (Cluster Head Authority)
              </h3>
              <button 
                onClick={() => setHandoffModalTask(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Task:</p>
              <p className="text-sm font-semibold text-white">{handoffModalTask.title}</p>
              <p className="text-xs text-cyan-400 mt-1">Client: {handoffModalTask.clientName} ({handoffModalTask.clientAUM})</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Reallocate to Advisor or Central Ops:
              </label>
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      onReassignTask(handoffModalTask.id, member.id, member.name);
                      setHandoffModalTask(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      handoffModalTask.assignedTo === member.id
                        ? 'bg-cyan-950/40 border-cyan-600 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{member.name}</div>
                      <div className="text-[11px] text-slate-400">{member.role}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      SLA: {member.slaScore}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHandoffModalTask(null)}
                className="text-xs px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
