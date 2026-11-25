import React from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const ProjectIdeasView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const ideas = [
    {
      org: 'SymPy',
      title: 'Enhancing Matrix Exponential Computation and Boundaries',
      description:
        'Modernize algorithms in sympy.matrices.dense for symbolic matrix exponentials, matrix powers, and shape error handling.',
      difficulty: 'Medium (175 Hours)',
      tech_stack: ['Python', 'Linear Algebra', 'pytest'],
      prereq: 'Familiarity with sympy/matrices directory and series expansion.',
      status: 'Verified Historical GSoC Project Idea',
    },
    {
      org: 'Python Software Foundation',
      title: 'Improve Standard Library Test Coverage in CPython Lib/test',
      description:
        'Extend unit tests and benchmark regressions across standard library modules, optimizing coverage for asyncio and os.',
      difficulty: 'Large (350 Hours)',
      tech_stack: ['Python', 'C', 'unittest'],
      prereq: 'CPython devguide environment build.',
      status: 'Verified Historical GSoC Project Idea',
    },
    {
      org: 'Zulip',
      title: 'Full-text Search Filter Operators & Message Search Optimization',
      description:
        'Refactor backend search queries in Django models and add structured keyword autocompletion in TypeScript web app.',
      difficulty: 'Medium (175 Hours)',
      tech_stack: ['Python', 'Django', 'TypeScript', 'PostgreSQL'],
      prereq: 'Local provisioned Zulip dev environment.',
      status: 'Verified Historical GSoC Project Idea',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amber-soft)] text-[var(--amber)]">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">GSoC Project Idea Intelligence</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Historical project ideas from past GSoC editions. Official 2027 project ideas are published after org announcements in February 2027.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ideas.map((idea, idx) => (
          <article
            key={idx}
            className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple transition-all hover:border-[var(--border-strong)] space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent" className="font-mono font-semibold">
                    {idea.org}
                  </Badge>
                  <h2 className="text-[15.5px] font-bold text-[var(--ink)]">{idea.title}</h2>
                </div>
                <div className="font-mono text-[11px] text-[var(--amber)]">{idea.status}</div>
              </div>
              <Badge tone="neutral" className="font-mono shrink-0">
                {idea.difficulty}
              </Badge>
            </div>

            <p className="text-[13px] leading-relaxed text-[var(--ink-secondary)]">{idea.description}</p>

            <div className="grid grid-cols-1 gap-4 border-t pt-3.5 md:grid-cols-2">
              <div>
                <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Technologies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {idea.tech_stack.map((t, i) => (
                    <Badge key={i} tone="neutral" className="font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Key Requirement
                </div>
                <p className="text-[12.5px] text-[var(--ink-secondary)]">{idea.prereq}</p>
              </div>
            </div>

            <div className="flex justify-end border-t pt-3">
              <Button variant="primary" size="sm" onClick={() => onNavigate('proposals')}>
                <span>Draft Proposal in Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
