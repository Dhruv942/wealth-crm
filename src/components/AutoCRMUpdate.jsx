import React, { useState, useEffect } from 'react';
import {
  Sparkles, Mic, FileText, CheckCircle2, ArrowRight, Copy, Check,
  Send, AlertCircle, RefreshCw, Layers, ShieldCheck, Database,
  MessageSquare, Mail, Building, Plus, ArrowUpRight, Zap, Phone,
  Pencil, Lock, Clock
} from 'lucide-react';
import {
  confirmCrmDraft,
  createCallNote,
  dispatchCrmTasks,
  syncCrmDraft,
  synthesizeCallNote,
  updateCrmDraft
} from '../services/api';
import { copyTextToClipboard } from '../utils/frontendState';

function normalizeParsedData(parsedData) {
  if (!parsedData) return parsedData;
  return {
    ...parsedData,
    liquiditySignals: (parsedData.liquiditySignals || []).map(signal => ({
      ...signal,
      amount: signal.amount || signal.amountDisplay
    })),
    generatedOpsTasks: (parsedData.generatedOpsTasks || []).map(task => ({
      ...task,
      assignedTo: task.assignedTo || task.assignedToUserId || 'ops-1',
      assignedToName: task.assignedToName || 'Central Ops & Compliance',
      clientAUM: task.clientAUM || '—',
      clientTier: task.clientTier || 'Client',
      slaCountdown: task.slaCountdown || '3h 00m',
      slaStatus: task.slaStatus || 'urgent',
      status: task.status === 'suggested' ? 'pending_ops' : (task.status || 'pending_ops')
    }))
  };
}

