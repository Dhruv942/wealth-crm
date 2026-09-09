import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Brain, RefreshCw, ShieldCheck, Clock,
  Sparkles, Bell, CheckCircle2, User, ChevronDown, Building,
  Lock, Eye, ShieldAlert, Layers, Search, X, AlertTriangle,
  Wallet, FileWarning, BookOpen, ChevronRight, FlaskConical
} from 'lucide-react';
import TaskAllocationDesk from './components/TaskAllocationDesk';
import RMCopilotDossier from './components/RMCopilotDossier';
import AutoCRMUpdate from './components/AutoCRMUpdate';
import PartnerOversight from './components/PartnerOversight';
import {
  CLIENT_PROFILES as LOCAL_CLIENT_PROFILES,
  DEMO_CALL_SCENARIOS as LOCAL_DEMO_CALL_SCENARIOS,
  FIRM_METRICS as LOCAL_FIRM_METRICS,
  HOUSE_VIEWS as LOCAL_HOUSE_VIEWS,
  INITIAL_TASKS as LOCAL_INITIAL_TASKS,
  PLAYBOOK_LIBRARY as LOCAL_PLAYBOOK_LIBRARY,
  TEAM_MEMBERS as LOCAL_TEAM_MEMBERS
} from './mockData/wealthData';
import {
  assignTask,
  fetchBootstrap,
  loginDemoRole,
  updateTaskStatus
} from './services/api';

const toRoleId = (user) => {
  if (!user) return 'rm-1';
  if (user.role === 'MANAGER') return 'rm-3';
  if (user.role === 'OPS') return 'ops-1';
  return user.id;
};

const mergeById = (fallback, incoming = []) => {
  const incomingById = new Map(incoming.map(item => [item.id, item]));
  const merged = fallback.map(item => ({ ...item, ...(incomingById.get(item.id) || {}) }));
  incoming.forEach(item => {
    if (!fallback.some(existing => existing.id === item.id)) merged.push(item);
  });
  return merged;
};

const enrichClients = (incoming = []) => {
  if (incoming.length === 0) return LOCAL_CLIENT_PROFILES;
  const incomingById = new Map(incoming.map(item => [item.id, item]));
  return incoming.map(client => {
    const fallback = LOCAL_CLIENT_PROFILES.find(item => item.id === client.id) || {};
    return {
      ...fallback,
      ...client,
      assignedRMId: client.assignedRMId || client.assignedRmId || fallback.assignedRMId
    };
  });
};

