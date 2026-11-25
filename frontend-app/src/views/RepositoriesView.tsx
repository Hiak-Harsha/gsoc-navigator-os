import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ExternalLink, FileCode, FolderGit2, GitFork, Layers, Star, Terminal } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

export const RepositoriesView: React.FC = () => {
  const [allRepos, setAllRepos] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [repo, setRepo] = useState<any>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialRepos();
  }, []);

  const loadInitialRepos = async () => {
    try {
      setLoading(true);
      const orgs = await api.getOrganizations();
      const repos = orgs.flatMap((o: any) =>
        (o.repositories || []).map((r: any) => ({ ...r, orgName: o.name }))
      );
      setAllRepos(repos);
      if (repos.length > 0) {
        await selectRepo(repos[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectRepo = async (repoId: number) => {
    setSelectedRepoId(repoId);
    try {
      const [repoData, treeData] = await Promise.all([
        api.getRepository(repoId),
        api.getRepositoryTree(repoId),
      ]);
      setRepo(repoData);
      setTree(treeData.tree || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Analyzing repository architectures...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header & Repo Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">
            Repository Intelligence &amp; Codebase Explorer
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Architecture blueprints, local environment setup commands, and indexed file hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allRepos.length > 1 && (
            <div className="inline-flex flex-wrap rounded-lg border bg-[var(--input-bg)] p-1">
              {allRepos.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRepo(r.id)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer',
                    selectedRepoId === r.id
                      ? 'bg-[var(--surface)] text-[var(--ink)] shadow-apple'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  )}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}

          {repo && (
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border bg-[var(--surface-elevated)] px-3 text-[12px] font-mono font-semibold text-[var(--accent-bright)] hover:border-[var(--border-strong)]"
            >
              <span>{repo.full_name}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {repo && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left Column: Architecture & Commands */}
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--accent-bright)]" />
                  <h2 className="text-[14px] font-semibold text-[var(--ink)]">Architectural Overview</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="amber" className="font-mono">
                    <Star className="h-3 w-3" /> {repo.stars_count}
                  </Badge>
                  <Badge tone="neutral" className="font-mono">
                    <GitFork className="h-3 w-3" /> {repo.forks_count}
                  </Badge>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--ink-secondary)]">
                {repo.architecture_summary}
              </p>
            </section>

            <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Terminal className="h-4 w-4 text-[var(--emerald)]" />
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                  Local Build &amp; Test Execution Commands
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                    Environment Setup
                  </span>
                  <pre className="thin-scroll overflow-x-auto rounded-xl border bg-[var(--input-bg)] p-3.5 font-mono text-[12px] text-[var(--emerald)]">
                    {repo.build_instructions}
                  </pre>
                </div>
                <div>
                  <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                    Run Test Suite
                  </span>
                  <pre className="thin-scroll overflow-x-auto rounded-xl border bg-[var(--input-bg)] p-3.5 font-mono text-[12px] text-[var(--accent-bright)]">
                    {repo.test_instructions}
                  </pre>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: File Tree */}
          <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3.5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-[var(--violet)]" />
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">Codebase Tree</h3>
              </div>
              <Badge tone="neutral" className="font-mono">
                {tree.length} files
              </Badge>
            </div>
            <div className="thin-scroll max-h-[460px] space-y-1.5 overflow-y-auto pr-1 font-mono text-[12px]">
              {tree.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-[var(--surface-elevated)] px-3 py-2 text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink)] transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 shrink-0 text-[var(--accent-bright)]" />
                    <span className="truncate">{item.path}</span>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-[var(--ink-muted)]">
                    {(item.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
