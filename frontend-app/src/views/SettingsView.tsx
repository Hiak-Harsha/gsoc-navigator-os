import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Settings, User, Key, Radio, ShieldCheck } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 font-mono text-sm">Loading configuration...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Integrations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Profile verification, GitHub OAuth/Token credentials, and AI provider parameters.
        </p>
      </div>

      <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>User Profile Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Name:</span>
            <span className="text-slate-200">{profile?.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">University:</span>
            <span className="text-slate-200">{profile?.university}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Academic Stage:</span>
            <span className="text-slate-200">{profile?.academic_stage} (Grad: {profile?.graduation_year})</span>
          </div>
          <div>
            <span className="text-slate-500 block">GitHub Username:</span>
            <span className="text-slate-200">{profile?.github_username || 'Not connected'}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#121a2d] border border-[#1e293b] rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          <span>GitHub API Integration</span>
        </h2>
        <p className="text-xs text-slate-300">
          Provide a GitHub Personal Access Token to increase GitHub REST API rate limits from 60 req/hr to 5,000 req/hr and sync private test PRs.
        </p>
        <div className="space-y-2">
          <input
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full max-w-md bg-[#0b0f19] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
