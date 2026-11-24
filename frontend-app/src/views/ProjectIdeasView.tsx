import React from 'react';
import { Lightbulb, ExternalLink, Code2, ShieldAlert } from 'lucide-react';

export const ProjectIdeasView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const ideas = [
    {
      org: "SymPy",
      title: "Enhancing Matrix Exponential Computation and Boundaries",
      description: "Modernize algorithms in sympy.matrices.dense for symbolic matrix exponentials, matrix powers, and shape error handling.",
      difficulty: "Medium (175 Hours)",
      tech_stack: ["Python", "Linear Algebra", "pytest"],
      prereq: "Familiarity with sympy/matrices directory and series expansion.",
      status: "Verified Historical GSoC Project Idea"
    },
    {
      org: "Python Software Foundation",
      title: "Improve Standard Library Test Coverage in CPython Lib/test",
      description: "Extend unit tests and benchmark regressions across standard library modules, optimizing coverage for asyncio and os.",
      difficulty: "Large (350 Hours)",
      tech_stack: ["Python", "C", "unittest"],
      prereq: "CPython devguide environment build.",
      status: "Verified Historical GSoC Project Idea"
    },
    {
      org: "Zulip",
      title: "Full-text Search Filter Operators & Message Search Optimization",
      description: "Refactor backend search queries in Django models and add structured keyword autocompletion in TypeScript web app.",
      difficulty: "Medium (175 Hours)",
      tech_stack: ["Python", "Django", "TypeScript", "PostgreSQL"],
      prereq: "Local provisioned Zulip dev environment.",
      status: "Verified Historical GSoC Project Idea"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">GSoC Project Idea Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical project ideas from past GSoC editions. Official 2027 project ideas are published after org announcements in February 2027.
        </p>
      </div>

      <div className="space-y-4">
        {ideas.map((idea, idx) => (
          <div key={idx} className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                    {idea.org}
                  </span>
                  <h2 className="text-base font-bold text-white">{idea.title}</h2>
                </div>
                <div className="text-[11px] text-amber-400 font-mono mt-1">{idea.status}</div>
              </div>
              <span className="text-xs font-mono bg-[#162238] border border-[#253755] text-slate-300 px-2.5 py-1 rounded shrink-0">
                {idea.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{idea.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-[#1e293b]">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Technologies:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {idea.tech_stack.map((t, i) => (
                    <span key={i} className="text-[10px] font-mono bg-[#162238] text-slate-300 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Key Requirement:</span>
                <p className="text-slate-300 mt-1">{idea.prereq}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigate('proposals')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
              >
                Draft Proposal in Proposal Studio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