const normalizeAuditLog = (log) => {
  const client = LOCAL_CLIENT_PROFILES.find(c => c.id === log.clientId);
  const actor = LOCAL_TEAM_MEMBERS.find(m => m.id === log.actorUserId);
  return {
    timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '') + ' IST' : 'Live'),
    event: log.event || 'Activity',
    client: log.client || client?.name || log.clientId || 'Internal Desk',
    advisor: log.advisor || actor?.name || log.actorUserId || 'System',
    detail: log.detail || '',
    complianceStatus: log.complianceStatus || log.compliance_status || 'ok'
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('allocation');
  const [tasks, setTasks] = useState(LOCAL_INITIAL_TASKS);
  const [teamMembers, setTeamMembers] = useState(LOCAL_TEAM_MEMBERS);
  const [clientProfiles, setClientProfiles] = useState(LOCAL_CLIENT_PROFILES);
  const [demoCallScenarios, setDemoCallScenarios] = useState(LOCAL_DEMO_CALL_SCENARIOS);
  const [firmMetrics, setFirmMetrics] = useState(LOCAL_FIRM_METRICS);
  const [houseViews, setHouseViews] = useState(LOCAL_HOUSE_VIEWS);
  const [playbookLibrary, setPlaybookLibrary] = useState(LOCAL_PLAYBOOK_LIBRARY);
  const [auditLogs, setAuditLogs] = useState([]);
  const [apiToken, setApiToken] = useState(null);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [currentRM, setCurrentRM] = useState(LOCAL_TEAM_MEMBERS[0]); // Defaults to Rahul Sharma (RM)
  const [selectedClientId, setSelectedClientId] = useState('cli-1');
  const [toastMessage, setToastMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [houseViewOpen, setHouseViewOpen] = useState(false);
  const [houseViewQuery, setHouseViewQuery] = useState('');
  const [expandedHouseView, setExpandedHouseView] = useState(null);

  const isManagerOrOps = currentRM.level === 'Manager' || currentRM.level === 'Operations';

  const applyBootstrap = (bootstrap, roleId) => {
    const nextTeamMembers = mergeById(LOCAL_TEAM_MEMBERS, bootstrap.teamMembers || []);
    const nextClients = enrichClients(bootstrap.clientProfiles || []);
    setTeamMembers(nextTeamMembers);
    setClientProfiles(nextClients);
    setTasks(bootstrap.tasks || LOCAL_INITIAL_TASKS);
    setDemoCallScenarios(bootstrap.demoCallScenarios || LOCAL_DEMO_CALL_SCENARIOS);
    setFirmMetrics(bootstrap.firmMetrics || LOCAL_FIRM_METRICS);
    setHouseViews(bootstrap.houseViews || LOCAL_HOUSE_VIEWS);
    setPlaybookLibrary(bootstrap.playbookLibrary || LOCAL_PLAYBOOK_LIBRARY);
    setAuditLogs((bootstrap.auditLogs || []).map(normalizeAuditLog));
    setCurrentRM(nextTeamMembers.find(m => m.id === roleId) || LOCAL_TEAM_MEMBERS.find(m => m.id === roleId) || nextTeamMembers[0]);
  };

  const loadBackendForRole = async (roleId, { silent = false } = {}) => {
    try {
      setApiStatus('connecting');
      const login = await loginDemoRole(roleId);
      const bootstrap = await fetchBootstrap(login.accessToken);
      setApiToken(login.accessToken);
      applyBootstrap(bootstrap, toRoleId(login.user));
      setApiStatus('connected');
      if (!silent) showToast(`Backend connected as ${login.user.name}`);
    } catch (error) {
      setApiStatus('offline');
      if (!silent) showToast(`Backend unavailable, using local demo data. ${error.message}`);
    }
  };

  // Scope for nudges & search — same isolation rule used everywhere else in the app
  const accessibleClients = isManagerOrOps
    ? clientProfiles
    : clientProfiles.filter(c => c.assignedRMId === currentRM.id);
  const accessibleTasks = isManagerOrOps
    ? tasks
    : tasks.filter(t => t.assignedTo === currentRM.id || t.assignedTo === 'ops-1');

  const nearBreachTasks = accessibleTasks.filter(t => t.slaStatus === 'near_breach');
  const pendingReKyc = accessibleClients.filter(c => (c.kycStatus || '').startsWith('Action Required'));
  const idleCashTotalLakhs = accessibleClients.reduce((sum, c) => {
    const match = (c.idleSavings || '').match(/([\d.]+)\s*Lakhs?/i);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);
  const nudgeCount = nearBreachTasks.length + pendingReKyc.length + (idleCashTotalLakhs > 0 ? 1 : 0);

  // Global Cmd/Ctrl+K to open the command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setBellOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    loadBackendForRole('rm-1', { silent: true });
  }, []);

  const paletteClientResults = paletteQuery
    ? accessibleClients.filter(c => c.name.toLowerCase().includes(paletteQuery.toLowerCase()))
    : [];
  const paletteTaskResults = paletteQuery
    ? accessibleTasks.filter(t => t.title.toLowerCase().includes(paletteQuery.toLowerCase()))
    : [];

  const openClientFromPalette = (clientId) => {
    setSelectedClientId(clientId);
    setActiveTab('copilot');
    setPaletteOpen(false);
    setPaletteQuery('');
  };

  const openTaskFromPalette = () => {
    setActiveTab('allocation');
    setPaletteOpen(false);
    setPaletteQuery('');
  };

  // Live IST Clock formatted as dd-mm-yy • HH:MM:SS IST
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = String(now.getFullYear()).slice(-2);
      setCurrentTime(`${d}-${m}-${y} • ${istString} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // When changing role persona, ensure selected client is one of their assigned clients
  const handleSwitchRM = (rmId) => {
    const found = teamMembers.find(m => m.id === rmId) || LOCAL_TEAM_MEMBERS.find(m => m.id === rmId);
    if (found) {
      setCurrentRM(found);
      loadBackendForRole(rmId, { silent: true });
      const isManager = found.level === 'Manager' || found.level === 'Operations';
      if (!isManager) {
        const theirClients = clientProfiles.filter(c => c.assignedRMId === found.id);
        if (theirClients.length > 0) {
          setSelectedClientId(theirClients[0].id);
        }
        if (activeTab === 'oversight') {
          setActiveTab('allocation');
        }
      }
      showToast(`Switched view to ${found.name} (${found.level === 'Manager' ? 'Manager View' : 'RM View'})`);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshCurrentRole = () => loadBackendForRole(currentRM.id, { silent: true });

  const handleUpdateTaskStatus = async (taskId, nextStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    if (apiToken) {
      try {
        await updateTaskStatus(apiToken, taskId, nextStatus);
        await refreshCurrentRole();
      } catch (error) {
        showToast(`Backend task update failed: ${error.message}`);
      }
    }
    showToast(`Task status advanced to "${nextStatus.replace('_', ' ')}"!`);
  };

  const handleReassignTask = async (taskId, newAssigneeId, newAssigneeName) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          assignedTo: newAssigneeId, 
          assignedToName: newAssigneeName,
          status: newAssigneeId.startsWith('ops') ? 'pending_ops' : t.status 
        };
      }
      return t;
    }));
    if (apiToken) {
      try {
        await assignTask(apiToken, taskId, newAssigneeId);
        await refreshCurrentRole();
      } catch (error) {
        showToast(`Backend reassignment failed: ${error.message}`);
      }
    }
    showToast(`Task successfully reallocated to ${newAssigneeName}!`);
  };

  const handleTasksGenerated = (newTasks) => {
    setTasks(prev => [...newTasks, ...prev]);
  };

  // Task count badge for current user
  const userTaskCount = isManagerOrOps
    ? tasks.length
    : tasks.filter(t => t.assignedTo === currentRM.id).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-cyan-600/30">
              K2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">WealthDesk</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {isManagerOrOps ? 'Manager Suite' : 'Advisor Suite'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Wealth Advisory Intelligence & Standup Desk
              </p>
            </div>
          </div>

          {/* Right Tools: IST Clock, Search, Nudges & Role View Switcher */}
          <div className="flex items-center gap-3">
            {/* Live IST Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            {/* Command Palette Trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors"
              title="Jump to a client or task (Ctrl/Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] border border-slate-700 rounded px-1">⌘K</span>
            </button>

            {/* House View Reference — honest alternative to a live AI chat bot */}
            <button
              onClick={() => setHouseViewOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors"
              title="Firm's approved House View — for market/macro questions on a call"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">House View</span>
            </button>

            {/* Nudge Bell */}
            <div className="relative">
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4" />
                {nudgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {nudgeCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 space-y-2.5 z-50">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Today's Nudges</div>
                  {nearBreachTasks.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-rose-200">{nearBreachTasks.length} task{nearBreachTasks.length > 1 ? 's' : ''} near SLA breach</span>
                    </div>
                  )}
                  {pendingReKyc.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800 text-xs flex items-start gap-2">
                      <FileWarning className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-200">{pendingReKyc.length} client{pendingReKyc.length > 1 ? 's' : ''} with pending Re-KYC</span>
                    </div>
                  )}
                  {idleCashTotalLakhs > 0 && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs flex items-start gap-2">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-200">₹{idleCashTotalLakhs.toFixed(0)} Lakhs idle across your book</span>
                    </div>
                  )}
                  {nudgeCount === 0 && (
                    <div className="text-xs text-slate-500 py-2 text-center">Nothing needs attention right now.</div>
                  )}
                </div>
              )}
            </div>

            {/* Role-Based Persona Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-1.5 transition-colors">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1 font-medium hidden sm:flex">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Simulate View:</span>
              </div>
              <select
                value={currentRM.id}
                onChange={(e) => handleSwitchRM(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-md px-2.5 py-1 text-slate-200 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="rm-1">Rahul Sharma — RM View (Private Wealth)</option>
                <option value="rm-2">Priya Nair — RM View (Affluent Banking)</option>
                <option value="rm-3">Vikram Mehta — Cluster Head (Manager View)</option>
                <option value="ops-1">Central Ops & Compliance — Firm Ops Queue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 py-2">
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'allocation'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{isManagerOrOps ? 'Team Standup Board' : 'My Action Desk'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-700">
              {userTaskCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'copilot'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>Advisor Call Co-Pilot</span>
          </button>

          <button
            onClick={() => setActiveTab('autocrm')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'autocrm'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Auto CRM & Meeting Synthesizer</span>
          </button>

          {isManagerOrOps ? (
            <button
              onClick={() => setActiveTab('oversight')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'oversight'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Cluster Head Governance</span>
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {activeTab === 'allocation' && (
          <TaskAllocationDesk
            tasks={tasks}
            teamMembers={teamMembers}
            clientProfiles={clientProfiles}
            firmMetrics={firmMetrics}
            currentRM={currentRM}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onReassignTask={handleReassignTask}
            onSelectClientForCopilot={setSelectedClientId}
            onNavigateToCopilot={() => setActiveTab('copilot')}
          />
        )}

        {activeTab === 'copilot' && (
          <RMCopilotDossier
            currentRM={currentRM}
            clientProfiles={clientProfiles}
            firmMetrics={firmMetrics}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onNavigateToAutoCRM={(clientId) => {
              setSelectedClientId(clientId);
              setActiveTab('autocrm');
            }}
          />
        )}

        {activeTab === 'autocrm' && (
          <AutoCRMUpdate
            currentRM={currentRM}
            clientProfiles={clientProfiles}
            demoCallScenarios={demoCallScenarios}
            playbookLibrary={playbookLibrary}
            apiToken={apiToken}
            onBackendRefresh={refreshCurrentRole}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onTasksGenerated={handleTasksGenerated}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'oversight' && isManagerOrOps && (
          <PartnerOversight 
            tasks={tasks}
            teamMembers={teamMembers}
            clientProfiles={clientProfiles}
            demoCallScenarios={demoCallScenarios}
            firmMetrics={firmMetrics}
            auditLogs={auditLogs}
          />
        )}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-cyan-900 text-white border border-cyan-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* House View Reference Slideover — MOCK, see CONTEXT.md "Dev Build Required" */}
      {houseViewOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-stretch justify-end z-50"
          onClick={() => { setHouseViewOpen(false); setExpandedHouseView(null); }}
        >
          <div
            className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  House View Reference
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 flex items-center gap-1 w-fit mt-1">
                  <FlaskConical className="w-3 h-3" /> Mock content — see CONTEXT.md
                </span>
              </div>
              <button onClick={() => { setHouseViewOpen(false); setExpandedHouseView(null); }} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  value={houseViewQuery}
                  onChange={(e) => setHouseViewQuery(e.target.value)}
                  placeholder="Search topics (e.g. gold, rates, geopolitics)..."
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {houseViews
                .filter(hv =>
                  houseViewQuery === '' ||
                  hv.title.toLowerCase().includes(houseViewQuery.toLowerCase()) ||
                  hv.tags.some(t => t.toLowerCase().includes(houseViewQuery.toLowerCase()))
                )
                .map(hv => (
                  <div key={hv.id} className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                    <button
                      onClick={() => setExpandedHouseView(expandedHouseView === hv.id ? null : hv.id)}
                      className="w-full text-left p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{hv.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Approved by {hv.approvedBy} • Last reviewed {hv.lastReviewed}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${expandedHouseView === hv.id ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedHouseView === hv.id && (
                      <div className="px-3 pb-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2">
                        {hv.summary}
                      </div>
                    )}
                  </div>
                ))}
              {houseViews.filter(hv =>
                houseViewQuery === '' ||
                hv.title.toLowerCase().includes(houseViewQuery.toLowerCase()) ||
                hv.tags.some(t => t.toLowerCase().includes(houseViewQuery.toLowerCase()))
              ).length === 0 && (
                <div className="text-xs text-slate-500 text-center py-8">No approved house view matches this topic yet — escalate to the research desk rather than improvising an answer.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {paletteOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 p-4 z-50"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Jump to a client or task..."
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
              />
              <button onClick={() => setPaletteOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {paletteQuery === '' && (
                <div className="text-xs text-slate-500 text-center py-6">Start typing a client or task name</div>
              )}
              {paletteQuery !== '' && paletteClientResults.length === 0 && paletteTaskResults.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-6">No matches in your book</div>
              )}
              {paletteClientResults.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold px-2 py-1">Clients</div>
                  {paletteClientResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => openClientFromPalette(c.id)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-slate-500">{c.aumDisplay}</span>
                    </button>
                  ))}
                </div>
              )}
              {paletteTaskResults.length > 0 && (
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold px-2 py-1">Tasks</div>
                  {paletteTaskResults.map(t => (
                    <button
                      key={t.id}
                      onClick={() => openTaskFromPalette()}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{t.title}</span>
                      <span className="text-slate-500">{t.clientName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500">
        K2alpha WealthDesk • Timezone: IST
      </footer>
    </div>
  );
}
