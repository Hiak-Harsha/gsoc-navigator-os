import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Key, Settings, User } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export interface SettingsViewProps {
  showToast?: (msg: string, error?: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ showToast }) => {
  const [profile, setProfile] = useState<any>(null);
  const [githubToken, setGithubToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setGithubUsername(data?.github_username || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updated = await api.updateProfile({ github_username: githubUsername });
      setProfile(updated);
      showToast?.('Settings saved');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to save settings', true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-[var(--surface)] py-20 text-center text-sm text-[var(--ink-muted)] shadow-apple">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start gap-3 rounded-2xl border bg-[var(--surface)] p-5 shadow-apple">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-elevated)] text-[var(--accent-bright)]">
          <Settings className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--ink)]">System Settings &amp; Integrations</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
            Contributor profile verification, GitHub credentials, and API synchronization controls.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)]">
            <User className="h-4 w-4 text-[var(--accent-bright)]" />
            <span>Contributor Profile Information</span>
          </h2>
          <Badge tone="emerald">Verified Student Profile</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 text-[12.5px] sm:grid-cols-2">
          <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5">
            <span className="font-mono text-[10.5px] uppercase text-[var(--ink-muted)]">Name</span>
            <div className="mt-0.5 font-semibold text-[var(--ink)]">{profile?.name}</div>
          </div>
          <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5">
            <span className="font-mono text-[10.5px] uppercase text-[var(--ink-muted)]">University</span>
            <div className="mt-0.5 font-semibold text-[var(--ink)]">{profile?.university}</div>
          </div>
          <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5">
            <span className="font-mono text-[10.5px] uppercase text-[var(--ink-muted)]">Academic Stage</span>
            <div className="mt-0.5 font-semibold text-[var(--ink)]">
              {profile?.academic_stage} (Grad: {profile?.graduation_year})
            </div>
          </div>
          <div className="rounded-xl border bg-[var(--surface-elevated)] p-3.5 space-y-1.5">
            <label className="block font-mono text-[10.5px] uppercase text-[var(--ink-muted)]">
              GitHub Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Hiak-Harsha"
                className="min-w-0 flex-1 rounded-lg border bg-[var(--surface)] px-3 py-1.5 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--accent-bright)]"
              />
              <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-[var(--surface)] p-5 shadow-apple space-y-3.5">
        <h2 className="flex items-center gap-2 border-b pb-3 text-[14px] font-semibold text-[var(--ink)]">
          <Key className="h-4 w-4 text-[var(--amber)]" />
          <span>GitHub API Integration</span>
        </h2>
        <p className="text-[12.5px] text-[var(--ink-secondary)]">
          Server-side environment uses <code className="rounded bg-[var(--input-bg)] px-1.5 py-0.5">GITHUB_TOKEN</code> to poll PR checks cleanly at 5,000 req/hr.
        </p>
        <input
          type="password"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (optional local override)"
          className="w-full max-w-md rounded-xl border bg-[var(--input-bg)] px-3.5 py-2.5 font-mono text-[12px] text-[var(--ink)] outline-none focus:border-[var(--accent-bright)]"
        />
      </section>
    </div>
  );
};
