import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, Terminal, Code2, AlertCircle } from 'lucide-react';

export const ContributionMentorView: React.FC<{ activeIssueId?: number }> = ({ activeIssueId }) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [stepNotes, setStepNotes] = useState('');
  const [patchDiff, setPatchDiff] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initOrLoadSession();
  }, [activeIssueId]);

  const initOrLoadSession = async () => {
    try {
      setLoading(true);
      let targetIssueId = activeIssueId;
      if (!targetIssueId) {
        const issues = await api.getIssues();
        if (issues.length > 0) targetIssueId = issues[0].id;
      }

      if (targetIssueId) {
        const session = await api.startCoaching(targetIssueId, 'mentor');
        const fullData = await api.getCoachingSession(session.id);
        setSessionData(fullData);
        setStepNotes(fullData.session.investigation_notes || '');
        setPatchDiff(fullData.session.patch_diff || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepTransition = async (nextStep: number) => {
    if (!sessionData) return;
    try {
      const updated = await api.updateCoachingStep(sessionData.session.id, {
        step: nextStep,
        notes: stepNotes,
        patch_diff: patchDiff,
        root_cause_confirmed: nextStep >= 5
      });
      const refreshed = await api.getCoachingSession(sessionData.session.id);
      setSessionData(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !sessionData) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Initializing coaching session...</div>;
  }

  const { session, issue, step_guidance } = sessionData;
  const steps = [
    'Understand', 'Investigate', 'Learn', 'Debug', 'Implement', 'Test', 'Review', 'Submit Preparation'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Personal Contribution Coaching Agent</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Issue #{issue.number}: {issue.title}
        </p>
      </div>

      {/* 8-Step Interactive Progress Tracker */}
      <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {steps.map((name, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < session.current_step;
            const isCurrent = stepNum === session.current_step;

            return (
              <button
                key={stepNum}
                onClick={() => handleStepTransition(stepNum)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent ? 'bg-blue-600/20 border-blue-500 text-blue-200' :
                  isCompleted ? 'bg-[#162238] border-emerald-500/30 text-emerald-300' :
                  'bg-[#0f172a] border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[10px] font-mono uppercase">Step {stepNum}</div>
                <div className="text-xs font-semibold truncate">{name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Coaching Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Guidance & Mentor Prompt */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-sm font-semibold text-white">
                Step {step_guidance.step}: {step_guidance.name}
              </h2>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded">
                Mode: {session.mode.toUpperCase()}
              </span>
            </div>

            <div className="bg-[#162238] border border-[#253755] rounded-lg p-4 space-y-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Goal</span>
              <p className="text-xs text-slate-200 font-medium">{step_guidance.goal}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Mentor Guidance</span>
              <pre className="text-xs font-mono text-slate-300 bg-[#0b0f19] p-4 rounded-lg border border-[#1e293b] whitespace-pre-wrap leading-relaxed">
                {step_guidance.guidance}
              </pre>
            </div>

            {/* Step Action Notes */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-300 font-medium block">
                Your Investigation Notes / Hypotheses:
              </label>
              <textarea
                value={stepNotes}
                onChange={(e) => setStepNotes(e.target.value)}
                placeholder="Document your observations, test results, or code findings..."
                className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg p-3 text-xs text-slate-200 font-mono h-24 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Diff input if in Implement or Review step */}
            {session.current_step >= 5 && (
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">Draft Code Patch / Diff:</label>
                <textarea
                  value={patchDiff}
                  onChange={(e) => setPatchDiff(e.target.value)}
                  placeholder="Paste your diff or updated function here..."
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg p-3 text-xs text-slate-200 font-mono h-32 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
              <button
                onClick={() => handleStepTransition(Math.max(1, session.current_step - 1))}
                disabled={session.current_step === 1}
                className="px-3.5 py-1.5 bg-[#162238] border border-[#253755] text-xs text-slate-300 rounded hover:bg-[#1e293b] disabled:opacity-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>

              <button
                onClick={() => handleStepTransition(Math.min(8, session.current_step + 1))}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>{session.current_step === 8 ? 'Complete Session' : 'Save & Advance Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Issue Details & PR Draft */}
        <div className="space-y-6">
          <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Target Problem</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#162238] p-3 rounded border border-[#253755]">
              {issue.body}
            </p>
          </div>

          <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Draft Commit & PR Metadata</h3>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Commit Message:</span>
                <code className="text-emerald-300 block bg-[#0b0f19] p-2 rounded border border-[#1e293b]">
                  {session.pr_title_draft}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