export default function AutoCRMUpdate({
  currentRM,
  clientProfiles = [],
  demoCallScenarios = [],
  playbookLibrary = [],
  apiToken,
  onBackendRefresh,
  onNavigateToAllocation,
  selectedClientId,
  onSelectClient,
  onShowToast
}) {
  const isManagerOrOps = currentRM.level === 'Manager' || currentRM.level === 'Operations';

  // Strict client book isolation, matching the Task Desk and Co-Pilot Dossier:
  // RMs only see call scenarios for clients assigned to them
  const accessibleScenarios = isManagerOrOps
    ? demoCallScenarios
    : demoCallScenarios.filter(s => {
        const client = clientProfiles.find(c => c.id === s.clientId);
        return client && client.assignedRMId === currentRM.id;
      });

  const initialScenario = accessibleScenarios.find(s => s.clientId === selectedClientId) || accessibleScenarios[0] || null;

  const [activeScenario, setActiveScenario] = useState(initialScenario);
  const [rawText, setRawText] = useState(initialScenario?.rawNotes || '');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [parsedData, setParsedData] = useState(normalizeParsedData(initialScenario?.parsedResult));
  const [isRecording, setIsRecording] = useState(false);
  const [copiedType, setCopiedType] = useState(null);
  const [isSyncedToCRM, setIsSyncedToCRM] = useState(false);
  const [crmRecordId, setCrmRecordId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [tasksDispatched, setTasksDispatched] = useState(false);
  const [isDraftConfirmed, setIsDraftConfirmed] = useState(false);
  const [editedSummary, setEditedSummary] = useState(initialScenario?.parsedResult?.summary || '');

  const activeClient = activeScenario ? clientProfiles.find(c => c.id === activeScenario.clientId) : null;

  // Sync if selectedClientId changes from another tab, or if switching RM persona
  // makes the current scenario inaccessible
  useEffect(() => {
    const match = accessibleScenarios.find(s => s.clientId === selectedClientId);
    const next = match || accessibleScenarios[0];
    if (!next) {
      setActiveScenario(null);
      setRawText('');
      setParsedData(null);
      setEditedSummary('');
      setIsSyncedToCRM(false);
      setCrmRecordId(null);
      setSyncError(null);
      setTasksDispatched(false);
      setIsDraftConfirmed(false);
      return;
    }
    if (next.id !== activeScenario?.id) {
      setActiveScenario(next);
      setRawText(next.rawNotes);
      setParsedData(normalizeParsedData(next.parsedResult));
      setEditedSummary(next.parsedResult.summary);
      setIsSyncedToCRM(false);
      setCrmRecordId(null);
      setSyncError(null);
      setTasksDispatched(false);
      setIsDraftConfirmed(false);
      if (!match) {
        onSelectClient(next.clientId);
      }
    }
  }, [selectedClientId, currentRM.id, demoCallScenarios, clientProfiles]);

  const handleSelectScenario = (scenario) => {
    setActiveScenario(scenario);
    setRawText(scenario.rawNotes);
    setParsedData(normalizeParsedData(scenario.parsedResult));
    setEditedSummary(scenario.parsedResult.summary);
    onSelectClient(scenario.clientId);
    setIsSyncedToCRM(false);
    setCrmRecordId(null);
    setSyncError(null);
    setTasksDispatched(false);
    setIsDraftConfirmed(false);
  };

  const handleSynthesize = async () => {
    if (!apiToken || !activeScenario) {
      onShowToast('Backend session and scenario are required before synthesis.');
      return;
    }
    setIsSynthesizing(true);
    try {
      const note = await createCallNote(apiToken, activeScenario.clientId, rawText);
      let nextParsed = await synthesizeCallNote(apiToken, note.id);
      nextParsed = normalizeParsedData(nextParsed);
      setParsedData(nextParsed);
      setEditedSummary(nextParsed.summary);
      setIsSyncedToCRM(false);
      setCrmRecordId(null);
      setSyncError(null);
      setTasksDispatched(false);
      setIsDraftConfirmed(false);
      onShowToast('Notes parsed into a draft CRM record. Review the summary before syncing.');
    } catch (error) {
      onShowToast(`Backend synthesis failed: ${error.message}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleConfirmDraft = async () => {
    try {
      if (apiToken && parsedData?.crmDraftId) {
        await updateCrmDraft(apiToken, parsedData.crmDraftId, { summary: editedSummary });
        await confirmCrmDraft(apiToken, parsedData.crmDraftId);
      }
    } catch (error) {
      onShowToast(`Backend draft confirmation failed: ${error.message}`);
      return;
    }
    setParsedData(prev => ({ ...prev, summary: editedSummary }));
    setIsDraftConfirmed(true);
    onShowToast('Summary confirmed. Ready to sync and dispatch.');
  };

  const ensureBackendDraft = async () => {
    if (!apiToken || !activeScenario) throw new Error('Backend session and scenario are required');
    if (parsedData?.crmDraftId) return parsedData;

    const note = await createCallNote(apiToken, activeScenario.clientId, rawText);
    const nextParsed = normalizeParsedData(await synthesizeCallNote(apiToken, note.id));
    await updateCrmDraft(apiToken, nextParsed.crmDraftId, { summary: editedSummary || nextParsed.summary });
    await confirmCrmDraft(apiToken, nextParsed.crmDraftId);

    const confirmedParsed = {
      ...nextParsed,
      summary: editedSummary || nextParsed.summary
    };
    setParsedData(confirmedParsed);
    setEditedSummary(confirmedParsed.summary);
    setIsDraftConfirmed(true);
    return confirmedParsed;
  };

  const handleDispatchOpsTasks = async () => {
    if (isDraftConfirmed && parsedData && parsedData.generatedOpsTasks && !tasksDispatched) {
      try {
        const draft = await ensureBackendDraft();
        const result = await dispatchCrmTasks(apiToken, draft.crmDraftId, `${draft.crmDraftId}-dispatch`);
        setTasksDispatched(true);
        await onBackendRefresh?.();
        onNavigateToAllocation?.();
        onShowToast(
          result.createdTaskIds.length > 0
            ? `Backend dispatched ${result.createdTaskIds.length} task(s) to Standup Board.`
            : 'These tasks were already on the Standup Board.'
        );
      } catch (error) {
        onShowToast(`Backend dispatch failed: ${error.message}`);
      }
    }
  };

  const handleSyncToCRM = async () => {
    if (!isDraftConfirmed) return;
    setSyncError(null);

    if (!apiToken) {
      onShowToast('Backend session is required before CRM sync.');
      return;
    }

    // A backend session exists: a failure here is a real failure and must surface as one,
    // never as a fake success. See CONTEXT.md "Dev Build Required" 8.5.
    setIsSyncing(true);
    try {
      const draft = await ensureBackendDraft();
      const result = await syncCrmDraft(apiToken, draft.crmDraftId);
      await onBackendRefresh?.();
      setCrmRecordId(result.externalRecordId);
      setIsSyncedToCRM(true);
      onShowToast('Synced to CRM. Activity log & pipeline signals recorded.');
    } catch (error) {
      setSyncError(error.message);
      onShowToast(`CRM sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await copyTextToClipboard(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
      onShowToast(`Copied ${type} to clipboard!`);
    } catch {
      onShowToast(`Could not copy ${type}. Select the text manually.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Auto CRM Value Proposition */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <RefreshCw className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Auto-CRM Meeting Synthesizer & Ops Dispatcher
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Turns rough call notes into a structured CRM record, ops tickets, and client follow-up drafts — review and dispatch each step yourself below.
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Pitch Scenarios Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Sample Call Scenarios:
          </span>
          <span className="text-[11px] text-cyan-400 font-medium">Click any scenario to test synthesis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {accessibleScenarios.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeScenario?.id === sc.id
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-600/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  {sc.momentType}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{sc.clientName}</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{sc.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {sc.rawNotes}
              </p>
            </button>
          ))}
        </div>
        {accessibleScenarios.length === 0 && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500">
            No meeting scenarios were returned by the backend for this role.
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Playbook library:</span>
          {playbookLibrary.map(p => (
            <span
              key={p.momentType}
              className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                p.status === 'demo'
                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={p.status === 'demo' ? 'Demo scenario available above' : 'Not yet built'}
            >
              {p.momentType}{p.status !== 'demo' ? ' (coming soon)' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Main Split Interface: Input on Left, Synthesized CRM Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Raw Input & Voice Dictation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Raw RM Post-Call Notes
              </h3>

              {/* Dictate / Voice Memo Simulation.
                  MOCK — see CONTEXT.md "Dev Build Required" (Dev 2: AI Pipeline).
                  There is no real microphone capture or speech-to-text here. Starting
                  "recording" just shows a toast; stopping it drops the scenario's
                  pre-written transcript into the textarea to simulate what a finished
                  dictation would look like. A real build must capture audio and call
                  a speech-to-text service. */}
              <button
                onClick={() => {
                  const wasRecording = isRecording;
                  setIsRecording(!isRecording);
                  if (!wasRecording) {
                    onShowToast('Simulating live speech-to-text audio dictation...');
                  } else {
                    setRawText(activeScenario?.rawNotes || '');
                    onShowToast('Mock transcription complete — see CONTEXT.md "Dev Build Required"');
                  }
                }}
                disabled={!activeScenario}
                className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  isRecording 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? 'Listening (IST)...' : 'Voice Memo'}</span>
              </button>
            </div>

            {/* Client Context Pill */}
            <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Target Client:</span>
              <span className="font-bold text-cyan-300">{activeScenario?.clientName || 'Waiting for backend'}</span>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Type rough bullets, notes, or spoken dictation..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-3 text-xs text-slate-200 leading-relaxed focus:outline-none resize-none font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can freely edit these notes to test how the synthesizer extracts data.
              </p>
            </div>

            {/* Synthesize Button */}
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing || !activeScenario}
              title={!activeScenario ? 'No backend scenario available' : undefined}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing CRM Record & Ops Tasks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Synthesize Notes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Synthesized CRM Record & Dispatches (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {parsedData && (
            <div className="space-y-4">
              {/* Institutional CRM Record Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Institutional CRM Interaction Record</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      isSyncedToCRM
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : syncError
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      Audit Status: {isSyncedToCRM ? 'Synced' : syncError ? 'Sync Failed' : 'Draft, Not Yet Synced'}
                    </span>
                    <button
                      onClick={handleSyncToCRM}
                      disabled={isSyncedToCRM || !isDraftConfirmed || isSyncing}
                      title={!isDraftConfirmed ? 'Confirm the summary above first' : undefined}
                      className={`text-xs px-3 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
                        isSyncedToCRM
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : syncError
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : isDraftConfirmed
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isSyncedToCRM ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      )}
                      <span>
                        {isSyncedToCRM ? 'Synced to CRM' : isSyncing ? 'Syncing...' : syncError ? 'Retry Sync' : 'Sync to CRM'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Metadata Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Client</span>
                    <span className="font-semibold text-white truncate block">{activeScenario?.clientName || 'Backend scenario'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Timestamp</span>
                    <span className="font-semibold text-white font-mono">05-09-26 08:48 IST</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Channel</span>
                    <span className="font-semibold text-white">Advisory Call</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Stage Update</span>
                    <span className="font-semibold text-emerald-400 truncate block">{parsedData.crmStageUpdate}</span>
                  </div>
                </div>

                {isSyncedToCRM && crmRecordId && (
                  <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-cyan-200 font-semibold block">CRM confirmation received</span>
                        <span className="text-[10px] text-slate-500 font-mono">External Record ID: {crmRecordId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real sync failure — never masked as success. Offers a direct retry. */}
                {syncError && !isSyncedToCRM && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <div>
                        <span className="text-rose-200 font-semibold block">CRM sync failed — nothing was recorded</span>
                        <span className="text-[10px] text-rose-300/80">{syncError}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSyncToCRM}
                      disabled={isSyncing}
                      className="text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded shrink-0 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {/* Formatted Discussion Summary — reviewed and confirmed before it can be synced */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Executive Summary — {isDraftConfirmed ? 'Confirmed' : 'Review Before Syncing'}
                    </span>
                    {isDraftConfirmed && (
                      <button
                        onClick={() => setIsDraftConfirmed(false)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                  {isDraftConfirmed ? (
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-emerald-800/40 text-xs text-slate-200 leading-relaxed font-sans flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{parsedData.summary}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        rows={4}
                        className="w-full p-3.5 rounded-lg bg-slate-950 border border-amber-800/60 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-amber-500 resize-none"
                      />
                      <button
                        onClick={handleConfirmDraft}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Summary</span>
                      </button>
                      <p className="text-[10px] text-slate-500">The RM reviews and edits this before it can be synced to CRM or dispatched — nothing is logged automatically.</p>
                    </div>
                  )}
                </div>

                {/* Sentiment & Suitability Guardrail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Client Sentiment</span>
                    <span className="font-medium text-amber-300 mt-0.5 block">{parsedData.sentiment}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mandate Alignment Check
                    </span>
                    <span className="text-[11px] text-emerald-200 mt-0.5 block">{parsedData.suitabilityGuardrail}</span>
                  </div>
                </div>

                {/* Liquidity Inflow Signals */}
                {parsedData.liquiditySignals && parsedData.liquiditySignals.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      Extracted Capital Inflow & Pipeline Signals:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parsedData.liquiditySignals.map((sig, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-emerald-400">{sig.amount}</span>
                            <span className="text-[10px] text-slate-400 block">{sig.asset}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                            {sig.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generated Ops Tasks Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-fuchsia-400" />
                    <h3 className="text-sm font-bold text-white">Auto-Extracted Operations Deliverables</h3>
                  </div>

                  <button
                    onClick={handleDispatchOpsTasks}
                    disabled={tasksDispatched || !isDraftConfirmed || parsedData.generatedOpsTasks.length === 0}
                    title={
                      !isDraftConfirmed
                        ? 'Confirm the summary above first'
                        : parsedData.generatedOpsTasks.length === 0
                        ? 'No ops tasks were detected in these notes'
                        : undefined
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                      tasksDispatched || !isDraftConfirmed || parsedData.generatedOpsTasks.length === 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md shadow-fuchsia-600/20'
                    }`}
                  >
                    {tasksDispatched ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{tasksDispatched ? 'Dispatched to Standup Board' : 'Dispatch to Standup Board'}</span>
                  </button>
                </div>

                {parsedData.generatedOpsTasks.length > 0 ? (
                  <div className="space-y-2">
                    {parsedData.generatedOpsTasks.map((t, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-200">{t.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Assignee: <strong className="text-fuchsia-300">{t.assignedToName || 'Central Ops'}</strong></span>
                            <span>•</span>
                            <span>Priority: <strong className="text-amber-400">{t.priority}</strong></span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          SLA: {t.slaCountdown || 'Today'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500">
                    No follow-up ops tasks were detected in these notes. Log the required action manually with Central Ops if one is needed.
                  </div>
                )}
              </div>

              {/* 1-Click Client Communications Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Pre-Drafted Client Follow-Up Comms
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Copy & Send Manually</span>
                </div>

                {/* WhatsApp Box */}
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Message Draft
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(parsedData.whatsappDraft, 'WhatsApp draft')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded flex items-center gap-1 transition-colors font-medium"
                      >
                        {copiedType === 'WhatsApp draft' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'WhatsApp draft' ? 'Copied' : 'Copy WhatsApp'}</span>
                      </button>
                      {activeClient?.phone && (
                        <a
                          href={`https://wa.me/91${activeClient.phone}?text=${encodeURIComponent(parsedData.whatsappDraft)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Opens WhatsApp with the message pre-filled — you still press Send yourself"
                          className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded flex items-center gap-1 transition-colors font-medium"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Open in WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b141a] border border-emerald-900/40">
                    <div className="max-w-[85%] ml-auto bg-[#005c4b] text-slate-100 rounded-2xl rounded-br-sm px-3.5 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-md">
                      {parsedData.whatsappDraft}
                    </div>
                    <div className="max-w-[85%] ml-auto flex items-center justify-end gap-1 mt-1 pr-1">
                      <span className="text-[10px] text-slate-500">8:48 PM</span>
                      <Check className="w-3 h-3 text-sky-400" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Opens WhatsApp with this message pre-filled — it doesn't send automatically.</p>
                </div>

                {/* Email Box */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Subject & Follow-up
                    </span>
                    <button
                      onClick={() => handleCopy(`Subject: ${parsedData.emailSubject}\n\n${parsedData.emailBody}`, 'Email draft')}
                      className="text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 transition-colors font-medium"
                    >
                      {copiedType === 'Email draft' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedType === 'Email draft' ? 'Copied' : 'Copy Email'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500">Subject: </span>
                    <strong className="text-white font-medium">{parsedData.emailSubject}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
