import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { FolderGit2, FileCode, Terminal, ExternalLink, Star, GitFork, BookOpen, Layers } from 'lucide-react';

export const RepositoriesView: React.FC = () => {
  const [repo, setRepo] = useState<any>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepo();
  }, []);

  const loadRepo = async () => {
    try {
      setLoading(true);
      const orgs = await api.getOrganizations();
      if (orgs.length > 0 && orgs[0].repositories.length > 0) {
        const repoId = orgs[0].repositories[0].id;
        const [repoData, treeData] = await Promise.all([
          api.getRepository(repoId),
          api.getRepositoryTree(repoId)
        ]);
        setRepo(repoData);
        setTree(treeData.tree || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Analyzing repository architecture...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Repository Intelligence & Codebase Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Structural architecture, key entry points, build/test execution instructions, and file hierarchy.
          </p>
        </div>
        {repo && (
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#162238] hover:bg-[#1e293b] border border-[#253755] text-xs font-mono text-slate-200 rounded transition-colors"
          >
            <span>GitHub: {repo.full_name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {repo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Architecture & Build Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">Architectural Overview</h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars_count}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo.forks_count}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {repo.architecture_summary}
              </p>
            </div>

            {/* Local Build & Test Instructions */}
            <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Local Build & Test Execution Commands</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Local Build / Environment Setup:</span>
                  <pre className="bg-[#0b0f19] border border-[#1e293b] p-3 rounded text-xs font-mono text-emerald-300 overflow-x-auto">
                    {repo.build_instructions}
                  </pre>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">Run Test Suite:</span>
                  <pre className="bg-[#0b0f19] border border-[#1e293b] p-3 rounded text-xs font-mono text-blue-300 overflow-x-auto">
                    {repo.test_instructions}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Codebase File Hierarchy */}
          <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Codebase Tree</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{tree.length} files</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-[450px] overflow-y-auto pr-1">
              {tree.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[#162238]/60 hover:bg-[#162238] text-slate-300 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{item.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">{(item.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
