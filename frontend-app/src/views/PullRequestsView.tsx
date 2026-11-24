import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Code2, CheckCircle2, AlertTriangle, Play, ShieldAlert, Sparkles } from 'lucide-react';

export const PullRequestsView: React.FC = () => {
  const [prDiff, setPrDiff] = useState(
`def simplify_rational_power(base, exp):
    # Guard against division by zero in rational power expansion
    if base == 0 and exp < 0:
        return S.ComplexInfinity
    return base ** exp

def test_simplify_rational_power():
    assert simplify_rational_power(0, -1) == S.ComplexInfinity`
  );
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async () => {
    try {
      setIsAuditing(true);
      const res = await api.auditPR({
        pr_number: 24901,
        repository_id: 1,
        diff_or_code: prDiff
      });
      setAuditResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Pull Request Intelligence & Code Reviewer</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated pre-submission peer review: detects missing regression tests, broad exception handling, and recurring antipatterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diff / Code Input */}
        <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Pull Request Code Diff</h2>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isAuditing ? 'Auditing...' : 'Run PR Quality Audit'}</span>
            </button>
          </div>
          <textarea
            value={prDiff}
            onChange={(e) => setPrDiff(e.target.value)}
            className="w-full h-80 bg-[#0b0f19] border border-[#1e293b] rounded-lg p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Audit Results */}
        <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h2 className="text-sm font-semibold text-white">Automated Review Feedback</h2>
            {auditResult && (
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                auditResult.score >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                Score: {auditResult.score}%
              </span>
            )}
          </div>

          {!auditResult ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600" />
              <p className="text-xs">Click "Run PR Quality Audit" to inspect your diff for test coverage and maintainability.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#162238] border border-[#253755] rounded-lg p-3">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Assessment</span>
                <p className="text-xs text-slate-200 mt-1">{auditResult.quality_assessment}</p>
              </div>

              {auditResult.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Detected Antipatterns & Warnings
                  </span>
                  <ul className="space-y-1">
                    {auditResult.warnings.map((w: string, idx: number) => (
                      <li key={idx} className="text-xs text-amber-200 bg-amber-950/40 border border-amber-800/30 p-2 rounded">
                        • {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {auditResult.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Strengths
                  </span>
                  <ul className="space-y-1">
                    {auditResult.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/30 p-2 rounded">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
